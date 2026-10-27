export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Number.isInteger(spec.n) || spec.n < 2 || spec.n > 5) throw new Error('n is an integer from 2 to 5.')
  if (!Number.isInteger(spec.k) || spec.k < 0 || spec.k > 9) throw new Error('k is an integer from 0 to 9.')
  return spec
}

export function buildTrace(spec) {
  const { n, k } = spec
  const results = []
  const digits = []
  const frames = [{ phase: 'start', activeLine: L('def grow'), digits: [], results: [], message: `Build ${n}-digit numbers. Consecutive digits must differ by exactly ${k}, and the first digit cannot be 0.` }]
  const grow = () => {
    if (digits.length === n) {
      results.push(Number(digits.join('')))
      frames.push({ phase: 'complete', activeLine: L('results.append'), digits: [...digits], results: [...results], message: `${digits.join('')} is complete and valid.` })
      return
    }
    for (let d = digits.length === 0 ? 1 : 0; d <= 9; d++) {
      if (digits.length > 0 && Math.abs(d - digits.at(-1)) !== k) continue
      digits.push(d)
      frames.push({ phase: 'extend', activeLine: L('digits.append'), digits: [...digits], results: [...results], message: `Append ${d}: ${digits.length < n ? 'keep building' : 'the number is full'}.` })
      grow()
      digits.pop()
    }
  }
  grow()
  frames.push({ phase: 'done', activeLine: L('return results'), digits: [], results: [...results], message: `${results.length} number(s) found.` })
  return { input: spec, result: results, frames }
}

export const code = `def numsSameConsecDiff(n, k):
    results = []
    def grow(digits):
        if len(digits) == n:
            results.append(int(''.join(map(str, digits))))
            return
        for d in range(1 if not digits else 0, 10):
            if digits and abs(d - digits[-1]) != k:
                continue
            digits.append(d)
            grow(digits)
            digits.pop()
    grow([])
    return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
