'use client'

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { applyKeys } from '@/lib/game/engine/sim';
import { pickRandom, type Question, QUESTION_BANK } from '@/lib/game/engine/questions';
import VimBuffer from '@/components/VimBuffer';
import FeedbackEmoji from '@/components/FeedbackEmoji';
import GameOverDialog from '@/components/GameOverDialog';

const DEFAULT_TEXT = ['Vim is a powerful text editor for efficient editing.'];

export default function GamePage() {
  const router = useRouter();
  const {
    score,
    timeLeft,
    gameActive,
    buffer,
    currentQuestion,
    feedback,
    setScore,
    setTimeLeft,
    decrementTime,
    setQuestionIndex,
    incrementQuestionIndex,
    setGameActive,
    setGameOver,
    setBuffer,
    setCurrentQuestion,
    setExpectedAnswer,
    setFeedback,
    resetGame
  } = useGame();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [hintText, setHintText] = useState('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [register] = useState<{ line?: string }>({});
  const [hintUsed, setHintUsed] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const timerPausedTimeout = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);
  const advanceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);

  useEffect(() => {
    // Check if user has completed setup
    const savedUsername = localStorage.getItem('vim-arcade-username');
    if (!savedUsername) {
      router.push('/');
      return;
    }

    const qs = pickRandom(QUESTION_BANK.length);
    setQuestions(qs);
    startGame(qs);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      if (timerPausedTimeout.current) clearTimeout(timerPausedTimeout.current);
    };
  }, []);

  function startGame(qs: Question[]) {
    setScore(0);
    setTimeLeft(60);
    setQuestionIndex(0);
    setGameActive(true);
    setGameOver(false);
    setShowGameOver(false);
    setHintUsed(false);
    setTimerPaused(false);

    resetBuffer();
    loadQuestion(qs, 0);
    startTimer();
  }

  function startTimer() {
    if (timerInterval.current) clearInterval(timerInterval.current);

    timerInterval.current = setInterval(() => {
      if (!timerPaused) {
        decrementTime();
      }
    }, 1000);
  }

  function pauseTimer(duration: number) {
    setTimerPaused(true);
    if (timerPausedTimeout.current) clearTimeout(timerPausedTimeout.current);

    timerPausedTimeout.current = setTimeout(() => {
      setTimerPaused(false);
    }, duration);
  }

  useEffect(() => {
    if (gameActive && timeLeft <= 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  function resetBuffer() {
    setBuffer({
      lines: [...DEFAULT_TEXT],
      cursor: { row: 0, col: 0 }
    });
  }

  function loadQuestion(qs: Question[], index: number) {
    if (index >= qs.length) {
      index = 0;
    }

    const q = qs[index];
    setCurrentQ(q);
    setCurrentQuestion(q.prompt);
    setExpectedAnswer(q.expected);
    setHintText('');
    setHintUsed(false);
    resetBuffer();
  }

  function handleInput(value: string) {
    setInputValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      processInput(value);
    }, 300);
  }

  function processInput(input: string) {
    const trimmed = input.trim();
    if (!trimmed || !currentQ) return;

    // Check for hint trigger
    if (trimmed === '@@') {
      showHint();
      return;
    }

    // Apply command to buffer
    try {
      const result = applyKeys(buffer, trimmed, register);
      setBuffer(result.buf);
    } catch (e) {
      console.error('Error applying keys:', e);
    }

    // Check if answer is correct
    const correct = currentQ.expected.some((exp) => exp === trimmed);

    if (correct) {
      handleCorrect();
    } else {
      handleWrong();
    }
  }

  function handleCorrect() {
    // Clear any pending feedback timeouts from hints
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);

    setFeedback('correct');
    // Only award point if hint wasn't used
    if (!hintUsed) {
      setScore(score + 1);
    }
    setInputValue('');
    setHintText('');
    setAnimationKey((prev) => prev + 1);

    // Brief pause (2s) to let user see the Vim command effect, then advance
    pauseTimer(2000);

    advanceTimeout.current = setTimeout(() => {
      incrementQuestionIndex();
      loadQuestion(questions, questions.indexOf(currentQ!) + 1);
    }, 2000);
  }

  function handleWrong() {
    setFeedback('wrong');
    setInputValue('');
    setAnimationKey((prev) => prev + 1);
  }

  function showHint() {
    // Clear any existing feedback timeout
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);

    setFeedback('hint');
    setHintText(currentQ ? currentQ.expected[0] : '');
    setInputValue('');
    setHintUsed(true);
    setAnimationKey((prev) => prev + 1);

    // Show hint emoji briefly but keep hint text visible
    feedbackTimeout.current = setTimeout(() => {
      setFeedback(null);
    }, 1200);
  }

  function endGame() {
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (timerPausedTimeout.current) clearTimeout(timerPausedTimeout.current);
    setGameActive(false);
    setGameOver(true);
    setShowGameOver(true);
    setTimerPaused(false);
  }

  function handleRestart() {
    setShowGameOver(false);
    const qs = pickRandom(QUESTION_BANK.length);
    setQuestions(qs);
    resetGame();
    startGame(qs);
  }

  function handleGoToScores() {
    router.push('/scores');
  }

  return (
    <>
      <GameOverDialog isOpen={showGameOver} onRestart={handleRestart} />

      <main className="min-h-screen flex flex-col items-center p-4 max-w-2xl mx-auto">
        {/* Header: Score and Timer */}
        <div className="w-full flex justify-between items-center mb-6 mt-4">
          <div className="font-['Press_Start_2P'] text-[#00ff7f] text-lg">
            Score: {score}
          </div>
          <div className="font-['Press_Start_2P'] text-[#ffc107] text-lg">
            {timeLeft}s
          </div>
        </div>

        {/* Question Banner */}
        <motion.div
          key={animationKey}
          animate={
            feedback === 'correct'
              ? { scale: [1, 1.05, 1], transition: { duration: 0.5, ease: 'easeOut' } }
              : feedback === 'wrong'
              ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5, ease: 'easeInOut' } }
              : feedback === 'hint'
              ? { y: [0, -5, 0, -5, 0], transition: { duration: 0.6, ease: 'easeInOut' } }
              : {}
          }
          className={`w-full border-2 rounded-lg p-4 mb-6 transition-all duration-300 relative ${
            feedback === 'correct'
              ? 'bg-green-900/70 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]'
              : feedback === 'wrong'
              ? 'bg-red-900/70 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.6)]'
              : feedback === 'hint'
              ? 'bg-amber-900/70 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
              : 'bg-[#0b0c1a]/90 border-[#00fff0] shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)]'
          }`}
        >
          <p
            className={`text-sm md:text-base text-center font-semibold transition-colors duration-300 pr-12 ${
              feedback === 'correct'
                ? 'text-green-100'
                : feedback === 'wrong'
                ? 'text-red-100'
                : feedback === 'hint'
                ? 'text-amber-100'
                : 'text-white'
            }`}
          >
            {currentQuestion}
            {hintText && (
              <span className="ml-2 font-bold text-amber-200">→ {hintText}</span>
            )}
          </p>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <FeedbackEmoji />
          </div>
        </motion.div>

        {/* Vim Buffer Display */}
        <div className="w-full mb-6">
          <VimBuffer buffer={buffer} />
        </div>

        {/* Command Input */}
        <div className="w-full mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            disabled={!gameActive}
            className="w-full bg-black/60 border-2 border-[#ff2d95] rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#00fff0] disabled:opacity-50"
            placeholder="Type Vim command... (use @@ for hint)"
            autoComplete="off"
          />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Type your answer and wait 300ms or type @@ for hint
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex gap-4 mt-auto pt-8">
          <button
            onClick={() => handleRestart()}
            className="px-6 py-2 border-2 border-[#00fff0] text-[#00fff0] rounded hover:bg-[#00fff0] hover:text-black font-['Press_Start_2P'] text-xs transition-colors"
          >
            Restart
          </button>
          <button
            onClick={handleGoToScores}
            className="px-6 py-2 border-2 border-[#ff2d95] text-[#ff2d95] rounded hover:bg-[#ff2d95] hover:text-black font-['Press_Start_2P'] text-xs transition-colors"
          >
            High Scores
          </button>
        </div>
      </main>
    </>
  );
}

