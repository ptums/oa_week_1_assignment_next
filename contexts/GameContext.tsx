'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GameState, Buffer, FeedbackType, PlayerStats } from '@/types';

const DEFAULT_BUFFER: Buffer = {
  lines: [],
  cursor: { row: 0, col: 0 }
};

const DEFAULT_STATS: PlayerStats = {
  times_played: 0,
  highest_score: 0
};

interface GameContextType extends GameState {
  setScore: (score: number) => void;
  incrementScore: () => void;
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;
  setQuestionIndex: (index: number) => void;
  incrementQuestionIndex: () => void;
  setGameActive: (active: boolean) => void;
  setGameOver: (over: boolean) => void;
  setUsername: (username: string) => void;
  setHasCompletedSetup: (completed: boolean) => void;
  setBuffer: (buffer: Buffer) => void;
  setCurrentQuestion: (question: string) => void;
  setExpectedAnswer: (answers: string[]) => void;
  setFeedback: (feedback: FeedbackType) => void;
  setPlayerStats: (stats: PlayerStats) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState('');
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [buffer, setBuffer] = useState<Buffer>(DEFAULT_BUFFER);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(DEFAULT_STATS);

  const incrementScore = useCallback(() => setScore(s => s + 1), []);
  const decrementTime = useCallback(() => setTimeLeft(t => Math.max(0, t - 1)), []);
  const incrementQuestionIndex = useCallback(() => setQuestionIndex(i => i + 1), []);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(60);
    setQuestionIndex(0);
    setGameActive(false);
    setGameOver(false);
    setFeedback(null);
    setBuffer(DEFAULT_BUFFER);
  }, []);

  const value: GameContextType = {
    score,
    timeLeft,
    questionIndex,
    gameActive,
    gameOver,
    username,
    hasCompletedSetup,
    buffer,
    currentQuestion,
    expectedAnswer,
    feedback,
    playerStats,
    setScore,
    incrementScore,
    setTimeLeft,
    decrementTime,
    setQuestionIndex,
    incrementQuestionIndex,
    setGameActive,
    setGameOver,
    setUsername,
    setHasCompletedSetup,
    setBuffer,
    setCurrentQuestion,
    setExpectedAnswer,
    setFeedback,
    setPlayerStats,
    resetGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

