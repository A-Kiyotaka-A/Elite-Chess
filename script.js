document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('bg-video');
    const source = document.getElementById('video-source');
    
    const videos = ['1.mp4', '2.mp4'];
    source.src = videos[Math.floor(Math.random() * videos.length)];
    
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.muted = true;
    
    const tryPlay = () => {
        video.play().catch(() => {
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

    // التعامل الذكي مع مغادرة التبويب (يمنع إعادة التحميل من الصفر)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause(); // إيقاف الفيديو لتوفير الموارد
        } else {
            // عند العودة، فقط استأنف الفيديو، لا تعيد تحميل الصفحة
            video.play().catch(() => {});
        }
    });
});
