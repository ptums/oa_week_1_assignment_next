import type { Buffer } from '../../../types';

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function moveCursor(buf: Buffer, dRow: number, dCol: number): Buffer {
  const row = clamp(buf.cursor.row + dRow, 0, buf.lines.length - 1);
  const line = buf.lines[row] ?? '';
  const col = clamp(buf.cursor.col + dCol, 0, Math.max(0, line.length - 1));
  return { ...buf, cursor: { row, col } };
}

export function setCursor(buf: Buffer, row: number, col: number): Buffer {
  const r = clamp(row, 0, buf.lines.length - 1);
  const line = buf.lines[r] ?? '';
  const c = clamp(col, 0, Math.max(0, line.length - 1));
  return { ...buf, cursor: { row: r, col: c } };
}

export function deleteChar(buf: Buffer): Buffer {
  const { row, col } = buf.cursor;
  const line = buf.lines[row] ?? '';
  if (!line) return buf;
  if (col >= line.length) return buf;
  const nextLine = line.slice(0, col) + line.slice(col + 1);
  const lines = buf.lines.slice();
  lines[row] = nextLine;
  return { ...buf, lines };
}

export function deleteWord(buf: Buffer): Buffer {
  const { row, col } = buf.cursor;
  const line = buf.lines[row] ?? '';
  const match = line.slice(col).match(/^\W*\w+\W*/);
  if (!match) return buf;
  const len = match[0].length;
  const nextLine = line.slice(0, col) + line.slice(col + len);
  const lines = buf.lines.slice();
  lines[row] = nextLine;
  return { ...buf, lines };
}

export function changeWord(buf: Buffer): Buffer {
  // simplification: change word == delete word
  return deleteWord(buf);
}

export function yankLine(buf: Buffer, register: { line?: string }) {
  register.line = buf.lines[buf.cursor.row] ?? '';
}

export function pasteBelow(buf: Buffer, register: { line?: string }): Buffer {
  const r = buf.cursor.row;
  const lines = buf.lines.slice();
  const paste = register.line ?? '';
  lines.splice(r + 1, 0, paste);
  return { ...buf, lines, cursor: { row: r + 1, col: 0 } };
}

export function deleteLine(buf: Buffer, count = 1): Buffer {
  const r = buf.cursor.row;
  const lines = buf.lines.slice();
  
  // If deleting would result in empty buffer, just empty the line instead
  if (lines.length === 1) {
    lines[0] = '';
    return { ...buf, lines, cursor: { row: 0, col: 0 } };
  }
  
  // Otherwise, delete the line(s)
  lines.splice(r, count);
  const newRow = Math.min(r, Math.max(0, lines.length - 1));
  const newCol = Math.min(buf.cursor.col, (lines[newRow] ?? '').length);
  return { ...buf, lines, cursor: { row: newRow, col: newCol } };
}

export function lineStart(buf: Buffer): Buffer {
  return { ...buf, cursor: { row: buf.cursor.row, col: 0 } };
}

export function lineEnd(buf: Buffer): Buffer {
  const line = buf.lines[buf.cursor.row] ?? '';
  return { ...buf, cursor: { row: buf.cursor.row, col: Math.max(0, line.length - 1) } };
}

export function goTop(buf: Buffer): Buffer {
  // Set cursor to -1 to show it above the text
  return { ...buf, cursor: { row: -1, col: 0 } };
}

export function goBottom(buf: Buffer): Buffer {
  // Set cursor beyond last line to show it below the text
  return { ...buf, cursor: { row: buf.lines.length, col: 0 } };
}

export function wordForward(buf: Buffer): Buffer {
  const { row, col } = buf.cursor;
  const line = buf.lines[row] ?? '';
  const rest = line.slice(col + 1);
  const m = rest.match(/\w/);
  if (!m) return buf;
  const idx = rest.indexOf(m[0]);
  return { ...buf, cursor: { row, col: col + 1 + idx } };
}

export function wordBackward(buf: Buffer): Buffer {
  const { row, col } = buf.cursor;
  const line = buf.lines[row] ?? '';
  const left = line.slice(0, col);
  const m = left.match(/\w(?=\W*$)/);
  if (!m) return buf;
  const idx = left.lastIndexOf(m[0]);
  return { ...buf, cursor: { row, col: Math.max(0, idx) } };
}

