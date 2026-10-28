export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums)) throw new Error('Use {"nums": [...]} with 2 to 20 positive integers.')
  const { nums } = data
  if (nums.length < 2 || nums.length > 20) throw new Error('Use 2 to 20 numbers.')
  if (nums.some(n => !Number.isInteger(n) || n < 1 || n > 1000000000)) throw new Error('Each number is an integer from 1 to 1000000000.')
  return { nums }
}

const digitSum = n => String(n).split('').reduce((total, d) => total + Number(d), 0)

export function buildTrace(input) {
  const { nums } = input
  const best = new Map()
  let answer = -1
  const maps = () => [{ name: 'largest', keyLabel: 'digit sum', valueLabel: 'largest number', isSet: false, entries: [...best] }]
  const frames = [{ phase: 'start', activeLine: L('best = empty map'), maps: maps(), ops: [], result: answer, message: 'Track the largest number seen for each digit sum. Only the largest one can make the best pair with a later number.' }]
  for (const n of nums) {
    const s = digitSum(n)
    if (best.has(s)) {
      const partner = best.get(s)
      const candidate = partner + n
      answer = Math.max(answer, candidate)
      const before = partner
      best.set(s, Math.max(partner, n))
      frames.push({ phase: 'pair', activeLine: L('set answer to the larger'), maps: maps(),
        ops: [{ map: 'largest', type: 'lookup', via: 'get', key: s, hit: true, value: before, hitNote: 'an earlier number with this digit sum is the best partner', missNote: 'no earlier number has this digit sum' },
          { map: 'largest', type: 'update', key: s, value: best.get(s), before }],
        result: answer, message: `${n} has digit sum ${s}, like ${partner}. The pair sums to ${candidate}. Best pair so far: ${answer}.` })
    } else {
      best.set(s, n)
      frames.push({ phase: 'scan', activeLine: L('set best of s to n'), maps: maps(),
        ops: [{ map: 'largest', type: 'insert', key: s, value: n }], result: answer,
        message: `${n} is the first number with digit sum ${s}, so it is stored and no pair is formed yet.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), maps: maps(), ops: [], result: answer, message: answer === -1 ? 'No two numbers share a digit sum, so the answer is -1.' : `Largest pair sum: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `largest pair sum with equal digit sums
best = empty map from digit sum to the largest number with that sum
answer = -1
for each number n
  s = digit sum of n
  if s is in best then
    candidate = best of s plus n
    set answer to the larger of answer and candidate
    set best of s to the larger of best of s and n
  otherwise
    set best of s to n
return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_sum(nums):
    best = {}
    answer = -1
    for n in nums:
        s = sum(int(d) for d in str(n))
        if s in best:
            answer = max(answer, best[s] + n)
            best[s] = max(best[s], n)
        else:
            best[s] = n
    return answer
`
