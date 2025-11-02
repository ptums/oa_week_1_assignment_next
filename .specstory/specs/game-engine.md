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
- `x` - Delete character
- `dd` - Delete line
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
- Single character: `x`, `p`, `w`, `b`
- Double character: `dd`, `dw`, `cw`, `yy`, `gg`
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

```typescript
export const QUESTION_BANK: Question[] = [
  { id: 'dd', prompt: 'Delete the current line', expected: ['dd'] },
  { id: 'gg', prompt: 'Go to the top of the file', expected: ['gg'] },
  { id: 'G', prompt: 'Go to the bottom of the file', expected: ['G'] },
  { id: 'dw', prompt: 'Delete a word', expected: ['dw'] },
  { id: 'x', prompt: 'Delete a single character', expected: ['x'] },
  { id: '0', prompt: 'Go to the start of the line', expected: ['0'] },
  { id: '$', prompt: 'Go to the end of the line', expected: ['$'] },
  { id: 'w', prompt: 'Move forward one word', expected: ['w'] },
  { id: 'b', prompt: 'Move backward one word', expected: ['b'] },
  { id: 'yy', prompt: 'Copy (yank) the current line', expected: ['yy'] },
  { id: 'p', prompt: 'Paste below the cursor', expected: ['p'] },
];
```

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

