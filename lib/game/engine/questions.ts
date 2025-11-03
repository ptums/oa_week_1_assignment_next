export type Question = {
  id: string;
  prompt: string;
  expected: string[]; // acceptable canonical commands
  applyAfter?: boolean; // if true, we check effect not just command string
};

export const QUESTION_BANK: Question[] = [
  { id: 'del-line', prompt: 'Delete the current line', expected: ['dd', '1dd'] },
  { id: 'yank-paste', prompt: 'Duplicate the current line (yank & paste)', expected: ['yy p', 'yyp'] },
  { id: 'del-word', prompt: 'Delete the next word starting at cursor', expected: ['dw'] },
  { id: 'change-word', prompt: 'Change the word under the cursor', expected: ['cw'] },
  { id: 'move-top', prompt: 'Move to the top of the file', expected: ['gg'] },
  { id: 'move-bottom', prompt: 'Move to the bottom of the file', expected: ['G'] },
  { id: 'move-begin', prompt: 'Move to the beginning of the current line', expected: ['0'] },
  { id: 'move-end', prompt: 'Move to the end of the current line', expected: ['$'] },
  { id: 'word-forward', prompt: 'Jump forward one word', expected: ['w'] },
  { id: 'word-backward', prompt: 'Jump backward one word', expected: ['b'] },
  { id: 'delete-char', prompt: 'Delete the character under the cursor', expected: ['x'] },
  
  // NEW: Navigation commands (hjkl)
  { id: 'move-left', prompt: 'Move cursor one character to the left', expected: ['h'] },
  { id: 'move-down', prompt: 'Move cursor one line down', expected: ['j'] },
  { id: 'move-up', prompt: 'Move cursor one line up', expected: ['k'] },
  { id: 'move-right', prompt: 'Move cursor one character to the right', expected: ['l'] },
  
  // NEW: Deletion with counts
  { id: 'del-2-lines', prompt: 'Delete 2 consecutive lines', expected: ['2dd'] },
  { id: 'del-3-lines', prompt: 'Delete 3 consecutive lines', expected: ['3dd'] },
  { id: 'del-5-lines', prompt: 'Delete 5 consecutive lines', expected: ['5dd'] },
  { id: 'del-10-lines', prompt: 'Delete 10 consecutive lines', expected: ['10dd'] }
];

export function pickRandom(count = 10): Question[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}


