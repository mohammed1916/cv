// Keep one running even total. A query changes only one value, so take the old value out of the total if it was
// even, put the new value in if it is even, and report the total. Nothing else is re-added.
export const code = String.raw`function sumEvenAfterQueries(nums, queries) {
  const values = [...nums]; // work on a copy so the input stays unchanged
  let evenSum = values.reduce((sum, x) => (x % 2 === 0 ? sum + x : sum), 0);
  const answer = [];
  for (const [value, index] of queries) {
    const old = values[index];
    if (old % 2 === 0) evenSum -= old; // the old value leaves the even total
    values[index] = old + value;
    if (values[index] % 2 === 0) evenSum += values[index]; // the new value joins it if it is even
    answer.push(evenSum);
  }
  return answer;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def sum_even_after_queries(nums, queries):
    values = list(nums)  # work on a copy so the input stays unchanged
    even_sum = sum(x for x in values if x % 2 == 0)
    answer = []
    for value, index in queries:
        old = values[index]
        if old % 2 == 0:
            even_sum -= old  # the old value leaves the even total
        values[index] = old + value
        if values[index] % 2 == 0:
            even_sum += values[index]  # the new value joins it if it is even
        answer.append(even_sum)
    return answer`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'start', label: 'Start', description: 'Add up the even values once, before any query.' },
  { id: 'query', label: 'Queries', description: 'Each query changes one value and adjusts the running total.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input && input.nums
  const queries = input && input.queries
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use nums: a list of 1 to 10 integers.')
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100)) throw new Error('Values must be integers from -100 to 100.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('Use queries: a list of 1 to 10 [value, index] pairs.')
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 2 || !Number.isInteger(query[0]) || Math.abs(query[0]) > 100) {
      throw new Error('Each query is [value, index], with value from -100 to 100.')
    }
    if (!Number.isInteger(query[1]) || query[1] < 0 || query[1] >= nums.length) throw new Error('Each query index must point into nums.')
  }
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const values = [...nums]
  let evenSum = values.reduce((sum, x) => (x % 2 === 0 ? sum + x : sum), 0)
  const answer = []
  const frames = [{ phase: 'start', activeLine: L('let evenSum'), pythonLine: PY('even_sum = sum'), index: null, values: [...values], evenSum, answer: [], message: `Before any query, the even values add up to ${evenSum}.` }]
  for (const [value, index] of queries) {
    const old = values[index]
    const removed = old % 2 === 0 ? old : 0
    if (old % 2 === 0) evenSum -= old
    values[index] = old + value
    const added = values[index] % 2 === 0 ? values[index] : 0
    if (values[index] % 2 === 0) evenSum += values[index]
    answer.push(evenSum)
    frames.push({ phase: 'query', activeLine: L('answer.push(evenSum)'), pythonLine: PY('answer.append(even_sum)'), index, values: [...values], old, next: old + value, removed, added, evenSum, answer: [...answer],
      message: `Add ${value} to index ${index}: ${old} becomes ${old + value}. Remove ${removed} and add ${added} from the even total, which is now ${evenSum}.` })
  }
  frames.push({ phase: 'query', activeLine: L('return answer'), pythonLine: PY('return answer'), index: null, values: [...values], evenSum, answer: [...answer], message: `All ${queries.length} queries are answered.` })
  return { input: { nums, queries }, result: answer, frames }
}
