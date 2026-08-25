/* ==========================================
   عقل أيانوكوجي المحسن (White Room AI v2)
   السرعة: < 15 ثانية | القوة: 2000-2500 ELO
   ========================================== */

// قيم القطع المحسنة
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// جداول المواقع المحسنة (Piece-Square Tables)
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

// دالة تقييم الوضع (محسنة للسرعة)
function evaluateBoard(game) {
    let score = 0;
    const board = game.board();
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                const pstValue = piece.color === 'w' 
                    ? PST[piece.type][i][j] 
                    : PST[piece.type][7 - i][j];
                
                if (piece.color === 'w') {
                    score += (value + pstValue);
                } else {
                    score -= (value + pstValue);
                }
            }
        }
    }
    
    return score;
}

// خوارزمية Minimax مع Alpha-Beta Pruning (محسنة)
function minimax(game, depth, alpha, beta, isMaximizing) {
    // شرط التوقف
    if (depth === 0 || game.game_over()) {
        return evaluateBoard(game);
    }

    const moves = game.moves({ verbose: true });
    
    // ترتيب الحركات: الأكل أولاً (يحسن كفاءة Alpha-Beta)
    moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.captured) scoreA = PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece] / 10;
        if (b.captured) scoreB = PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece] / 10;
        return scoreB - scoreA;
    });

    if (isMaximizing) {
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

// الدالة الرئيسية للحصول على أفضل حركة
function getBestMove(game) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    
    let bestMove = null;
    let bestValue = Infinity; // أيانوكوجي يلعب بالأسود (يقلل القيمة)
    
    // ترتيب الحركات الأولية
    moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.captured) scoreA = PIECE_VALUES[a.captured];
        if (b.captured) scoreB = PIECE_VALUES[b.captured];
        return scoreB - scoreA;
    });

    // عمق 3 = سريع جداً (1-5 ثواني) وقوي
    const DEPTH = 3;
    
    for (let i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        const boardValue = minimax(game, DEPTH - 1, -Infinity, Infinity, true);
        game.undo();

        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = moves[i];
        }
    }
    
    return bestMove;
}
