'use client'

import type { Buffer } from '@/types';

interface VimBufferProps {
  buffer: Buffer;
}

export default function VimBuffer({ buffer }: VimBufferProps) {
  // Check if cursor is above (gg command) or below (G command) the text
  const cursorAbove = buffer.cursor.row < 0;
  const cursorBelow = buffer.cursor.row >= buffer.lines.length;
  
  // Safety check: ensure buffer has at least one line
  const safeBuffer = buffer.lines.length === 0 
    ? { ...buffer, lines: [''], cursor: { row: 0, col: 0 } }
    : buffer;

  return (
    <pre className="font-mono text-sm md:text-base leading-6 p-4 bg-black/60 text-green-400 rounded-lg border-2 border-[#00ff7f] overflow-auto min-h-[120px] flex flex-col justify-center">
      {/* Show cursor above text for "go to top" command */}
      {cursorAbove && (
        <div className="mb-4">
          <span className="bg-[#ff2d95] text-black px-0.5 animate-pulse">█</span>
        </div>
      )}
      
      {/* Add spacing above the text */}
      <div className="my-3">
        {safeBuffer.lines.map((line, r) => (
          <div key={r}>
            {r === safeBuffer.cursor.row ? (
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    line.slice(0, safeBuffer.cursor.col) +
                    '<span class="bg-[#ff2d95] text-black px-0.5">' +
                    (line[safeBuffer.cursor.col] ?? ' ') +
                    '</span>' +
                    line.slice(safeBuffer.cursor.col + 1)
                }}
              />
            ) : (
              line || '\u00A0' // Use non-breaking space for empty lines
            )}
          </div>
        ))}
      </div>
      
      {/* Show cursor below text for "go to bottom" command */}
      {cursorBelow && (
        <div className="mt-4">
          <span className="bg-[#ff2d95] text-black px-0.5 animate-pulse">█</span>
        </div>
      )}
    </pre>
  );
}

