import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BOARD_WIDTH, BOARD_HEIGHT, COLORS, SHAPES } from './utils/constants';
import { createEmptyBoard, clearLines, getRandomPiece } from './utils/boardHelpers';
import { checkCollision, mergePieceToBoard } from './utils/collision';

function App() {
  // Game state
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Spawn a new piece at the top center
  const spawnPiece = useCallback((newBoard) => {
    const piece = getRandomPiece();
    const startPos = { x: 3, y: 0 };
    
    // Check if game over (piece can't spawn)
    if (checkCollision(newBoard, piece, startPos, 0)) {
      setGameOver(true);
      return;
    }
    
    setCurrentPiece(piece);
    setPosition(startPos);
    setRotation(0);
  }, []);

  // Lock piece and spawn new one
  const handlePieceLock = useCallback(() => {
    if (!currentPiece) return;
    
    // Merge piece into board
    let newBoard = mergePieceToBoard(board, currentPiece, position, rotation);
    
    // Check for complete lines
    const { board: clearedBoard, linesCleared } = clearLines(newBoard);
    newBoard = clearedBoard;
    
    // Update score
    if (linesCleared > 0) {
      setScore(s => s + linesCleared * 100);
    }
    
    setBoard(newBoard);
    spawnPiece(newBoard);
  }, [currentPiece, position, rotation, board, spawnPiece]);

  // Move piece left
  const moveLeft = useCallback(() => {
    const newPos = { ...position, x: position.x - 1 };
    if (!checkCollision(board, currentPiece, newPos, rotation)) {
      setPosition(newPos);
    }
  }, [board, currentPiece, position, rotation]);

  // Move piece right
  const moveRight = useCallback(() => {
    const newPos = { ...position, x: position.x + 1 };
    if (!checkCollision(board, currentPiece, newPos, rotation)) {
      setPosition(newPos);
    }
  }, [board, currentPiece, position, rotation]);

  // Move piece down
  const moveDown = useCallback(() => {
    const newPos = { ...position, y: position.y + 1 };
    if (!checkCollision(board, currentPiece, newPos, rotation)) {
      setPosition(newPos);
    } else {
      handlePieceLock();
    }
  }, [board, currentPiece, position, rotation, handlePieceLock]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    const newRotation = (rotation + 1) % 4;
    if (!checkCollision(board, currentPiece, position, newRotation)) {
      setRotation(newRotation);
    }
  }, [board, currentPiece, position, rotation]);

  // Handle keyboard input
  const handleKeyPress = useCallback((event) => {
    if (!gameStarted || gameOver || isPaused) return;
    
    switch(event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveRight();
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveDown();
        break;
      case 'ArrowUp':
      case ' ':
        event.preventDefault();
        rotatePiece();
        break;
      case 'p':
      case 'P':
        setIsPaused(p => !p);
        break;
      default:
        break;
    }
  }, [gameStarted, gameOver, isPaused, moveLeft, moveRight, moveDown, rotatePiece]);

  // Set up keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Game loop - pieces fall automatically
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;
    
    const interval = setInterval(() => {
      moveDown();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, isPaused, moveDown]);

  // Start game
  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    setPosition({ x: 3, y: 0 });
    setRotation(0);
    
    const newBoard = createEmptyBoard();
    spawnPiece(newBoard);
  };

  // Create display board with current piece
  const getDisplayBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece && gameStarted) {
      const shape = SHAPES[currentPiece].rotations[rotation];
      const colorCode = SHAPES[currentPiece].color;
      
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (shape[row][col]) {
            const boardY = position.y + row;
            const boardX = position.x + col;
            
            if (boardY >= 0 && boardY < BOARD_HEIGHT &&
                boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = colorCode;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const displayBoard = getDisplayBoard();

  return (
    <div className="app-container">
      <h1>React Tetris Game</h1>
      
      <div className="game-wrapper">
        {/* Game Board */}
        <div className="board-container">
          <div className="board">
            {displayBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="cell"
                    style={{ backgroundColor: COLORS[cell] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          <div className="score-box">
            <h2>Score</h2>
            <p className="score-value">{score}</p>
          </div>

          <div className="controls-box">
            <h3>Controls</h3>
            <div className="controls-list">
              <p>← → : Move</p>
              <p>↑ or Space : Rotate</p>
              <p>↓ : Drop Fast</p>
              <p>P : Pause</p>
            </div>
          </div>

          <div className="button-group">
            {!gameStarted ? (
              <button onClick={startGame} className="start-btn">
                Start Game
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className="pause-btn"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button onClick={startGame} className="restart-btn">
                  New Game
                </button>
              </>
            )}
          </div>

          {gameOver && (
            <div className="game-over-message">
              <p>Game Over!</p>
              <p>Final Score: {score}</p>
            </div>
          )}

          {isPaused && gameStarted && (
            <div className="paused-message">
              <p>⏸ Paused</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
