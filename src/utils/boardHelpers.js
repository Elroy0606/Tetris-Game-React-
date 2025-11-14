// boardHelpers.js - Helper functions for board operations
import { BOARD_WIDTH, BOARD_HEIGHT } from './constants';

// Create an empty board filled with zeros
export function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => 
    Array(BOARD_WIDTH).fill(0)
  );
}

// Clear complete lines and return new board + lines cleared count
export function clearLines(board) {
  let linesCleared = 0;
  
  const newBoard = board.filter(row => {
    const isComplete = row.every(cell => cell !== 0);
    if (isComplete) {
      linesCleared++;
      return false;
    }
    return true;
  });
  
  // Add empty rows at top to maintain height
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  
  return { board: newBoard, linesCleared };
}

// Get a random piece type
export function getRandomPiece() {
  const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return pieces[Math.floor(Math.random() * pieces.length)];
}
