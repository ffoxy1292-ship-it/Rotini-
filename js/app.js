// حالة التطبيق
let currentUser = null;
let posts = [];
let currentFilter = 'all';

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadPosts();
    setupEventListeners();
});

// التحقق من حالة التسجيل
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserProfile();
    } else {
        showAuthButtons();
    }
}

// إظهار أزرار التسجيل
function showAuthButtons() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userProfile').style.display = 'none';
}

// إظهار الملف الشخصي
function showUserProfile() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userProfile').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.avatar;
}

// تحميل المنشورات
function loadPosts() {
    // منشورات تجريبية
    posts = [
        {
            id: 1,
            title: "روتين العناية بالبشرة الصباحي",
            content: "أبدأ يومي بتنظيف البشرة ثم وضع سيروم فيتامين سي وكريم مرطب...",
            theme: "morning",
            author: "سارة",
            votes: 1245,
            date: "2024-01-15",
            inCompetition: true
        },
        {
            id: 2,
            title: "روتين المساء للاسترخاء",
            content: "قبل النوم أستمتع بجلسة يوجا قصيرة ثم قراءة كتاب مع شاي الأعشاب...",
            theme: "evening",
            author: "فاطمة",
            votes: 1120,
            date: "2024-01-14",
            inCompetition: true
        },
        {
            id: 3,
            title: "روتين العناية بالشعر",
            content: "كل يوم أربعاء أهتم بشعري باستخدام الزيوت الطبيعية والمساجات...",
            theme: "morning",
            author: "نور",
            votes: 980,
            date: "2024-01-13",
            inCompetition: true
        }
    ];
    
    renderPosts();
}

// عرض المنشورات
function renderPosts() {
    const postsGrid = document.getElementById('postsGrid');
    const filteredPosts = filterPostsByType(posts, currentFilter);
    
    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-feather"></i>
                <h3>لا توجد منشورات</h3>
                <p>كني أول من يشارك روتينه!</p>
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
                <span class="post-date">${formatDate(post.date)}</span>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-content">${post.content}</p>
            <div class="post-media">
                <i class="fas fa-image"></i>
                <span>صورة الروتين</span>
            </div>
            <div class="post-actions">
                <button class="vote-btn" onclick="votePost(${post.id})">
                    <i class="fas fa-heart"></i>
                    <span>${post.votes}</span>
                </button>
                <span class="post-author">بواسطة ${post.author}</span>
            </div>
        </div>
    `).join('');
}

// تصفية المنشورات
function filterPosts(type) {
    currentFilter = type;
    
    // تحديث التبويبات النشطة
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderPosts();
}

function filterPostsByType(postsList, type) {
    switch (type) {
        case 'morning':
            return postsList.filter(post => post.theme === 'morning');
        case 'evening':
            return postsList.filter(post => post.theme === 'evening');
        case 'popular':
            return [...postsList].sort((a, b) => b.votes - a.votes);
        case 'weekly':
            return postsList.filter(post => post.inCompetition);
        default:
            return postsList;
    }
}

// التصويت على منشور
function votePost(postId) {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.votes++;
        renderPosts();
    }
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // رفع الملفات
    const uploadArea = document.getElementById('uploadArea');
    const mediaFiles = document.getElementById('mediaFiles');
    
    uploadArea.addEventListener('click', () => mediaFiles.click());
    
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
        uploadArea.style.borderColor = '#e5e7eb';
        uploadArea.style.background = '#f8fafc';
        handleFiles(e.dataTransfer.files);
    });
    
    mediaFiles.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // نماذج التسجيل
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('postForm').addEventListener('submit', handlePostSubmit);
}

// معالجة رفع الملفات
function handleFiles(files) {
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaElement = file.type.startsWith('image/') ? 
                `<img src="${e.target.result}" alt="صورة">` :
                `<video src="${e.target.result}" controls></video>`;
            
            preview.innerHTML += mediaElement;
        };
        reader.readAsDataURL(file);
    });
}

// تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // محاكاة تسجيل الدخول
    currentUser = {
        id: 1,
        name: "مستخدم",
        email: email,
        avatar: "https://via.placeholder.com/40/ec4899/ffffff?text=U"
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showUserProfile();
    hideLoginForm();
    
    // إظهار رسالة نجاح
    alert('تم تسجيل الدخول بنجاح!');
}

// إنشاء حساب
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    if (password !== confirm) {
        alert('كلمات المرور غير متطابقة!');
        return;
    }
    
    // محاكاة إنشاء حساب
    currentUser = {
        id: 1,
        name: name,
        email: email,
        avatar: "https://via.placeholder.com/40/ec4899/ffffff?text=" + name.charAt(0)
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showUserProfile();
    hideRegisterForm();
    
    // إظهار رسالة نجاح
    alert('تم إنشاء الحساب بنجاح!');
}

// نشر منشور
function handlePostSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const theme = document.querySelector('input[name="theme"]:checked').value;
    const inCompetition = document.getElementById('joinCompetition').checked;
    
    const newPost = {
        id: posts.length + 1,
        title: title,
        content: content,
        theme: theme,
        author: currentUser.name,
        votes: 0,
        date: new Date().toISOString().split('T')[0],
        inCompetition: inCompetition
    };
    
    posts.unshift(newPost);
    renderPosts();
    hidePostForm();
    
    // إعادة تعيين النموذج
    document.getElementById('postForm').reset();
    document.getElementById('mediaPreview').innerHTML = '';
    
    // إظهار رسالة نجاح
    alert('تم نشر المنشور بنجاح!');
}

// دوال إظهار/إخفاء النماذج
function showPostForm() {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    document.getElementById('postModal').style.display = 'flex';
}

function hidePostForm() {
    document.getElementById('postModal').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('loginModal').style.display = 'flex';
    hideRegisterForm();
}

function hideLoginForm() {
    document.getElementById('loginModal').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('registerModal').style.display = 'flex';
    hideLoginForm();
}

function hideRegisterForm() {
    document.getElementById('registerModal').style.display = 'none';
}

function showProfilePage() {
    if (!currentUser) return;
    
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileAvatar').src = currentUser.avatar;
    document.getElementById('profilePage').style.display = 'block';
}

function hideProfilePage() {
    document.getElementById('profilePage').style.display = 'none';
}

function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('show');
}

function showMyPosts() {
    alert('سيتم عرض منشوراتك هنا!');
    document.getElementById('userMenu').classList.remove('show');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthButtons();
    document.getElementById('userMenu').classList.remove('show');
    alert('تم تسجيل الخروج بنجاح!');
}

function editProfile() {
    alert('سيتم فتح صفحة تعديل الملف الشخصي!');
}

function changeAvatar() {
    alert('سيتم فتح خيارات تغيير الصورة!');
}

// دوال مساعدة
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// إغلاق النماذج عند النقر خارجها
window.addEventListener('click', function(e) {
    const postModal = document.getElementById('postModal');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (e.target === postModal) hidePostForm();
    if (e.target === loginModal) hideLoginForm();
    if (e.target === registerModal) hideRegisterForm();
});
