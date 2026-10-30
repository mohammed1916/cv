export const python = `def countDivisibleSubstrings(s):
    digits = [int(ch) for ch in s]
    n = len(digits)
    prefix = [0] * (n + 1)
    value7 = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + digits[i]
        value7[i + 1] = (value7[i] * 10 + digits[i]) % 7
    scaled7 = [0] * (n + 1)
    power = 1
    for i in range(n + 1):
        scaled7[i] = value7[i] * power % 7
        power = power * 5 % 7
    cnt9 = [0] * 9
    cnt3 = [0] * 3
    cnt7 = [0] * 7
    total = 0
    for r in range(n):
        cnt9[prefix[r] % 9] += 1
        cnt3[prefix[r] % 3] += 1
        cnt7[scaled7[r]] += 1
        d = digits[r]
        if d == 0:
            continue
        if d == 1:
            total += r + 1
        elif d in (2, 4, 5, 8):
            count = sum(int(s[start:r + 1]) % d == 0 for start in range(max(0, r - 1), r + 1))
            if r >= 2 and int(s[r - 2:r + 1]) % d == 0:
                count += r - 1
            total += count
        elif d in (3, 9):
            total += sum(cnt9[x] for x in range(9) if (prefix[r + 1] - x) % d == 0)
        elif d == 6:
            total += sum(cnt3[x] for x in range(3) if (d + 4 * (prefix[r] - x)) % 6 == 0)
        else:
            total += cnt7[scaled7[r + 1]]
    return total
`

const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const code = [
  'FUNCTION countDivisibleSubstrings(s)',
  'prefix digit sums and prefix values modulo 7 (scaled by powers of 10⁻¹)',
  'total ← 0',
  'FOR r FROM 0 TO n − 1',
  'record start r in the residue counters',
  'd ← digit at position r',
  'IF d = 0 THEN skip this end position',
  'IF d = 1 THEN add r + 1 (every substring ending here)',
  'ELSE IF d is 2, 4, 5 or 8 THEN count starts using the last three digits',
  'ELSE IF d is 3 or 9 THEN count starts whose digit sum is divisible by d',
  'ELSE IF d = 6 THEN count starts with the mod-6 test',
  'ELSE count starts with equal scaled remainder modulo 7',
  'RETURN total',
].map((text, index) => ({ line: index + 1, text }))

export function parseInput(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text
  if (!data || typeof data !== 'object') throw new Error('Use a JSON object with s.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('s must be a digit string of 1 to 20 characters for this visualization.')
  if (!/^[0-9]+$/.test(s)) throw new Error('s must contain only the digits 0 to 9.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const digits = [...s].map(Number)
  const n = digits.length
  const prefix = Array(n + 1).fill(0)
  const value7 = Array(n + 1).fill(0)
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + digits[i]
    value7[i + 1] = (value7[i] * 10 + digits[i]) % 7
  }
  const scaled7 = Array(n + 1).fill(0)
  let power = 1
  for (let i = 0; i <= n; i++) {
    scaled7[i] = (value7[i] * power) % 7
    power = (power * 5) % 7
  }
  const cnt9 = Array(9).fill(0)
  const cnt3 = Array(3).fill(0)
  const cnt7 = Array(7).fill(0)
  const counted = Array(n).fill(null)
  const frames = []
  let total = 0
  const snap = extra => ({ digits: [...digits], r: -1, d: null, count: null, counted: [...counted], total, result: null, ...extra })
  frames.push(snap({ phase: 'setup', activeLine: 2, pythonLine: P('prefix = [0]'),
    message: 'Precompute prefix digit sums and prefix values modulo 7. Multiplying by powers of 10⁻¹ makes the modulo-7 test a simple equality.' }))
  for (let r = 0; r < n; r++) {
    cnt9[prefix[r] % 9]++
    cnt3[prefix[r] % 3]++
    cnt7[scaled7[r]]++
    const d = digits[r]
    if (d === 0) {
      counted[r] = 0
      frames.push(snap({ phase: 'skip', activeLine: 7, pythonLine: P('continue'), r, d, count: 0, total,
        message: `Digit 0 at position ${r} cannot be a last digit, so it adds nothing.` }))
      continue
    }
    let count
    let line
    let lineName
    if (d === 1) {
      count = r + 1
      line = P('total += r + 1')
      lineName = 'every substring ending here'
    } else if ([2, 4, 5, 8].includes(d)) {
      count = 0
      for (let start = Math.max(0, r - 1); start <= r; start++) if (Number(s.slice(start, r + 1)) % d === 0) count++
      if (r >= 2 && Number(s.slice(r - 2, r + 1)) % d === 0) count += r - 1
      line = P('count = sum(')
      lineName = 'the last three digits decide every longer start'
    } else if (d === 3 || d === 9) {
      count = 0
      for (let x = 0; x < 9; x++) if ((((prefix[r + 1] - x) % d) + d) % d === 0) count += cnt9[x]
      line = P('total += sum(cnt9')
      lineName = 'digit sums divisible by the digit'
    } else if (d === 6) {
      count = 0
      for (let x = 0; x < 3; x++) if ((((d + 4 * (prefix[r] - x)) % 6) + 6) % 6 === 0) count += cnt3[x]
      line = P('total += sum(cnt3')
      lineName = 'the mod-6 test'
    } else {
      count = cnt7[scaled7[r + 1]]
      line = P('total += cnt7')
      lineName = 'equal scaled remainders modulo 7'
    }
    counted[r] = count
    total += count
    frames.push(snap({ phase: 'count', activeLine: d === 1 ? 8 : 9, pythonLine: line, r, d, count, total,
      message: `Ending at position ${r} (digit ${d}): ${count} substring(s) are divisible by ${d}, using ${lineName}.` }))
  }
  frames.push(snap({ phase: 'done', activeLine: 13, pythonLine: P('return total'), r: n - 1, d: null, count: null, total, result: total,
    message: `Return ${total}, the number of divisible substrings.` }))
  return { input, result: total, frames }
}
