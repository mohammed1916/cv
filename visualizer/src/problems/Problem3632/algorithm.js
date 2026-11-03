// Subarrays with XOR at Least K. Prefix XORs turn a subarray nums[i..j-1] into
// prefix[i] XOR prefix[j]. Every pair of prefixes is compared as numbers, not by popcount.

const MAX_LENGTH = 12
const MAX_VALUE = 15

const CODE_TEXT = [
  'FUNCTION countXorAtLeast(nums, k)',
  '    prefix ← [0]; append the running XOR of each number',
  '    count ← 0',
  '    FOR each end j from 1 to len(prefix) − 1',
  '        FOR each start i from 0 to j − 1',
  '            IF prefix[i] XOR prefix[j] ≥ k THEN count ← count + 1',
  '    RETURN count',
]

const PY = [
  'def count_xor_at_least(nums, k):',
  '    prefix = [0]',
  '    for x in nums:',
  '        prefix.append(prefix[-1] ^ x)',
  '    count = 0',
  '    for j in range(1, len(prefix)):',
  '        for i in range(j):',
  '            if prefix[i] ^ prefix[j] >= k:',
  '                count += 1',
  '    return count',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(count_xor_at_least(data["nums"], data["k"])))',
]

const PHASES = [
  { id: 'setup', label: 'Prefixes', description: 'Build the running XOR of the numbers.' },
  { id: 'end', label: 'End', description: 'Choose the end of the subarray.' },
  { id: 'pair', label: 'Pair', description: 'Compare one start prefix with the end.' },
  { id: 'hit', label: 'Count', description: 'The XOR is at least k.' },
  { id: 'miss', label: 'Skip', description: 'The XOR is below k.' },
  { id: 'done', label: 'Result', description: 'Report the number of qualifying subarrays.' },
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')
export const phases = PHASES

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums has 1 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  if (!Number.isInteger(k) || k < 0 || k > 31) throw new Error('k is an integer from 0 to 31.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] ^ x)
  const frames = [{ pythonLine: P('prefix = [0]'), phase: 'setup', activeLine: L('prefix ← [0]'), prefix: [...prefix], i: null, j: null, value: null, count: 0, message: 'Prefix XOR values are ready.' }]
  let count = 0
  for (let j = 1; j < prefix.length; j++) {
    frames.push({ pythonLine: P('for j in range(1'), phase: 'end', activeLine: L('FOR each end j'), prefix, i: null, j, value: null, count, message: `Subarrays ending before index ${j}.` })
    for (let i = 0; i < j; i++) {
      const value = prefix[i] ^ prefix[j]
      const hit = value >= k
      if (hit) count++
      frames.push({
        pythonLine: P('if prefix[i] ^ prefix[j]'), phase: hit ? 'hit' : 'miss', activeLine: L('IF prefix[i] XOR'),
        prefix, i, j, value, k, count,
        message: `prefix[${i}] XOR prefix[${j}] = ${value} ${hit ? '≥' : '<'} ${k}${hit ? ', so it counts' : ', so it does not count'}.`,
      })
    }
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: L('RETURN count'), prefix, i: null, j: null, value: null, k, count, message: `${count} subarray${count === 1 ? '' : 's'} have XOR at least ${k}.` })
  return { input: { nums, k }, result: count, frames }
}
