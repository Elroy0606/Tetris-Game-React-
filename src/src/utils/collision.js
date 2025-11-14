// collision.js - Collision detection logic
import { SHAPES, BOARD_WIDTH, BOARD_HEIGHT } from './constants';

// Main collision detection function
export function checkCollision(board, piece, position, rotation) {
  const shape = SHAPES[piece].rotations[rotation];
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (shape[row][col]) {
        const boardX = position.x + col;
        const boardY = position.y + row;
        
        // Check boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return true;
        }
        
        if (boardY >= BOARD_HEIGHT) {
          return true;
        }
        
        // Check occupied cells
        if (boardY >= 0 && board[boardY][boardX] !== 0) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Merge piece into board permanently
export function mergePieceToBoard(board, piece, position, rotation) {
  const newBoard = board.map(row => [...row]);
  const shape = SHAPES[piece].rotations[rotation];
  const colorCode = SHAPES[piece].color;
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (shape[row][col]) {
        const boardY = position.y + row;
        const boardX = position.x + col;
        
        if (boardY >= 0 && boardY < BOARD_HEIGHT && 
            boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = colorCode;
        }
      }
    }
  }
  
  return newBoard;
}
