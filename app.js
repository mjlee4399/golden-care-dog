/* ============================================================
   골든케어 댕댕이 🐾 — app.js
   노령견 AI 정밀 영양 분석 로직
   ============================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────
   1. 간식 데이터베이스 (Mock AI 지식 베이스)
   ──────────────────────────────────────────────────────────── */
const SNACK_DB = {
  '고구마': {
    emoji: '🍠',
    kcalPer100g: 86,
    protein: '1.6g', fat: '0.1g', carbs: '20.1g', fiber: '3.0g',
    baseStatus: 'warning',
    baseAmount: { min: 0, max: 15 }, // g / 하루
    conditions: {
      kidney:    { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '신장 질환 시 칼륨 함량으로 인해 급여량을 10g 이하로 엄격히 제한하세요.' },
      diabetes:  { status: 'danger',  amount: { min: 0, max: 5 },  tipOverride: '당뇨 보호자 필독! 고구마는 혈당을 빠르게 올릴 수 있습니다. 5g 미만으로 매우 드물게 급여하거나 수의사와 상담 후 결정하세요.' },
      joint:     { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '과체중 우려 시 칼로리가 있어 관절 부담 증가. 10g 이하로 제한하세요.' },
      digestion: { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '소화 불량 시 식이섬유가 오히려 부담될 수 있어요. 소량(10g 이하)만 급여하세요.' },
      heart:     { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '심장 질환 시 나트륨·칼륨 균형에 주의. 10g 이하로 제한하세요.' },
      liver:     { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '간 질환 시 탄수화물 과다 주의. 10g 이하로 급여하세요.' },
    },
    nutrition: ['베타카로틴 풍부', '식이섬유', '비타민 B6'],
    cookingTip: '껍질을 벗기고 삶거나 쪄서 식힌 후 급여하세요. 간식 총 칼로리의 10% 이내로 유지하세요.',
    caution: '고구마는 당분이 많아 당뇨·비만 강아지에겐 매우 소량만 허용됩니다.'
  },

  '북어채': {
    emoji: '🐟',
    kcalPer100g: 324,
    protein: '72.0g', fat: '2.3g', carbs: '0g', fiber: '0g',
    baseStatus: 'warning',
    baseAmount: { min: 0, max: 5 },
    conditions: {
      kidney:    { status: 'danger',  amount: { min: 0, max: 0 },  tipOverride: '❌ 급여 금지! 북어채의 높은 염분과 단백질은 신장에 치명적입니다. 즉시 급여를 중단하세요.' },
      diabetes:  { status: 'warning', amount: { min: 0, max: 5 },  tipOverride: '무염 북어 기준으로 소량(5g 이하) 급여 가능. 반드시 물에 30분 이상 불려 염분 제거 후 급여하세요.' },
      joint:     { status: 'warning', amount: { min: 0, max: 5 },  tipOverride: '단백질 급여량은 적절하나 염분 주의. 물에 충분히 불려 사용하세요.' },
      digestion: { status: 'warning', amount: { min: 0, max: 3 },  tipOverride: '소화 불량 시 단백질 흡수가 어려울 수 있습니다. 3g 이하 소량만 급여하세요.' },
      heart:     { status: 'danger',  amount: { min: 0, max: 0 },  tipOverride: '❌ 급여 주의! 염분이 심장 질환을 악화시킵니다. 무염 가공 제품도 가급적 피하세요.' },
      liver:     { status: 'warning', amount: { min: 0, max: 3 },  tipOverride: '간 질환 시 단백질 과부하 우려. 3g 이하 소량으로 제한하세요.' },
    },
    nutrition: ['고단백', '저지방', '타우린'],
    cookingTip: '반드시 물에 30분 이상 불려 염분을 충분히 제거한 뒤 잘게 찢어 급여하세요.',
    caution: '시중 북어채는 염분이 매우 높습니다. 반드시 염분 제거 후 급여하고 신장 질환 강아지에겐 절대 금지입니다.'
  },

  '브로콜리': {
    emoji: '🥦',
    kcalPer100g: 33,
    protein: '2.8g', fat: '0.4g', carbs: '5.2g', fiber: '2.6g',
    baseStatus: 'safe',
    baseAmount: { min: 10, max: 20 },
    conditions: {
      kidney:    { status: 'safe',    amount: { min: 10, max: 15 }, tipOverride: '신장 질환 시 과도한 급여는 인산 부담이 될 수 있어 15g 이하로 조절하세요.' },
      diabetes:  { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '혈당 지수가 낮아 당뇨 강아지에게 안전합니다. 20g 이하로 급여 가능해요.' },
      joint:     { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '비타민 K와 항염 성분이 관절 건강에 도움이 됩니다.' },
      digestion: { status: 'warning', amount: { min: 5,  max: 10 }, tipOverride: '소화 불량 시 브로콜리 꽃 부분의 이소티오시아네이트가 자극이 될 수 있어요. 5~10g 소량, 잘 익혀 급여하세요.' },
      heart:     { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '항산화 성분이 심장 건강에 도움이 됩니다.' },
      liver:     { status: 'safe',    amount: { min: 10, max: 15 }, tipOverride: '간 해독을 돕는 성분이 포함되어 있어 유익합니다. 15g 이하로 급여하세요.' },
    },
    nutrition: ['비타민 C·K', '항암 성분', '식이섬유', '칼슘'],
    cookingTip: '살짝 데쳐서(3분 이내) 식힌 후 잘게 다져 15~20g 내외로 급여하세요. 항암 작용이 있어 노령견에게 매우 좋습니다!',
    caution: '브로콜리 꽃 부분은 다량 급여 시 이소티오시아네이트로 소화 장애를 유발할 수 있어요. 전체 식사의 10% 이내로 유지하세요.'
  },

  '사과': {
    emoji: '🍎',
    kcalPer100g: 52,
    protein: '0.3g', fat: '0.2g', carbs: '13.8g', fiber: '2.4g',
    baseStatus: 'safe',
    baseAmount: { min: 10, max: 25 },
    conditions: {
      kidney:    { status: 'warning', amount: { min: 5,  max: 15 }, tipOverride: '신장 질환 시 칼륨 함량 주의. 껍질 제거 후 15g 이하로 제한하세요.' },
      diabetes:  { status: 'warning', amount: { min: 5,  max: 10 }, tipOverride: '당뇨 강아지에겐 과당 함량 주의. 껍질과 씨를 제거한 과육 10g 이하로 소량만 급여하세요.' },
      joint:     { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '퀘르세틴 성분이 항염 효과가 있어 관절 건강에 도움이 됩니다.' },
      digestion: { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '펙틴이 장 건강에 도움이 됩니다. 껍질 제거 후 급여하면 소화가 더 편해요.' },
      heart:     { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '항산화 성분이 심혈관에 유익합니다.' },
      liver:     { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '사과에 함유된 항산화 성분이 간 세포 보호에 도움이 됩니다.' },
    },
    nutrition: ['비타민 A·C', '펙틴', '퀘르세틴', '식이섬유'],
    cookingTip: '씨와 심, 껍질을 제거하고 얇게 슬라이스하거나 잘게 다져서 급여하세요. 씨에는 미량의 시안화물이 있어 반드시 제거해야 합니다.',
    caution: '반드시 씨앗과 심을 제거하세요! 씨앗은 소량이지만 독성을 함유합니다. 껍질의 농약도 주의하여 세척하거나 제거하세요.'
  },

  '닭가슴살': {
    emoji: '🍗',
    kcalPer100g: 165,
    protein: '31.0g', fat: '3.6g', carbs: '0g', fiber: '0g',
    baseStatus: 'safe',
    baseAmount: { min: 15, max: 30 },
    conditions: {
      kidney:    { status: 'warning', amount: { min: 10, max: 20 }, tipOverride: '신장 질환 시 단백질 제한이 필요할 수 있습니다. 수의사와 단백질 제한량 상담 후 20g 이하로 급여하세요.' },
      diabetes:  { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '혈당을 올리지 않아 당뇨 강아지에게 매우 적합한 간식입니다.' },
      joint:     { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '고단백 저지방으로 근육 유지에 도움이 되어 관절 부담을 줄여줍니다.' },
      digestion: { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '소화가 잘 되는 단백질원입니다. 부드럽게 익혀 급여하면 더욱 좋아요.' },
      heart:     { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '저지방 단백질로 심장 건강에 유익합니다. 염분 없이 조리하세요.' },
      liver:     { status: 'warning', amount: { min: 10, max: 20 }, tipOverride: '간 질환 시 단백질 대사 부담 주의. 20g 이하로 급여하고 수의사 상담을 권장합니다.' },
    },
    nutrition: ['고단백', '저지방', '비타민 B3·B6', '인·아연'],
    cookingTip: '절대 양념 없이 삶거나 쪄서 급여하세요. 뼈는 완전히 제거하고 잘게 찢거나 다져서 주세요. 날 것은 살모넬라 위험이 있습니다.',
    caution: '반드시 완전히 익혀서 급여하세요. 양파, 마늘, 파 등 인간 향신료는 절대 사용 금지입니다.'
  },

  '당근': {
    emoji: '🥕',
    kcalPer100g: 41,
    protein: '0.9g', fat: '0.2g', carbs: '9.6g', fiber: '2.8g',
    baseStatus: 'safe',
    baseAmount: { min: 15, max: 30 },
    conditions: {
      kidney:    { status: 'safe',    amount: { min: 10, max: 20 }, tipOverride: '신장에 부담이 적어 안전합니다. 20g 이하로 급여하세요.' },
      diabetes:  { status: 'warning', amount: { min: 10, max: 15 }, tipOverride: '당근의 당지수가 중간 수준이라 당뇨 강아지는 15g 이하로 제한하세요.' },
      joint:     { status: 'safe',    amount: { min: 15, max: 30 }, tipOverride: '베타카로틴이 항염 효과가 있어 관절 건강에 도움이 됩니다.' },
      digestion: { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '식이섬유가 장 운동을 도와 소화에 유익합니다.' },
      heart:     { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '항산화 성분이 심혈관 건강에 좋습니다.' },
      liver:     { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '베타카로틴이 간 건강에 유익합니다.' },
    },
    nutrition: ['베타카로틴', '비타민 A·K', '식이섬유', '칼륨'],
    cookingTip: '생것 또는 살짝 쪄서 급여 가능합니다. 잘게 썰거나 강판에 갈아서 사료에 섞어도 좋아요.',
    caution: '당근은 강아지에게 비교적 안전한 간식이지만, 과다 급여 시 변색(눈물 등)이 생길 수 있습니다.'
  },

  '블루베리': {
    emoji: '🫐',
    kcalPer100g: 57,
    protein: '0.7g', fat: '0.3g', carbs: '14.5g', fiber: '2.4g',
    baseStatus: 'safe',
    baseAmount: { min: 5, max: 15 },
    conditions: {
      kidney:    { status: 'safe',    amount: { min: 5,  max: 10 }, tipOverride: '신장에 비교적 안전하지만 옥살산이 포함되어 10g 이하로 제한하세요.' },
      diabetes:  { status: 'warning', amount: { min: 3,  max: 8 },  tipOverride: '당뇨 강아지에겐 과당이 있어 8g 이하 소량만 급여하세요.' },
      joint:     { status: 'safe',    amount: { min: 5,  max: 15 }, tipOverride: '강력한 항산화 성분이 염증 완화에 도움이 됩니다.' },
      digestion: { status: 'safe',    amount: { min: 5,  max: 15 }, tipOverride: '장내 유익균을 증가시켜 소화에 도움이 됩니다.' },
      heart:     { status: 'safe',    amount: { min: 5,  max: 15 }, tipOverride: '안토시아닌이 혈관 건강을 돕고 심장에 유익합니다.' },
      liver:     { status: 'safe',    amount: { min: 5,  max: 15 }, tipOverride: '항산화 성분이 간 세포를 보호합니다.' },
    },
    nutrition: ['안토시아닌', '비타민 C·K', '항산화', '망간'],
    cookingTip: '신선한 것을 그대로 1~3알씩 급여하거나 살짝 으깨서 사료와 섞어도 좋아요. 냉동 블루베리도 해동 후 급여 가능합니다.',
    caution: '블루베리는 강아지에게 매우 안전한 슈퍼푸드입니다. 하지만 과다 급여는 설사를 유발할 수 있어 15g 이하로 유지하세요.'
  },

  '두부': {
    emoji: '🤍',
    kcalPer100g: 76,
    protein: '8.0g', fat: '4.0g', carbs: '2.0g', fiber: '0.3g',
    baseStatus: 'safe',
    baseAmount: { min: 15, max: 30 },
    conditions: {
      kidney:    { status: 'warning', amount: { min: 10, max: 20 }, tipOverride: '신장 질환 시 인·칼륨·단백질 부담. 20g 이하로 제한하고 수의사와 상담하세요.' },
      diabetes:  { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '혈당에 영향이 거의 없어 당뇨 강아지에게 좋습니다.' },
      joint:     { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '이소플라본이 항염 효과가 있어 관절에 도움이 됩니다.' },
      digestion: { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '소화가 잘 되는 단백질원입니다.' },
      heart:     { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '식물성 단백질로 심장 건강에 유익합니다. 염분 없이 급여하세요.' },
      liver:     { status: 'safe',    amount: { min: 15, max: 25 }, tipOverride: '간에 부담이 적은 식물성 단백질원입니다.' },
    },
    nutrition: ['식물성 단백질', '이소플라본', '칼슘', '철분'],
    cookingTip: '순두부나 연두부를 물에 한 번 헹궈 염분을 제거한 후 잘게 으깨서 급여하세요. 부침두부보다 순두부가 소화에 더 유리해요.',
    caution: '시중 두부는 간수(염화마그네슘)가 포함될 수 있어 반드시 물로 세척 후 급여하세요. 너무 많이 먹이면 구토·설사가 생길 수 있습니다.'
  },

  '바나나': {
    emoji: '🍌',
    kcalPer100g: 89,
    protein: '1.1g', fat: '0.3g', carbs: '22.8g', fiber: '2.6g',
    baseStatus: 'warning',
    baseAmount: { min: 0, max: 15 },
    conditions: {
      kidney:    { status: 'warning', amount: { min: 0, max: 8 },  tipOverride: '신장 질환 시 칼륨 함량이 높아 위험합니다. 8g 이하로 매우 드물게 급여하거나 피하세요.' },
      diabetes:  { status: 'danger',  amount: { min: 0, max: 5 },  tipOverride: '당뇨 강아지에겐 바나나의 높은 당분이 혈당 급등을 유발합니다. 가급적 피하고 급여 시 5g 이하 극소량만 허용하세요.' },
      joint:     { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '칼로리가 높아 과체중 시 관절 부담이 됩니다. 10g 이하로 제한하세요.' },
      digestion: { status: 'safe',    amount: { min: 5, max: 15 },  tipOverride: '적당량의 바나나는 장 운동을 도와 변비 완화에 도움이 됩니다.' },
      heart:     { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '칼륨이 높아 심장 질환에 주의가 필요합니다. 10g 이하로 제한하세요.' },
      liver:     { status: 'warning', amount: { min: 0, max: 10 }, tipOverride: '간 질환 시 당분 대사 부담. 10g 이하로 제한하세요.' },
    },
    nutrition: ['비타민 B6', '칼륨', '마그네슘', '망간'],
    cookingTip: '잘 익은 바나나를 껍질 제거 후 얇게 슬라이스해서 급여하세요. 냉동 바나나 슬라이스는 여름 간식으로 좋아요.',
    caution: '바나나는 당분과 칼륨이 높아 신장 질환·당뇨 강아지에겐 각별히 주의가 필요합니다. 과다 급여 시 구토·설사가 생길 수 있습니다.'
  }
};

/* ────────────────────────────────────────────────────────────
   2. RER / 간식 칼로리 계산
   ──────────────────────────────────────────────────────────── */
function calcRER(weightKg) {
  // RER = 70 × (체중)^0.75
  return Math.round(70 * Math.pow(weightKg, 0.75));
}

function calcSnackLimit(rer, age) {
  // 노령견(10세 이상)은 일일 칼로리의 8%, 일반은 10%
  const ratio = age >= 10 ? 0.08 : 0.10;
  return Math.round(rer * ratio);
}

/* ────────────────────────────────────────────────────────────
   3. 급여량 조정 (몸무게 × 질환 보정)
   ──────────────────────────────────────────────────────────── */
function adjustAmount(baseAmount, weightKg, age, conditions) {
  // 기본 급여량을 5~6kg 기준으로 설계 → 몸무게 비례
  const weightFactor = weightKg / 5.5;
  // 노령견 보정 (10세+ → 80%, 15세+ → 65%)
  const ageFactor = age >= 15 ? 0.65 : age >= 10 ? 0.80 : 1.0;

  let min = Math.round(baseAmount.min * weightFactor * ageFactor);
  let max = Math.round(baseAmount.max * weightFactor * ageFactor);

  return { min: Math.max(0, min), max: Math.max(0, max) };
}

/* ────────────────────────────────────────────────────────────
   4. 단일 간식 분석
   ──────────────────────────────────────────────────────────── */
function analyzeSnack(snackName, weightKg, age, conditions) {
  const db = SNACK_DB[snackName];

  if (!db) {
    // DB에 없는 간식 → 일반 권고
    return {
      name: snackName,
      emoji: '🍽️',
      status: 'warning',
      amount: { min: 0, max: 10 },
      displayAmount: '5~10g 이하',
      barPercent: 20,
      nutrition: ['영양 정보 없음'],
      cookingTip: '이 간식에 대한 정보가 데이터베이스에 없습니다. 수의사와 상담 후 소량(5~10g 이하)만 급여해 보세요.',
      caution: '알려지지 않은 간식은 반드시 수의사 상담 후 급여하세요.',
      tipOverride: null,
    };
  }

  // 가장 나쁜 조건 적용
  let worstStatus = db.baseStatus;
  let worstTip = null;
  let worstAmount = null;

  const statusRank = { safe: 0, warning: 1, danger: 2 };

  for (const cond of conditions) {
    const condData = db.conditions[cond];
    if (!condData) continue;
    if (statusRank[condData.status] > statusRank[worstStatus]) {
      worstStatus = condData.status;
      worstTip = condData.tipOverride;
      worstAmount = condData.amount;
    }
  }

  const baseAmt = worstAmount || db.baseAmount;
  const adjusted = adjustAmount(baseAmt, weightKg, age, conditions);

  let displayAmount;
  if (adjusted.max === 0) {
    displayAmount = '급여 금지';
  } else if (adjusted.min === adjusted.max) {
    displayAmount = `${adjusted.max}g 이하`;
  } else {
    displayAmount = `${adjusted.min}~${adjusted.max}g`;
  }

  // 게이지 바: max 대비 퍼센트 (최대 100g 기준)
  const barPercent = adjusted.max === 0 ? 5 : Math.min(100, Math.round(adjusted.max / 40 * 100));

  return {
    name: snackName,
    emoji: db.emoji,
    status: worstStatus,
    amount: adjusted,
    displayAmount,
    barPercent,
    nutrition: db.nutrition,
    cookingTip: db.cookingTip,
    caution: db.caution,
    tipOverride: worstTip,
  };
}

/* ────────────────────────────────────────────────────────────
   5. 결과 카드 HTML 생성
   ──────────────────────────────────────────────────────────── */
function buildResultCard(result, index) {
  const statusMap = {
    safe:    { label: '✅ 안전',   cls: 'safe',    icon: '🟢' },
    warning: { label: '⚠️ 주의',   cls: 'warning', icon: '🟡' },
    danger:  { label: '🚫 위험',   cls: 'danger',  icon: '🔴' },
  };
  const s = statusMap[result.status];

  const nutriChips = result.nutrition
    .map(n => `<span class="nutrition-chip">${n}</span>`)
    .join('');

  const tipText = result.tipOverride || result.cookingTip;
  const cautionText = result.tipOverride ? result.caution : '';

  const animDelay = index * 0.1;

  return `
    <div class="result-card ${s.cls}" style="animation-delay:${animDelay}s">
      <div class="result-card-header">
        <span class="result-status-icon">${result.emoji}</span>
        <span class="result-snack-name">${result.name}</span>
        <span class="result-status-label">${s.label}</span>
      </div>
      <div class="result-card-body">
        <div class="dosage-section">
          <div class="dosage-label">
            <span class="dosage-title">📏 추천 급여량 (하루 기준)</span>
            <span class="dosage-amount">${result.displayAmount}</span>
          </div>
          <div class="dosage-bar-track">
            <div class="dosage-bar-fill" style="width:0%" data-target="${result.barPercent}%"></div>
          </div>
        </div>
        <div class="nutrition-chips">${nutriChips}</div>
        <div class="tip-section">
          <p class="tip-title">💡 조리·급여 팁</p>
          <p class="tip-text">${tipText}</p>
          ${cautionText ? `<p class="tip-text" style="margin-top:0.5rem; color:var(--danger-red); font-weight:600;">⚠️ ${cautionText}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ────────────────────────────────────────────────────────────
   6. 종합 요약 배너 생성
   ──────────────────────────────────────────────────────────── */
function buildSummaryBanner(results, age, weightKg, conditions, rer, snackLimit) {
  const safeCount    = results.filter(r => r.status === 'safe').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const dangerCount  = results.filter(r => r.status === 'danger').length;

  let icon, title, body;

  if (dangerCount > 0) {
    icon  = '🚨';
    title = `위험 간식 ${dangerCount}가지 포함 — 즉시 확인이 필요합니다!`;
    body  = `분석된 ${results.length}가지 간식 중 ${dangerCount}가지가 현재 댕댕이의 상태에 위험합니다. 빨간 카드의 내용을 꼭 확인하고 해당 간식은 즉시 중단하거나 수의사와 상담하세요.`;
  } else if (warningCount > 0) {
    icon  = '⚠️';
    title = `주의 간식 ${warningCount}가지 — 소량·조심 급여를 권장해요`;
    body  = `${age}세 · ${weightKg}kg 댕댕이 기준, 노령견 간식 허용 칼로리는 하루 약 ${snackLimit}kcal (RER ${rer}kcal × 8%)입니다. 노란 카드의 권장 급여량을 지키며 급여해 주세요.`;
  } else {
    icon  = '🎉';
    title = `모든 간식이 안전해요! 오늘도 건강한 간식 타임 🐾`;
    body  = `선택한 ${results.length}가지 간식 모두 현재 상태에서 안전합니다. 단, 노령견은 하루 간식 칼로리를 ${snackLimit}kcal 이내로 유지하고 조리 팁을 꼭 따라 주세요.`;
  }

  let condText = '';
  if (conditions.length > 0) {
    const condNames = {
      kidney: '신장 질환', diabetes: '당뇨', joint: '관절/슬개골',
      digestion: '소화 불량', heart: '심장 질환', liver: '간 질환'
    };
    condText = ` · 질환: ${conditions.map(c => condNames[c] || c).join(', ')}`;
  }

  return `
    <div class="summary-banner">
      <div class="summary-icon">${icon}</div>
      <div class="summary-text-block">
        <p class="summary-text-title">${title}</p>
        <p class="summary-text-body">${body}</p>
        <p class="summary-text-body" style="margin-top:0.4rem; font-size:0.75rem; opacity:0.75;">
          📋 분석 기준: ${age}세 · ${weightKg}kg${condText} · RER ${rer}kcal · 간식 허용 ${snackLimit}kcal/일
        </p>
      </div>
    </div>
  `;
}

/* ────────────────────────────────────────────────────────────
   7. 파티클 배경 (잔잔한 발바닥 파티클)
   ──────────────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PAWS = ['🐾', '🐾', '🐾', '•', '·'];
  function createParticle() {
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      size: Math.random() * 14 + 6,
      opacity: Math.random() * 0.18 + 0.04,
      speed: Math.random() * 0.35 + 0.1,
      drift: (Math.random() - 0.5) * 0.3,
      paw:  PAWS[Math.floor(Math.random() * PAWS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
    };
  }

  for (let i = 0; i < 30; i++) particles.push(createParticle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.font = `${p.size}px serif`;
      ctx.fillText(p.paw, 0, 0);
      ctx.restore();
      p.y -= p.speed;
      p.x += p.drift;
      p.rotation += p.rotSpeed;
      if (p.y < -30) { Object.assign(p, createParticle(), { y: canvas.height + 30 }); }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ────────────────────────────────────────────────────────────
   8. 앱 초기화 & 이벤트
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* --- DOM 참조 --- */
  const ageInput      = document.getElementById('dog-age');
  const weightInput   = document.getElementById('dog-weight');
  const ageHint       = document.getElementById('age-hint');
  const weightHint    = document.getElementById('weight-hint');
  const rerValue      = document.getElementById('rer-value');
  const snackLimitEl  = document.getElementById('snack-limit');
  const snackBtns     = document.querySelectorAll('.snack-btn');
  const customInput   = document.getElementById('custom-snack');
  const customAddBtn  = document.getElementById('custom-add-btn');
  const selectedTags  = document.getElementById('selected-tags');
  const analyzeBtn    = document.getElementById('analyze-btn');
  const analyzeBtnInner = document.getElementById('analyze-btn-inner');
  const loadingSpinner  = document.getElementById('loading-spinner');
  const resultsPlaceholder = document.getElementById('results-placeholder');
  const resultsContent     = document.getElementById('results-content');

  let selectedSnacks = [];

  /* --- RER 실시간 업데이트 --- */
  function updateRER() {
    const age    = parseFloat(ageInput.value)    || 0;
    const weight = parseFloat(weightInput.value) || 0;
    if (weight > 0) {
      const rer   = calcRER(weight);
      const limit = calcSnackLimit(rer, age);
      rerValue.textContent     = `${rer} kcal/일`;
      snackLimitEl.textContent = `${limit} kcal`;

      ageHint.textContent    = age >= 10
        ? `🌿 노령견 기준 적용 (보수적 계산)`
        : `🐶 일반 성견 기준 적용`;
      weightHint.textContent = weight < 3
        ? '⚠️ 소형 · 극소형견 주의'
        : weight > 20
          ? '🐕 중·대형견 기준'
          : '';
    } else {
      rerValue.textContent     = '— kcal/일';
      snackLimitEl.textContent = '— kcal';
    }
  }

  ageInput.addEventListener('input', updateRER);
  weightInput.addEventListener('input', updateRER);
  updateRER(); // 초기값 계산

  /* --- 간식 버튼 토글 --- */
  snackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.snack;
      if (selectedSnacks.includes(name)) {
        selectedSnacks = selectedSnacks.filter(s => s !== name);
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        selectedSnacks.push(name);
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      }
      renderSelectedTags();
    });
  });

  /* --- 커스텀 간식 추가 --- */
  function addCustomSnack() {
    const val = customInput.value.trim();
    if (!val) return;
    if (!selectedSnacks.includes(val)) {
      selectedSnacks.push(val);
      renderSelectedTags();
    }
    customInput.value = '';
    customInput.focus();
  }

  customAddBtn.addEventListener('click', addCustomSnack);
  customInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomSnack();
  });

  /* --- 선택 태그 렌더링 --- */
  function renderSelectedTags() {
    if (selectedSnacks.length === 0) {
      selectedTags.innerHTML = '<span class="no-selection-hint">위에서 간식을 선택해주세요 🐾</span>';
      return;
    }
    selectedTags.innerHTML = selectedSnacks.map(name => {
      const db = SNACK_DB[name];
      const emoji = db ? db.emoji : '🍽️';
      return `
        <span class="selected-tag">
          ${emoji} ${name}
          <button class="tag-remove" data-name="${name}" aria-label="${name} 제거">×</button>
        </span>
      `;
    }).join('');

    // 태그 삭제 버튼
    selectedTags.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        selectedSnacks = selectedSnacks.filter(s => s !== name);
        // 그리드 버튼 해제
        snackBtns.forEach(sb => {
          if (sb.dataset.snack === name) {
            sb.classList.remove('selected');
            sb.setAttribute('aria-pressed', 'false');
          }
        });
        renderSelectedTags();
      });
    });
  }

  /* --- 질환 체크박스 가져오기 --- */
  function getConditions() {
    return Array.from(document.querySelectorAll('.condition-checkbox:checked'))
      .map(cb => cb.value);
  }

  /* --- 분석 실행 --- */
  analyzeBtn.addEventListener('click', async () => {
    if (selectedSnacks.length === 0) {
      shakeBtn();
      return;
    }

    const age    = parseFloat(ageInput.value)    || 14;
    const weight = parseFloat(weightInput.value) || 5.8;
    const conditions = getConditions();

    // 로딩 시작
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display     = 'none';

    // 모의 AI 딜레이 (700ms ~ 1400ms)
    const delay = 700 + Math.random() * 700;
    await new Promise(res => setTimeout(res, delay));

    // 분석
    const rer   = calcRER(weight);
    const limit = calcSnackLimit(rer, age);
    const results = selectedSnacks.map(name => analyzeSnack(name, weight, age, conditions));

    // 결과 렌더링
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    resultsContent.innerHTML = `
      <div class="results-header">
        <h2 class="results-title">🔬 AI 정밀 분석 결과</h2>
        <span class="results-meta">분석 시각: ${timeStr} · ${results.length}가지 간식</span>
      </div>
      <div class="result-cards-grid">
        ${results.map((r, i) => buildResultCard(r, i)).join('')}
      </div>
      ${buildSummaryBanner(results, age, weight, conditions, rer, limit)}
    `;

    // 로딩 종료
    analyzeBtn.classList.remove('loading');
    analyzeBtn.disabled = false;
    resultsContent.style.display = 'block';

    // 게이지 바 애니메이션
    setTimeout(() => {
      resultsContent.querySelectorAll('.dosage-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target;
      });
    }, 100);

    // 결과로 스크롤
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* --- 버튼 흔들기 (간식 미선택) --- */
  function shakeBtn() {
    analyzeBtn.style.animation = 'shake 0.4s ease';
    setTimeout(() => analyzeBtn.style.animation = '', 400);
  }

  // shake 키프레임
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-6px); }
      40%     { transform: translateX(6px); }
      60%     { transform: translateX(-4px); }
      80%     { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
});
