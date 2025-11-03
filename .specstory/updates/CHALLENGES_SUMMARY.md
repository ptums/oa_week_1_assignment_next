# Vim Challenges - Quick Summary

**Total Questions**: 19 (expanded from 11, adjusted after removing 2 problematic questions)  
**Date**: November 3, 2025  
**Last Updated**: November 3, 2025

---

## 📊 Challenge Categories

### 🧭 Navigation (10 questions)
Fundamental Vim cursor movement commands.

| Command | Description | Difficulty |
|---------|-------------|------------|
| `h` | Move cursor left | ⭐ Beginner |
| `j` | Move cursor down | ⭐ Beginner |
| `k` | Move cursor up | ⭐ Beginner |
| `l` | Move cursor right | ⭐ Beginner |
| `w` | Jump forward one word | ⭐ Beginner |
| `b` | Jump backward one word | ⭐ Beginner |
| `0` | Move to line start | ⭐⭐ Intermediate |
| `$` | Move to line end | ⭐⭐ Intermediate |
| `gg` | Go to top of file | ⭐⭐ Intermediate |
| `G` | Go to bottom of file | ⭐⭐ Intermediate |

---

### ✂️ Deletion (7 questions)
Commands for removing text, including count modifiers.

| Command | Description | Difficulty |
|---------|-------------|------------|
| `x` | Delete character under cursor | ⭐ Beginner |
| `dd` | Delete current line | ⭐ Beginner |
| `dw` | Delete word | ⭐⭐ Intermediate |
| `2dd` | Delete 2 consecutive lines | ⭐⭐ Intermediate |
| `3dd` | Delete 3 consecutive lines | ⭐⭐ Intermediate |
| `5dd` | Delete 5 consecutive lines | ⭐⭐⭐ Advanced |
| `10dd` | Delete 10 consecutive lines | ⭐⭐⭐ Advanced |

---

### ✏️ Editing (1 question)
Text modification commands.

| Command | Description | Difficulty |
|---------|-------------|------------|
| `cw` | Change word under cursor | ⭐⭐ Intermediate |

---

### 📋 Copy/Paste (1 question)
Clipboard operations for duplicating text.

| Command | Description | Difficulty |
|---------|-------------|------------|
| `yy p` | Duplicate line (yank & paste) | ⭐⭐ Intermediate |

**Note**: Standalone `yy` and `p` questions were removed because:
- `yy` produces no visible change (confusing for learners)
- `p` requires prior yanked content (breaks in isolated questions)

---

## 🎯 Learning Path

### Level 1: Beginner (8 questions)
Master basic cursor movement and simple deletions.
- `h`, `j`, `k`, `l` - Arrow key alternatives
- `x` - Delete single character
- `dd` - Delete line

### Level 2: Intermediate (8 questions)
Efficient navigation and word manipulation.
- `w`, `b` - Word jumping
- `0`, `$` - Line boundaries
- `gg`, `G` - File boundaries
- `dw`, `cw` - Word operations
- `yy p` - Copy/paste (duplicate line)
- `2dd`, `3dd` - Multiple line deletion

### Level 3: Advanced (3 questions)
Count modifiers for powerful operations.
- `5dd` - Delete 5 lines
- `10dd` - Delete 10 lines

---

## 💡 Vim Concepts Taught

### 1. **Modal Editing**
All commands assume Normal mode (the default Vim mode).

### 2. **Count Modifiers**
Prefix commands with numbers to repeat them:
- `2dd` = delete 2 lines
- `3w` = forward 3 words (not in game yet)
- `5x` = delete 5 characters (not in game yet)

### 3. **Motion Commands**
Commands that move the cursor:
- Character: `h`, `j`, `k`, `l`
- Word: `w`, `b`
- Line: `0`, `$`
- File: `gg`, `G`

### 4. **Operator Commands**
Commands that act on text:
- Delete: `x`, `dd`, `dw`
- Change: `cw`
- Yank: `yy`
- Paste: `p`

### 5. **Composability**
Vim commands can be combined:
- `yy p` = yank then paste = duplicate line

---

## 📈 Progression Metrics

| Metric | Value |
|--------|-------|
| **Total Questions** | 19 |
| **Beginner** | 8 (42%) |
| **Intermediate** | 8 (42%) |
| **Advanced** | 3 (16%) |
| **Navigation Focus** | 10 (53%) |
| **Deletion Focus** | 7 (37%) |
| **Copy/Paste Focus** | 1 (5%) |
| **Editing Focus** | 1 (5%) |

---

## 🔮 Future Expansion Ideas

### Potential Additions
- `i` - Enter insert mode
- `A` - Append at end of line
- `o` - Open new line below
- `d$` - Delete to end of line
- `d0` - Delete to start of line
- `c$` - Change to end of line
- `u` - Undo
- `Ctrl+r` - Redo
- `/pattern` - Search
- `n` - Next search result
- `:w` - Save (ex command)
- `:q` - Quit (ex command)

### Complex Combinations
- `ci"` - Change inside quotes
- `diw` - Delete inner word
- `dap` - Delete around paragraph

---

**See**: [NEW_CHALLENGES_ADDED.md](./NEW_CHALLENGES_ADDED.md) for implementation details.

