import type { Buffer } from '../../../types';
import {
  moveCursor, deleteChar, deleteWord, changeWord,
  yankLine, pasteBelow, deleteLine, lineStart, lineEnd, goTop, goBottom,
  wordForward, wordBackward
} from './buffer';

// Very small Vim subset parser. Returns new buffer + canonical command string.
export function applyKeys(buf: Buffer, input: string, register: { line?: string }): { buf: Buffer; command: string } {
  let b = { ...buf };
  let cmd = input.trim();

  // Support counts like 3dd
  const countMatch = cmd.match(/^(\d+)([a-z]+)$/);
  let count = 1;
  if (countMatch) {
    count = parseInt(countMatch[1], 10);
    cmd = countMatch[2];
  }

  switch (cmd) {
    case 'h': b = moveCursor(b, 0, -1); break;
    case 'j': b = moveCursor(b, 1, 0); break;
    case 'k': b = moveCursor(b, -1, 0); break;
    case 'l': b = moveCursor(b, 0, 1); break;
    case '0': b = lineStart(b); break;
    case '$': b = lineEnd(b); break;
    case 'gg': b = goTop(b); break;
    case 'G': b = goBottom(b); break;
    case 'x': b = deleteChar(b); break;
    case 'dw': b = deleteWord(b); break;
    case 'cw': b = changeWord(b); break;
    case 'yy': yankLine(b, register); break;
    case 'p': b = pasteBelow(b, register); break;
    case 'dd': b = deleteLine(b, count); break;
    case 'w': b = wordForward(b); break;
    case 'b': b = wordBackward(b); break;
    default:
      // support simple composite "yy p"
      if (cmd === 'yy p' || cmd === 'yyp') {
        yankLine(b, register);
        b = pasteBelow(b, register);
        cmd = 'yy p';
      }
      break;
  }

  return { buf: b, command: cmd };
}


