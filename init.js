// تهيئة محرك القواعد
var game = new Chess();

// تهيئة الرقعة البصرية
var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    // منع سحب القطع إذا لم يكن دور اللاعب
    onDragStart: function(source, piece, position, orientation) {
        // السماح فقط بسحب القطع البيضاء (اللاعب)
        if (game.game_over()) return false;
        if (piece.search(/^b/) !== -1) return false; // منع سحب القطع السوداء
        return true;
    },
    
    // التحقق من الحركات القانونية عند الإفلات
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        if (move === null) return 'snapback';
        
        // تحديث حالة الرقعة
        board.position(game.fen());
        
        // التحقق من الكش والكش مات
        updateCheckStatus();
        
        // دور الروبوت (سنضيفه لاحقاً)
        // setTimeout(makeRobotMove, 500);
    },
    
    onSnapEnd: function() {
        board.position(game.fen());
    }
});

// دالة لعرض الحركات الممكنة عند النقر على قطعة
function showPossibleMoves(square) {
    // إزالة جميع المؤشرات السابقة
    removeMoveIndicators();
    
    // الحصول على الحركات الممكنة من هذا المربع
    var moves = game.moves({
        square: square,
        verbose: true
    });
    
    if (moves.length === 0) return;
    
    // عرض كل حركة
    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        var targetSquare = board.$board.find('.square-' + move.to);
        
        // تحديد نوع الحركة
        if (move.flags.includes('k') || move.flags.includes('q')) {
            // تبييت
            targetSquare.addClass('move-castle');
        } else if (move.flags.includes('c') || move.flags.includes('e')) {
            // أكل (عادي أو بالمرور)
            targetSquare.addClass('move-capture');
        } else {
            // حركة عادية
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
        // كش مات - أحمر غامق
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) {
            board.$board.find('.square-' + kingSquare).addClass('in-checkmate');
        }
        setTimeout(function() {
            alert('كش مات! اللعبة انتهت.');
        }, 100);
    } else if (game.in_check()) {
        // كش عادي - أحمر شفاف
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) {
            board.$board.find('.square-' + kingSquare).addClass('in-check');
        }
    } else if (game.in_draw()) {
        setTimeout(function() {
            alert('تعادل! اللعبة انتهت.');
        }, 100);
    }
}

// دالة للحصول على مربع الملك
function getKingSquare(color) {
    var boardPosition = game.board();
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var piece = boardPosition[i][j];
            if (piece && piece.type === 'k' && piece.color === color) {
                var file = String.fromCharCode(97 + j); // a-h
                var rank = 8 - i; // 8-1
                return file + rank;
            }
        }
    }
    return null;
}

// إضافة حدث النقر على المربعات
board.$board.on('click', '.square-55d63', function() {
    var square = $(this).data('square');
    
    // إذا كان هناك قطعة في هذا المربع
    var piece = game.get(square);
    if (piece && piece.color === 'w') { // فقط القطع البيضاء (اللاعب)
        showPossibleMoves(square);
    }
});

// إعادة ضبط حجم الرقعة عند تغيير حجم النافذة
$(window).resize(function() {
    board.resize();
});
