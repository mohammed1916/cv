// Sort Threats by Severity and Exploitability. Each threat is [id, severity, exploitability].
// Score is 2 * severity + exploitability. Higher score comes first; equal scores break to the smaller id.
// Insertion sort keeps a sorted prefix and places each new threat into it.

const MAX_THREATS = 8

const CODE_TEXT = [
  'FUNCTION sortThreats(threats)',
  '    order ← copy of threats',
  '    FOR i from 1 to len(order) − 1',
  '        current ← order[i]; j ← i',
  '        WHILE j > 0 AND current ranks before order[j − 1]',
  '            order[j] ← order[j − 1]; j ← j − 1',
  '        order[j] ← current',
  '    RETURN order',
]

const PY = [
  'def score(threat):',
  '    return 2 * threat[1] + threat[2]',
  '',
  'def ranks_before(a, b):',
  '    return score(a) > score(b) or (score(a) == score(b) and a[0] < b[0])',
  '',
  'def sort_threats(threats):',
  '    order = list(threats)',
  '    for i in range(1, len(order)):',
  '        current = order[i]',
  '        j = i',
  '        while j > 0 and ranks_before(current, order[j - 1]):',
  '            order[j] = order[j - 1]',
  '            j -= 1',
  '        order[j] = current',
  '    return order',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(sort_threats(json.loads(sys.stdin.read()))))',
]

const PHASES = [
  { id: 'setup', label: 'Read threats', description: 'Copy the threats and compute each score.' },
  { id: 'pick', label: 'Pick', description: 'Take the next unplaced threat.' },
  { id: 'compare', label: 'Compare', description: 'Check it against a placed threat.' },
  { id: 'shift', label: 'Shift', description: 'Move a weaker threat one slot right.' },
  { id: 'insert', label: 'Insert', description: 'Drop the threat into its slot.' },
  { id: 'done', label: 'Result', description: 'Report the sorted threats.' },
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

const scoreOf = t => 2 * t[1] + t[2]
const before = (a, b) => scoreOf(a) > scoreOf(b) || (scoreOf(a) === scoreOf(b) && a[0] < b[0])

export function parseInput(text) {
  const threats = JSON.parse(text)
  if (!Array.isArray(threats) || threats.length < 1 || threats.length > MAX_THREATS) {
    throw new Error(`Use a list of 1 to ${MAX_THREATS} threats.`)
  }
  for (const t of threats) {
    if (!Array.isArray(t) || t.length !== 3 || !t.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) {
      throw new Error('Each threat is [id, severity, exploitability] with integers from 0 to 100.')
    }
  }
  if (new Set(threats.map(t => t[0])).size !== threats.length) throw new Error('Threat ids must be unique.')
  return threats
}

export function buildTrace(threats) {
  const order = threats.map(t => [...t])
  const frames = [{ pythonLine: P('order = list'), phase: 'setup', activeLine: L('order ← copy'), order: order.map(t => t[0]), current: null, compare: null, message: `Scores: ${order.map(t => `${t[0]}=${scoreOf(t)}`).join(', ')}. Higher first, ties by smaller id.` }]
  for (let i = 1; i < order.length; i++) {
    const current = order[i]
    let j = i
    frames.push({ pythonLine: P('current = order[i]'), phase: 'pick', activeLine: L('current ← order[i]'), order: order.map(t => t[0]), current: current[0], compare: null, message: `Place threat ${current[0]} (score ${scoreOf(current)}) into the sorted prefix.` })
    while (j > 0) {
      const other = order[j - 1]
      const ahead = before(current, other)
      frames.push({ pythonLine: P('while j > 0'), phase: 'compare', activeLine: L('WHILE j > 0'), order: order.map(t => t[0]), current: current[0], compare: other[0], message: ahead ? `${current[0]} (score ${scoreOf(current)}) ranks before ${other[0]} (score ${scoreOf(other)}).` : `${current[0]} does not rank before ${other[0]}; it stops here.` })
      if (!ahead) break
      order[j] = other
      j -= 1
      frames.push({ pythonLine: P('order[j] = order[j - 1]'), phase: 'shift', activeLine: L('order[j] ← order[j − 1]'), order: order.map(t => t[0]), current: current[0], compare: null, message: `Shift ${other[0]} one slot right.` })
    }
    order[j] = current
    frames.push({ pythonLine: P('order[j] = current'), phase: 'insert', activeLine: L('order[j] ← current'), order: order.map(t => t[0]), current: current[0], compare: null, message: `Threat ${current[0]} sits at position ${j}.` })
  }
  frames.push({ pythonLine: P('return order'), phase: 'done', activeLine: L('RETURN order'), order: order.map(t => t[0]), current: null, compare: null, message: 'All threats are placed.' })
  return { input: threats, result: order, frames }
}
