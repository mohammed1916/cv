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
  const frames = [{ phase: 'start', activeLine: L('start grow with no digits'), pythonLine: 13, digits: [], results: [], message: `Build ${n}-digit numbers. Consecutive digits must differ by exactly ${k}, and the first digit cannot be 0.` }]
  const grow = () => {
    if (digits.length === n) {
      results.push(Number(digits.join('')))
      frames.push({ phase: 'complete', activeLine: L('append it to results'), pythonLine: 5, digits: [...digits], results: [...results], message: `${digits.join('')} is complete and valid.` })
      return
    }
    for (let d = digits.length === 0 ? 1 : 0; d <= 9; d++) {
      if (digits.length > 0 && Math.abs(d - digits.at(-1)) !== k) continue
      digits.push(d)
      frames.push({ phase: 'extend', activeLine: L('append d to digits'), pythonLine: 10, digits: [...digits], results: [...results], message: `Append ${d}: ${digits.length < n ? 'keep building' : 'the number is full'}.` })
      grow()
      digits.pop()
    }
  }
  grow()
  frames.push({ phase: 'done', activeLine: L('return results'), pythonLine: 14, digits: [], results: [...results], message: `${results.length} number(s) found.` })
  return { input: spec, result: results, frames }
}

export const code = `numsSameConsecDiff(n, k) returns all n-digit numbers whose neighbouring digits differ by k
  set results to an empty list, and start grow with no digits
  grow(digits):
    if digits has n entries, then append it to results and return
    for each digit d from 0 to 9 (from 1 if digits is empty)
      if digits is not empty and |d minus the last digit| is not k, then skip d
      append d to digits
      grow(digits)
      remove the last digit from digits
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def nums_same_consec_diff(n, k):
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
    return results`
