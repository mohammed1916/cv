const PY = [
  "def countAlmostEqualPairs(nums):",
  "    width = len(str(max(nums)))",
  "    texts = [str(x).zfill(width) for x in nums]",
  "    count = 0",
  "    for j in range(len(texts)):",
  "        reach = {texts[j]}",
  "        frontier = {texts[j]}",
  "        for swap_round in range(2):",
  "            next_level = set()",
  "            for word in frontier:",
  "                for a in range(width):",
  "                    for b in range(a + 1, width):",
  "                        letters = list(word)",
  "                        letters[a], letters[b] = letters[b], letters[a]",
  "                        next_level.add(\"\".join(letters))",
  "            frontier = next_level",
  "            reach |= next_level",
  "        for i in range(j):",
  "            if texts[i] in reach:",
  "                count += 1",
  "    return count",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = [
  { line: 1, text: "width is the number of digits in the largest value" },
  { line: 2, text: "pad each value to width digits with leading zeros" },
  { line: 3, text: "count is 0" },
  { line: 4, text: "for each index j" },
  { line: 5, text: "reach starts as the padded value at j" },
  { line: 6, text: "repeat two times: apply every digit swap to the frontier" },
  { line: 7, text: "add the swapped words to reach" },
  { line: 8, text: "for each earlier index i, if its padded value is in reach, add 1 to count" },
  { line: 9, text: "return count" },
]

const MAX_VALUES = 12
const MAX_VALUE = 999999

function readJson(text) {
  if (typeof text !== "string") return text
  try { return JSON.parse(text) } catch (error) {
    throw new Error(`Input must be JSON such as {"nums": [1023, 2310, 2130, 213]}: ${error.message}`)
  }
}

export function parseInput(text) {
  const data = readJson(text)
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be an object with key "nums".')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 2) throw new Error('Key "nums" must be an array of at least two integers.')
  if (nums.length > MAX_VALUES) throw new Error(`The visualization accepts at most ${MAX_VALUES} numbers.`)
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 1 || value > MAX_VALUE) throw new Error(`nums[${index}] must be an integer from 1 to ${MAX_VALUE}.`)
  })
  return { nums }
}

// Words reachable by at most two digit swaps, built in the same two rounds as the Python.
function swapsOf(word, width) {
  const out = new Set()
  for (let a = 0; a < width; a += 1) {
    for (let b = a + 1; b < width; b += 1) {
      const letters = word.split("")
      ;[letters[a], letters[b]] = [letters[b], letters[a]]
      out.add(letters.join(""))
    }
  }
  return out
}

export function buildTrace(input) {
  const { nums } = input
  const width = String(Math.max(...nums)).length
  const texts = nums.map(value => String(value).padStart(width, "0"))
  const frames = []
  let count = 0
  const pairs = []
  const add = (phase, activeLine, pythonText, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, nums, texts, width, count, pairs: [...pairs], j: -1, i: -1, ...extra,
  })
  add("setup", 1, "width = len(", `Pad every number to ${width} digits.`)
  add("setup", 2, "texts = [str(x)", `Padded values: ${texts.join(", ")}.`)
  add("setup", 3, "count = 0", "Start with no almost equal pairs.")
  for (let j = 0; j < texts.length; j += 1) {
    const reach = new Set([texts[j]])
    let frontier = new Set([texts[j]])
    add("reach", 5, "reach = {texts[j]}", `Start the reach of ${texts[j]}.`, { j })
    for (let round = 0; round < 2; round += 1) {
      const nextLevel = new Set()
      frontier.forEach(word => swapsOf(word, width).forEach(next => nextLevel.add(next)))
      frontier = nextLevel
      nextLevel.forEach(word => reach.add(word))
      add("swap", 6, "for swap_round in range(2)", `Round ${round + 1}: reach of ${texts[j]} now has ${reach.size} word(s).`, { j, reach: [...reach] })
    }
    for (let i = 0; i < j; i += 1) {
      if (reach.has(texts[i])) {
        count += 1
        pairs.push([i, j])
        add("count", 8, "count += 1", `${texts[i]} and ${texts[j]} are almost equal within two swaps, so pair (${i}, ${j}) counts.`, { j, i })
      } else {
        add("check", 8, "if texts[i] in reach", `${texts[i]} is not within two swaps of ${texts[j]}.`, { j, i })
      }
    }
  }
  add("done", 9, "return count", `Return ${count}.`)
  return { input: { nums }, result: count, frames }
}
