// تهيئة محرك القواعد
var game = new Chess();

// تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    
    // مسار صور القطع
    // ⚠️ مهم: غيّر هذا المسار حسب مكان صور القطع لديك
    // إذا كانت الصور في مجلد img وأسمائها مثل wP.png, bK.png
    pieceTheme: 'img/{piece}.png',
    
    // التحقق من الحركات القانونية
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        // إذا كانت الحركة غير قانونية، أعد القطعة
        if (move === null) return 'snapback';
    }
});

// إعادة ضبط حجم الرقعة عند تغيير حجم النافذة
$(window).resize(function() {
    board.resize();
});
