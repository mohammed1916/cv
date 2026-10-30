export const code = [
  { line: 1, text: "Sort nums and take its middle value, or both middle values" },
  { line: 2, text: "For each middle value m, find the nearest palindrome at or below m and the nearest at or above m" },
  { line: 3, text: "Collect the distinct candidate palindromes" },
  { line: 4, text: "Return the smallest total cost of moving every value to one candidate" },
]

export const python = `def minimumCost(nums):
    def is_palindrome(x):
        return str(x) == str(x)[::-1]
    def cost(target):
        return sum(abs(v - target) for v in nums)
    nums = sorted(nums)
    n = len(nums)
    medians = {nums[n // 2], nums[(n - 1) // 2]}
    candidates = set()
    for m in medians:
        down = m
        while not is_palindrome(down):
            down -= 1
        up = m
        while not is_palindrome(up):
            up += 1
        candidates.add(down)
        candidates.add(up)
    return min(cost(p) for p in candidates)`

function isPalindrome(x) {
  const text = String(x)
  return text === [...text].reverse().join("")
}

function validateInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object such as {"nums": [1, 2, 3, 4, 5]}.')
  }
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) {
    throw new Error("nums must be an array of 1 to 50 integers (the visualization cap).")
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
    throw new Error('Input must be valid JSON, such as {"nums": [1, 2, 3, 4, 5]}.')
  }
  return validateInput(data)
}

function nearestPalindrome(start, direction, frames, phaseName, pythonLine, activeLine) {
  let value = start
  while (!isPalindrome(value)) {
    value += direction
    frames.push({
      phase: phaseName, activeLine, pythonLine, target: value, candidates: [], best: null,
      message: `${value} is not a palindrome. Keep moving ${direction > 0 ? "up" : "down"}.`,
    })
  }
  return value
}

export function buildTrace(input) {
  const { nums } = validateInput(input)
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const cost = (target) => sorted.reduce((sum, v) => sum + Math.abs(v - target), 0)
  const frames = []
  frames.push({
    phase: "sort", activeLine: 1, pythonLine: 6, target: null, candidates: [], best: null,
    sorted, message: `Sort the values: [${sorted.join(", ")}].`,
  })
  const medians = [...new Set([sorted[Math.floor(n / 2)], sorted[Math.floor((n - 1) / 2)]])]
  frames.push({
    phase: "median", activeLine: 1, pythonLine: 8, target: null, candidates: [], best: null,
    sorted, message: `Medians to check: ${medians.join(" and ")}.`,
  })
  const candidates = []
  for (const m of medians) {
    const down = nearestPalindrome(m, -1, frames, "down", 12, 2)
    const up = nearestPalindrome(m, 1, frames, "up", 15, 2)
    frames.push({
      phase: "down", activeLine: 2, pythonLine: 12, target: down, candidates: [...candidates], best: null,
      sorted, message: `Nearest palindrome at or below ${m} is ${down}.`,
    })
    for (const p of [down, up]) {
      if (!candidates.includes(p)) candidates.push(p)
    }
    frames.push({
      phase: "up", activeLine: 2, pythonLine: 15, target: up, candidates: [...candidates], best: null,
      sorted, message: `Nearest palindrome at or above ${m} is ${up}.`,
    })
  }
  frames.push({
    phase: "candidates", activeLine: 3, pythonLine: 18, target: null, candidates: [...candidates], best: null,
    sorted, message: `Candidates: [${candidates.join(", ")}].`,
  })
  let best = null
  for (const p of candidates) {
    const c = cost(p)
    if (best === null || c < best) best = c
    frames.push({
      phase: "cost", activeLine: 4, pythonLine: 19, target: p, candidates: [...candidates], best,
      sorted, message: `Cost to make every value ${p} is ${c}. Best so far ${best}.`,
    })
  }
  frames.push({
    phase: "done", activeLine: 4, pythonLine: 19, target: null, candidates: [...candidates], best,
    sorted, message: `Return ${best}.`,
  })
  return { input: { nums }, result: best, frames }
}
