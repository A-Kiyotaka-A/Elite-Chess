// تهيئة محرك القواعد والرقعة
var game = new Chess();

var board = Chessboard('board-container', {
    draggable: true,
    position: 'start',
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    
    // السماح فقط بسحب القطع البيضاء
    onDragStart: function(source, piece) {
        if (game.game_over()) return false;
        if (piece.search(/^b/) !== -1) return false; 
        return true;
    },
    
    // عند إفلات القطعة
    onDrop: function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        // إذا كانت الحركة غير قانونية، أعد القطعة
        if (move === null) return 'snapback';
        
        removeMoveIndicators();
        updateTurnIndicator();
        updateCheckStatus();
        
        // إذا لم تنته اللعبة، دع أيانوكوجي يلعب
        if (!game.game_over()) {
            makeAyanokojiMove();
        }
    },
    
    // تحديث الرقعة بعد استقرار الحركة (يمنع ظهور الأشباح)
    onSnapEnd: function() {
        board.position(game.fen());
    }
});

// دالة جعل أيانوكوجي يلعب
function makeAyanokojiMove() {
    // إظهار مؤشر التفكير فوراً
    $('#thinking-indicator').fadeIn(200);
    
    // استخدام setTimeout لمنح المتصفح فرصة لتحديث الشاشة قبل بدء الحساب
    setTimeout(function() {
        // 800 ميلي ثانية كحد أقصى لمنع تجميد الأجهزة البطيئة
        var bestMove = getBestMove(game, 800);
        
        if (bestMove) {
            game.move(bestMove);
            board.position(game.fen());
            updateTurnIndicator();
            updateCheckStatus();
        }
        
        // إخفاء المؤشر بعد الانتهاء
        $('#thinking-indicator').fadeOut(200);
    }, 100);
}

// عرض الحركات الممكنة عند النقر على قطعة
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

// إزالة جميع المؤشرات
function removeMoveIndicators() {
    $('.square-55d63').removeClass('move-normal move-capture move-castle in-check in-checkmate');
}

// تحديث مؤشر الدور
function updateTurnIndicator() {
    var indicator = $('#turn-indicator');
    if (game.turn() === 'w') {
        indicator.html('<span class="dot white-dot"></span> دورك');
    } else {
        indicator.html('<span class="dot black-dot"></span> دور أيانوكوجي');
    }
}

// التحقق من حالة الكش والكش مات
function updateCheckStatus() {
    removeMoveIndicators();
    if (game.in_checkmate()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) $('.square-' + kingSquare).addClass('in-checkmate');
        showGameOverModal(game.turn() === 'w' ? 'loss' : 'win');
    } else if (game.in_check()) {
        var kingSquare = getKingSquare(game.turn());
        if (kingSquare) $('.square-' + kingSquare).addClass('in-check');
    } else if (game.in_draw()) {
        showGameOverModal('draw');
    }
}

// العثور على موقع الملك
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

// رسائل أيانوكوجي حسب النتيجة
var ayanokojiMessages = {
    win: [
        "\"النتيجة كانت حتمية منذ البداية.\"",
        "\"لم تكن تملك فرصة حقيقية.\"",
        "\"مشاعرك لا تعني شيئاً أمام المنطق.\"",
        "\"هل ظننت حقاً أنك تستطيع الفوز علي؟\""
    ],
    loss: [
        "\"... مثير للاهتمام.\"",
        "\"لم أحسب هذا الاحتمال.\"",
        "\"ربما... أخطأت في التقدير.\"",
        "\"لن أكرر هذا الخطأ.\""
    ],
    draw: [
        "\"تعادل. نتيجة متوقعة.\"",
        "\"لم تكن تستحق أكثر من ذلك.\"",
        "\"كفء... لكن ليس كافياً.\""
    ]
};

// عرض نافذة النتيجة
function showGameOverModal(result) {
    var modal = $('#game-over-modal');
    var title = $('#result-title');
    var message = $('#ayanokoji-message');
    
    title.removeClass('result-win result-loss result-draw');
    
    if (result === 'win') {
        title.text('فزت!').addClass('result-win');
    } else if (result === 'loss') {
        title.text('خسرت').addClass('result-loss');
    } else {
        title.text('تعادل').addClass('result-draw');
    }
    
    var messages = ayanokojiMessages[result];
    var randomMsg = messages[Math.floor(Math.random() * messages.length)];
    message.text(randomMsg);
    
    modal.fadeIn(300);
}

// إعادة تعيين اللعبة
function resetGame() {
    game.reset();
    board.start();
    removeMoveIndicators();
    updateTurnIndicator();
    $('#game-over-modal').fadeOut(200);
    if (typeof resetAI === 'function') {
        resetAI(); // مسح ذاكرة الذكاء الاصطناعي
    }
}

// ربط الأزرار بالأحداث
$('#btn-new-game').on('click', resetGame);
$('#btn-play-again').on('click', resetGame);

$('#btn-undo').on('click', function() {
    if (game.history().length >= 2) {
        game.undo(); // تراجع عن حركة أيانوكوجي
        game.undo(); // تراجع عن حركتك
        board.position(game.fen());
        removeMoveIndicators();
        updateTurnIndicator();
    }
});

// النقر على المربعات لإظهار الحركات
$(document).on('click', '.square-55d63', function() {
    var square = $(this).data('square');
    var piece = game.get(square);
    if (piece && piece.color === 'w') {
        showPossibleMoves(square);
    } else {
        removeMoveIndicators();
    }
});

// إعادة ضبط حجم الرقعة عند تغيير حجم النافذة
$(window).resize(function() {
    board.resize();
});

// التهيئة الأولية
updateTurnIndicator();
