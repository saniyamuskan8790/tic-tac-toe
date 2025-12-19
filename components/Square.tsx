
import React from 'react';
import { Player } from '../types';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        h-24 w-24 sm:h-32 sm:w-32 text-5xl sm:text-6xl font-bold flex items-center justify-center
        transition-all duration-300 rounded-xl glass
        ${value === null ? 'hover:bg-slate-800/50 cursor-pointer' : 'cursor-default'}
        ${isWinningSquare ? 'ring-4 ring-yellow-400 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.4)] z-10' : ''}
        ${value === 'X' ? 'neon-x' : value === 'O' ? 'neon-o' : ''}
      `}
    >
      {value}
    </button>
  );
};

export default Square;
