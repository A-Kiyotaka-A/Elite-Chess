/* ==========================================
   عقل أيانوكوجي - White Room AI v3
   المستوى: 2000-2500 ELO
   التقنيات: Minimax + Alpha-Beta + Quiescence 
            + Transposition Table + Opening Book
   ========================================== */

// ====== 1. ثوابت القطع والقيم ======
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// ====== 2. جداول المواقع المحسنة (Piece-Square Tables) ======
// مصممة لتشجيع السيطرة على المركز والنشاط
const PST = {
    p: [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [ 5,  5, 10, 25, 25, 10,  5,  5],
        [ 0,  0,  0, 20, 20,  0,  0,  0],
        [ 5, -5,-10,  0,  0,-10, -5,  5],
        [ 5, 10, 10,-20,-20, 10, 10,  5],
        [ 0,  0,  0,  0,  0,  0,  0,  0]
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
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [ 5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [ 0,  0,  0,  5,  5,  0,  0,  0]
    ],
    q: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [  0,  0,  5,  5,  5,  5,  0, -5],
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
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20]
    ]
};

// ====== 3. Zobrist Hashing للـ Transposition Table ======
// إنشاء أرقام عشوائية ثابتة لكل قطعة في كل مربع
const ZOBRIST_TABLE = {};
const ZOBRIST_SIDE = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
const ZOBRIST_CASTLE = {};

function initZobrist() {
    const pieces = ['p', 'n', 'b', 'r', 'q', 'k'];
    const colors = ['w', 'b'];
    pieces.forEach(p => {
        ZOBRIST_TABLE[p] = {};
        colors.forEach(c => {
            ZOBRIST_TABLE[p][c] = {};
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    const sq = String.fromCharCode(97 + j) + (8 - i);
                    ZOBRIST_TABLE[p][c][sq] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                }
            }
        });
    });
    // Hash للتبييت
    ZOBRIST_CASTLE['K'] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    ZOBRIST_CASTLE['Q'] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    ZOBRIST_CASTLE['k'] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    ZOBRIST_CASTLE['q'] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}
initZobrist();

// حساب Hash للموقف الحالي
function computeHash(game) {
    let hash = 0;
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const sq = String.fromCharCode(97 + j) + (8 - i);
                hash ^= ZOBRIST_TABLE[piece.type][piece.color][sq];
            }
        }
    }
    if (game.turn() === 'b') hash ^= ZOBRIST_SIDE;
    return hash;
}

// Transposition Table
const TT = new Map();
const TT_EXACT = 0;
const TT_ALPHA = 1;
const TT_BETA = 2;

// ====== 4. Opening Book بسيط ======
const OPENING_BOOK = {
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e2e4', 'd2d4', 'c2c4', 'g1f3'],
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e7e5', 'c7c5', 'e7e6'],
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': ['g1f3', 'f1c4', 'f1b5', 'd2d4'],
    'rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['e5d4', 'd7d5', 'b8c6'],
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': ['g1f3', 'd2d4', 'b1c3', 'f1c4']
};

function getBookMove(game) {
    const fen = game.fen().split(' ').slice(0, 4).join(' ');
    if (OPENING_BOOK[fen]) {
        const moves = game.moves({ verbose: true });
        const bookMoves = OPENING_BOOK[fen];
        for (const bookMove of bookMoves) {
            const from = bookMove.substring(0, 2);
            const to = bookMove.substring(2, 4);
            const promo = bookMove.length > 4 ? bookMove[4] : 'q';
            const found = moves.find(m => m.from === from && m.to === to && 
                (m.promotion === promo || !m.promotion));
            if (found) return found;
        }
    }
    return null;
}

// ====== 5. دالة التقييم المتقدمة ======
function evaluatePosition(game) {
    if (game.in_checkmate()) {
        return game.turn() === 'w' ? -99999 : 99999;
    }
    if (game.in_draw()) return 0;

    let score = 0;
    const board = game.board();
    
    // مكافأة السيطرة على المركز (d4, d5, e4, e5)
    const centerSquares = { 'd4': 0, 'd5': 0, 'e4': 0, 'e5': 0 };
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (!piece) continue;
            
            const sq = String.fromCharCode(97 + j) + (8 - i);
            const value = PIECE_VALUES[piece.type];
            
            // PST value
            const pstValue = piece.color === 'w' 
                ? PST[piece.type][i][j] 
                : PST[piece.type][7 - i][j];
            
            const totalValue = value + pstValue;
            
            if (piece.color === 'w') {
                score += totalValue;
            } else {
                score -= totalValue;
            }
            
            // مكافأة السيطرة على المركز
            if (centerSquares.hasOwnProperty(sq)) {
                const bonus = piece.type === 'p' ? 10 : 
                              piece.type === 'n' || piece.type === 'b' ? 15 : 5;
                if (piece.color === 'w') score += bonus;
                else score -= bonus;
            }
        }
    }
    
    // تقييم سلامة الملك (King Safety)
    score += evaluateKingSafety(game, 'w');
    score -= evaluateKingSafety(game, 'b');
    
    // مكافأة التطور (Development) - تحريك القطع في الافتتاح
    if (game.history().length < 20) {
        score += evaluateDevelopment(game);
    }
    
    return score;
}

// تقييم سلامة الملك
function evaluateKingSafety(game, color) {
    let safety = 0;
    const board = game.board();
    
    // إيجاد موقع الملك
    let kingSq = null;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece && piece.type === 'k' && piece.color === color) {
                kingSq = { row: i, col: j };
                break;
            }
        }
        if (kingSq) break;
    }
    
    if (!kingSq) return 0;
    
    // فحص البيادق أمام الملك
    const direction = color === 'w' ? -1 : 1;
    const kingFile = kingSq.col;
    
    for (let f = Math.max(0, kingFile - 1); f <= Math.min(7, kingFile + 1); f++) {
        const pawnRow = kingSq.row + direction;
        if (pawnRow >= 0 && pawnRow < 8) {
            const piece = board[pawnRow][f];
            if (piece && piece.type === 'p' && piece.color === color) {
                safety += 15; // مكافأة لوجود بيادق حماية
            }
        }
    }
    
    // معاقبة فتح خطوط أمام الملك
    if (color === 'w' && kingSq.row === 7 && kingSq.col >= 4 && kingSq.col <= 6) {
        // الملك في الجهة الملكيّة بعد التبييت
        if (!board[6][kingSq.col] || board[6][kingSq.col].color !== color) {
            safety -= 20; // عقوبة لفتح الخط
        }
    }
    
    return safety;
}

// تقييم التطور
function evaluateDevelopment(game) {
    let score = 0;
    const history = game.history({ verbose: true });
    const movedPieces = new Set();
    
    history.forEach(move => {
        const key = move.piece + move.from;
        if (movedPieces.has(key)) {
            // تحريك نفس القطعة مرتين في الافتتاح = عقوبة
            score += move.color === 'w' ? -10 : 10;
        }
        movedPieces.add(key);
    });
    
    // مكافأة تطوير القطع الخفيفة
    const developed = ['N', 'B', 'Q'].filter(p => 
        history.some(m => m.piece === p.toLowerCase() && m.color === 'w')
    ).length;
    score += developed * 8;
    
    return score;
}

// ====== 6. Quiescence Search (للبحث في حركات الأخذ فقط) ======
function quiesce(game, alpha, beta, isMaximizing) {
    const standPat = evaluatePosition(game);
    
    if (isMaximizing) {
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;
    } else {
        if (standPat <= alpha) return alpha;
        if (beta > standPat) beta = standPat;
    }
    
    const moves = game.moves({ verbose: true });
    // فقط حركات الأخذ والترقية
    const captures = moves.filter(m => m.captured || m.promotion);
    
    // ترتيب حركات الأخذ (MVV-LVA: Most Valuable Victim - Least Valuable Aggressor)
    captures.sort((a, b) => {
        const scoreA = (PIECE_VALUES[a.captured] || 0) - PIECE_VALUES[a.piece] / 10;
        const scoreB = (PIECE_VALUES[b.captured] || 0) - PIECE_VALUES[b.piece] / 10;
        return scoreB - scoreA;
    });
    
    for (const move of captures) {
        game.move(move);
        const score = quiesce(game, alpha, beta, !isMaximizing);
        game.undo();
        
        if (isMaximizing) {
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        } else {
            if (score <= alpha) return alpha;
            if (score < beta) beta = score;
        }
    }
    
    return isMaximizing ? alpha : beta;
}

// ====== 7. Minimax مع Alpha-Beta + Transposition Table ======
function minimax(game, depth, alpha, beta, isMaximizing) {
    const hash = computeHash(game);
    
    // التحقق من Transposition Table
    const ttEntry = TT.get(hash);
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_ALPHA && ttEntry.score <= alpha) return alpha;
        if (ttEntry.flag === TT_BETA && ttEntry.score >= beta) return beta;
    }
    
    // شرط التوقف
    if (depth === 0) {
        return quiesce(game, alpha, beta, isMaximizing);
    }
    
    const originalAlpha = alpha;
    const moves = game.moves({ verbose: true });
    
    if (moves.length === 0) {
        if (game.in_checkmate()) {
            return isMaximizing ? -99999 + (100 - depth) : 99999 - (100 - depth);
        }
        return 0; // تعادل
    }
    
    // Move Ordering محسن
    moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.captured) scoreA = PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
        if (b.captured) scoreB = PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
        if (a.promotion) scoreA += 900;
        if (b.promotion) scoreB += 900;
        // مكافأة حركات الكش
        game.move(a); const checkA = game.in_check() ? 50 : 0; game.undo();
        game.move(b); const checkB = game.in_check() ? 50 : 0; game.undo();
        scoreA += checkA; scoreB += checkB;
        return scoreB - scoreA;
    });
    
    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove = null;
    
    for (const move of moves) {
        game.move(move);
        const score = minimax(game, depth - 1, alpha, beta, !isMaximizing);
        game.undo();
        
        if (isMaximizing) {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, score);
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
            beta = Math.min(beta, score);
        }
        
        if (beta <= alpha) break; // Alpha-Beta Pruning
    }
    
    // حفظ في Transposition Table
    let flag = TT_EXACT;
    if (bestScore <= originalAlpha) flag = TT_ALPHA;
    else if (bestScore >= beta) flag = TT_BETA;
    
    TT.set(hash, { depth, score: bestScore, flag, bestMove });
    
    return bestScore;
}

// ====== 8. الدالة الرئيسية - Iterative Deepening مع حد زمني ======
function getBestMove(game, timeLimit = 10000) { // 10 ثوانٍ افتراضياً
    
    // 1. التحقق من Opening Book أولاً
    const bookMove = getBookMove(game);
    if (bookMove) {
        console.log(' أيانوكوجي يستخدم Opening Book');
        return bookMove;
    }
    
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0];
    
    const startTime = Date.now();
    let bestMove = null;
    let bestScore = 0;
    const isMaximizing = game.turn() === 'w';
    
    // Iterative Deepening: نبدأ بعمق 1 ونزيد حتى ننفد الوقت
    for (let depth = 1; depth <= 6; depth++) {
        const depthStart = Date.now();
        
        // ترتيب الحركات باستخدام TT من العمق السابق
        const orderedMoves = [...moves].sort((a, b) => {
            const hashA = computeHash(game);
            game.move(a); const entryA = TT.get(computeHash(game)); game.undo();
            const hashB = computeHash(game);
            game.move(b); const entryB = TT.get(computeHash(game)); game.undo();
            const scoreA = entryA ? entryA.score : 0;
            const scoreB = entryB ? entryB.score : 0;
            return isMaximizing ? scoreB - scoreA : scoreA - scoreB;
        });
        
        let depthBestMove = null;
        let depthBestScore = isMaximizing ? -Infinity : Infinity;
        
        for (const move of orderedMoves) {
            game.move(move);
            const score = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
            game.undo();
            
            if (isMaximizing) {
                if (score > depthBestScore) {
                    depthBestScore = score;
                    depthBestMove = move;
                }
            } else {
                if (score < depthBestScore) {
                    depthBestScore = score;
                    depthBestMove = move;
                }
            }
        }
        
        bestMove = depthBestMove;
        bestScore = depthBestScore;
        
        const elapsed = Date.now() - startTime;
        console.log(`♟ عمق ${depth}: أفضل نتيجة = ${bestScore}, الوقت = ${elapsed}ms`);
        
        // إذا وجدنا كش مات، نتوقف فوراً
        if (Math.abs(bestScore) > 90000) break;
        
        // إذا تجاوزنا 70% من الوقت المحدد، نتوقف
        if (elapsed > timeLimit * 0.7) break;
    }
    
    console.log(`♟ أيانوكوجي اختار: ${bestMove.san} (نتيجة: ${bestScore})`);
    return bestMove;
}

// ====== 9. تنظيف Transposition Table بين الألعاب ======
function resetAI() {
    TT.clear();
}
