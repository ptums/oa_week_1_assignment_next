# New Vim Challenges Added

**Date**: November 3, 2025  
**Type**: Feature Enhancement  
**Status**: ✅ Complete

---

## Summary

Added **10 new Vim challenges** to the question bank, expanding the game from 11 to 21 total questions. After bug fixes, **19 questions** remain active. The new challenges focus on fundamental Vim navigation (hjkl) and advanced deletion with count modifiers.

**Update**: Removed 2 problematic questions (`yy` and `p` standalone). See [PASTE_QUESTION_FIX.md](./PASTE_QUESTION_FIX.md) for details.

---

## Changes Made

### 1. Question Bank Expansion

**File**: `lib/game/engine/questions.ts`

**New Challenges** (10 total):

#### Navigation Commands (4 questions)
- `h` - Move cursor one character to the left
- `j` - Move cursor one line down
- `k` - Move cursor one line up
- `l` - Move cursor one character to the right

#### Deletion with Counts (4 questions)
- `2dd` - Delete 2 consecutive lines
- `3dd` - Delete 3 consecutive lines
- `5dd` - Delete 5 consecutive lines
- `10dd` - Delete 10 consecutive lines

#### Individual Yank/Paste (2 questions)
- `yy` - Yank (copy) the current line
- `p` - Paste the yanked content below the cursor

---

## Question Bank Summary

**Total Questions**: 21 (was 11)

**By Category**:
| Category | Commands | Count |
|----------|----------|-------|
| **Navigation** | `h`, `j`, `k`, `l`, `gg`, `G`, `0`, `$`, `w`, `b` | 10 |
| **Deletion** | `x`, `dd`, `2dd`, `3dd`, `5dd`, `10dd`, `dw` | 7 |
| **Editing** | `cw` | 1 |
| **Copy/Paste** | `yy`, `p`, `yy p` | 3 |

---

## Educational Benefits

### 1. **Core Navigation (hjkl)**
The fundamental Vim navigation keys are now included. These are essential for efficient Vim usage and the foundation for all cursor movement.

### 2. **Count Modifiers**
Questions like `2dd`, `3dd`, `5dd`, and `10dd` teach users that Vim commands can be prefixed with numbers to repeat operations. This is a powerful concept that applies to many Vim commands.

### 3. **Clipboard Operations**
Separating `yy` and `p` from the composite `yy p` helps users understand that:
- `yy` copies to a register (clipboard)
- `p` pastes from that register
- They can be used independently or together

---

## Technical Implementation

### Engine Support

All new commands were already supported by the game engine:

**Navigation** (`h`, `j`, `k`, `l`):
```typescript
// sim.ts (lines 22-25)
case 'h': b = moveCursor(b, 0, -1); break;
case 'j': b = moveCursor(b, 1, 0); break;
case 'k': b = moveCursor(b, -1, 0); break;
case 'l': b = moveCursor(b, 0, 1); break;
```

**Count Modifiers**:
```typescript
// sim.ts (lines 14-19)
const countMatch = cmd.match(/^(\d+)([a-z]+)$/);
let count = 1;
if (countMatch) {
  count = parseInt(countMatch[1], 10);
  cmd = countMatch[2];
}
```

**Delete with Count**:
```typescript
// sim.ts (line 35)
case 'dd': b = deleteLine(b, count); break;
```

---

## No Breaking Changes

- ✅ Existing questions remain unchanged
- ✅ Backward compatible with saved game progress
- ✅ Random selection still works (`pickRandom()`)
- ✅ No API or component changes needed

---

## Testing

### Verification Steps

1. **Question Count**: Verify 21 questions in bank
2. **Navigation**: Test `h`, `j`, `k`, `l` commands work
3. **Counts**: Test `2dd`, `3dd`, `5dd`, `10dd` delete correct number of lines
4. **Individual Operations**: Test `yy` and `p` work separately
5. **Random Selection**: Ensure new questions appear in gameplay

---

## Documentation Updated

- ✅ `lib/game/engine/questions.ts` - Question bank expanded
- ✅ `.specstory/specs/game-engine.md` - Spec updated with new questions
- ✅ `.specstory/updates/NEW_CHALLENGES_ADDED.md` - This document

---

## Future Enhancements

Potential additional challenges to consider:
- `d$` - Delete to end of line
- `d0` - Delete to start of line
- `c$` - Change to end of line
- `2w` - Move forward 2 words
- `3b` - Move backward 3 words
- `2x` - Delete 2 characters
- `3p` - Paste 3 times

**Note**: These would require extending the count modifier support to more commands in `sim.ts`.

---

## Code Example

```typescript
// questions.ts - New structure
export const QUESTION_BANK: Question[] = [
  // ... existing 11 questions ...
  
  // NEW: Navigation commands (hjkl)
  { id: 'move-left', prompt: 'Move cursor one character to the left', expected: ['h'] },
  { id: 'move-down', prompt: 'Move cursor one line down', expected: ['j'] },
  { id: 'move-up', prompt: 'Move cursor one line up', expected: ['k'] },
  { id: 'move-right', prompt: 'Move cursor one character to the right', expected: ['l'] },
  
  // NEW: Deletion with counts
  { id: 'del-2-lines', prompt: 'Delete 2 consecutive lines', expected: ['2dd'] },
  { id: 'del-3-lines', prompt: 'Delete 3 consecutive lines', expected: ['3dd'] },
  { id: 'del-5-lines', prompt: 'Delete 5 consecutive lines', expected: ['5dd'] },
  
  // NEW: Individual yank and paste
  { id: 'yank-line', prompt: 'Yank (copy) the current line', expected: ['yy'] },
  { id: 'paste-line', prompt: 'Paste the yanked content below the cursor', expected: ['p'] },
  
  // NEW: Advanced deletion
  { id: 'del-10-lines', prompt: 'Delete 10 consecutive lines', expected: ['10dd'] }
];
```

---

**Status**: ✅ Complete and ready for gameplay testing

