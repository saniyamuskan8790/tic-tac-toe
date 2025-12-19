
import React from 'react';
import Square from './Square';
import { Player } from '../types';

interface BoardProps {
  board: Player[];
  onSquareClick: (index: number) => void;
  winningLine: number[] | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick, winningLine, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-700/50 shadow-2xl">
      {board.map((square, i) => (
        <Square
          key={i}
          value={square}
          onClick={() => onSquareClick(i)}
          isWinningSquare={winningLine?.includes(i) || false}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default Board;
