var game = new Chess();

var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    onDragStart: function(source, piece) {
        if (game.game_over()) return false;
        if (piece.search(/^b/) !== -1) return false; // منع سحب قطع أيانوكوجي
        return true;
    },
    
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        if (move === null) return 'snapback';
        
        removeMoveIndicators();
        updateCheckStatus();
        
        // إذا لم تنته اللعبة، دع أيانوكوجي يلعب
        if (!game.game_over()) {
            setTimeout(makeAyanokojiMove, 600); // تأخير بسيط لمحاكاة "التفكير"
        }
    },
    
    onSnapEnd: function() {
        board.position(game.fen());
    }
});

// دالة جعل أيانوكوجي يلعب
function makeAyanokojiMove() {
    const statusEl = document.getElementById('ayanokoji-status');
    statusEl.style.display = 'block';
    statusEl.textContent = getAyanokojiQuote(); // عرض رسالة باردة أثناء التفكير

    // استخدام setTimeout للسماح للمتصفح بتحديث واجهة المستخدم قبل بدء الحساب الثقيل
    setTimeout(() => {
        const bestMove = getBestMove(game, 4); // عمق 4 = قوي جداً وسريع
        
        if (bestMove) {
            game.move(bestMove);
            board.position(game.fen());
            updateCheckStatus();
        }
        
        statusEl.style.display = 'none'; // إخفاء رسالة التفكير
    }, 500);
}

// --- دوال المساعدة (نفس السابقة) ---
function showPossibleMoves(square) {
    removeMoveIndicators();
    var moves = game.moves({ square: square, verbose: true });
    if (moves.length === 0) return;
    
    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        var $targetSquare = $('.square-' + move.to);
        
        if (move.flags.includes('k') || move.flags.includes('q')) {
            $targetSquare.addClass('move-castle');
        } else if (move.flags.includes('c') || move.flags.includes('e')) {
            $targetSquare.addClass('move-capture');
        } else {
            $targetSquare.addClass('move-normal');
        }
    }
}

function removeMoveIndicators() {
    $('.square-55d63').removeClass('move-normal move-capture move-castle in-check in-checkmate');
}

function updateCheckStatus() {
    removeMoveIndicators();
    if (game.in_checkmate()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) $('.square-' + kingSquare).addClass('in-checkmate');
        setTimeout(() => alert('أيانوكوجي: "لقد انتهت اللعبة، كما توقعت."'), 300);
    } else if (game.in_check()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) $('.square-' + kingSquare).addClass('in-check');
    } else if (game.in_draw()) {
        setTimeout(() => alert('أيانوكوجي: "تعادل. لم تكن تستحق أكثر من ذلك."'), 300);
    }
}

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

$(document).on('click', '.square-55d63', function() {
    var square = $(this).data('square');
    var piece = game.get(square);
    if (piece && piece.color === 'w') {
        showPossibleMoves(square);
    } else {
        removeMoveIndicators();
    }
});

$(window).resize(function() {
    board.resize();
});
