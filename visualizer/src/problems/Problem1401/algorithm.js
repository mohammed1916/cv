export const phases = [
  { id: 'clamp', label: 'Nearest point', description: 'Clamp the circle centre into the rectangle to find the closest rectangle point.' },
  { id: 'measure', label: 'Squared distance', description: 'Measure the squared distance from the centre to that point.' },
  { id: 'decide', label: 'Compare radius', description: 'Overlap or touching holds when the squared distance is at most the squared radius.' },
];

export const examples = [
  { label: 'Overlapping', input: JSON.stringify({ radius: 2, cx: 0, cy: 0, left: 1, bottom: -1, right: 3, top: 1 }) },
  { label: 'Separated', input: JSON.stringify({ radius: 1, cx: 5, cy: 5, left: 0, bottom: 0, right: 2, top: 2 }) },
  { label: 'Touching edge', input: JSON.stringify({ radius: 1, cx: 0, cy: 0, left: 1, bottom: 0, right: 2, top: 2 }) },
];

export function parseInput(text) {
  const data = JSON.parse(text);
  const { radius, cx, cy, left, bottom, right, top } = data ?? {};
  const coords = [cx, cy, left, bottom, right, top];
  if (!Number.isInteger(radius) || radius < 1 || radius > 10000) throw new Error('radius must be an integer from 1 to 10000.');
  if (coords.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Coordinates must be integers from -10000 to 10000.');
  if (left > right || bottom > top) throw new Error('Use left ≤ right and bottom ≤ top for the rectangle.');
  return { radius, cx, cy, left, bottom, right, top };
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export function buildTrace(input) {
  const { radius, cx, cy, left, bottom, right, top } = input;
  const nx = clamp(cx, left, right), ny = clamp(cy, bottom, top);
  const base = { radius, center: [cx, cy], rect: { left, bottom, right, top }, nearest: [nx, ny] };
  const frames = [{
    phase: 'clamp', activeLine: 2,
    message: `Nearest rectangle point to (${cx}, ${cy}) is (${nx}, ${ny}).`,
    snapshot: { ...base, dx: null, dy: null, dist2: null, result: null },
  }];
  const dx = nx - cx, dy = ny - cy, dist2 = dx * dx + dy * dy;
  frames.push({
    phase: 'measure', activeLine: 3,
    message: `dx = ${dx}, dy = ${dy}, squared distance ${dist2}.`,
    snapshot: { ...base, dx, dy, dist2, result: null },
  });
  const result = dist2 <= radius * radius;
  frames.push({
    phase: 'decide', activeLine: 4,
    message: `${dist2} ${result ? '≤' : '>'} ${radius * radius} (radius squared): ${result ? 'overlap or touch' : 'no overlap'}.`,
    snapshot: { ...base, dx, dy, dist2, result },
  });
  return { input: { ...input }, result, frames };
}

export const code = [
  'FUNCTION circleOverlapsRectangle(radius, cx, cy, left, bottom, right, top)',
  '    nearest ← (clamp cx to [left, right], clamp cy to [bottom, top])',
  '    dx ← nearest.x − cx;  dy ← nearest.y − cy',
  '    RETURN dx² + dy² ≤ radius²',
].map((text, i) => ({ line: i + 1, text }));

export const python = `def circleOverlapsRectangle(radius, cx, cy, left, bottom, right, top):
    nearest_x = min(max(cx, left), right)
    nearest_y = min(max(cy, bottom), top)
    dx, dy = nearest_x - cx, nearest_y - cy
    return dx * dx + dy * dy <= radius * radius`;

export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5 };
