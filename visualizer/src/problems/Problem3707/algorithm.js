
const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 2 || s.length > 50 || !/^[a-z]+$/.test(s)) throw new Error('Use a JSON string of 2 to 50 lowercase letters.')
  return { s }
}

const scoreOf = ch => ch.charCodeAt(0) - 96

export function buildTrace({ s }) {
  const values = [...s].map(scoreOf)
  const total = values.reduce((a, b) => a + b, 0)
  const frames = []
  let left = 0
  let result = false
  frames.push({ pythonLine: PY('total = sum'), phase: 'score', activeLine: L('const values'), cut: null, left: 0, right: total, total, message: `Total score is ${total}; each side must reach ${total / 2} to be equal.` })
  for (let cut = 0; cut < s.length - 1; cut++) {
    left += values[cut]
    const right = total - left
    const matched = 2 * left === total
    frames.push({ pythonLine: PY('left += values'), phase: 'scan', activeLine: L('left += values'), cut, left, right, total, matched,
      message: `Split after index ${cut}: left ${left}, right ${right}${matched ? ', equal.' : '.'}` })
    if (matched) { result = true; break }
  }
  frames.push({ pythonLine: PY('return True'), phase: 'done', activeLine: L('return false'), cut: null, left, right: total - left, total, matched: result,
    message: result ? 'An equal split exists.' : 'No split has equal scores.' })
  return { input: { s }, result, frames }
}

export const code = `function equalScoreSplit(s) {
  const values = [...s].map(ch => ch.charCodeAt(0) - 96)
  const total = values.reduce((a, b) => a + b, 0)
  let left = 0
  for (let cut = 0; cut < s.length - 1; cut++) {
    left += values[cut]
    if (2 * left === total) return true
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}

export const python = `def equal_score_split(s):
    values = [ord(c) - 96 for c in s]
    total = sum(values)
    left = 0
    for cut in range(len(s) - 1):
        left += values[cut]
        if 2 * left == total:
            return True
    return False
`
