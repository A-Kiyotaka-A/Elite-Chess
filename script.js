// 1. اختيار فيديو عشوائي عند كل تحميل
const videos = ['1.mp4', '2.mp4'];
const randomVideo = videos[Math.floor(Math.random() * videos.length)];
document.getElementById('video-source').src = randomVideo;
document.getElementById('bg-video').load();

// 2. التحكم بالقوائم
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const languageBtn = document.getElementById('language-btn');
const languageMenu = document.getElementById('language-menu');

settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.toggle('active');
    if (!settingsMenu.classList.contains('active')) {
        languageMenu.classList.remove('active');
    }
});

languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageMenu.classList.toggle('active');
});

// 3. تغيير اللغة والترجمة
const langOptions = document.querySelectorAll('.lang-option');
const menuText = document.querySelector('.menu-text');

// عناوين التبويب مع الزخرفة المطلوبة
const tabTitles = {
    ar: '｢ شطرنج النُّخبة ｣',
    en: '｢ Elite Chess ｣',
    ja: '｢ エリート・チェス ｣'
};

langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        
        // تحديث تحديد اللغة
        langOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // ترجمة النصوص في القائمة
        menuText.textContent = menuText.getAttribute(`data-${lang}`);
        
        // تغيير عنوان التبويب
        document.title = tabTitles[lang];
        
        // تغيير اتجاه الصفحة
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    });
});

// تحديد العربية كافتراضية
document.querySelector('[data-lang="ar"]').classList.add('selected');
