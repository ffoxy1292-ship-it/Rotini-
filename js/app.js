class RoutineApp {
    constructor() {
        this.themeManager = new ThemeManager();
        this.voteSystem = new VoteSystem();
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.setupEventListeners();
        this.updateUI();
    }

    loadUser() {
        // محاكاة نظام المستخدمين (في النسخة النهائية استخدمي Firebase)
        this.currentUser = {
            id: 'user_' + Date.now(),
            name: 'مستخدم',
            stars: 0
        };
        this.updateUserDisplay();
    }

    setupEventListeners() {
        document.getElementById('publish-btn').addEventListener('click', () => {
            this.publishPost();
        });
    }

    publishPost() {
        const content = document.getElementById('post-content').value;
        const currentTheme = this.themeManager.getCurrentTheme();
        
        if (!this.themeManager.isTemplateAvailable(currentTheme)) {
            alert('❌ انتهى وقت هذا القالب! لا يمكن النشر الآن.');
            return;
        }

        if (!content.trim()) {
            alert('⚠️ يرجى كتابة محتوى للنشر');
            return;
        }

        // إضافة مرشح للتصويت
        this.voteSystem.addCandidate(
            this.currentUser.id,
            this.currentUser.name,
            content
        );

        // حفظ المنشور
        this.savePost(content, currentTheme);
        
        // تحديث الواجهة
        this.updateUI();
        alert('✅ تم النشر بنجاح!');
        
        // مسح الحقول
        document.getElementById('post-content').value = '';
    }

    savePost(content, theme) {
        const posts = JSON.parse(localStorage.getItem('user_posts')) || [];
        posts.push({
            id: Date.now(),
            userId: this.currentUser.id,
            content: content,
            theme: theme,
            timestamp: new Date().toISOString(),
            likes: 0
        });
        localStorage.setItem('user_posts', JSON.stringify(posts));
    }

    updateUI() {
        this.updateUserDisplay();
        this.voteSystem.displayCandidates();
        this.updateTimeDisplay();
    }

    updateUserDisplay() {
        const starElement = document.getElementById('star-count');
        if (starElement) {
            starElement.textContent = this.currentUser.stars;
        }
    }

    updateTimeDisplay() {
        const now = new Date();
        const timeElement = document.getElementById('current-time-template');
        if (timeElement) {
            const themeNames = {
                'morning': '🌅 روتين الصباح',
                'evening': '🌇 روتين المساء', 
                'night': '🌙 روتين الليل'
            };
            timeElement.textContent = themeNames[this.themeManager.getCurrentTheme()] || 'روتيني';
        }
    }
}

// تشغيل التطبيق
const app = new RoutineApp();
const voteSystem = new VoteSystem();
