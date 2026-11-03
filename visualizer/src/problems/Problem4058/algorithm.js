// The pulse is the alternating sum: index k adds a[k] when k is even and subtracts it when k is odd.
// Left-rotating the segment [l..r] moves a[l] to position r and slides the rest one place left.
// Only positions l and r change sign relative to a plain shift, which gives the gain in O(1):
//   gain(l, r) = -2 * (P[r] - P[l]) + (s[r] - s[l]) * a[l]
// where s[k] is the sign at k and P[k] is the prefix sum of s[m] * a[m].
// Scanning r from left to right, the best l for each sign class is kept as a running maximum.

const MAX_LENGTH = 16

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
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error('Use an array of 1 to 16 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -1000000000 && v <= 1000000000)) throw new Error('Each value is an integer from -1000000000 to 1000000000.')
  return nums
}

const sign = k => (k % 2 === 0 ? 1 : -1)

export function rotatedPreview(a, l, r) {
  return [...a.slice(0, l), ...a.slice(l + 1, r + 1), a[l], ...a.slice(r + 1)]
}

function better(current, value, index) {
  return value > current.value ? { value, index } : current
}

export function buildTrace(a) {
  const n = a.length
  const prefix = []
  let running = 0
  for (let k = 0; k < n; k++) {
    running += sign(k) * a[k]
    prefix.push(running)
  }
  const base = n ? prefix[n - 1] : 0
  const frames = []
  frames.push({
    phase: 'setup', activeLine: L('prefix ← running sums'), pythonLine: P('prefix.append(total)'),
    r: -1, l: -1, gain: null, bestGain: 0, bestL: null, bestR: null, preview: null, base, value: base,
    message: `The unchanged pulse is ${base}. Prefix sums of the signed values are ready.`,
  })
  let maxEven = { value: -Infinity, index: -1 }
  let maxOdd = { value: -Infinity, index: -1 }
  let maxOddPlus = { value: -Infinity, index: -1 }
  let maxEvenMinus = { value: -Infinity, index: -1 }
  let bestGain = 0
  let bestL = null
  let bestR = null
  for (let r = 1; r < n; r++) {
    const l = r - 1
    if (l % 2 === 0) {
      maxEven = better(maxEven, 2 * prefix[l], l)
      maxEvenMinus = better(maxEvenMinus, 2 * prefix[l] - 2 * a[l], l)
    } else {
      maxOdd = better(maxOdd, 2 * prefix[l], l)
      maxOddPlus = better(maxOddPlus, 2 * prefix[l] + 2 * a[l], l)
    }
    frames.push({
      phase: 'extend', activeLine: L('add l = r − 1'), pythonLine: P('same_even = max'),
      r, l, gain: null, bestGain, bestL, bestR, preview: bestR === null ? null : rotatedPreview(a, bestL, bestR), base,
      value: base + bestGain, message: `Segments that end at ${r} may start at ${l}. Record ${l} in its sign class.`,
    })
    const candidates = r % 2 === 0
      ? [maxEven, maxOddPlus]
      : [maxOdd, maxEvenMinus]
    const pick = candidates[0].value >= candidates[1].value ? candidates[0] : candidates[1]
    const gain = pick.value - 2 * prefix[r]
    const candidateL = pick.index
    frames.push({
      phase: 'candidate', activeLine: L('gain ← best candidate'), pythonLine: P('gain = max('),
      r, l: candidateL, gain, bestGain, bestL, bestR, preview: bestR === null ? null : rotatedPreview(a, bestL, bestR), base,
      value: base + bestGain, message: `Rotating [${candidateL}..${r}] changes the pulse by ${gain}.`,
    })
    if (gain > bestGain) {
      bestGain = gain
      bestL = candidateL
      bestR = r
      frames.push({
        phase: 'record', activeLine: L('IF gain > bestGain'), pythonLine: P('best_gain = max(best_gain, gain)'),
        r, l: candidateL, gain, bestGain, bestL, bestR, preview: rotatedPreview(a, bestL, bestR), base,
        value: base + bestGain, message: `New best: rotate [${bestL}..${bestR}] for a pulse of ${base + bestGain}.`,
      })
    }
  }
  const result = base + bestGain
  frames.push({
    phase: 'done', activeLine: L('RETURN base + best'), pythonLine: P('return base + best_gain'),
    r: -1, l: -1, gain: null, bestGain, bestL, bestR, preview: bestR === null ? null : rotatedPreview(a, bestL, bestR), base,
    value: result, message: bestR === null ? `No rotation helps. The pulse stays ${result}.` : `Greatest pulse: ${result}.`,
  })
  return { input: a, result, base, bestL, bestR, frames }
}

export const code = `FUNCTION maxPulse(a)
    prefix ← running sums of sign(k) * a[k]
    base ← prefix at the last index
    bestGain ← 0
    FOR r from 1 to the last index
        add l = r − 1 to the best table for its sign class
        gain ← best candidate for r minus 2 * prefix[r]
        IF gain > bestGain THEN record l and r as the best rotation
    RETURN base + best gain`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `NEG = float("-inf")


def max_pulse(a):
    n = len(a)
    prefix = []
    total = 0
    for k in range(n):
        total += (1 if k % 2 == 0 else -1) * a[k]
        prefix.append(total)
    base = prefix[-1] if n else 0
    best_gain = 0
    same_even = same_odd = opp_odd = opp_even = NEG
    for r in range(1, n):
        l = r - 1
        if l % 2 == 0:
            same_even = max(same_even, 2 * prefix[l])
            opp_even = max(opp_even, 2 * prefix[l] - 2 * a[l])
        else:
            same_odd = max(same_odd, 2 * prefix[l])
            opp_odd = max(opp_odd, 2 * prefix[l] + 2 * a[l])
        if r % 2 == 0:
            gain = max(same_even, opp_odd) - 2 * prefix[r]
        else:
            gain = max(same_odd, opp_even) - 2 * prefix[r]
        best_gain = max(best_gain, gain)
    return base + best_gain


if __name__ == "__main__":
    import json
    import sys
    print(max_pulse(json.loads(sys.stdin.read())))
`
