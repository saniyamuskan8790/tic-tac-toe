
export type Player = 'X' | 'O' | null;

export enum GameMode {
  LOCAL_PVP = 'LOCAL_PVP',
  AI_CHALLENGE = 'AI_CHALLENGE'
}

export interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'Draw';
  winningLine: number[] | null;
}

export interface AIResponse {
  move: number;
  commentary: string;
}
