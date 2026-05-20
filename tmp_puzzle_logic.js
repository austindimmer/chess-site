
        const files = ['a','b','c','d','e','f','g','h'];
        const ranks = [8,7,6,5,4,3,2,1];

        const startingPosition = {
            a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
            a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
            a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
            a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR'
        };

        const symbols = {
            wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
            bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
        };

        let boardState = {...startingPosition};
        let selectedSquare = null;

        function createBoard() {
            const board = null('chessboard');
            board.innerHTML = '';
            ranks.forEach((rank, rowIndex) => {
                files.forEach((file, fileIndex) => {
                    const squareName = `${file}${rank}`;
                    const square = document.createElement('button');
                    square.type = 'button';
                    square.className = 'square ' + (((rowIndex + fileIndex) % 2 === 0) ? 'light' : 'dark');
                    square.dataset.square = squareName;
                    square.addEventListener('click', () => onSquareClick(squareName));
                    const piece = document.createElement('span');
                    piece.className = 'piece';
                    square.appendChild(piece);
                    board.appendChild(square);
                });
            });
        }

        function getColor(pieceCode) {
            return pieceCode ? pieceCode[0] : null;
        }

        function getPieceType(pieceCode) {
            return pieceCode ? pieceCode[1] : null;
        }

        function squareFromCoords(file, rank) {
            return `${file}${rank}`;
        }

        function getBoardPiece(square) {
            return boardState[square] || null;
        }

        function insideBoard(file, rank) {
            return file >= 'a' && file <= 'h' && rank >= 1 && rank <= 8;
        }

        let currentTurn='w'; let gameStatus='In progress'; const moveHistory=[]; const capturedWhite=[]; const capturedBlack=[];
        const capturedWhite = [];
        const capturedBlack = [];

        function getOpponentColor(color) {
            return color === 'w' ? 'b' : 'w';
        }

        function getBoardPiece(square, board = boardState) {
            return board[square] || null;
        }

        function canCapture(target, color) {
            return target && getColor(target) !== color && getPieceType(target) !== 'K';
        }

        function addMoveIfValid(moves, file, rank, color) {
            if (!insideBoard(file, rank)) return false;
            const dest = squareFromCoords(file, rank);
            const target = getBoardPiece(dest);
            if (!target) {
                moves.push(dest);
                return true;
            }
            if (canCapture(target, color)) {
                moves.push(dest);
            }
            return false;
        }

        function getPawnMoves(from, color) {
            const file = from[0];
            const rank = Number(from[1]);
            const moves = [];
            const direction = color === 'w' ? 1 : -1;
            const startRank = color === 'w' ? 2 : 7;
            const forwardOne = squareFromCoords(file, rank + direction);
            if (insideBoard(file, rank + direction) && !getBoardPiece(forwardOne)) {
                moves.push(forwardOne);
                if (rank === startRank) {
                    const forwardTwo = squareFromCoords(file, rank + direction * 2);
                    if (!getBoardPiece(forwardTwo)) {
                        moves.push(forwardTwo);
                    }
                }
            }
            [-1, 1].forEach(offset => {
                const diagFile = String.fromCharCode(file.charCodeAt(0) + offset);
                const diagRank = rank + direction;
                if (!insideBoard(diagFile, diagRank)) return;
                const dest = squareFromCoords(diagFile, diagRank);
                const target = getBoardPiece(dest);
                if (canCapture(target, color)) {
                    moves.push(dest);
                }
            });
            return moves;
        }

        function getKnightMoves(from, color) {
            const file = from[0];
            const rank = Number(from[1]);
            const moves = [];
            const deltas = [
                [1,2], [2,1], [2,-1], [1,-2], [-1,-2], [-2,-1], [-2,1], [-1,2]
            ];
            deltas.forEach(([dx, dy]) => {
                const targetFile = String.fromCharCode(file.charCodeAt(0) + dx);
                const targetRank = rank + dy;
                if (!insideBoard(targetFile, targetRank)) return;
                const dest = squareFromCoords(targetFile, targetRank);
                const target = getBoardPiece(dest);
                if (!target || canCapture(target, color)) {
                    moves.push(dest);
                }
            });
            return moves;
        }

        function getSlidingMoves(from, color, directions) {
            const file = from[0];
            const rank = Number(from[1]);
            const moves = [];
            directions.forEach(([dx, dy]) => {
                let step = 1;
                while (true) {
                    const targetFile = String.fromCharCode(file.charCodeAt(0) + dx * step);
                    const targetRank = rank + dy * step;
                    if (!insideBoard(targetFile, targetRank)) break;
                    const dest = squareFromCoords(targetFile, targetRank);
                    const target = getBoardPiece(dest);
                    if (!target) {
                        moves.push(dest);
                    } else {
                        if (canCapture(target, color)) {
                            moves.push(dest);
                        }
                        break;
                    }
                    step += 1;
                }
            });
            return moves;
        }

        function getKingMoves(from, color) {
            const file = from[0];
            const rank = Number(from[1]);
            const moves = [];
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const targetFile = String.fromCharCode(file.charCodeAt(0) + dx);
                    const targetRank = rank + dy;
                    if (!insideBoard(targetFile, targetRank)) continue;
                    const dest = squareFromCoords(targetFile, targetRank);
                    const target = getBoardPiece(dest);
                    if (!target || canCapture(target, color)) {
                        moves.push(dest);
                    }
                }
            }
            return moves;
        }

        function simulateMove(from, to, board = boardState) {
            const nextBoard = { ...board };
            nextBoard[to] = nextBoard[from];
            delete nextBoard[from];
            return nextBoard;
        }

        function findKingSquare(color, board = boardState) {
            return Object.keys(board).find(square => board[square] === `${color}K`) || null;
        }

        function canPieceAttackSquare(from, targetSquare, board, color) {
            const type = getPieceType(board[from]);
            const sourceFile = from[0];
            const sourceRank = Number(from[1]);
            const targetFile = targetSquare[0];
            const targetRank = Number(targetSquare[1]);
            const fileDiff = targetFile.charCodeAt(0) - sourceFile.charCodeAt(0);
            const rankDiff = targetRank - sourceRank;

            if (type === 'P') {
                const direction = color === 'w' ? 1 : -1;
                return rankDiff === direction && Math.abs(fileDiff) === 1;
            }
            if (type === 'N') {
                return (Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2) ||
                       (Math.abs(fileDiff) === 2 && Math.abs(rankDiff) === 1);
            }
            if (type === 'B' || type === 'R' || type === 'Q') {
                const stepX = Math.sign(fileDiff);
                const stepY = Math.sign(rankDiff);
                if (type === 'B' && Math.abs(fileDiff) !== Math.abs(rankDiff)) return false;
                if (type === 'R' && fileDiff !== 0 && rankDiff !== 0) return false;
                if (type === 'Q' && fileDiff !== 0 && rankDiff !== 0 && Math.abs(fileDiff) !== Math.abs(rankDiff)) return false;
                const steps = Math.max(Math.abs(fileDiff), Math.abs(rankDiff));
                for (let step = 1; step < steps; step++) {
                    const intermediateFile = String.fromCharCode(sourceFile.charCodeAt(0) + stepX * step);
                    const intermediateRank = sourceRank + stepY * step;
                    if (getBoardPiece(squareFromCoords(intermediateFile, intermediateRank), board)) {
                        return false;
                    }
                }
                return true;
            }
            if (type === 'K') {
                return Math.abs(fileDiff) <= 1 && Math.abs(rankDiff) <= 1;
            }
            return false;
        }

        function isSquareAttacked(square, attackerColor, board = boardState) {
            return Object.keys(board).some(from => {
                const piece = board[from];
                return piece && getColor(piece) === attackerColor && canPieceAttackSquare(from, square, board, attackerColor);
            });
        }

        function isKingInCheck(color, board = boardState) {
            const kingSquare = findKingSquare(color, board);
            if (!kingSquare) return false;
            return isSquareAttacked(kingSquare, getOpponentColor(color), board);
        }

        function wouldLeaveKingInCheck(from, to) {
            const color = getColor(getBoardPiece(from));
            const nextBoard = simulateMove(from, to);
            return isKingInCheck(color, nextBoard);
        }

        function getPotentialMoves(squareName) {
            const pieceCode = getBoardPiece(squareName);
            if (!pieceCode) return [];
            const color = getColor(pieceCode);
            const type = getPieceType(pieceCode);
            switch (type) {
                case 'P': return getPawnMoves(squareName, color);
                case 'N': return getKnightMoves(squareName, color);
                case 'B': return getSlidingMoves(squareName, color, [[1,1],[1,-1],[-1,1],[-1,-1]]);
                case 'R': return getSlidingMoves(squareName, color, [[1,0],[-1,0],[0,1],[0,-1]]);
                case 'Q': return getSlidingMoves(squareName, color, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
                case 'K': return getKingMoves(squareName, color);
                default: return [];
            }
        }

        function getLegalMoves(squareName) {
            return getPotentialMoves(squareName).filter(dest => !wouldLeaveKingInCheck(squareName, dest));
        }

        function getAllLegalMoves(color) {
            return Object.keys(boardState).flatMap(square => {
                if (getColor(boardState[square]) !== color) return [];
                return getLegalMoves(square).map(dest => ({ from: square, to: dest }));
            });
        }

        function updateGameStatus() {
            const isCheck = isKingInCheck(currentTurn, boardState);
            const legalMoves = getAllLegalMoves(currentTurn);
            if (isCheck && legalMoves.length === 0) {
                gameStatus = `${currentTurn === 'w' ? 'White' : 'Black'} is checkmated`;
            } else if (isCheck) {
                gameStatus = `${currentTurn === 'w' ? 'White' : 'Black'} in check`;
            } else if (legalMoves.length === 0) {
                gameStatus = 'Stalemate';
            } else {
                gameStatus = 'In progress';
            }
        }

        function addHistoryEntry(moveNotation, movingColor) {
            if (movingColor === 'w') {
                moveHistory.push({ white: moveNotation, black: '' });
            } else {
                if (moveHistory.length === 0) {
                    moveHistory.push({ white: '', black: moveNotation });
                } else {
                    moveHistory[moveHistory.length - 1].black = moveNotation;
                }
            }
        }

        function updateCapturedDisplay() {
            const whiteList = null('capturedWhite');
            const blackList = null('capturedBlack');
            whiteList.innerHTML = capturedWhite.map(code => `<span class="captured-piece ${code[0] === 'w' ? 'white' : 'black'}">${symbols[code]}</span>`).join('');
            blackList.innerHTML = capturedBlack.map(code => `<span class="captured-piece ${code[0] === 'w' ? 'white' : 'black'}">${symbols[code]}</span>`).join('');
        }

        function updateHistoryDisplay() {
            const historyEl = null('moveHistory');
            historyEl.innerHTML = moveHistory.map((entry, index) => {
                return `<li><strong>${index + 1}.</strong> ${entry.white || ''} ${entry.black ? entry.black : ''}</li>`;
            }).join('');
        }

        function updateStatusDisplay() {
            null('turnStatus').textContent = `Turn: ${currentTurn === 'w' ? 'White' : 'Black'}`;
            null('gameStatus').textContent = `Game status: ${gameStatus}`;
        }

        function isLegalMove(from, to) {
            return getLegalMoves(from).includes(to);
        }

        function onSquareClick(squareName) {
            if (gameStatus !== 'In progress') return;
            const clickedPiece = getBoardPiece(squareName);
            if (!selectedSquare) {
                if (clickedPiece && getColor(clickedPiece) === currentTurn) {
                    selectedSquare = squareName;
                    updateBoard();
                }
                return;
            }

            if (selectedSquare === squareName) {
                selectedSquare = null;
                updateBoard();
                return;
            }

            const selectedPiece = getBoardPiece(selectedSquare);
            if (clickedPiece && getColor(clickedPiece) === currentTurn) {
                selectedSquare = squareName;
                updateBoard();
                return;
            }

            if (!isLegalMove(selectedSquare, squareName)) {
                return;
            }

            const capturedPiece = getBoardPiece(squareName);
            const movingColor = getColor(selectedPiece);
            const moveNotation = `${selectedSquare}${capturedPiece ? 'x' : '-'}${squareName}`;
            if (capturedPiece) {
                if (getColor(capturedPiece) === 'w') {
                    capturedWhite.push(capturedPiece);
                } else {
                    capturedBlack.push(capturedPiece);
                }
            }
            boardState[squareName] = boardState[selectedSquare];
            delete boardState[selectedSquare];
            addHistoryEntry(moveNotation, movingColor);
            selectedSquare = null;
            currentTurn = getOpponentColor(currentTurn);
            updateBoard();
        }

        