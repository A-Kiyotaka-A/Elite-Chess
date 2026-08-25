const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PST = {
    p: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
    n: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
    b: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
    r: [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
    q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
    k: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
};

const OPENING_BOOK = {
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e2e4', 'd2d4', 'c2c4', 'g1f3'],
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e7e5', 'c7c5', 'e7e6']
};

function getBookMove(game) {
    const fen = game.fen().split(' ').slice(0, 4).join(' ');
    if (OPENING_BOOK[fen]) {
        const moves = game.moves({ verbose: true });
        for (const bookMove of OPENING_BOOK[fen]) {
            const from = bookMove.substring(0, 2);
            const to = bookMove.substring(2, 4);
            const found = moves.find(m => m.from === from && m.to === to);
            if (found) return found;
        }
    }
    return null;
}

function evaluatePosition(game) {
    if (game.in_checkmate()) return game.turn() === 'w' ? -99999 : 99999;
    if (game.in_draw()) return 0;

    let score = 0;
    const board = game.board();
    const centerSquares = { 'd4': 0, 'd5': 0, 'e4': 0, 'e5': 0 };
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (!piece) continue;
            const sq = String.fromCharCode(97 + j) + (8 - i);
            const pstValue = piece.color === 'w' ? PST[piece.type][i][j] : PST[piece.type][7 - i][j];
            const totalValue = PIECE_VALUES[piece.type] + pstValue;
            score += piece.color === 'w' ? totalValue : -totalValue;
            
            if (centerSquares.hasOwnProperty(sq)) {
                const bonus = piece.type === 'p' ? 10 : (piece.type === 'n' || piece.type === 'b' ? 15 : 5);
                score += piece.color === 'w' ? bonus : -bonus;
            }
        }
    }
    return score;
}

function minimax(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.game_over()) return evaluatePosition(game);

    const moves = game.moves({ verbose: true });
    moves.sort((a, b) => {
        const scoreA = a.captured ? PIECE_VALUES[a.captured] : 0;
        const scoreB = b.captured ? PIECE_VALUES[b.captured] : 0;
        return scoreB - scoreA;
    });

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const eval = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const eval = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

// الدالة الرئيسية المحسّنة للأجهزة البطيئة
function getBestMove(game, timeLimit = 1500) { // 1.5 ثانية كحد أقصى لمنع التهنيج
    const bookMove = getBookMove(game);
    if (bookMove) return bookMove;
    
    const moves = game.moves({ verbose: true });
    if (moves.length <= 1) return moves[0] || null;
    
    const startTime = Date.now();
    let bestMove = null;
    let bestScore = game.turn() === 'w' ? -Infinity : Infinity;
    const isMaximizing = game.turn() === 'w';
    const MAX_DEPTH = 3; // عمق 3 مثالي للأجهزة المتوسطة/البطيئة
    
    moves.sort((a, b) => {
        const scoreA = a.captured ? PIECE_VALUES[a.captured] : 0;
        const scoreB = b.captured ? PIECE_VALUES[b.captured] : 0;
        return scoreB - scoreA;
    });

    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
        let depthBestMove = null;
        let depthBestScore = isMaximizing ? -Infinity : Infinity;
        
        for (const move of moves) {
            // فحص الوقت قبل كل حركة لمنع تجميد المتصفح نهائياً
            if (Date.now() - startTime > timeLimit) break;
            
            game.move(move);
            const score = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
            game.undo();
            
            if (isMaximizing) {
                if (score > depthBestScore) { depthBestScore = score; depthBestMove = move; }
            } else {
                if (score < depthBestScore) { depthBestScore = score; depthBestMove = move; }
            }
        }
        
        bestMove = depthBestMove;
        bestScore = depthBestScore;
        
        if (Math.abs(bestScore) > 90000) break; // كش مات
        if (Date.now() - startTime > timeLimit) break; // نفد الوقت
    }
    
    return bestMove;
}
