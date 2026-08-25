// تهيئة محرك القواعد
var game = new Chess();

// تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    onDragStart: function(source, piece, position, orientation) {
        if (game.game_over()) return false;
        if (piece.search(/^b/) !== -1) return false; // منع سحب القطع السوداء
        return true;
    },
    
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        if (move === null) return 'snapback';
        
        board.position(game.fen());
        updateCheckStatus();
    },
    
    onSnapEnd: function() {
        board.position(game.fen());
    }
});

// دالة لعرض الحركات الممكنة عند النقر على قطعة
function showPossibleMoves(square) {
    removeMoveIndicators();
    var moves = game.moves({ square: square, verbose: true });
    if (moves.length === 0) return;
    
    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        var targetSquare = board.$board.find('.square-' + move.to);
        
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
    board.$board.find('.square-55d63').removeClass('move-normal move-capture move-castle in-check in-checkmate');
}

// دالة للتحقق من حالة الكش
function updateCheckStatus() {
    removeMoveIndicators();
    if (game.in_checkmate()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) board.$board.find('.square-' + kingSquare).addClass('in-checkmate');
        setTimeout(function() { alert('كش مات! اللعبة انتهت.'); }, 100);
    } else if (game.in_check()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) board.$board.find('.square-' + kingSquare).addClass('in-check');
    } else if (game.in_draw()) {
        setTimeout(function() { alert('تعادل! اللعبة انتهت.'); }, 100);
    }
}

// دالة للحصول على مربع الملك
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

// إضافة حدث النقر على المربعات
board.$board.on('click', '.square-55d63', function() {
    var square = $(this).data('square');
    var piece = game.get(square);
    if (piece && piece.color === 'w') {
        showPossibleMoves(square);
    }
});

$(window).resize(function() {
    board.resize();
});
