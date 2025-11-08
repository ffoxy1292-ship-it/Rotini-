// تكوين Supabase - بمعلوماتك الحقيقية
const SUPABASE_URL = 'https://aqubnqhjqpppmjjckbet.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdWJucWhqcXBwcG1qamNrYmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Nzc3MzksImV4cCI6MjA3ODE1MzczOX0.JdZzOM4U44ppNewcNJjFtxlDQAIrt_HXHLWW831hz6I';

// إنشاء عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
async function checkAuthStatus() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user && !error) {
        currentUser = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'مستخدم',
            avatar: user.user_metadata?.avatar || 'https://via.placeholder.com/40/ec4899/ffffff?text=U'
        };
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

// تحميل المنشورات من قاعدة البيانات
async function loadPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading posts:', error);
        // استخدام بيانات تجريبية في حالة الخطأ
        loadSamplePosts();
    } else {
        posts = data || [];
        renderPosts();
    }
}

// بيانات تجريبية للطوارئ
function loadSamplePosts() {
    posts = [
        {
            id: 1,
            title: "روتين العناية بالبشرة الصباحي",
            content: "أبدأ يومي بتنظيف البشرة ثم وضع سيروم فيتامين سي وكريم مرطب...",
            theme: "morning",
            author: "سارة",
            votes: 1245,
            date: "2025-10-15",
            in_competition: true
        },
        {
            id: 2,
            title: "روتين المساء للاسترخاء",
            content: "قبل النوم أستمتع بجلسة يوجا قصيرة ثم قراءة كتاب مع شاي الأعشاب...",
            theme: "evening",
            author: "فاطمة",
            votes: 1120,
            date: "2025-11-04",
            in_competition: true
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
        <div class="post-card ${post.in_competition ? 'competition-post' : ''}">
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
            return postsList.filter(post => post.in_competition);
        default:
            return postsList;
    }
}

// التصويت على منشور
async function votePost(postId) {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.votes++;
        
        // تحديث في قاعدة البيانات
        const { error } = await supabase
            .from('posts')
            .update({ votes: post.votes })
            .eq('id', postId);
            
        if (error) {
            console.error('Error updating vote:', error);
            post.votes--; // التراجع عن التصويت في حالة الخطأ
        }
        
        renderPosts();
    }
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // رفع الملفات للمنشورات
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
    
    // إعداد رفع صورة البروفايل
    setupProfileImageUpload();
    
    // نماذج التسجيل
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('postForm').addEventListener('submit', handlePostSubmit);
}

// معالجة رفع الملفات للمنشورات
function handleFiles(files) {
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaElement = file.type.startsWith('image/') ? 
                `<img src="${e.target.result}" alt="صورة" class="uploaded-image">` :
                `<video src="${e.target.result}" controls class="uploaded-video"></video>`;
            
            preview.innerHTML += mediaElement;
        };
        reader.readAsDataURL(file);
    });
}

// إصلاح رفع صورة البروفايل
function setupProfileImageUpload() {
    const profileImageInput = document.createElement('input');
    profileImageInput.type = 'file';
    profileImageInput.accept = 'image/*';
    profileImageInput.style.display = 'none';
    profileImageInput.id = 'profileImageInput';
    document.body.appendChild(profileImageInput);
    
    // تأكد من وجود الزر أولاً
    setTimeout(() => {
        const editAvatarBtn = document.querySelector('.edit-avatar');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                profileImageInput.click();
            });
        }
    }, 1000);
    
    profileImageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            handleProfileImageUpload(e.target.files[0]);
        }
    });
    
    // أيضاً إضافة إمكانية تغيير الصورة من البروفايل الرئيسي
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            if (currentUser) {
                profileImageInput.click();
            }
        });
    }
}

// معالجة رفع صورة البروفايل
function handleProfileImageUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // تحديث الصورة في كل الأماكن
        const profileAvatar = document.getElementById('profileAvatar');
        const userAvatar = document.getElementById('userAvatar');
        
        if (profileAvatar) profileAvatar.src = e.target.result;
        if (userAvatar) userAvatar.src = e.target.result;
        
        // تحديث بيانات المستخدم
        if (currentUser) {
            currentUser.avatar = e.target.result;
            // حفظ في localStorage مؤقتاً
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        alert('🎉 تم تغيير صورة البروفايل بنجاح!');
    };
    
    reader.onerror = function() {
        alert('❌ حدث خطأ في تحميل الصورة. حاولي مرة أخرى.');
    };
    
    reader.readAsDataURL(file);
}
// إنشاء حساب
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    if (password !== confirm) {
        alert('كلمات المرور غير متطابقة!');
        return;
    }
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name,
                avatar: `https://via.placeholder.com/40/ec4899/ffffff?text=${name.charAt(0)}`
            }
        }
    });

    if (error) {
        alert('خطأ في إنشاء الحساب: ' + error.message);
    } else {
        alert('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.');
        hideRegisterForm();
    }
}

// نشر منشور
async function handlePostSubmit(e) {
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
        title: title,
        content: content,
        theme: theme,
        author: currentUser.name,
        votes: 0,
        date: new Date().toISOString().split('T')[0],
        in_competition: inCompetition,
        user_id: currentUser.id
    };
    
    // إدراج في قاعدة البيانات
    const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select();

    if (error) {
        alert('خطأ في نشر المنشور: ' + error.message);
    } else {
        posts.unshift(data[0]);
        renderPosts();
        hidePostForm();
        
        // إعادة تعيين النموذج
        document.getElementById('postForm').reset();
        document.getElementById('mediaPreview').innerHTML = '';
        
        alert('تم نشر المنشور بنجاح!');
    }
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

async function logout() {
    const { error } = await supabase.auth.signOut();
    currentUser = null;
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
