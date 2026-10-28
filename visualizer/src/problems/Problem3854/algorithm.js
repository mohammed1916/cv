export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('nums must have 1 to 12 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < -1000000000 || v > 1000000000)) throw new Error('Each value must be an integer from -1000000000 to 1000000000.')
  return { nums }
}

const parity = x => ((x % 2) + 2) % 2

export function buildTrace({ nums }) {
  const frames = [{ phase: 'start', activeLine: L('set best ops'), shape: null, ops: null, spread: null, best: null, message: 'Two shapes are possible: even values at even indexes, or odd values at even indexes.' }]
  let best = null
  for (const s of [0, 1]) {
    let ops = 0
    const cands = nums.map((v, i) => {
      const need = (i + s) % 2
      if (parity(v) === need) return [v]
      ops += 1
      return [v - 1, v + 1]
    })
    // Try each candidate low end; every element takes its smallest candidate at or above it.
    let spread = Infinity
    for (const lo of [...new Set(cands.flat())]) {
      if (!cands.every(cs => cs.some(c => c >= lo))) continue
      const hi = Math.max(...cands.map(cs => Math.min(...cs.filter(c => c >= lo))))
      spread = Math.min(spread, hi - lo)
    }
    const option = [ops, spread]
    const better = best === null || ops < best[0] || (ops === best[0] && spread < best[1])
    if (better) best = option
    frames.push({ phase: 'shape', activeLine: L('set ops to the number'), shape: s, ops, spread, best: best ? [...best] : null,
      message: `Shape ${s === 0 ? 'A (even at even indexes)' : 'B (odd at even indexes)'} needs ${ops} operation(s) and can reach spread ${spread}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return [best ops'), shape: null, ops: best[0], spread: best[1], best: [...best], message: `Answer: [${best.join(', ')}].` })
  return { input: { nums }, result: best, frames }
}

export const code = `parity alternating (nums):
  set best ops to infinity and best spread to infinity
  for each shape s in [0, 1]
    set ops to the number of elements with the wrong parity for this shape
    each wrong element can become its value minus 1 or plus 1
    each right element stays as it is
    set spread to the smallest largest-minus-smallest over all choices
    if ops is less than best ops, or equal with a smaller spread, then
      set best ops and best spread to ops and spread
  return [best ops, best spread]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def parity_alternating_cost(nums):
    n = len(nums)
    options = []
    for s in (0, 1):
        ops = 0
        cands = []
        for i, v in enumerate(nums):
            need = (i + s) % 2
            if v % 2 == need:
                cands.append([v])
            else:
                ops += 1
                cands.append([v - 1, v + 1])
        spread = None
        for lo in sorted({c for cs in cands for c in cs}):
            if all(any(c >= lo for c in cs) for cs in cands):
                hi = max(min(c for c in cs if c >= lo) for cs in cands)
                if spread is None or hi - lo < spread:
                    spread = hi - lo
        options.append((ops, spread))
    return list(min(options))
`
