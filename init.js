// تهيئة محرك القواعد
var game = new Chess();

// تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    
    // ✅ تم تصحيح مسار الصور ليطابق مجلداتك على GitHub
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    // التحقق من الحركات القانونية
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // ترقية تلقائية للوزير
        });
        
        // إذا كانت الحركة غير قانونية، أعد القطعة لمكانها
        if (move === null) return 'snapback';
    },
    
    // تحديث حالة اللعبة بعد كل حركة (للتأكد من عدم وجود أخطاء)
    onSnapEnd: function() {
        board.position(game.fen());
    }
});

// إعادة ضبط حجم الرقعة عند تغيير حجم النافذة
$(window).resize(function() {
    board.resize();
});
