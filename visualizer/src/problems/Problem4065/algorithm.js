// Each round removes one copy of every value still present, taking the distinct values in increasing order.
// Repeating rounds until nothing is left builds the answer in the order the values were removed.

const MAX_LENGTH = 24

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error('Use an array of 1 to 24 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return nums
}

function countsOf(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) || 0) + 1)
  return counts
}

const snapshot = counts => [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([value, count]) => ({ value, count }))

export function buildTrace(nums) {
  const counts = countsOf(nums)
  const answer = []
  const frames = []
  let round = 0
  frames.push({
    phase: 'setup', activeLine: L('counts ← how many times'), pythonLine: P('counts = Counter(nums)'),
    round, distinct: [], answer: [], counts: snapshot(counts), value: null, message: `Counted ${nums.length} values across ${counts.size} distinct value${counts.size === 1 ? '' : 's'}.`,
  })
  while (counts.size > 0) {
    round++
    const distinct = [...counts.keys()].sort((a, b) => a - b)
    frames.push({
      phase: 'round', activeLine: L('WHILE counts is not empty'), pythonLine: P('while counts:'),
      round, distinct, answer: [...answer], counts: snapshot(counts), value: null,
      message: `Round ${round} removes one copy of ${distinct.join(', ')}.`,
    })
    for (const value of distinct) {
      answer.push(value)
      const left = counts.get(value) - 1
      if (left === 0) counts.delete(value)
      else counts.set(value, left)
      frames.push({
        phase: 'take', activeLine: L('append value to answer'), pythonLine: P('answer.append(value)'),
        round, distinct, answer: [...answer], counts: snapshot(counts), value,
        message: `Append ${value}. ${left === 0 ? 'No copies remain.' : `${left} cop${left === 1 ? 'y' : 'ies'} left.`}`,
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: L('RETURN answer'), pythonLine: P('return answer'),
    round, distinct: [], answer: [...answer], counts: [], value: null,
    message: `Concatenated ${round} round${round === 1 ? '' : 's'} into ${answer.length} values.`,
  })
  return { input: nums, result: answer, frames }
}

export const code = `FUNCTION rearrangeByRemoving(nums)
    counts ← how many times each value appears
    answer ← empty list
    WHILE counts is not empty
        distinct ← values still present, in increasing order
        FOR each value in distinct
            append value to answer
            remove one copy of value from counts
    RETURN answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter


def rearrange_array(nums):
    counts = Counter(nums)
    answer = []
    while counts:
        for value in sorted(counts):
            answer.append(value)
            counts[value] -= 1
            if counts[value] == 0:
                del counts[value]
    return answer


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(rearrange_array(json.loads(sys.stdin.read()))))
`
