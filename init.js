// تهيئة محرك القواعد
var game = new Chess();

// تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    // التحقق من الحركات القانونية عند الإفلات
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        // إذا كانت الحركة غير قانونية، أعد القطعة لمكانها
        if (move === null) return 'snapback';
        
        // تحديث حالة الكش
        updateCheckStatus();
    },
    
    //
