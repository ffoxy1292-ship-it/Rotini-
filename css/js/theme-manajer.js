class ThemeManager {
    constructor() {
        this.currentTheme = '';
        this.init();
    }

    init() {
        this.updateThemeBasedOnTime();
        setInterval(() => {
            this.updateThemeBasedOnTime();
        }, 60000); // تحديث كل دقيقة
    }

    updateThemeBasedOnTime() {
        const now = new Date();
        const hour = now.getHours();
        
        // إزالة الثيم الحالي
        document.body.classList.remove('theme-morning', 'theme-evening', 'theme-night');
        
        // تحديد الثيم حسب الوقت
        if (hour >= 6 && hour < 12) {
            this.setMorningTheme();
        } else if (hour >= 12 && hour < 18) {
            this.setEveningTheme();
        } else {
            this.setNightTheme();
        }
    }

    setMorningTheme() {
        document.body.classList.add('theme-morning');
        this.updateSkyBar('#87CEEB', '#98FB98', 'cloud');
        this.currentTheme = 'morning';
    }

    setEveningTheme() {
        document.body.classList.add('theme-evening');
        this.updateSkyBar('#FF7E5F', '#FEB47B', 'cloud');
        this.currentTheme = 'evening';
    }

    setNightTheme() {
        document.body.classList.add('theme-night');
        this.updateSkyBar('#0F2027', '#2C5364', 'star');
        this.currentTheme = 'night';
    }

    updateSkyBar(color1, color2, elementType) {
        const skyBar = document.getElementById('sky-bar');
        skyBar.style.background = `linear-gradient(90deg, ${color1}, ${color2})`;
        
        // تحديث العناصر في شريط السماء
        skyBar.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const element = document.createElement('div');
            element.className = elementType;
            element.style.left = `${Math.random() * 100}%`;
            element.style.animationDelay = `${Math.random() * 5}s`;
            skyBar.appendChild(element);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    isTemplateAvailable(templateType) {
        const now = new Date();
        const hour = now.getHours();
        
        const timeSlots = {
            'morning': { start: 6, end: 12 },
            'evening': { start: 12, end: 18 },
            'night': { start: 18, end: 24 }
        };
        
        const slot = timeSlots[templateType];
        return hour >= slot.start && hour < slot.end;
    }
  }
