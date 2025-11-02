'use client'

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useGame } from '@/contexts/GameContext';

interface WelcomeDialogProps {
  isOpen: boolean;
  onStart: () => void;
}

export default function WelcomeDialog({ isOpen, onStart }: WelcomeDialogProps) {
  const { setUsername, setHasCompletedSetup } = useGame();
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    // Save to localStorage
    localStorage.setItem('vim-arcade-username', nameInput.trim());
    setUsername(nameInput.trim());
    setHasCompletedSetup(true);

    // Initialize database entry
    try {
      const response = await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nameInput.trim(), score: 0 })
      });
      
      if (!response.ok) {
        console.error('Failed to save to database');
      }
    } catch (e) {
      console.error('Error saving to database:', e);
    }

    onStart();
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
                <DialogTitle className="font-['Press_Start_2P'] text-[#00fff0] text-xl mb-4 text-center">
                  Welcome to VIM ARCADE
                </DialogTitle>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm mb-2">
                      Enter your name:
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-black/60 border-2 border-[#ff2d95] rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-[#00fff0]"
                      placeholder="Your name..."
                      maxLength={20}
                      autoFocus
                    />
                    {error && (
                      <p className="text-red-400 text-xs mt-1">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 border-2 border-[#00fff0] rounded text-[#00fff0] hover:bg-[#00fff0] hover:text-black shadow-[0_0_8px_rgba(0,255,240,0.6),_0_0_16px_rgba(255,45,149,0.4)] font-['Press_Start_2P'] text-sm transition-colors"
                  >
                    Play
                  </button>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

