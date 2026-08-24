// تهيئة محرك القواعد
var game = new Chess();

// تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    
    // ✅ المسار الصحيح لصور القطع بناءً على مستودع GitHub الخاص بك
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    // التحقق من الحركات القانونية عند الإفلات
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // ترقية تلقائية للوزير
        });
        
        // إذا كانت الحركة غير قانونية، أعد القطعة لمكانها
        if (move === null) return 'snapback';
    },
    
    // تحديث حالة الرقعة بعد انتهاء الحركة (لضمان التزامن)
    onSnapEnd: function() {
        board.position(game.fen());
    }
});

// إعادة ضبط حجم الرقعة تلقائياً عند تغيير حجم نافذة المتصفح
$(window).resize(function() {
    board.resize();
});
