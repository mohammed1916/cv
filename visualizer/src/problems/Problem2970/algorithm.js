export const code = [
  { line: 1, text: "Find p, the last index of the longest strictly increasing prefix" },
  { line: 2, text: "Find q, the first index of the longest strictly increasing suffix" },
  { line: 3, text: "For each prefix length a from 0 up to p plus one, move b to the smallest valid end, never below a or q minus one" },
  { line: 4, text: "Add n minus b to the count" },
  { line: 5, text: "Return the count" },
]

export const python = `def incremovableSubarrayCount(nums):
    n = len(nums)
    p = 0
    while p + 1 < n and nums[p] < nums[p + 1]:
        p += 1
    q = n - 1
    while q > 0 and nums[q - 1] < nums[q]:
        q -= 1
    count = 0
    b = 0
    for a in range(min(p + 1, n - 1) + 1):
        b = max(b, a, q - 1)
        if a > 0:
            while b < n - 1 and nums[a - 1] >= nums[b + 1]:
                b += 1
        count += n - b
    return count`

function validateInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object such as {"nums": [8, 7, 6, 6]}.')
  }
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) {
    throw new Error("nums must be an array of 1 to 50 positive integers (the visualization cap).")
  }
  nums.forEach((value, i) => {
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      throw new Error(`nums[${i}] must be an integer from 1 to 1000.`)
    }
  })
  return { nums: [...nums] }
}

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, such as {"nums": [8, 7, 6, 6]}.')
  }
  return validateInput(data)
}

export function buildTrace(input) {
  const { nums } = validateInput(input)
  const n = nums.length
  const frames = []
  let p = 0
  frames.push({
    phase: "prefix", activeLine: 1, pythonLine: 3, a: null, b: null, p: 0, q: null, count: 0,
    message: "Start with p = 0 and walk while the prefix keeps increasing.",
  })
  while (p + 1 < n && nums[p] < nums[p + 1]) {
    p += 1
    frames.push({
      phase: "prefix", activeLine: 1, pythonLine: 5, a: null, b: null, p, q: null, count: 0,
      message: `nums[${p - 1}] < nums[${p}]: the increasing prefix now ends at ${p}.`,
    })
  }
  let q = n - 1
  frames.push({
    phase: "suffix", activeLine: 2, pythonLine: 6, a: null, b: null, p, q, count: 0,
    message: "Start q at the last index and walk left while the suffix keeps increasing.",
  })
  while (q > 0 && nums[q - 1] < nums[q]) {
    q -= 1
    frames.push({
      phase: "suffix", activeLine: 2, pythonLine: 8, a: null, b: null, p, q, count: 0,
      message: `nums[${q}] < nums[${q + 1}]: the increasing suffix starts at ${q}.`,
    })
  }
  let count = 0
  let b = 0
  for (let a = 0; a <= Math.min(p + 1, n - 1); a++) {
    b = Math.max(b, a, q - 1)
    frames.push({
      phase: "scan", activeLine: 3, pythonLine: 11, a, b, p, q, count,
      message: `Kept prefix is nums[0..${a - 1}]. Start from end b = ${b}.`,
    })
    if (a > 0) {
      while (b < n - 1 && nums[a - 1] >= nums[b + 1]) {
        b += 1
        frames.push({
          phase: "move", activeLine: 3, pythonLine: 15, a, b, p, q, count,
          message: `nums[${a - 1}] = ${nums[a - 1]} is not less than nums[${b + 1}] = ${nums[b + 1]}: move b to ${b}.`,
        })
      }
    }
    count += n - b
    frames.push({
      phase: "add", activeLine: 4, pythonLine: 16, a, b, p, q, count,
      message: `Removing nums[${a}..b] for any end from ${b} to ${n - 1} works: add ${n - b}.`,
    })
  }
  frames.push({
    phase: "done", activeLine: 5, pythonLine: 17, a: null, b: null, p, q, count,
    message: `Return ${count}.`,
  })
  return { input: { nums }, result: count, frames }
}
