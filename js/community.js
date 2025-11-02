// نظام المجتمع
let communityPosts = JSON.parse(localStorage.getItem('routinyat-posts')) || [];
let currentFilter = 'all';

// عرض المشاركات في المجتمع
function displayCommunityPosts() {
    const postsContainer = document.getElementById('communityPosts');
    let filteredPosts = communityPosts;

    // تطبيق الفلتر
    if (currentFilter === 'morning') {
        filteredPosts = communityPosts.filter(post => post.theme === 'morning');
    } else if (currentFilter === 'evening') {
        filteredPosts = communityPosts.filter(post => post.theme === 'evening');
    } else if (currentFilter === 'popular') {
        filteredPosts = communityPosts.filter(post => post.likes >= 5);
    }

    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts" style="text-align: center; padding: 4rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">👥</div>
                <h3 style="color: var(--text-dark); margin-bottom: 1rem;">لا توجد مشاركات</h3>
                <p style="color: var(--text-light); margin-bottom: 2rem;">
                    ${currentFilter === 'all' ? 'لا توجد مشاركات في المجتمع بعد' : 
                      currentFilter === 'popular' ? 'لا توجد مشاركات شائعة بعد' : 
                      `لا توجد مشاركات ${currentFilter === 'morning' ? 'صباحية' : 'مسائية'} بعد`}
                </p>
                <button class="btn-post" onclick="location.href='index.html'">
                    <i class="fas fa-plus"></i>
                    ابدئي بمشاركة روتينك
                </button>
            </div>
        `;
        return;
    }

    postsContainer.innerHTML = filteredPosts.map(post => `
        <div class="community-post ${post.theme}" data-id="${post.id}">
            <div class="post-header">
                <div class="post-author-info">
                    <div class="author-avatar">
                        ${post.author.charAt(0)}
                    </div>
                    <div class="author-details">
                        <span class="author-name">${post.author}</span>
                        <span class="post-date">${post.date}</span>
                    </div>
                </div>
                <span class="post-theme ${post.theme}">
                    ${post.theme === 'morning' ? '🌞 صباحي' : '🌙 مسائي'}
                </span>
            </div>
            
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.content}</p>
            </div>
            
            <div class="post-actions">
                <button class="action-btn like-btn" onclick="likeCommunityPost(${post.id})">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes}</span>
                </button>
                <button class="action-btn comment-btn" onclick="showComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments ? post.comments.length : 0}</span>
                </button>
                <button class="action-btn share-btn" onclick="sharePost(${post.id})">
                    <i class="fas fa-share"></i>
                </button>
            </div>
            
            ${post.comments && post.comments.length > 0 ? `
                <div class="post-comments">
                    ${post.comments.slice(0, 2).map(comment => `
                        <div class="comment">
                            <strong>${comment.author}:</strong> ${comment.text}
                        </div>
                    `).join('')}
                    ${post.comments.length > 2 ? `
                        <div class="more-comments">+${post.comments.length - 2} تعليق إضافي</div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// الإعجاب في المجتمع
function likeCommunityPost(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        savePosts();
        displayCommunityPosts();
        
        // تأثير الإعجاب
        const likeBtn = event.target.closest('.like-btn');
        likeBtn.classList.add('liked');
        setTimeout(() => {
            likeBtn.classList.remove('liked');
        }, 600);
    }
}

// تصفية المشاركات
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // تحديد الزر النشط
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // تطبيق الفلتر
            currentFilter = this.dataset.filter;
            displayCommunityPosts();
        });
    });
}

// مشاركة المشاركة
function sharePost(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (post && navigator.share) {
        navigator.share({
            title: post.title,
            text: post.content,
            url: window.location.href
        });
    } else {
        // نسخ الرابط
        const tempInput = document.createElement('input');
        tempInput.value = `${post.title}\n\n${post.content}\n\n---\nشاركتها من تطبيق روتينيات`;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        alert('📋 تم نسخ المشاركة! يمكنك مشاركتها الآن.');
    }
}

// حفظ المشاركات
function savePosts() {
    localStorage.setItem('routinyat-posts', JSON.stringify(communityPosts));
}

// التهيئة الأولية للمجتمع
document.addEventListener('DOMContentLoaded', function() {
    displayCommunityPosts();
    setupFilters();
    
    // إضافة CSS إضافي للمجتمع
    const communityStyles = `
        .community-page {
            padding: 100px 2rem 4rem;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .page-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .page-header h1 {
            font-size: 2.5rem;
            color: var(--text-dark);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }
        
        .page-header p {
            color: var(--text-light);
            font-size: 1.2rem;
        }
        
        .community-filters {
            margin-bottom: 2rem;
        }
        
        .filter-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .filter-btn {
            padding: 0.8rem 1.5rem;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            color: var(--text-light);
        }
        
        .filter-btn.active,
        .filter-btn:hover {
            background: linear-gradient(135deg, var(--primary-pink), var(--purple));
            color: white;
            border-color: transparent;
        }
        
        .community-post {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        .community-post:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .post-author-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .author-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-pink), var(--purple));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .author-details {
            display: flex;
            flex-direction: column;
        }
        
        .author-name {
            font-weight: 600;
            color: var(--text-dark);
        }
        
        .post-date {
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .post-content {
            margin: 1.5rem 0;
        }
        
        .post-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 1rem;
        }
        
        .post-text {
            color: var(--text-light);
            line-height: 1.6;
        }
        
        .post-actions {
            display: flex;
            gap: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-light);
            transition: all 0.3s ease;
            padding: 0.5rem 1rem;
            border-radius: 20px;
        }
        
        .action-btn:hover {
            background: rgba(0, 0, 0, 0.05);
        }
        
        .like-btn.liked {
            color: var(--primary-pink);
            animation: heartBeat 0.6s ease;
        }
        
        @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.3); }
            50% { transform: scale(1); }
            75% { transform: scale(1.2); }
        }
        
        .post-comments {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .comment {
            padding: 0.5rem 0;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .more-comments {
            color: var(--primary-pink);
            font-weight: 600;
            cursor: pointer;
            margin-top: 0.5rem;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = communityStyles;
    document.head.appendChild(styleSheet);
});
