// تهيئة محرك القواعد
var game = new Chess();

// تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    // السماح بسحب أي قطعة (أبيض أو أسود) للتجربة
    onDragStart: function(source, piece, position, orientation) {
        if (game.game_over()) return false;
        return true; 
    },
    
    // التحقق من الحركات القانونية عند الإفلات
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        // إذا كانت الحركة غير قانونية، أعد القطعة لمكانها فوراً
        if (move === null) return 'snapback';
        
        // ملاحظة هامة: لا نضع board.position() هنا لتجنب ظهور "الأشباح"
    },
    
    // تحديث الرقعة بعد استقرار القطعة (هذا هو المكان الصحيح لمنع الأشباح)
    onSnapEnd: function() {
        board.position(game.fen());
        updateCheckStatus();
    }
});

// دالة لعرض الحركات الممكنة عند النقر على قطعة
function showPossibleMoves(square) {
    removeMoveIndicators();
    var moves = game.moves({ square: square, verbose: true });
    if (moves.length === 0) return;
    
    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        var targetSquare = $('.square-' + move.to);
        
        if (move.flags.includes('k') || move.flags.includes('q')) {
            targetSquare.addClass('move-castle');
        } else if (move.flags.includes('c') || move.flags.includes('e')) {
            targetSquare.addClass('move-capture');
        } else {
            targetSquare.addClass('move-normal');
        }
    }
}

// دالة لإزالة جميع المؤشرات
function removeMoveIndicators() {
    $('.square-55d63').removeClass('move-normal move-capture move-castle in-check in-checkmate');
}

// دالة للتحقق من حالة الكش والكش مات
function updateCheckStatus() {
    removeMoveIndicators();
    if (game.in_checkmate()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) $('.square-' + kingSquare).addClass('in-checkmate');
        setTimeout(function() { alert('كش مات! انتهت اللعبة.'); }, 300);
    } else if (game.in_check()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) $('.square-' + kingSquare).addClass('in-check');
    } else if (game.in_draw()) {
        setTimeout(function() { alert('تعادل! انتهت اللعبة.'); }, 300);
    }
}

// دالة للحصول على موقع الملك الحالي
function getKingSquare(color) {
    var boardPosition = game.board();
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var piece = boardPosition[i][j];
            if (piece && piece.type === 'k' && piece.color === color) {
                return String.fromCharCode(97 + j) + (8 - i);
            }
        }
    }
    return null;
}

// إضافة حدث النقر لإظهار الحركات
$(document).on('click', '.square-55d63', function() {
    var square = $(this).data('square');
    var piece = game.get(square);
    if (piece) {
        showPossibleMoves(square);
    } else {
        removeMoveIndicators();
    }
});

// إعادة ضبط حجم الرقعة عند تغيير حجم النافذة
$(window).resize(function() {
    board.resize();
});
