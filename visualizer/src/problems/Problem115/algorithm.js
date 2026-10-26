export function buildSubsequenceStory(source, target) {
  const s = Array.from(source), t = Array.from(target);
  if (s.length > 64 || t.length > 64) throw new Error('Use at most 64 characters per string for the visual trace.');
  const dp = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0n));
  const writtenAt = dp.map(row => row.map(() => Infinity));
  for (let i = 0; i <= s.length; i++) { dp[i][0] = 1n; writtenAt[i][0] = 0; }
  for (let j = 1; j <= t.length; j++) writtenAt[0][j] = 0;
  const frames = [{ activeLine: 4, phase: 'base', i: 0, j: 0, message: 'There is one way to make an empty target: skip every source character. An empty source cannot make a nonempty target.' }];
  for (let i = 1; i <= s.length; i++) for (let j = 1; j <= t.length; j++) {
    const skip = dp[i-1][j], use = s[i-1] === t[j-1] ? dp[i-1][j-1] : 0n;
    const common = { i, j, skip: String(skip), use: String(use), matched: s[i-1] === t[j-1] };
    frames.push({ ...common, activeLine: 7, phase: 'skip', value: String(skip), message: `Skip source character #${i-1} (${s[i-1]}): keep ${skip} ways from the row above.` });
    frames.push({ ...common, activeLine: 8, phase: 'compare', value: String(skip), message: s[i-1] === t[j-1] ? 'Characters match. We can also use this source position to extend the shorter target prefix.' : 'Characters differ. This source position cannot finish the target prefix.' });
    dp[i][j] = skip + use;
    if (s[i-1] === t[j-1]) frames.push({ ...common, activeLine: 9, phase: 'match', value: String(dp[i][j]), message: `Skip ${skip} + use ${use} = ${dp[i][j]} distinct choices of source positions.` });
    writtenAt[i][j] = frames.length - 1;
  }
  frames.push({ activeLine: 10, phase: 'done', i: s.length, j: t.length, value: String(dp[s.length][t.length]), message: `${dp[s.length][t.length]} distinct subsequences form the complete target.` });
  return { s, t, frames, values: dp.map(row => row.map(String)), writtenAt };
}

export function subsequenceCellAt(story, stepIndex, row, column) {
  if (stepIndex < 0) return '0';
  const step = story.frames[stepIndex];
  if (step.i === row && step.j === column && step.value !== undefined) return step.value;
  return story.writtenAt[row][column] <= stepIndex ? story.values[row][column] : '0';
}
