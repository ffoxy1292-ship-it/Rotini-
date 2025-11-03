// البيانات
let posts = JSON.parse(localStorage.getItem('routinyat-posts')) || [];
let currentFilter = 'all';
let selectedMedia = [];

// نظام المنافسة الأسبوعية
let weeklyCompetition = {
    active: true,
    theme: "روتين العناية الصباحي",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    participants: []
};

// عرض المنشورات
function displayPosts() {
    const postsGrid = document.getElementById('postsGrid');
    let filteredPosts = posts;

    // تطبيق الفلتر
    if (currentFilter === 'morning') {
        filteredPosts = posts.filter(post => post.theme === 'morning');
    } else if (currentFilter === 'evening') {
        filteredPosts = posts.filter(post => post.theme === 'evening');
    } else if (currentFilter === 'popular') {
        filteredPosts = posts.filter(post => post.votes > 2);
    } else if (currentFilter === 'weekly') {
        filteredPosts = posts.filter(post => post.inCompetition);
    }

    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-feather"></i>
                <h3>لا توجد منشورات بعد</h3>
                <p>كوني أول من يشارك روتينها اليومي!</p>
                <button class="btn-primary" onclick="showPostForm()" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i>
                    ابدئي بمشاركة روتينك
                </button>
            </div>
        `;
        return;
    }

    postsGrid.innerHTML = filteredPosts.map(post => `
        <div class="post-card ${post.inCompetition ? 'competition-post' : ''}">
            <div class="post-header">
                <span class="post-theme ${post.theme}">
                    ${post.theme === 'morning' ? '🌞 صباحي' : '🌙 مسائي'}
                </span>
                <span class="post-date">${post.date}</span>
            </div>
            
            <h3 class="post-title">${post.title}</h3>
            
            ${post.media && post.media.length > 0 ? `
                <div class="post-media">
                    ${post.media[0].type === 'image' ? 
                        `<img src="${post.media[0].url}" alt="${post.title}">` :
                        `<video src="${post.media[0].url}" controls></video>`
                    }
                </div>
            ` : `
                <div class="post-media">
                    <i class="fas fa-image"></i>
                    <p>لا توجد وسائط</p>
                </div>
            `}
            
            <p class="post-content">${post.content}</p>
            
            <div class="post-actions">
                <button class="vote-btn" onclick="votePost(${post.id})">
                    <i class="fas fa-heart"></i>
                    <span>${post.votes || 0}</span>
                </button>
                <span class="post-author">${post.author}</span>
            </div>
        </div>
    `).join('');
}

// التصويت على منشور
function votePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.votes = (post.votes || 0) + 1;
        
        // إذا كان في المنافسة، تحديث المتصدرين
        if (post.inCompetition) {
            updateCompetitionLeaderboard();
        }
        
        savePosts();
        displayPosts();
        
        // تأثير التصويت
        const btn = event.target.closest('.vote-btn');
        btn.classList.add('voted');
        setTimeout(() => {
            btn.classList.remove('voted');
        }, 1000);
        
        // منح نقاط للمستخدم
        addUserPoints(1);
    }
}

// إضافة نقاط للمستخدم
function addUserPoints(points) {
    let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    userPoints += points;
    localStorage.setItem('userPoints', userPoints);
    updateUserPointsDisplay();
}

// تحديث عرض النقاط
function updateUserPointsDisplay() {
    const pointsElement = document.querySelector('.user-points .points');
    if (pointsElement) {
        const points = localStorage.getItem('userPoints') || '0';
        pointsElement.textContent = parseInt(points).toLocaleString();
    }
}

// تصفية المنشورات
function filterPosts(filter) {
    currentFilter = filter;
    
    // تحديث أزرار الفلتر
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayPosts();
}

// إعداد رفع الوسائط
function setupMediaUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('mediaFiles');
    const mediaPreview = document.getElementById('mediaPreview');

    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ec4899';
        uploadArea.style.background = '#fdf2f8';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#e5e7eb';
        uploadArea.style.background = '#f8fafc';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

// معالجة الملفات
function handleFiles(files) {
    selectedMedia = [];
    const mediaPreview = document.getElementById('mediaPreview');
    mediaPreview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedMedia.push({
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    url: e.target.result,
                    file: file
                });
                
                const mediaItem = document.createElement('div');
                if (file.type.startsWith('image/')) {
                    mediaItem.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                } else {
                    mediaItem.innerHTML = `<video src="${e.target.result}" controls></video>`;
                }
                mediaPreview.appendChild(mediaItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

// إظهار نموذج المنشور
function showPostForm() {
    document.getElementById('postModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// إخفاء النموذج
function hidePostForm() {
    document.getElementById('postModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('postForm').reset();
    document.getElementById('mediaPreview').innerHTML = '';
    selectedMedia = [];
}

// إضافة منشور جديد
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const theme = document.querySelector('input[name="theme"]:checked').value;
    const joinCompetition = document.getElementById('joinCompetition').checked;
    
    const newPost = {
        id: Date.now(),
        title,
        content,
        theme,
        media: [...selectedMedia],
        votes: 0,
        author: getRandomFemaleName(),
        date: new Date().toLocaleDateString('ar-AR'),
        timestamp: Date.now(),
        inCompetition: joinCompetition
    };
    
    posts.unshift(newPost);
    
    // إذا انضمت للمنافسة
    if (joinCompetition) {
        weeklyCompetition.participants.push(newPost.id);
        updateCompetitionLeaderboard();
    }
    
    savePosts();
    displayPosts();
    hidePostForm();
    
    // منح نقاط للنشر
    addUserPoints(10);
    
    alert('🎉 تم نشر روتينك بنجاح!');
});

// أسماء عشوائية
function getRandomFemaleName() {
    const names = ['سارة', 'فاطمة', 'مريم', 'هدى', 'نور', 'لينا', 'ياسمين', 'ريم', 'أمينة', 'زينب'];
    return names[Math.floor(Math.random() * names.length)];
}

// تحديث متصدرين المنافسة
function updateCompetitionLeaderboard() {
    const competitionPosts = posts.filter(post => post.inCompetition)
                                 .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                                 .slice(0, 3);
    
    const leadersBoard = document.querySelector('.leaders-board');
    if (leadersBoard) {
        leadersBoard.innerHTML = competitionPosts.map((post, index) => `
            <div class="leader">
                <img src="https://via.placeholder.com/40/ec4899/ffffff?text=${post.author.charAt(0)}" alt="${post.author}">
                <span>${post.author}</span>
                <span class="votes">${post.votes || 0} صوت</span>
            </div>
        `).join('');
    }
}

// تحديث مؤقت المنافسة
function updateCompetitionTimer() {
    const now = new Date();
    const timeLeft = weeklyCompetition.endDate - now;
    
    if (timeLeft <= 0) {
        endCompetition();
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    const timerElement = document.getElementById('competitionTimer');
    if (timerElement) {
        timerElement.textContent = `${days} أيام و ${hours} ساعة متبقية`;
    }
}

// إنهاء المنافسة
function endCompetition() {
    const winner = posts.filter(post => post.inCompetition)
                       .sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
    
    if (winner) {
        alert(`🎉 مبروك! ${winner.author} فازت بمنافسة هذا الأسبوع!`);
    }
    
    // إعادة تعيين المنافسة
    resetCompetition();
}

// إعادة تعيين المنافسة
function resetCompetition() {
    weeklyCompetition.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    weeklyCompetition.participants = [];
    
    // تغيير الموضوع
    const themes = [
        "روتين العناية الصباحي",
        "روتين الاسترخاء المسائي", 
        "روتين الرياضة اليومي",
        "روتين الطهي الصحي",
        "روتين العناية بالبشرة"
    ];
    weeklyCompetition.theme = themes[Math.floor(Math.random() * themes.length)];
    
    // تحديث الواجهة
    const themeElement = document.querySelector('.weekly-theme h3');
    if (themeElement) {
        themeElement.textContent = `موضوع هذا الأسبوع: "${weeklyCompetition.theme}"`;
    }
    
    updateCompetitionTimer();
}

// حفظ البيانات
function savePosts() {
    localStorage.setItem('routinyat-posts', JSON.stringify(posts));
}

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    displayPosts();
    updateUserPointsDisplay();
    updateCompetitionLeaderboard();
    updateCompetitionTimer();
    setupMediaUpload();
    
    // إغلاق المودال بالنقر خارجيه
    document.getElementById('postModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hidePostForm();
        }
    });
    
    // تحديث المؤقت كل دقيقة
    setInterval(updateCompetitionTimer, 60000);
    
    // تحديث المنافسة كل أسبوع
    setInterval(() => {
        if (weeklyCompetition.endDate - new Date() <= 0) {
            endCompetition();
        }
    }, 60000);
});
