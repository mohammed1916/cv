// Sort Array By Absolute Value. Selection sort by |value|: repeatedly take the first remaining
// value with the smallest absolute value. Ties keep their original order.

const MAX_LENGTH = 10
const MAX_VALUE = 20

const CODE_TEXT = [
  'FUNCTION sortByAbs(values)',
  '    remaining ← copy of values; result ← empty list',
  '    WHILE remaining is not empty',
  '        m ← 0',
  '        FOR i from 1 to len(remaining) − 1',
  '            IF |remaining[i]| < |remaining[m]| THEN m ← i',
  '        move remaining[m] to the end of result',
  '    RETURN result',
]

const PY = [
  'def sort_by_abs(values):',
  '    remaining = list(values)',
  '    result = []',
  '    while remaining:',
  '        m = 0',
  '        for i in range(1, len(remaining)):',
  '            if abs(remaining[i]) < abs(remaining[m]):',
  '                m = i',
  '        result.append(remaining.pop(m))',
  '    return result',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(sort_by_abs(json.loads(sys.stdin.read()))))',
]

const PHASES = [
  { id: 'setup', label: 'Remaining', description: 'Start with every value still unplaced.' },
  { id: 'scan', label: 'Scan', description: 'Look for a smaller absolute value.' },
  { id: 'best', label: 'New best', description: 'This value has the smallest absolute value so far.' },
  { id: 'take', label: 'Take', description: 'Move the chosen value to the result.' },
  { id: 'done', label: 'Result', description: 'Report the sorted array.' },
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
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > MAX_LENGTH) throw new Error(`Use a list of 1 to ${MAX_LENGTH} integers.`)
  if (!values.every(v => Number.isInteger(v) && Math.abs(v) <= MAX_VALUE)) throw new Error(`Each value is an integer from -${MAX_VALUE} to ${MAX_VALUE}.`)
  return values
}

export function buildTrace(values) {
  const remaining = values.map((value, index) => ({ value, index }))
  const result = []
  const frames = [{ pythonLine: P('remaining = list'), phase: 'setup', activeLine: L('remaining ← copy'), remaining: remaining.map(r => r.index), result: [], m: null, i: null, message: 'Every value is still unplaced.' }]
  while (remaining.length) {
    let m = 0
    frames.push({ pythonLine: P('m = 0'), phase: 'scan', activeLine: L('m ← 0'), remaining: remaining.map(r => r.index), result: result.map(r => r.index), m: 0, i: null, message: `Start with ${remaining[0].value} as the smallest candidate.` })
    for (let i = 1; i < remaining.length; i++) {
      const better = Math.abs(remaining[i].value) < Math.abs(remaining[m].value)
      frames.push({ pythonLine: P('if abs(remaining[i])'), phase: better ? 'best' : 'scan', activeLine: L('IF |remaining[i]|'), remaining: remaining.map(r => r.index), result: result.map(r => r.index), m, i, message: better ? `|${remaining[i].value}| is smaller than |${remaining[m].value}|, so index ${i} is the new best.` : `|${remaining[i].value}| is not smaller than |${remaining[m].value}|.` })
      if (better) m = i
    }
    const [taken] = remaining.splice(m, 1)
    result.push(taken)
    frames.push({ pythonLine: P('result.append(remaining.pop'), phase: 'take', activeLine: L('move remaining[m]'), remaining: remaining.map(r => r.index), result: result.map(r => r.index), m: null, i: null, message: `Move ${taken.value} to the result.` })
  }
  const output = result.map(r => r.value)
  frames.push({ pythonLine: P('return result'), phase: 'done', activeLine: L('RETURN result'), remaining: [], result: result.map(r => r.index), m: null, i: null, message: `Sorted by absolute value: ${output.join(', ')}.` })
  return { input: values, result: output, frames }
}
