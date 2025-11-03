// نظام المنافسة الأسبوعية
let weeklyCompetition = {
    active: true,
    theme: "روتين العناية الصباحي",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // أسبوع من الآن
    participants: [],
    leaderboard: []
};

// تحديث timer المنافسة
function updateCompetitionTimer() {
    const now = new Date();
    const timeLeft = weeklyCompetition.endDate - now;
    
    if (timeLeft <= 0) {
        // إنهاء المنافسة وبدء جديدة
        endCompetition();
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    document.getElementById('competitionTimer').textContent = 
        `${days} أيام و ${hours} ساعة متبقية`;
}

// إنهاء المنافسة وإعلان الفائز
function endCompetition() {
    // تحديد الفائز
    const winner = weeklyCompetition.leaderboard[0];
    
    // عرض إشعار الفائز
    showNotification(`🎉 مبروك! ${winner.name} فازت بمنافسة هذا الأسبوع!`);
    
    // إعادة تعيين المنافسة
    resetCompetition();
}

// إعادة تعيين المنافسة
function resetCompetition() {
    weeklyCompetition.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    weeklyCompetition.participants = [];
    weeklyCompetition.leaderboard = [];
    
    // تغيير موضوع المنافسة
    const themes = [
        "روتين العناية الصباحي",
        "روتين الاسترخاء المسائي", 
        "روتين الرياضة اليومي",
        "روتن الطهي الصحي",
        "روتين العناية بالبشرة"
    ];
    weeklyCompetition.theme = themes[Math.floor(Math.random() * themes.length)];
    
    // تحديث الواجهة
    updateCompetitionUI();
}

// التصويت على منشور
function votePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        // زيادة التصويت
        post.votes = (post.votes || 0) + 1;
        
        // إذا كان في المنافسة، تحديث الترتيب
        if (post.inCompetition) {
            updateCompetitionLeaderboard(post);
        }
        
        // منح نقاط للمستخدم
        addUserPoints(5);
        
        savePosts();
        displayPosts();
        
        // تأثير التصويت
        event.target.classList.add('voted');
        setTimeout(() => {
            event.target.classList.remove('voted');
        }, 1000);
    }
}

// إضافة نقاط للمستخدم
function addUserPoints(points) {
    let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    userPoints += points;
    localStorage.setItem('userPoints', userPoints);
    updateUserPointsDisplay();
}

// تحديث عرض نقاط المستخدم
function updateUserPointsDisplay() {
    const pointsElement = document.querySelector('.user-points .points');
    if (pointsElement) {
        pointsElement.textContent = localStorage.getItem('userPoints') || '0';
    }
}

// تحديث لوحة المتصدرين
function updateCompetitionLeaderboard(post) {
    const participantIndex = weeklyCompetition.leaderboard.findIndex(p => p.postId === post.id);
    
    if (participantIndex !== -1) {
        weeklyCompetition.leaderboard[participantIndex].votes = post.votes;
    } else {
        weeklyCompetition.leaderboard.push({
            postId: post.id,
            name: post.author,
            votes: post.votes
        });
    }
    
    // ترتيب المتصدرين
    weeklyCompetition.leaderboard.sort((a, b) => b.votes - a.votes);
    
    // تحديث الواجهة
    updateLeaderboardUI();
}

// تحديث واجهة المتصدرين
function updateLeaderboardUI() {
    const leadersContainer = document.querySelector('.leaders-board');
    if (leadersContainer) {
        leadersContainer.innerHTML = weeklyCompetition.leaderboard.slice(0, 3).map((leader, index) => `
            <div class="leader">
                <img src="https://via.placeholder.com/40" alt="${leader.name}">
                <span>${leader.name}</span>
                <span class="votes">${leader.votes} صوت</span>
            </div>
        `).join('');
    }
}

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    updateCompetitionTimer();
    updateUserPointsDisplay();
    setInterval(updateCompetitionTimer, 60000); // تحديث كل دقيقة
});
