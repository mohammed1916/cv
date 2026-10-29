export function generateSteps(height) {
  const steps = [];
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;
  let bestPair = [0, height.length - 1];

  steps.push({
    phase: "init",
    left,
    right,
    maxArea,
    bestPair,
    currentArea: null,
    activeLine: 3,
    message: "Initialize left and right pointers at the ends of the array.",
  });

  while (left < right) {
    const w = right - left;
    const h = Math.min(height[left], height[right]);
    const area = w * h;

    steps.push({
      phase: "compute",
      left,
      right,
      maxArea,
    bestPair,
      currentArea: area,
      activeLine: 6,
      message: `Calculate area: width=${w}, height=min(${height[left]}, ${height[right]})=${h}. Area=${area}.`,
    });

    if (area > maxArea) {
      maxArea = area;
      bestPair = [left, right];
      steps.push({
        phase: "update",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: area,
        activeLine: 7,
        message: `New max area found! Update max_area to ${maxArea}.`,
      });
    } else {
      steps.push({
        phase: "skip",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: area,
        activeLine: 7,
        message: `Area ${area} is not greater than max_area ${maxArea}.`,
      });
    }

    if (height[left] < height[right]) {
      steps.push({
        phase: "move",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: null,
        activeLine: 9,
        message: `height[left] < height[right] (${height[left]} < ${height[right]}). Move left pointer inwards to find a taller line.`,
      });
      left++;
    } else {
      steps.push({
        phase: "move",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: null,
        activeLine: 11,
        message: `height[left] >= height[right] (${height[left]} >= ${height[right]}). Move right pointer inwards to find a taller line.`,
      });
      right--;
    }
  }

  steps.push({
    phase: "done",
    left,
    right,
    maxArea,
    bestPair,
    currentArea: null,
    activeLine: 12,
    message: `Pointers met. Maximum area is ${maxArea}.`,
  });

  return steps;
}


// ---- Container With Most Water (statement-sourced; see scratch statements/11.md) ----
export function parseInput(text) {
  let h = text
  if (typeof text === 'string') {
    try { h = JSON.parse(text) } catch { throw new Error('Input must be a JSON array of heights, for example [1,8,6,2,5].') }
  } else if (h && typeof h === 'object' && !Array.isArray(h) && 'height' in h) h = h.height
  if (!Array.isArray(h) || h.length < 2 || h.length > 50) throw new Error('Use an array of 2 to 50 heights.')
  if (h.some(v => !Number.isInteger(v) || v < 0 || v > 10000)) throw new Error('Heights are integers from 0 to 10000.')
  return h
}

export function buildTrace(height) {
  let left = 0
  let right = height.length - 1
  let best = 0
  let bestPair = [0, height.length - 1]
  const frames = [{ phase: 'start', activeLine: L('set left to the first index and right to the last index'), left, right, best, message: 'Start with pointers at both ends.' }]
  while (left < right) {
    const area = (right - left) * Math.min(height[left], height[right])
    if (area > best) {
      best = area
      bestPair = [left, right]
    }
    frames.push({ phase: 'compute', activeLine: L('area is the width times the shorter of the two walls'), left, right, best, message: `Width ${right - left}, limit ${Math.min(height[left], height[right])}: area ${area}. Best ${best}.` })
    if (height[left] < height[right]) {
      left++
      frames.push({ phase: 'move', activeLine: L('move left'), left, right, best, message: 'The left wall is shorter, so it limits the water. Move it inward.' })
    } else {
      right--
      frames.push({ phase: 'move', activeLine: L('move right'), left, right, best, message: 'The right wall is not taller, so move it inward.' })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), left, right, best, message: `Largest container holds ${best}.` })
  return { input: height, result: best, bestPair, frames }
}

export const code = `max area (height):
  set left to the first index and right to the last index
  set best to 0
  while left is less than right:
    area is the width times the shorter of the two walls
    if area is greater than best then set best to area
    if the left wall is shorter then move left inward
    otherwise move right inward
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_area(height):
    left = 0
    right = len(height) - 1
    best = 0
    while left < right:
        area = (right - left) * min(height[left], height[right])
        best = max(best, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 2,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 11,
  9: 12,
}
