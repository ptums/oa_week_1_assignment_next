# Paste Question Bug Fix

**Date**: November 3, 2025  
**Type**: Bug Fix  
**Status**: ✅ Fixed

---

## Problem

The standalone paste question broke the app:

```typescript
{ id: 'paste-line', prompt: 'Paste the yanked content below the cursor', expected: ['p'] }
```

**Why it broke**:
1. Each question starts with a fresh buffer via `resetBuffer()`
2. The register (clipboard) is empty - nothing has been yanked
3. When user types `p`, it pastes an empty string
4. No visible change occurs, making the app seem broken
5. User gets stuck because nothing happens

---

## Root Cause

The `p` command requires **prior state** (yanked content in the register), but questions are **stateless** - each starts fresh with no register content.

```typescript
// buffer.ts - pasteBelow always succeeds, even with empty register
export function pasteBelow(buf: Buffer, register: { line?: string }): Buffer {
  const r = buf.cursor.row;
  const lines = buf.lines.slice();
  const paste = register.line ?? '';  // Empty string if nothing yanked
  lines.splice(r + 1, 0, paste);      // Inserts empty line
  return { ...buf, lines, cursor: { row: r + 1, col: 0 } };
}
```

---

## Solution

**Removed 2 problematic questions**:

1. ❌ `paste-line` - Requires prior yank
2. ❌ `yank-line` - Produces no visible change (confusing)

**Kept the working composite question**:

✅ `yank-paste` - "Duplicate the current line (yank & paste)" → `yy p`

This teaches both operations together and produces a visible result.

---

## Files Changed

### `lib/game/engine/questions.ts`

**Before**: 21 questions (2 broken)
```typescript
// Removed these:
{ id: 'yank-line', prompt: 'Yank (copy) the current line', expected: ['yy'] },
{ id: 'paste-line', prompt: 'Paste the yanked content below the cursor', expected: ['p'] },
```

**After**: 19 questions (all working)

---

## Updated Question Bank

**Total**: 19 questions

**By Category**:
| Category | Commands | Count |
|----------|----------|-------|
| **Navigation** | `h`, `j`, `k`, `l`, `gg`, `G`, `0`, `$`, `w`, `b` | 10 |
| **Deletion** | `x`, `dd`, `2dd`, `3dd`, `5dd`, `10dd`, `dw` | 7 |
| **Editing** | `cw` | 1 |
| **Copy/Paste** | `yy p` | 1 |

---

## Why Standalone Yank/Paste Don't Work

### 1. **Yank (`yy`) Problem**
- **No visible feedback**: Yanking copies to register but doesn't change the display
- **User confusion**: Nothing happens on screen after typing `yy`
- **Can't verify**: Player has no way to know if they answered correctly

### 2. **Paste (`p`) Problem**
- **Requires prior state**: Register must contain yanked content
- **Questions are stateless**: Each question starts with empty register
- **Empty paste**: `p` inserts empty line (invisible/confusing)
- **Breaks user flow**: Nothing visible happens

### 3. **Composite (`yy p`) Works**
- ✅ **Visible result**: Line is duplicated
- ✅ **Self-contained**: Both yank and paste in one command
- ✅ **Clear feedback**: User sees the duplication immediately

---

## Design Lesson

**Game design principle**: Every question must produce **immediate visible feedback**.

**Questions should**:
- ✅ Be self-contained (no prior state required)
- ✅ Show clear visual results
- ✅ Allow player to verify their answer

**Avoid**:
- ❌ Commands with no visible output (`yy`)
- ❌ Commands requiring prior state (`p` without yank)
- ❌ Multi-step operations split across questions

---

## Testing

**Verified**:
- ✅ App no longer breaks on paste question
- ✅ All 19 questions work correctly
- ✅ Composite `yy p` question functions as expected
- ✅ No linter errors

---

## Documentation Updated

- ✅ `.specstory/specs/game-engine.md` - Updated question count and list
- ✅ `.specstory/updates/PASTE_QUESTION_FIX.md` - This document
- ✅ `lib/game/engine/questions.ts` - Removed problematic questions

---

**Status**: ✅ Bug fixed, app stable with 19 working questions

