'use client'

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function FeedbackEmoji() {
  const { feedback, setFeedback } = useGame();
  const [show, setShow] = useState(false);
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    if (feedback) {
      setShow(true);
      
      switch (feedback) {
        case 'correct':
          setEmoji('✓');
          break;
        case 'wrong':
          setEmoji('✗');
          break;
        case 'hint':
          setEmoji('⚠️');
          break;
      }

      const timer = setTimeout(() => {
        setShow(false);
        setFeedback(null);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [feedback, setFeedback]);

  if (!show) return null;

  const colorClass = feedback === 'correct' 
    ? 'text-green-400' 
    : feedback === 'wrong' 
    ? 'text-red-400' 
    : 'text-yellow-400';

  return (
    <div className={`text-3xl ${colorClass} animate-fade flex-shrink-0`}>
      {emoji}
    </div>
  );
}

