export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some((v, i) => !Number.isInteger(v) || Math.abs(v) > 10000 || (i && v < nums[i - 1]))) throw new Error('Enter a sorted JSON array of 1–10,000 integers with |v| ≤ 10,000.')
  return nums
}

// Greedy: extend a subsequence ending at x−1 if one exists; otherwise start a new one needing x+1 and x+2.
export function buildTrace(nums) {
  const count = new Map(), tails = new Map()
  for (const v of nums) count.set(v, (count.get(v) ?? 0) + 1)
  const frames = [{ phase: 'start', value: null, tails: {}, activeLine: L('count the occurrences'), message: 'Count each value; try to extend a subsequence before starting one.' }]
  let ok = true
  for (const v of nums) {
    if (!ok) break
    if (count.get(v) === 0) continue
    count.set(v, count.get(v) - 1)
    if ((tails.get(v - 1) ?? 0) > 0) {
      tails.set(v - 1, tails.get(v - 1) - 1)
      tails.set(v, (tails.get(v) ?? 0) + 1)
      frames.push({ phase: 'extend', value: v, tails: Object.fromEntries(tails), activeLine: L('extend it so'), message: `${v} extends a subsequence ending at ${v - 1}.` })
    } else if ((count.get(v + 1) ?? 0) > 0 && (count.get(v + 2) ?? 0) > 0) {
      count.set(v + 1, count.get(v + 1) - 1)
      count.set(v + 2, count.get(v + 2) - 1)
      tails.set(v + 2, (tails.get(v + 2) ?? 0) + 1)
      frames.push({ phase: 'start-new', value: v, tails: Object.fromEntries(tails), activeLine: L('start a new run'), message: `${v} starts a new run of length 3: ${v}, ${v + 1}, ${v + 2}.` })
    } else {
      ok = false
      frames.push({ phase: 'reject', value: v, tails: Object.fromEntries(tails), activeLine: L('otherwise return false'), message: `${v} can neither extend a run nor start one of length 3.` })
    }
  }
  frames.push({ phase: 'done', value: null, tails: Object.fromEntries(tails), result: ok, activeLine: L('return true'), message: ok ? 'Every value joined a run of length at least 3.' : 'Some value could not be placed.' })
  return { input: nums, result: ok, frames }
}

export const code = `function isPossible(nums):
  count the occurrences of each value in nums; set tails to an empty table
  for each value x in nums, in order:
    if no copies of x remain unused, continue to the next x
    use one copy of x
    if a run ends at x - 1, extend it so that it ends at x
    otherwise, if x + 1 and x + 2 both have unused copies, start a new run x, x+1, x+2 that ends at x + 2
    otherwise return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def is_possible(nums):
    count, tails = Counter(nums), Counter()
    for x in nums:
        if count[x] == 0:
            continue
        count[x] -= 1
        if tails[x - 1] > 0:
            tails[x - 1] -= 1
            tails[x] += 1
        elif count[x + 1] > 0 and count[x + 2] > 0:
            count[x + 1] -= 1
            count[x + 2] -= 1
            tails[x + 2] += 1
        else:
            return False
    return True
`
