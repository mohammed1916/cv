export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.cookies)) throw new Error('Use an object with a "cookies" array and a "k".')
  const { cookies, k } = input
  if (cookies.length < 2 || cookies.length > 8) throw new Error('cookies holds 2 to 8 bag sizes.')
  if (cookies.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each bag holds an integer from 1 to 50.')
  if (!Number.isInteger(k) || k < 2 || k > Math.min(4, cookies.length)) throw new Error('k is an integer from 2 to 4 and at most the number of bags.')
  return { cookies, k }
}

export function buildTrace(input) {
  const { cookies, k } = input
  const n = cookies.length
  const totals = new Array(k).fill(0)
  const choice = new Array(n).fill(-1)
  let best = Infinity
  let bestChoice = null
  const frames = [{ phase: 'start', activeLine: L('set best to infinity'), cookie: -1, child: -1, totals: [...totals], best: null, message: `Share ${n} bags among ${k} children, minimizing the largest total.` }]
  const give = index => {
    if (index === n) {
      const unfair = Math.max(...totals)
      if (unfair < best) { best = unfair; bestChoice = [...choice] }
      frames.push({ phase: 'leaf', activeLine: L('keep the smaller unfairness'), cookie: -1, child: -1, totals: [...totals], best, message: `Every bag is handed out. The largest total is ${unfair}.` })
      return
    }
    for (let child = 0; child < k; child++) {
      if (totals[child] + cookies[index] >= best) {
        frames.push({ phase: 'prune', activeLine: L('skip this child'), cookie: index, child, totals: [...totals], best, message: `Child ${child} would reach ${totals[child] + cookies[index]}, which cannot beat ${best}.` })
        continue
      }
      totals[child] += cookies[index]
      choice[index] = child
      frames.push({ phase: 'give', activeLine: L('give the cookie to this child'), cookie: index, child, totals: [...totals], best, message: `Bag ${cookies[index]} goes to child ${child}.` })
      give(index + 1)
      totals[child] -= cookies[index]
      choice[index] = -1
    }
  }
  give(0)
  frames.push({ phase: 'done', activeLine: L('return best'), cookie: -1, child: -1, totals: bestChoice ? totals.map(() => 0) : totals, best, message: `The fewest possible largest total is ${best}.` })
  return { input, result: best, frames, bestChoice }
}

export const code = `fewest possible largest total when sharing the bags fairly
  set best to infinity
  call give with bag zero
  return best
give(index)
  if every bag has been handed out then
    keep the smaller unfairness if it beats best
    stop
  for each child
    if the child total plus this bag is at least best then skip this child
    otherwise give the cookie to this child, call give with index plus one, then take the cookie back`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def fair_distribution(cookies, k):
    totals = [0] * k
    best = float('inf')

    def give(index):
        nonlocal best
        if index == len(cookies):
            best = min(best, max(totals))
            return
        for child in range(k):
            if totals[child] + cookies[index] >= best:
                continue
            totals[child] += cookies[index]
            give(index + 1)
            totals[child] -= cookies[index]

    give(0)
    return best
`
