'use client'

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';

interface GameOverDialogProps {
  isOpen: boolean;
  onRestart: () => void;
}

export default function GameOverDialog({ isOpen, onRestart }: GameOverDialogProps) {
  const { score, username, setPlayerStats } = useGame();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && !saved) {
      saveScore();
    }
  }, [isOpen]);

  async function saveScore() {
    if (saved) return;
    setSaved(true);

    try {
      const response = await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score })
      });
      
      if (response.ok) {
        const player = await response.json();
        
        setPlayerStats({
          times_played: player.times_played,
          highest_score: player.highest_score
        });
        
        localStorage.setItem('vim-arcade-stats', JSON.stringify({
          times_played: player.times_played,
          highest_score: player.highest_score
        }));
      }
    } catch (e) {
      console.error('Error saving score:', e);
    }
  }

  function handleRestart() {
    setSaved(false);
    onRestart();
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-[#0b0c1a] border-2 border-[#00fff0] p-6 shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)] transition-all">
                <DialogTitle className="font-['Press_Start_2P'] text-[#00fff0] text-2xl mb-4 text-center">
                  Game Over!
                </DialogTitle>

                <div className="text-center space-y-6">
                  <div>
                    <p className="text-sm mb-2">Your Score:</p>
                    <p className="font-['Press_Start_2P'] text-4xl text-[#00ff7f]">{score}</p>
                  </div>

                  <button
                    onClick={handleRestart}
                    className="w-full px-4 py-3 border-2 border-[#00fff0] rounded text-[#00fff0] hover:bg-[#00fff0] hover:text-black shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)] font-['Press_Start_2P'] text-sm transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

