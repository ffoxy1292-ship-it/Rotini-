// روتينيات الصباح
const morningRoutines = [
    {
        id: 1,
        title: "روتين الاستيقاظ المبكر",
        duration: "30 دقيقة",
        steps: [
            "⏰ الاستيقاظ بدون غفوات",
            "💧 شرب كوبين من الماء",
            "🪟 فتح الستائر للشمس",
            "🧘‍♀️ تمارين stretching بسيطة",
            "📝 كتابة نوايا اليوم"
        ],
        benefits: ["نشاط", "تركيز", "طاقة إيجابية"]
    },
    {
        id: 2,
        title: "روتين العناية بالبشرة الصباحي",
        duration: "15 دقيقة",
        steps: [
            "🧼 غسول لطيف للوجه",
            "💦 تونر مرطب",
            "🌟 سيروم فيتامين C",
            "🧴 كريم مرطب + واقي شمس",
            "💄 مكياج خفيف (اختياري)"
        ],
        benefits: ["نضارة", "حماية", "ترطيب"]
    },
    {
        id: 3,
        title: "روتين الصحة واللياقة",
        duration: "45 دقيقة",
        steps: [
            "🏃‍♀️ 15 دقيقة تمارين كارديو",
            "💪 15 دقيقة تمارين قوة",
            "🧘‍♀️ 10 دقيقة يوجا وتأمل",
            "🍵 تحضير مشروب صحي"
        ],
        benefits: ["لياقة", "صحة", "نشاط"]
    }
];

// عرض روتينيات الصباح
function displayMorningRoutines() {
    const container = document.getElementById('morningRoutines');
    
    container.innerHTML = morningRoutines.map(routine => `
        <div class="routine-card morning-routine">
            <div class="routine-header">
                <h3>${routine.title}</h3>
                <span class="routine-duration">${routine.duration}</span>
            </div>
            
            <div class="routine-steps">
                ${routine.steps.map(step => `
                    <div class="step">
                        <span class="step-icon">${step.split(' ')[0]}</span>
                        <span class="step-text">${step.split(' ').slice(1).join(' ')}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="routine-benefits">
                ${routine.benefits.map(benefit => `
                    <span class="benefit-tag">${benefit}</span>
                `).join('')}
            </div>
            
            <button class="start-routine-btn" onclick="startRoutine(${routine.id})">
                ابدئي هذا الروتين
            </button>
        </div>
    `).join('');
}

// بدء الروتين
function startRoutine(routineId) {
    const routine = morningRoutines.find(r => r.id === routineId);
    if (routine) {
        // هنا يمكن إضافة صفحة تتبع للروتين
        alert(`🚀 بدأت روتين: ${routine.title}\n\nالمدة: ${routine.duration}\n\nحظاً موفقاً! 🌞`);
    }
}

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    displayMorningRoutines();
});
