// البيانات
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

// دالة التصفية - مهمة!
function filterPosts(filter) {
    console.log('جاري تصفية:', filter);
    currentFilter = filter;
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayPosts();
}

// عرض المنشورات
function displayPosts() {
    console.log('عرض المنشورات، الفلتر:', currentFilter);
    const postsGrid = document.getElementById('postsGrid');
    let filteredPosts = posts;

    // تطبيق الفلتر
    if (currentFilter === 'morning') {
        filteredPosts = posts.filter(post => post.theme === 'morning');
    } else if (currentFilter === 'evening') {
        filteredPosts = posts.filter(post => post.theme === 'evening');
    } else if (currentFilter === 'popular') {
        filteredPosts = posts.filter(post => post.votes > 0);
    } else if (currentFilter === 'weekly') {
        filteredPosts = posts.filter(post => post.inCompetition);
    }

    console.log('المنشورات المصفاة:', filteredPosts);

    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-feather"></i>
                <h3>لا توجد منشورات</h3>
                <p>${currentFilter === 'all' ? 'لا توجد منشورات بعد' : 
                   currentFilter === 'morning' ? 'لا توجد منشورات صباحية' :
                   currentFilter === 'evening' ? 'لا توجد منشورات مسائية' :
                   'لا توجد منشورات في المنافسة'}</p>
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

// التصويت
function votePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.votes = (post.votes || 0) + 1;
        savePosts();
        displayPosts();
        
        // تأثير التصويت
        const btn = event.target.closest('.vote-btn');
        btn.classList.add('voted');
        setTimeout(() => btn.classList.remove('voted'), 1000);
    }
}

// إظهار نموذج المنشور
function showPostForm() {
    console.log('فتح نموذج المنشور');
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

    uploadArea.addEventListener('click', () => {
        console.log('نقر على منطقة الرفع');
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        console.log('تم اختيار ملف:', e.target.files);
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
                console.log('تم تحميل الصورة');
            };
            reader.readAsDataURL(file);
        }
    });
}

// إضافة منشور جديد
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('محاولة إضافة منشور');
    
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
        title,
        content,
        theme: theme.value,
        media: selectedMedia,
        votes: 0,
        author: getRandomFemaleName(),
        date: new Date().toLocaleDateString('ar-AR'),
        timestamp: Date.now(),
        inCompetition: joinCompetition
    };
    
    posts.unshift(newPost);
    savePosts();
    displayPosts();
    hidePostForm();
    
    alert('🎉 تم نشر روتينك بنجاح!');
});

// أسماء عشوائية
function getRandomFemaleName() {
    const names = ['سارة', 'فاطمة', 'مريم', 'هدى', 'نور', 'لينا', 'ياسمين', 'ريم'];
    return names[Math.floor(Math.random() * names.length)];
}

// حفظ البيانات
function savePosts() {
    localStorage.setItem('routinyat-posts', JSON.stringify(posts));
}

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
    
    // إعداد الأحداث
    setupMediaUpload();
    displayPosts();
    
    // إغلاق المودال
    document.getElementById('postModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hidePostForm();
        }
    });
    
    // منع إغلاق المودال عند النقر داخله
    document.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    console.log('التهيئة اكتملت');
});
