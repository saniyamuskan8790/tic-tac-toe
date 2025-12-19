
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import { GameMode, Player, GameState, AIResponse } from './types';
import { getAIMove, getCommentary } from './services/geminiService';

const calculateWinner = (squares: Player[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (!squares.includes(null)) {
    return { winner: 'Draw' as const, line: null };
  }
  return null;
};

const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.AI_CHALLENGE);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [commentary, setCommentary] = useState<string>("Welcome to the arena! I'm Gemini Prime, let's see if you can keep up.");
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winnerInfo, setWinnerInfo] = useState<{ winner: Player | 'Draw'; line: number[] | null } | null>(null);

  const commentaryEndRef = useRef<HTMLDivElement>(null);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinnerInfo(null);
    setCommentary(gameMode === GameMode.AI_CHALLENGE 
      ? "Resetting... Ready for another defeat?" 
      : "New round! Player X starts.");
  }, [gameMode]);

  const handleSquareClick = useCallback(async (i: number) => {
    if (board[i] || winnerInfo || isAILoading) return;

    const newBoard = [...board];
    const currentPlayer = xIsNext ? 'X' : 'O';
    newBoard[i] = currentPlayer;
    setBoard(newBoard);
    
    const result = calculateWinner(newBoard);
    if (result) {
      setWinnerInfo(result);
      if (result.winner === 'X') setScores(s => ({ ...s, X: s.X + 1 }));
      else if (result.winner === 'O') setScores(s => ({ ...s, O: s.O + 1 }));
      else setScores(s => ({ ...s, draws: s.draws + 1 }));

      const finalWords = await getCommentary(newBoard, result.winner, currentPlayer);
      setCommentary(finalWords);
      return;
    }

    setXIsNext(!xIsNext);
  }, [board, winnerInfo, xIsNext, isAILoading]);

  // AI Logic
  useEffect(() => {
    const triggerAI = async () => {
      if (gameMode === GameMode.AI_CHALLENGE && !xIsNext && !winnerInfo) {
        setIsAILoading(true);
        // Add a slight delay for better UX
        await new Promise(r => setTimeout(r, 600));
        
        try {
          const aiResponse: AIResponse = await getAIMove(board, 'O', 'X');
          setCommentary(aiResponse.commentary);
          handleSquareClick(aiResponse.move);
        } catch (err) {
          console.error("AI turn failed", err);
        } finally {
          setIsAILoading(false);
        }
      }
    };

    triggerAI();
  }, [xIsNext, gameMode, winnerInfo, board, handleSquareClick]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      
      {/* Header */}
      <div className="max-w-4xl w-full flex flex-col items-center mb-8">
        <h1 className="text-4xl sm:text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
          GEMINI PRIME
        </h1>
        <p className="text-slate-400 font-medium tracking-widest uppercase text-xs sm:text-sm">
          Ultimate Tic-Tac-Toe Engine
        </p>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Stats & Mode */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Scoreboard
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Player X</span>
                <span className="text-2xl font-mono font-bold text-blue-400">{scores.X}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Player O</span>
                <span className="text-2xl font-mono font-bold text-pink-400">{scores.O}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700/50 pt-4">
                <span className="text-slate-400">Draws</span>
                <span className="text-2xl font-mono font-bold text-slate-300">{scores.draws}</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="space-y-3">
              <button 
                onClick={() => { setGameMode(GameMode.AI_CHALLENGE); resetGame(); }}
                className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all ${gameMode === GameMode.AI_CHALLENGE ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                vs AI Challenge
              </button>
              <button 
                onClick={() => { setGameMode(GameMode.LOCAL_PVP); resetGame(); }}
                className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all ${gameMode === GameMode.LOCAL_PVP ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Local PvP
              </button>
            </div>
          </div>
        </div>

        {/* Center: Game Board */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="mb-6 h-12 flex items-center">
            {winnerInfo ? (
              <div className="text-2xl sm:text-3xl font-bold animate-bounce text-yellow-400">
                {winnerInfo.winner === 'Draw' ? "It's a Tie!" : `🎉 Player ${winnerInfo.winner} Wins!`}
              </div>
            ) : (
              <div className={`text-xl font-medium px-6 py-2 rounded-full glass border transition-all ${xIsNext ? 'border-blue-500/50 text-blue-400' : 'border-pink-500/50 text-pink-400'}`}>
                {isAILoading ? 'Gemini is thinking...' : `Current Turn: ${xIsNext ? 'X' : 'O'}`}
              </div>
            )}
          </div>

          <Board 
            board={board} 
            onSquareClick={handleSquareClick} 
            winningLine={winnerInfo?.line || null}
            disabled={isAILoading || !!winnerInfo}
          />

          <button 
            onClick={resetGame}
            className="mt-8 px-10 py-4 bg-white text-slate-950 font-black rounded-full hover:bg-indigo-400 hover:text-white transition-all transform hover:scale-105 shadow-xl uppercase tracking-tighter"
          >
            Restart Game
          </button>
        </div>

        {/* Right: AI Commentary */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-[300px]">
          <div className="glass flex-1 p-6 rounded-2xl flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              AI Logs
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 animate-in slide-in-from-right-2">
                <p className="text-sm italic text-slate-300 leading-relaxed">
                  "{commentary}"
                </p>
                <div className="mt-2 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">Gemini Prime</span>
                </div>
              </div>
              {isAILoading && (
                <div className="flex gap-1 items-center justify-center p-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce delay-150"></div>
                </div>
              )}
              <div ref={commentaryEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-12 text-slate-600 text-xs text-center">
        Powered by Gemini 3 Flash & React 18
      </div>
    </div>
  );
};

export default App;
