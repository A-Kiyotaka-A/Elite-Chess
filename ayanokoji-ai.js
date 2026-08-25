/* ==========================================
   عقل أيانوكوجي (White Room AI)
   مستوى الصعوبة: Grandmaster (مستحيل الهزيمة تقريباً)
   ========================================== */

// قيم القطع الأساسية
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// جداول تقييم المواقع (Piece-Square Tables)
// تشجع الذكاء الاصطناعي على وضع القطع في أماكن استراتيجية (مثل الأحصنة في الوسط)
const PST = {
    p: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    n: [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    b: [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    r: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    q: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    k: [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ]
};

// دالة تقييم الوضع الحالي للرقعة
function evaluateBoard(board) {
    let totalEvaluation = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                // استخدام جداول المواقع (مع عكس الجدول للقطع السوداء)
                const pstValue = piece.color === 'w' 
                    ? PST[piece.type][i][j] 
                    : PST[piece.type][7 - i][j];
                
                if (piece.color === 'w') {
                    totalEvaluation += (value + pstValue);
                } else {
                    totalEvaluation -= (value + pstValue);
                }
            }
        }
    }
    return totalEvaluation;
}

// خوارزمية Minimax مع تقليم Alpha-Beta (للبحث العميق والسريع)
function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || game.game_over()) {
        return evaluateBoard(game.board());
    }

    const moves = game.moves();
    // ترتيب الحركات لتحسين كفاءة التقليم (الأكل أولاً)
    moves.sort((a, b) => {
        const moveA = game.move(a); const valA = moveA.captured ? 10 : 0; game.undo();
        const moveB = game.move(b); const valB = moveB.captured ? 10 : 0; game.undo();
        return valB - valA;
    });

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            const eval = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break; // Alpha-Beta Pruning
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            const eval = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break; // Alpha-Beta Pruning
        }
        return minEval;
    }
}

// الدالة الرئيسية للحصول على أفضل حركة لأيانوكوجي
function getBestMove(game, depth = 4) {
    const moves = game.moves();
    let bestMove = null;
    let bestValue = Infinity; // أيانوكوجي يلعب بالأسود (يقلل القيمة)

    // خلط الحركات قليلاً لتجنب تكرار نفس الافتتاحيات تماماً
    moves.sort(() => Math.random() - 0.5);

    for (let i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        // نبحث بعمق 4 (يمكن زيادته إلى 5 إذا كان الجهاز قوياً، لكنه قد يبطئ المتصفح)
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, true);
        game.undo();

        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = moves[i];
        }
    }
    return bestMove;
}

// رسائل أيانوكوجي الباردة
const ayanokojiQuotes = [
    "أنت مجرد أداة في هذه اللعبة.",
    "هذه كانت حتمية منذ البداية.",
    "هل ظننت حقاً أنك تستطيع الفوز علي؟",
    "مشاعرك لا تعني شيئاً أمام المنطق.",
    "لقد حسبت كل احتمالاتك مسبقاً.",
    "استسلم، فهذا هو النتيجة الطبيعية."
];

function getAyanokojiQuote() {
    return ayanokojiQuotes[Math.floor(Math.random() * ayanokojiQuotes.length)];
}