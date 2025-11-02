export function pointsFor(correct: boolean, usedHint: boolean, timedOut: boolean): number {
  if (timedOut) return -1;
  if (!correct) return 0;
  return usedHint ? 0 : 1;
}


