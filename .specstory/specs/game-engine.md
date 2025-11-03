# Game Engine Specification

**Component**: Vim Simulation Engine  
**Location**: `lib/game/engine/`  
**Last Updated**: November 2, 2025

---

## Overview

The game engine simulates Vim editor behavior, allowing players to learn Vim keybindings through interactive gameplay. It consists of buffer operations, keystroke parsing, questions, and scoring.

---

## Architecture

```
lib/game/engine/
├── buffer.ts       # Vim buffer operations (cursor, text manipulation)
├── sim.ts          # Keystroke parser and command simulator
├── questions.ts    # Question bank and random selection
└── scoring.ts      # Score calculation logic
```

---

## Core Components

### 1. Buffer (`buffer.ts`)

Manages the text buffer and cursor position.

#### Buffer Type
```typescript
export interface Buffer {
  lines: string[];
  cursor: { row: number; col: number };
}
```

#### Key Functions

**Cursor Movement**:
- `moveCursor(buf, row, col)` - Move cursor to position
- `goTop(buf)` - Move to top (`gg` command) - sets row to -1
- `goBottom(buf)` - Move to bottom (`G` command) - sets row to lines.length
- `lineStart(buf)` - Move to start of line (`0`)
- `lineEnd(buf)` - Move to end of line (`$`)
- `wordForward(buf)` - Move forward one word (`w`)
- `wordBackward(buf)` - Move backward one word (`b`)

**Text Manipulation**:
- `deleteChar(buf)` - Delete character at cursor (`x`)
- `deleteWord(buf)` - Delete word (`dw`)
- `deleteLine(buf)` - Delete current line (`dd`)
  - **Special behavior**: If last line, clears content instead of deleting
- `changeWord(buf)` - Change word (`cw`)
- `yankLine(buf, register)` - Copy line to register (`yy`)
- `pasteBelow(buf, register)` - Paste below cursor (`p`)

#### Special Cursor Behavior

**Visual Indicators**:
- Row `-1`: Cursor shows **above** text (for `gg`)
- Row `>= lines.length`: Cursor shows **below** text (for `G`)

This allows players to see the cursor move beyond text boundaries.

---

### 2. Keystroke Simulator (`sim.ts`)

Parses Vim commands and applies them to the buffer.

#### Main Function

```typescript
export function applyKeys(
  buf: Buffer, 
  keys: string, 
  register: { line?: string }
): { buf: Buffer }
```

**Supported Commands**:
- `h` - Move cursor left
- `j` - Move cursor down
- `k` - Move cursor up
- `l` - Move cursor right
- `x` - Delete character
- `dd` - Delete line (supports counts: `2dd`, `3dd`, etc.)
- `dw` - Delete word
- `cw` - Change word
- `yy` - Yank (copy) line
- `p` - Paste below
- `gg` - Go to top
- `G` - Go to bottom
- `0` - Line start
- `$` - Line end
- `w` - Word forward
- `b` - Word backward

**Command Parsing**:
- Single character: `h`, `j`, `k`, `l`, `x`, `p`, `w`, `b`
- Double character: `dd`, `dw`, `cw`, `yy`, `gg`
- With counts: `2dd`, `3dd`, `5dd`, `10dd`
- Uppercase: `G`
- Special: `0`, `$`

---

### 3. Questions (`questions.ts`)

Question bank with Vim challenges.

#### Question Type
```typescript
export interface Question {
  id: string;
  prompt: string;         // What to do (e.g., "Delete current line")
  expected: string[];     // Valid answers (e.g., ["dd"])
}
```

#### Question Bank

**Total Questions**: 19 (updated November 3, 2025)

```typescript
export const QUESTION_BANK: Question[] = [
  // Basic operations (11 questions)
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
  
  // Navigation commands (4 questions)
  { id: 'move-left', prompt: 'Move cursor one character to the left', expected: ['h'] },
  { id: 'move-down', prompt: 'Move cursor one line down', expected: ['j'] },
  { id: 'move-up', prompt: 'Move cursor one line up', expected: ['k'] },
  { id: 'move-right', prompt: 'Move cursor one character to the right', expected: ['l'] },
  
  // Deletion with counts (4 questions)
  { id: 'del-2-lines', prompt: 'Delete 2 consecutive lines', expected: ['2dd'] },
  { id: 'del-3-lines', prompt: 'Delete 3 consecutive lines', expected: ['3dd'] },
  { id: 'del-5-lines', prompt: 'Delete 5 consecutive lines', expected: ['5dd'] },
  { id: 'del-10-lines', prompt: 'Delete 10 consecutive lines', expected: ['10dd'] },
];
```

**Categories**:
- **Navigation**: `h`, `j`, `k`, `l`, `gg`, `G`, `0`, `$`, `w`, `b` (10 questions)
- **Deletion**: `x`, `dd`, `2dd`, `3dd`, `5dd`, `10dd`, `dw` (7 questions)
- **Editing**: `cw` (1 question)
- **Copy/Paste**: `yy p` (1 question)

**Note**: Standalone `yy` and `p` questions were removed because:
- `yy` (yank) produces no visible change, making it confusing for learners
- `p` (paste) requires prior yanked content, which doesn't exist in isolated questions

#### Random Selection
```typescript
export function pickRandom(count: number): Question[]
```
Returns shuffled array of `count` questions.

---

### 4. Scoring (`scoring.ts`)

Score calculation logic.

```typescript
export function pointsFor(correct: boolean, hintUsed: boolean): number {
  if (hintUsed) return 0;    // No points if hint was used
  return correct ? 1 : 0;     // 1 point for correct, 0 for wrong
}
```

**Rules**:
- ✅ Correct answer without hint: **+1 point**
- ⚠️ Correct answer with hint: **0 points**
- ❌ Wrong answer: **0 points**
- 💡 Hint used: User can still attempt answer (no points)

---

## Game Flow Integration

### Usage in Game Page

```typescript
import { applyKeys } from '@/lib/game/engine/sim';
import { pickRandom, QUESTION_BANK } from '@/lib/game/engine/questions';

// Initialize
const questions = pickRandom(QUESTION_BANK.length);
const buffer = { lines: ['Sample text'], cursor: { row: 0, col: 0 } };

// Process user input
const result = applyKeys(buffer, userInput, register);
setBuffer(result.buf);

// Check answer
const correct = currentQuestion.expected.some(exp => exp === userInput);
```

---

## Text Buffer Management

### Default Text
```typescript
const DEFAULT_TEXT = [
  'Vim is a powerful text editor for efficient editing.'
];
```

Single sentence to keep UI clean and focused.

### Buffer Reset
Buffer resets to default text for each new question.

---

## Visual Feedback

### Cursor Position
- Normal: Pink highlight on current character
- Above text (`gg`): Pink block above sentence
- Below text (`G`): Pink block below sentence

### Text Changes
- Deletions: Text removes immediately
- Paste: Text appears below cursor
- Changes: Affects specific characters/words

---

## Edge Cases

### Empty Buffer
**Problem**: After `dd`, buffer could become empty  
**Solution**: `deleteLine()` prevents deleting last line; clears content instead

```typescript
if (lines.length === 1) {
  lines[0] = '';  // Clear instead of delete
  return { ...buf, lines, cursor: { row: 0, col: 0 } };
}
```

### Cursor Out of Bounds
**Solution**: Safety checks in `VimBuffer` component ensure at least one line exists.

---

## Related Files

- `lib/game/engine/buffer.ts` - Buffer operations
- `lib/game/engine/sim.ts` - Command parser
- `lib/game/engine/questions.ts` - Question data
- `lib/game/engine/scoring.ts` - Score logic
- `app/game/page.tsx` - Game integration
- `components/VimBuffer.tsx` - Visual rendering
- `types/index.ts` - TypeScript types

---

## Future Enhancements

- [ ] More complex commands (e.g., `3dd`, `2w`)
- [ ] Visual mode simulation
- [ ] Multiple lines of text
- [ ] Insert mode simulation
- [ ] Search commands (`/`, `?`)

---

*Last Updated: November 2, 2025*

