// اختيار فيديو عشوائي عند كل تحميل
const videos = ['1.mp4', '2.mp4'];
const randomVideo = videos[Math.floor(Math.random() * videos.length)];
document.getElementById('video-source').src = randomVideo;
document.getElementById('bg-video').load();
