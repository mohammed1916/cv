export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 0 && x <= 15)) throw new Error('Each value is an integer from 0 to 15.')
  return { nums }
}

const BITS = 4

export function buildTrace({ nums }) {
  const n = nums.length
  const answer = Array(n).fill(1)
  const nearest = Array(BITS).fill(-1)
  const frames = []
  for (let i = n - 1; i >= 0; i--) {
    for (let b = 0; b < BITS; b++) if ((nums[i] >> b) & 1) nearest[b] = i
    let far = i
    for (let b = 0; b < BITS; b++) if (nearest[b] !== -1) far = Math.max(far, nearest[b])
    answer[i] = far - i + 1
    frames.push({ phase: 'scan', activeLine: CL('answer[i] = far - i + 1'), pythonLine: PL('answer[i] = far - i + 1'), i, r: far, nearest: [...nearest], answer: [...answer], message: `From ${i}, the last index needed to reach every bit that appears after it is ${far}, so the shortest subarray has length ${far - i + 1}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return answer'), pythonLine: PL('return answer'), i: -1, r: -1, nearest: [...nearest], answer: [...answer], message: `Answers for each start: ${answer.join(', ')}.` })
  return { input: { nums }, result: answer, frames }
}

export const code = `function smallestSubarrays(nums) {
  const n = nums.length;
  const answer = Array(n).fill(1);
  const nearest = Array(4).fill(-1);
  for (let i = n - 1; i >= 0; i--) {
    for (let b = 0; b < 4; b++) {
      if ((nums[i] >> b) & 1) nearest[b] = i;
    }
    let far = i;
    for (let b = 0; b < 4; b++) {
      if (nearest[b] !== -1) far = Math.max(far, nearest[b]);
    }
    answer[i] = far - i + 1;
  }
  return answer;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def smallest_subarrays(nums):
    n = len(nums)
    answer = [1] * n
    nearest = [-1] * 4
    for i in range(n - 1, -1, -1):
        for b in range(4):
            if (nums[i] >> b) & 1:
                nearest[b] = i
        far = i
        for b in range(4):
            if nearest[b] != -1:
                far = max(far, nearest[b])
        answer[i] = far - i + 1
    return answer
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
