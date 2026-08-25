document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('bg-video');
    const source = document.getElementById('video-source');
    
    const videos = ['1.mp4', '2.mp4'];
    source.src = videos[Math.floor(Math.random() * videos.length)];
    
    // تحسينات صارمة لأداء الفيديو على الأجهزة الضعيفة
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata'); // لا يحمل الفيديو بالكامل إلا عند الحاجة
    video.muted = true;
    
    const tryPlay = () => {
        video.play().catch(() => {
            // إذا منع المتصفح التشغيل التلقائي، ننتظر أول لمس أو نقرة
            const unlock = () => {
                video.play();
                document.removeEventListener('click', unlock);
                document.removeEventListener('touchstart', unlock);
            };
            document.addEventListener('click', unlock);
            document.addEventListener('touchstart', unlock);
        });
    };
    
    tryPlay();

    // توفير الموارد: إيقاف الفيديو فوراً إذا غادر المستخدم التبويب
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
        } else {
            video.play().catch(() => {});
        }
    });
});
