export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 0 && x <= 9)) throw new Error('Each value is an integer from 0 to 9.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const ans = Array(n).fill(-1)
  const first = []
  const second = []
  const frames = []
  for (let i = 0; i < n; i++) {
    while (second.length && nums[second[second.length - 1]] < nums[i]) {
      ans[second.pop()] = nums[i]
    }
    const moved = []
    while (first.length && nums[first[first.length - 1]] < nums[i]) {
      moved.push(first.pop())
    }
    for (let k = moved.length - 1; k >= 0; k--) second.push(moved[k])
    first.push(i)
    frames.push({ phase: 'scan', activeLine: CL('while (second.length'), pythonLine: PL('while second'), i, first: first.map(k => nums[k]), second: second.map(k => nums[k]), firstIdx: [...first], secondIdx: [...second], ans: [...ans], message: `${nums[i]} at ${i}: indices waiting for a second greater value move to the second stack; the answers found so far are ${ans.join(', ')}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return ans'), pythonLine: PL('return ans'), i: -1, first: first.map(k => nums[k]), second: second.map(k => nums[k]), firstIdx: [...first], secondIdx: [...second], ans: [...ans], message: `Indices never resolved keep -1.` })
  return { input: { nums }, result: ans, frames }
}

export const code = `function secondGreater(nums) {
  const n = nums.length;
  const ans = Array(n).fill(-1);
  const first = [];
  const second = [];
  for (let i = 0; i < n; i++) {
    while (second.length && nums[second[second.length - 1]] < nums[i]) {
      ans[second.pop()] = nums[i];
    }
    const moved = [];
    while (first.length && nums[first[first.length - 1]] < nums[i]) {
      moved.push(first.pop());
    }
    for (let k = moved.length - 1; k >= 0; k--) second.push(moved[k]);
    first.push(i);
  }
  return ans;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def second_greater(nums):
    n = len(nums)
    ans = [-1] * n
    first = []
    second = []
    for i in range(n):
        while second and nums[second[-1]] < nums[i]:
            ans[second.pop()] = nums[i]
        moved = []
        while first and nums[first[-1]] < nums[i]:
            moved.append(first.pop())
        for k in reversed(moved):
            second.append(k)
        first.append(i)
    return ans
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
