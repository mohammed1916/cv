// Teaching model (knowledge-derived): for each query, try every block of 1s that sits between
// two 0s, turn it into 0s, then fill the longest zero run. Augmented 1s are added at both ends.
const lineOf = (lines, text) => lines.findIndex(line => line.includes(text)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and queries.')
  const { s, queries } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 16 || !/^[01]+$/.test(s)) throw new Error('s is 1 to 16 characters of 0 and 1.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 4) throw new Error('Use 1 to 4 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !q.every(Number.isInteger) || q[0] < 0 || q[1] >= s.length || q[0] > q[1]) {
      throw new Error('Each query is [l, r] with 0 <= l <= r < length of s.')
    }
  }
  return { s, queries }
}

// Brute force for one substring: the best change in ones over all valid trades.
function bestGain(sub) {
  const t = ['1', ...sub, '1']
  let best = { gain: 0, block: null }
  for (let start = 1; start < t.length - 1; start++) {
    if (t[start] !== '1' || t[start - 1] !== '0') continue
    let end = start
    while (end + 1 < t.length - 1 && t[end + 1] === '1') end++
    if (t[end + 1] !== '0') continue
    const post = t.slice()
    for (let x = start; x <= end; x++) post[x] = '0'
    const longest = longestZeroRun(post)
    const gain = longest - (end - start + 1)
    if (gain > best.gain) best = { gain, block: [start - 1, end - 1] }
  }
  return best
}

function longestZeroRun(arr) {
  let longest = 0
  let run = 0
  for (const c of arr) {
    run = c === '0' ? run + 1 : 0
    longest = Math.max(longest, run)
  }
  return longest
}

export function buildTrace({ s, queries }) {
  const frames = []
  const answers = []
  frames.push({ pythonLine: lineOf(PY_LINES, 'answers = []'), phase: 'start', activeLine: L('start with no answers'), window: null, block: null, answers: [], message: 'Start with no query answered.' })
  for (const [l, r] of queries) {
    const sub = s.slice(l, r + 1).split('')
    const ones = sub.filter(c => c === '1').length
    frames.push({ pythonLine: lineOf(PY_LINES, 'for l, r in queries'), phase: 'query', activeLine: L('for each query'), window: [l, r], block: null, answers: answers.slice(), message: `Query [${l}, ${r}]: the substring has ${ones} ones.` })
    const { gain, block } = bestGain(sub)
    if (block) {
      frames.push({ pythonLine: lineOf(PY_LINES, 'gain = '), phase: 'trade', activeLine: L('keep the best trade'), window: [l, r], block: [l + block[0], l + block[1]], answers: answers.slice(), message: `Turning the block at [${l + block[0]}, ${l + block[1]}] into zeros and filling the longest zero run gains ${gain}.` })
    }
    const answer = ones + gain
    answers.push(answer)
    frames.push({ pythonLine: lineOf(PY_LINES, 'answers.append'), phase: 'result', activeLine: L('record the count'), window: [l, r], block: null, answers: answers.slice(), message: `Query answer ${answer}.` })
  }
  frames.push({ pythonLine: lineOf(PY_LINES, 'return answers'), phase: 'done', activeLine: L('return the answers'), window: null, block: null, answers: answers.slice(), message: `Answers: ${answers.join(', ')}.` })
  return { input: { s, queries }, result: answers, frames }
}

export const code = `answer each query on its substring
  start with no answers
  for each query [l, r]
    count the ones in s from l to r
    for each block of ones that has zeros on both sides inside the augmented string
      turn that block into zeros and measure the longest zero run
      keep the best trade, which may be no trade at all
    record the count of ones after the best trade
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_active_after_trade(s, queries):
    answers = []
    for l, r in queries:
        sub = s[l:r + 1]
        ones = sub.count('1')
        t = '1' + sub + '1'
        best_gain = 0
        for start in range(1, len(t) - 1):
            if t[start] != '1' or t[start - 1] != '0':
                continue
            end = start
            while end + 1 < len(t) - 1 and t[end + 1] == '1':
                end += 1
            if t[end + 1] != '0':
                continue
            post = t[:start] + '0' * (end - start + 1) + t[end + 1:]
            longest = max(len(part) for part in post.split('1'))
            gain = longest - (end - start + 1)
            best_gain = max(best_gain, gain)
        answers.append(ones + best_gain)
    return answers`
const PY_LINES = python.split('\n')
