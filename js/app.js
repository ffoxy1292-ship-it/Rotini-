// تكوين Supabase
const SUPABASE_URL = 'https://aqubnqhjqpppmjjckbet.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdWJucWhqcXBwcG1qamNrYmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Nzc3MzksImV4cCI6MjA3ODE1MzczOX0.JdZzOM4U44ppNewcNJjFtxlDQAIrt_HXHLWW831hz6I';

// إنشاء عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// حالة التطبيق
let currentUser = null;
let posts = [];
let currentFilter = 'all';

// صور بروفايل افتراضية
const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadPosts();
    setupEventListeners();
});

// التحقق من حالة التسجيل
async function checkAuthStatus() {
    // تحقق من localStorage أولاً
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserProfile();
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user && !error) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // استخدام الصورة المحفوظة أو افتراضية
        const savedAvatar = localStorage.getItem('userAvatar');
        const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
        
        currentUser = {
            id: user.id,
            email: user.email,
            name: profile?.name || user.user_metadata?.name || 'مستخدم',
            avatar: savedAvatar || profile?.avatar || user.user_metadata?.avatar || randomAvatar
        };
        
        // حفظ في localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
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
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles (name, avatar)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        posts = data || [];
        renderPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        // استخدام بيانات تجريبية في حالة الخطأ
        loadSamplePosts();
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
            author_avatar: DEFAULT_AVATARS[0],
            votes: 1245,
            created_at: new Date().toISOString(),
            in_competition: true,
            image_data: "https://images.unsplash.com/photo-1558618666-fcd25856cd63?w=400&h=300&fit=crop"
        },
        {
            id: 2,
            title: "روتين المساء للاسترخاء",
            content: "قبل النوم أستمتع بجلسة يوجا قصيرة ثم قراءة كتاب مع شاي الأعشاب...",
            theme: "evening",
            author: "فاطمة",
            author_avatar: DEFAULT_AVATARS[1],
            votes: 1120,
            created_at: new Date().toISOString(),
            in_competition: true,
            image_data: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?w=400&h=300&fit=crop"
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
    
    postsGrid.innerHTML = filteredPosts.map(post => {
        const authorAvatar = post.profiles?.avatar || post.author_avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
        const authorName = post.profiles?.name || post.author;
        
        return `
        <div class="post-card ${post.in_competition ? 'competition-post' : ''}">
            <div class="post-header">
                <div class="post-author-info">
                    <img src="${authorAvatar}" alt="${authorName}" class="author-avatar">
                    <span class="post-author">${authorName}</span>
                </div>
                <div class="post-meta">
                    <span class="post-theme ${post.theme}">
                        ${post.theme === 'morning' ? '🌞 صباحي' : '🌙 مسائي'}
                    </span>
                    <span class="post-date">${formatDate(post.created_at || post.date)}</span>
                </div>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-content">${post.content}</p>
            ${post.image_data ? `
                <div class="post-media">
                    <img src="${post.image_data}" alt="صورة المنشور" class="post-image">
                </div>
            ` : `
                <div class="post-media">
                    <div class="no-image">
                        <i class="fas fa-image"></i>
                        <span>لا توجد صورة</span>
                    </div>
                </div>
            `}
            <div class="post-actions">
                <button class="vote-btn" onclick="votePost(${post.id})">
                    <i class="fas fa-heart"></i>
                    <span>${post.votes || 0}</span>
                </button>
                <span class="post-stats">${post.votes || 0} إعجاب</span>
            </div>
        </div>
        `;
    }).join('');
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
        post.votes = (post.votes || 0) + 1;
        
        // تحديث في قاعدة البيانات
        try {
            const { error } = await supabase
                .from('posts')
                .update({ votes: post.votes })
                .eq('id', postId);
                
            if (error) throw error;
            
            renderPosts();
        } catch (error) {
            console.error('Error updating vote:', error);
            post.votes--; // التراجع عن التصويت في حالة الخطأ
        }
    }
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // رفع الملفات للمنشورات
    const uploadArea = document.getElementById('uploadArea');
    const mediaFiles = document.getElementById('mediaFiles');
    
    if (uploadArea && mediaFiles) {
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
    }
    
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
    if (!preview) return;
    
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (file.type.startsWith('image/')) {
                preview.innerHTML = `<img src="${e.target.result}" alt="صورة" class="uploaded-image">`;
            } else if (file.type.startsWith('video/')) {
                preview.innerHTML = `<video src="${e.target.result}" controls class="uploaded-video"></video>`;
            }
        };
        reader.readAsDataURL(file);
    });
}

// إعداد رفع صورة البروفايل
function setupProfileImageUpload() {
    const profileImageInput = document.createElement('input');
    profileImageInput.type = 'file';
    profileImageInput.accept = 'image/*';
    profileImageInput.style.display = 'none';
    profileImageInput.id = 'profileImageInput';
    document.body.appendChild(profileImageInput);
    
    profileImageInput.addEventListener('change', async function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // تحقق من حجم الصورة
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر من 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const imageData = e.target.result;
                    
                    // تحديث الصورة محلياً فوراً
                    document.querySelectorAll('#userAvatar, #profileAvatar').forEach(img => {
                        img.src = imageData;
                    });
                    
                    // حفظ في localStorage
                    if (currentUser) {
                        currentUser.avatar = imageData;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        localStorage.setItem('userAvatar', imageData);
                        
                        // تحديث في Supabase
                        const { error } = await supabase
                            .from('profiles')
                            .upsert({
                                id: currentUser.id,
                                avatar: imageData,
                                name: currentUser.name,
                                updated_at: new Date().toISOString()
                            });

                        if (error) throw error;
                        
                        alert('🎉 تم تحديث صورة البروفايل بنجاح!');
                    }
                    
                } catch (error) {
                    console.error('خطأ في حفظ الصورة:', error);
                    alert('❌ حدث خطأ في حفظ الصورة');
                }
            };
            
            reader.onerror = function() {
                alert('❌ حدث خطأ في تحميل الصورة');
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // إضافة مستمعي الأحداث للأزرار
    setTimeout(() => {
        const editAvatarBtn = document.querySelector('.edit-avatar');
        const userAvatar = document.getElementById('userAvatar');
        
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => profileImageInput.click());
        }
        
        if (userAvatar) {
            userAvatar.style.cursor = 'pointer';
            userAvatar.addEventListener('click', () => {
                if (currentUser) profileImageInput.click();
            });
        }
    }, 1000);
}

// تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        // جلب بيانات البروفايل بعد التسجيل
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const savedAvatar = localStorage.getItem('userAvatar');
        const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
        
        currentUser = {
            id: data.user.id,
            email: data.user.email,
            name: profile?.name || data.user.user_metadata?.name || 'مستخدم',
            avatar: savedAvatar || profile?.avatar || data.user.user_metadata?.avatar || randomAvatar
        };
        
        // حفظ في localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showUserProfile();
        hideLoginForm();
        alert('✅ تم تسجيل الدخول بنجاح!');
        
    } catch (error) {
        alert('❌ خطأ في تسجيل الدخول: ' + error.message);
    }
}

// إنشاء حساب
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    if (password !== confirm) {
        alert('❌ كلمات المرور غير متطابقة!');
        return;
    }
    
    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    avatar: randomAvatar
                }
            }
        });

        if (error) throw error;

        // إنشاء بروفايل للمستخدم الجديد
        await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                name: name,
                avatar: randomAvatar
            });
            
        alert('✅ تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.');
        hideRegisterForm();
        
    } catch (error) {
        alert('❌ خطأ في إنشاء الحساب: ' + error.message);
    }
}

// نشر منشور - الإصدار المصحح
async function handlePostSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const themeElement = document.querySelector('input[name="theme"]:checked');
    
    if (!title || !content || !themeElement) {
        alert('❌ يرجى ملء جميع الحقول');
        return;
    }
    
    const theme = themeElement.value;
    const inCompetition = document.getElementById('joinCompetition').checked;
    
    // الحصول على الصورة المرفوعة إذا وجدت
    let imageData = null;
    const mediaPreview = document.getElementById('mediaPreview');
    if (mediaPreview) {
        const uploadedImage = mediaPreview.querySelector('img');
        if (uploadedImage) {
            imageData = uploadedImage.src;
        }
    }
    
    try {
        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    title: title,
                    content: content,
                    theme: theme,
                    author: currentUser.name,
                    author_avatar: currentUser.avatar,
                    votes: 0,
                    created_at: new Date().toISOString(),
                    in_competition: inCompetition,
                    image_data: imageData,
                    user_id: currentUser.id
                }
            ])
            .select();

        if (error) throw error;

        // إضافة المنشور الجديد للمصفوفة وعرضه
        if (data && data.length > 0) {
            posts.unshift(data[0]);
            renderPosts();
            hidePostForm();
            
            // إعادة تعيين النموذج
            document.getElementById('postForm').reset();
            if (mediaPreview) mediaPreview.innerHTML = '';
            
            alert('✅ تم نشر المنشور بنجاح!');
        }
        
    } catch (error) {
        console.error('خطأ في النشر:', error);
        alert('❌ حدث خطأ في نشر المنشور: ' + error.message);
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
    
    // تحديث الإحصائيات
    const userPosts = posts.filter(post => post.user_id === currentUser.id);
    document.getElementById('statPosts').textContent = userPosts.length;
    document.getElementById('statVotes').textContent = userPosts.reduce((sum, post) => sum + (post.votes || 0), 0);
    document.getElementById('statPoints').textContent = userPosts.length * 10;
}

function hideProfilePage() {
    document.getElementById('profilePage').style.display = 'none';
}

function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('show');
}

function showMyPosts() {
    if (!currentUser) return;
    
    // تصفية لعرض منشورات المستخدم فقط
    const userPosts = posts.filter(post => post.user_id === currentUser.id);
    const tempPosts = posts;
    posts = userPosts;
    currentFilter = 'all';
    renderPosts();
    
    alert('📝 يتم عرض منشوراتك فقط');
    document.getElementById('userMenu').classList.remove('show');
    
    // إعادة المنشورات بعد 5 ثواني
    setTimeout(() => {
        posts = tempPosts;
        renderPosts();
    }, 5000);
}

async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        localStorage.removeItem('currentUser');
        showAuthButtons();
        document.getElementById('userMenu').classList.remove('show');
        alert('✅ تم تسجيل الخروج بنجاح!');
    } catch (error) {
        alert('❌ خطأ في تسجيل الخروج: ' + error.message);
    }
}

function editProfile() {
    alert('🔄 سيتم فتح صفحة تعديل الملف الشخصي قريباً!');
}

function changeAvatar() {
    document.getElementById('profileImageInput').click();
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

// منع إغلاق القائمة عند النقر داخلها
document.addEventListener('click', function(e) {
    const userMenu = document.getElementById('userMenu');
    const userProfile = document.getElementById('userProfile');
    
    if (userMenu && userMenu.classList.contains('show') && userProfile && !userProfile.contains(e.target)) {
        userMenu.classList.remove('show');
    }
});
