// Number of Student Replacements. The selection starts at the first arrival and is
// replaced only by a strictly better (smaller) rank. Replacements are counted.

const MAX_ARRIVALS = 16

const CODE_TEXT = [
  'FUNCTION countReplacements(ranks)',
  '    selected ← ranks[0]; count ← 0',
  '    FOR each later rank in ranks from index 1',
  '        IF rank is strictly better than selected',
  '            selected ← rank; count ← count + 1',
  '        ELSE keep selected',
  '    RETURN count',
]

const PY = [
  'def count_replacements(ranks):',
  '    selected = ranks[0]',
  '    count = 0',
  '    for rank in ranks[1:]:',
  '        if rank < selected:',
  '            selected = rank',
  '            count += 1',
  '    return count',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(count_replacements(json.loads(sys.stdin.read()))))',
]

const PHASES = [
  { id: 'setup', label: 'First arrival', description: 'Select the first student.' },
  { id: 'scan', label: 'Compare', description: 'Compare the next arrival with the selection.' },
  { id: 'replace', label: 'Replace', description: 'A strictly better rank takes the selection.' },
  { id: 'keep', label: 'Keep', description: 'The selection stays.' },
  { id: 'done', label: 'Result', description: 'Report the replacement count.' },
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
  const ranks = JSON.parse(text)
  if (!Array.isArray(ranks) || ranks.length < 1 || ranks.length > MAX_ARRIVALS) {
    throw new Error(`Use a list of 1 to ${MAX_ARRIVALS} arrival ranks.`)
  }
  if (!ranks.every(r => Number.isInteger(r) && r >= 1 && r <= 100)) throw new Error('Each rank is an integer from 1 to 100.')
  return ranks
}

export function buildTrace(ranks) {
  let selected = ranks[0]
  let selectedIndex = 0
  let count = 0
  const frames = [{ pythonLine: P('selected = ranks[0]'), phase: 'setup', activeLine: L('selected ← ranks[0]'), index: 0, selected, selectedIndex, count, message: `Student 0 with rank ${selected} is selected first.` }]
  for (let i = 1; i < ranks.length; i++) {
    const rank = ranks[i]
    frames.push({ pythonLine: P('for rank in'), phase: 'scan', activeLine: L('FOR each later rank'), index: i, selected, selectedIndex, count, message: `Compare arrival ${i} (rank ${rank}) with selected rank ${selected}.` })
    if (rank < selected) {
      selected = rank
      selectedIndex = i
      count += 1
      frames.push({ pythonLine: P('selected = rank'), phase: 'replace', activeLine: L('selected ← rank; count'), index: i, selected, selectedIndex, count, message: `${rank} is strictly better, so it replaces the selection. Count is ${count}.` })
    } else {
      frames.push({ pythonLine: P('if rank < selected'), phase: 'keep', activeLine: L('ELSE keep selected'), index: i, selected, selectedIndex, count, message: `${rank} is not strictly better, so the selection stays.` })
    }
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: L('RETURN count'), index: ranks.length - 1, selected, selectedIndex, count, message: `${count} replacement${count === 1 ? '' : 's'}.` })
  return { input: ranks, result: count, frames }
}
