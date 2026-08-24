// اختيار فيديو عشوائي عند كل تحميل
const videos = ['1.mp4', '2.mp4'];
const randomVideo = videos[Math.floor(Math.random() * videos.length)];
document.getElementById('video-source').src = randomVideo;
document.getElementById('bg-video').load();

// زر الإعدادات
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const languageBtn = document.getElementById('language-btn');
const languageMenu = document.getElementById('language-menu');

settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.toggle('active');
    languageMenu.classList.remove('active');
});

languageBtn.addEventListener('click', () => {
    languageMenu.classList.toggle('active');
});

// تغيير اللغة
const langOptions = document.querySelectorAll('.lang-option');
const mainTitle = document.querySelector('.main-title');

langOptions.forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.getAttribute('data-lang');
        
        // إزالة التحديد من الكل
        langOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // تغيير العنوان
        mainTitle.textContent = mainTitle.getAttribute(`data-${lang}`);
        
        // تغيير اتجاه الصفحة
        if (lang === 'ar') {
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.lang = lang;
            document.documentElement.dir = 'ltr';
        }
    });
});

// تحديد العربية كافتراضية
document.querySelector('[data-lang="ar"]').classList.add('selected');