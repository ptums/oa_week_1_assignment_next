export type Pos = { row: number; col: number };

export type Buffer = { 
  lines: string[]; 
  cursor: Pos;
};

export type FeedbackType = 'correct' | 'wrong' | 'hint' | null;

export interface PlayerRecord {
  username: string;
  times_played: number;
  highest_score: number;
}

export interface PlayerStats {
  times_played: number;
  highest_score: number;
}

export interface GameState {
  score: number;
  timeLeft: number;
  questionIndex: number;
  gameActive: boolean;
  gameOver: boolean;
  username: string;
  hasCompletedSetup: boolean;
  buffer: Buffer;
  currentQuestion: string;
  expectedAnswer: string[];
  feedback: FeedbackType;
  playerStats: PlayerStats;
}

