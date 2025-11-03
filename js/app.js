// نظام المستخدمين والبيانات
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('routinyat-users')) || [];
let posts = JSON.parse(localStorage.getItem('routinyat-posts')) || [];
let currentFilter = 'all';
let selectedMedia = [];

// نظام المنافسة
let weeklyCompetition = {
    active: true,
    theme: "روتين العناية الصباحي",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    participants: []
};

// ==================== نظام المستخدمين ====================

// تحميل بيانات المستخدم الحالي
function loadCurrentUser() {
    if (currentUser) {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userProfile').style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userAvatar').src = currentUser.avatar || `https://via.placeholder.com/40/ec4899/ffffff?text=${currentUser.name.charAt(0)}`;
        
        // تحديث النقاط
        updateUserPointsDisplay();
    }
}

// تسجيل الدخول
function showLoginForm() {
    document.getElementById('loginModal').style.display = 'flex';
}

function hideLoginForm() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// إنشاء حساب
function showRegisterForm() {
    document.getElementById('registerModal').style.display = 'flex';
}

function hideRegisterForm() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerForm').reset();
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadCurrentUser();
        hideLoginForm();
        displayPosts();
        alert(`🎉 أهلاً بعودتك ${user.name}!`);
    } else {
        alert('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
});

// إنشاء حساب جديد
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;
    
    if (password !== confirmPassword) {
        alert('❌ كلمتا المرور غير متطابقتين');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('❌ هذا البريد الإلكتروني مستخدم بالفعل');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        avatar: `https://via.placeholder.com/100/ec4899/ffffff?text=${name.charAt(0)}`,
        joinDate: new Date().toLocaleDateString('ar-AR'),
        points: 0,
        postsCount: 0,
        votesReceived: 0
    };
    
    users.push(newUser);
    currentUser = newUser;
    
    localStorage.setItem('routinyat-users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    loadCurrentUser();
    hideRegisterForm();
    displayPosts();
    
    alert(`🎉 مرحباً ${name}! تم إنشاء حسابك بنجاح`);
});

// تسجيل الخروج
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userProfile').style.display = 'none';
    displayPosts();
    alert('👋 تم تسجيل الخروج بنجاح');
}

// القائمة المنسدلة للمستخدم
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-profile')) {
        document.getElementById('userMenu').style.display = 'none';
    }
});

// ==================== نظام المنشورات ====================

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
                <h3>لا توجد منشورات</h3>
                <p>${currentFilter === 'all' ? 'لا توجد منشورات بعد' : 
                   currentFilter === 'morning' ? 'لا توجد منشورات صباحية' :
                   currentFilter === 'evening' ? 'لا توجد منشورات مسائية' :
                   'لا توجد منشورات في المنافسة'}</p>
                ${currentUser ? `
                    <button class="btn-primary" onclick="showPostForm()" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i>
                        ابدئي بمشاركة روتينك
                    </button>
                ` : `
                    <button class="btn-primary" onclick="showRegisterForm()" style="margin-top: 1rem;">
                        <i class="fas fa-user-plus"></i>
                        سجلي دخول للبدء
                    </button>
                `}
            </div>
        `;
        return;
    }

    postsGrid.innerHTML = filteredPosts.map(post => {
        const authorUser = users.find(u => u.id === post.authorId) || { name: 'مستخدم', avatar: 'https://via.placeholder.com/40/ec4899/ffffff?text=?' };
        
        return `
        <div class="post-card ${post.inCompetition ? 'competition-post' : ''}">
            <div class="post-header">
                <div class="post-author-info">
                    <img src="${authorUser.avatar}" alt="${authorUser.name}" class="author-avatar">
                    <div>
                        <div class="author-name">${authorUser.name}</div>
                        <div class="post-date">${post.date}</div>
                    </div>
                </div>
                <span class="post-theme ${post.theme}">
                    ${post.theme === 'morning' ? '🌞 صباحي' : '🌙 مسائي'}
                </span>
            </div>
            
            <h3 class="post-title">${post.title}</h3>
            
            ${post.media && post.media.length > 0 ? `
                <div class="post-media">
                    ${post.media[0].type === 'image' ? 
                        `<img src="${post.media[0].url}" alt="${post.title}">` :
                        `<video src="${post.media[0].url}" controls></video>`
                    }
                </div>
            ` : ''}
            
            <p class="post-content">${post.content}</p>
            
            <div class="post-actions">
                <button class="vote-btn ${post.userVoted ? 'voted' : ''}" onclick="votePost(${post.id})">
                    <i class="fas fa-heart"></i>
                    <span>${post.votes || 0}</span>
                </button>
                <button class="comment-btn" onclick="toggleComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments ? post.comments.length : 0}</span>
                </button>
            </div>
            
            <!-- قسم التعليقات -->
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <div class="comments-list">
                    ${post.comments ? post.comments.map(comment => {
                        const commentUser = users.find(u => u.id === comment.authorId) || { name: 'مستخدم', avatar: 'https://via.placeholder.com/32/ec4899/ffffff?text=?' };
                        return `
                        <div class="comment">
                            <img src="${commentUser.avatar}" alt="${commentUser.name}" class="comment-avatar">
                            <div class="comment-content">
                                <div class="comment-author">${commentUser.name}</div>
                                <div class="comment-text">${comment.text}</div>
                                <div class="comment-date">${comment.date}</div>
                            </div>
                        </div>
                        `;
                    }).join('') : ''}
                </div>
                ${currentUser ? `
                <div class="add-comment">
                    <input type="text" id="commentInput-${post.id}" placeholder="اكتب تعليقك..." class="comment-input">
                    <button onclick="addComment(${post.id})" class="btn-primary">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                ` : `
                <div class="login-to-comment">
                    <button class="btn-secondary" onclick="showLoginForm()">
                        <i class="fas fa-sign-in-alt"></i>
                        سجلي دخول لإضافة تعليق
                    </button>
                </div>
                `}
            </div>
        </div>
        `;
    }).join('');
}

// التصويت على منشور
function votePost(postId) {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        // التحقق إذا المستخدم صوت مسبقاً
        if (!post.userVotes) post.userVotes = [];
        
        if (post.userVotes.includes(currentUser.id)) {
            alert('❌ لقد قمت بالتصويت على هذا المنشور مسبقاً');
            return;
        }
        
        post.votes = (post.votes || 0) + 1;
        post.userVotes.push(currentUser.id);
        
        // منح نقاط لصاحب المنشور
        const postAuthor = users.find(u => u.id === post.authorId);
        if (postAuthor) {
            postAuthor.points += 5;
            postAuthor.votesReceived += 1;
        }
        
        // منح نقاط للمستخدم الحالي
        currentUser.points += 1;
        
        saveAllData();
        displayPosts();
        
        // تأثير التصويت
        const btn = event.target.closest('.vote-btn');
        btn.classList.add('voted');
        
        updateUserPointsDisplay();
    }
}

// إظهار/إخفاء التعليقات
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
}

// إضافة تعليق
function addComment(postId) {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('❌ الرجاء كتابة تعليق');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (!post.comments) post.comments = [];
        
        const newComment = {
            id: Date.now(),
            authorId: currentUser.id,
            text: commentText,
            date: new Date().toLocaleDateString('ar-AR'),
            timestamp: Date.now()
        };
        
        post.comments.unshift(newComment);
        
        // منح نقاط لصاحب المنشور
        const postAuthor = users.find(u => u.id === post.authorId);
        if (postAuthor) {
            postAuthor.points += 3;
        }
        
        // منح نقاط للمستخدم الحالي
        currentUser.points += 2;
        
        saveAllData();
        displayPosts();
        
        // إعادة فتح قسم التعليقات
        document.getElementById(`comments-${postId}`).style.display = 'block';
        commentInput.value = '';
        
        updateUserPointsDisplay();
    }
}

// ==================== نظام النماذج ====================

// إظهار نموذج المنشور
function showPostForm() {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    document.getElementById('postModal').style.display = 'flex';
}

// إخفاء النموذج
function hidePostForm() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('postForm').reset();
    document.getElementById('mediaPreview').innerHTML = '';
    selectedMedia = [];
}

// إعداد رفع الوسائط
function setupMediaUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('mediaFiles');
    const mediaPreview = document.getElementById('mediaPreview');

    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                mediaPreview.innerHTML = `
                    <img src="${e.target.result}" style="max-width: 100%; border-radius: 10px; margin-top: 1rem;">
                `;
                selectedMedia = [{
                    type: 'image',
                    url: e.target.result,
                    file: file
                }];
            };
            reader.readAsDataURL(file);
        }
    });
}

// إضافة منشور جديد
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const theme = document.querySelector('input[name="theme"]:checked');
    const joinCompetition = document.getElementById('joinCompetition').checked;
    
    if (!theme) {
        alert('الرجاء اختيار نوع الروتين (صباحي أو مسائي)');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        authorId: currentUser.id,
        title,
        content,
        theme: theme.value,
        media: selectedMedia,
        votes: 0,
        userVotes: [],
        date: new Date().toLocaleDateString('ar-AR'),
        timestamp: Date.now(),
        inCompetition: joinCompetition,
        comments: []
    };
    
    posts.unshift(newPost);
    
    // زيادة عدد منشورات المستخدم
    currentUser.postsCount = (currentUser.postsCount || 0) + 1;
    currentUser.points += 10;
    
    // إذا انضمت للمنافسة
    if (joinCompetition) {
        weeklyCompetition.participants.push(newPost.id);
        updateCompetitionLeaderboard();
    }
    
    saveAllData();
    displayPosts();
    hidePostForm();
    
    updateUserPointsDisplay();
    alert('🎉 تم نشر روتينك بنجاح!');
});

// ==================== نظام التصفية ====================

function filterPosts(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayPosts();
}

// ==================== نظام النقاط ====================

function updateUserPointsDisplay() {
    if (currentUser) {
        const pointsElement = document.querySelector('.user-points .points');
        if (pointsElement) {
            pointsElement.textContent = currentUser.points.toLocaleString();
        }
    }
}

// ==================== نظام المنافسة ====================

function updateCompetitionLeaderboard() {
    const competitionPosts = posts.filter(post => post.inCompetition)
                                 .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                                 .slice(0, 3);
    
    const leadersBoard = document.querySelector('.leaders-board');
    if (leadersBoard) {
        leadersBoard.innerHTML = competitionPosts.map((post, index) => {
            const author = users.find(u => u.id === post.authorId) || { name: 'مستخدم' };
            return `
            <div class="leader">
                <img src="https://via.placeholder.com/40/ec4899/ffffff?text=${author.name.charAt(0)}" alt="${author.name}">
                <span>${author.name}</span>
                <span class="votes">${post.votes || 0} صوت</span>
            </div>
            `;
        }).join('');
    }
}

// ==================== نظام الحفظ ====================

function saveAllData() {
    localStorage.setItem('routinyat-users', JSON.stringify(users));
    localStorage.setItem('routinyat-posts', JSON.stringify(posts));
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// ==================== التهيئة ====================

document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
    displayPosts();
    updateCompetitionLeaderboard();
    setupMediaUpload();
    
    // إغلاق المودالات بالنقر خارجها
    document.getElementById('postModal').addEventListener('click', function(e) {
        if (e.target === this) hidePostForm();
    });
    
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if (e.target === this) hideLoginForm();
    });
    
    document.getElementById('registerModal').addEventListener('click', function(e) {
        if (e.target === this) hideRegisterForm();
    });
    
    // منع إغلاق المودالات عند النقر داخلها
    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
});
