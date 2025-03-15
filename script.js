document.addEventListener("DOMContentLoaded", () => {
  // Main calculator elements
  const enemyAtkEl = document.getElementById("enemyAtk");
  const enemyTypeEl = document.getElementById("enemyType");
  const enemyClassEl = document.getElementById("enemyClass");
  const unitTypeEl = document.getElementById("unitType");
  const unitClassEl = document.getElementById("unitClass");
  const drNormalsEl = document.getElementById("drNormals");
  const drOtherEl = document.getElementById("drOther");
  const tdbLevelEl = document.getElementById("tdbLevel");
  const guardActiveEl = document.getElementById("guardActive");
  const effectiveDefEl = document.getElementById("effectiveDef");
  
  const damageResultEl = document.getElementById("damageResult");
  const formulaTextEl = document.getElementById("formulaText");
  
  // Effective DEF Calculator elements
  const calc_baseDefEl = document.getElementById("calc_baseDef");
  const calc_leaderBonusEl = document.getElementById("calc_leaderBonus");
  const calc_passiveBonusEl = document.getElementById("calc_passiveBonus");
  const calc_supportBonusEl = document.getElementById("calc_supportBonus");
  const calcEffectiveDefResultEl = document.getElementById("calcEffectiveDefResult");
  
  // Add event listeners for main inputs
  const mainInputs = document.querySelectorAll("#calcForm input, #calcForm select");
  mainInputs.forEach(input => {
    input.addEventListener("input", updateCalculator);
    input.addEventListener("change", updateCalculator);
  });
  
  // Add event listeners for the effective DEF calculator
  const defCalcInputs = document.querySelectorAll("#defCalcSection input");
  defCalcInputs.forEach(input => {
    input.addEventListener("input", updateDefCalculator);
    input.addEventListener("change", updateDefCalculator);
  });
  
  // Type advantage cycle: AGL > STR > PHY > INT > TEQ > AGL
  const advantageMap = {
    "Agl": "Str",
    "Str": "Phy",
    "Phy": "Int",
    "Int": "Teq",
    "Teq": "Agl"
  };
  
  function getTypeRelation(userType, enemyType) {
    if (advantageMap[userType] === enemyType) {
      return "adv"; // advantage
    } else if (advantageMap[enemyType] === userType) {
      return "disadv"; // disadvantage
    }
    return "neutral";
  }
  
  function getClassRelation(userClass, enemyClass) {
    return (userClass === enemyClass) ? "same" : "opp";
  }
  
  // Base multipliers (placeholder values; update with correct ones)
  const baseTable = {
    adv_same: 0.80,
    adv_opp: 0.85,
    neutral_same: 1.00,
    neutral_opp: 1.05,
    disadv_same: 1.20,
    disadv_opp: 1.25
  };
  
  function getBaseMultiplier(typeRel, classRel) {
    let key = `${typeRel}_${classRel}`;
    if (typeRel === "neutral") key = `neutral_${classRel}`;
    return baseTable[key] || 1.0;
  }
  
  function updateCalculator() {
    // Parse main inputs
    const enemyAtk = parseFloat(enemyAtkEl.value) || 0;
    const eType = enemyTypeEl.value;
    const eClass = enemyClassEl.value;
    const uType = unitTypeEl.value;
    const uClass = unitClassEl.value;
    const drNormals = (parseFloat(drNormalsEl.value) || 0) / 100;
    const drOther = (parseFloat(drOtherEl.value) || 0) / 100;
    const tdbLevel = parseInt(tdbLevelEl.value) || 0;
    const guardActive = guardActiveEl.checked;
    const effectiveDef = parseFloat(effectiveDefEl.value) || 0;
    
    // Determine type and class relations
    const typeRel = getTypeRelation(uType, eType); // "adv", "disadv", or "neutral"
    const classRel = getClassRelation(uClass, eClass); // "same" or "opp"
    
    // Get base multiplier from table and apply TDB if advantage
    let baseMultiplier = getBaseMultiplier(typeRel, classRel);
    if (typeRel === "adv") {
      baseMultiplier -= 0.01 * tdbLevel;
      if (baseMultiplier < 0) baseMultiplier = 0;
    }
    
    // Variance range
    const varianceMin = 1.0;
    const varianceMax = 1.03;
    
    // Calculate damage
    // (EnemyATK * baseMultiplier * variance * (1 - drNormals) * (1 - drOther) - EffectiveDEF) * (guard ? 0.5 : 1.0)
    function calcDamage(variance) {
      const preDef = enemyAtk * baseMultiplier * variance * (1 - drNormals) * (1 - drOther);
      const afterDef = preDef - effectiveDef;
      const guardMult = guardActive ? 0.5 : 1.0;
      return afterDef * guardMult;
    }
    
    const dmgMin = calcDamage(varianceMin);
    const dmgMax = calcDamage(varianceMax);
    const finalMin = dmgMin < 0 ? 0 : dmgMin;
    const finalMax = dmgMax < 0 ? 0 : dmgMax;
    
    damageResultEl.textContent = `${finalMin.toFixed(0)} - ${finalMax.toFixed(0)}`;
    
    // Update formula display text
    formulaTextEl.textContent = `
Damage Taken =
  (EnemyATK: ${enemyAtk})
  × (Base Multiplier: ${baseMultiplier.toFixed(2)} [${typeRel}, ${classRel}])
  × (Variance: [1.00 ~ 1.03])
  × (1 - DR_normals: ${drNormals.toFixed(2)})
  × (1 - DR_other: ${drOther.toFixed(2)})
  - (EffectiveDEF: ${effectiveDef.toFixed(0)})
) 
× (Guard: ${guardActive ? 0.5 : 1.0})

Range: ${finalMin.toFixed(0)} to ${finalMax.toFixed(0)}
    `;
  }
  
  function updateDefCalculator() {
    // Parse effective DEF calculator inputs
    const baseDef = parseFloat(calc_baseDefEl.value) || 0;
    const leaderBonus = (parseFloat(calc_leaderBonusEl.value) || 0) / 100;
    const passiveBonus = (parseFloat(calc_passiveBonusEl.value) || 0) / 100;
    const supportBonus = (parseFloat(calc_supportBonusEl.value) || 0) / 100;
    
    const calculatedEffectiveDef = baseDef * (1 + leaderBonus + passiveBonus + supportBonus);
    calcEffectiveDefResultEl.value = calculatedEffectiveDef.toFixed(0);
  }
  
  // Initialize on page load
  updateCalculator();
  updateDefCalculator();
});
