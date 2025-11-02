'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import WelcomeDialog from '@/components/WelcomeDialog';

export default function HomePage() {
  const router = useRouter();
  const { hasCompletedSetup, username, setUsername, setHasCompletedSetup } = useGame();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Initialize database
    fetch('/api/init').catch(console.error);

    // Check if user exists
    const savedUsername = localStorage.getItem('vim-arcade-username');
    if (!savedUsername) {
      setShowWelcome(true);
    } else {
      setHasCompletedSetup(true);
      setUsername(savedUsername);
    }
  }, [setHasCompletedSetup, setUsername]);

  function handleStart() {
    setShowWelcome(false);
    router.push('/game');
  }

  function handlePlay() {
    router.push('/game');
  }

  function handleHighScores() {
    router.push('/scores');
  }

  return (
    <>
      <WelcomeDialog isOpen={showWelcome} onStart={handleStart} />

      <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
        <h1 className="font-['Press_Start_2P'] text-3xl md:text-4xl text-[#00fff0] text-center">
          VIM ARCADE
        </h1>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={handlePlay}
            disabled={!hasCompletedSetup}
            className={`w-full px-6 py-3 border-2 rounded font-['Press_Start_2P'] text-sm transition-colors ${
              hasCompletedSetup
                ? 'border-[#00fff0] text-[#00fff0] hover:bg-[#00fff0] hover:text-black shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)]'
                : 'border-gray-600 text-gray-600 cursor-not-allowed'
            }`}
          >
            Play
          </button>

          <button
            onClick={handleHighScores}
            className="w-full px-6 py-3 border-2 border-[#ff2d95] text-[#ff2d95] rounded hover:bg-[#ff2d95] hover:text-black shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)] font-['Press_Start_2P'] text-sm transition-colors"
          >
            High Scores
          </button>
        </div>

        {hasCompletedSetup && (
          <p className="text-sm text-gray-400">
            Welcome back, <span className="text-[#00fff0]">{username}</span>!
          </p>
        )}
      </main>
    </>
  );
}
