// 1. تهيئة محرك القواعد
var game = new Chess();

// 2. تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    
    // ⚠️ مهم جداً: مسار صور القطع
    // يجب أن يتطابق هذا المسار مع مكان مجلد الصور لديك.
    // إذا كانت الصور في مجلد img وأسمائها مثل wP.png, bK.png فاضبطها هكذا:
    pieceTheme: 'img/{piece}.png', 
    
    // إذا كانت الصور في مجلد img/chesspieces/wikipedia/ فاستخدم هذا:
    // pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',

    // 3. دالة التحقق من الحركات القانونية
    onDrop: function(source, target) {
        // محاولة تنفيذ الحركة في محرك القواعد
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // ترقية البيدق تلقائياً إلى وزير
        });
        
        // إذا كانت الحركة غير قانونية، أعد القطعة لمكانها
        if (move === null) return 'snapback';
    }
});

// 4. إعادة ضبط حجم الرقعة عند تغيير حجم النافذة
$(window).resize(function() {
    board.resize();
});