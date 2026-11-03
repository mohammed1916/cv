// Independently written teaching model. The sample inputs are invented for this visualization.
export const code = [
  'function removeOuterPairs(s):',
  '  depth = 0',
  '  kept = empty text',
  '  for ch in s:',
  '    if ch is "(":',
  '      if depth > 0: keep ch',
  '      depth = depth + 1',
  '    else:',
  '      depth = depth - 1',
  '      if new depth > 0: keep ch',
  '  return kept',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def remove_outermost(s):
    depth = 0
    kept = []
    for ch in s:
        if ch == "(":
            if depth > 0:
                kept.append(ch)
            depth += 1
        else:
            depth -= 1
            if depth:
                kept.append(ch)
    return "".join(kept)`

const PSEUDO = code.map(line => line.text)
const PY_LINES = python.split('\n')
function lineOf(lines, key) {
  const index = lines.findIndex(text => text.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, pseudoKey, pyKey, message, snapshot) => ({
  phase,
  activeLine: lineOf(PSEUDO, pseudoKey),
  pythonLine: lineOf(PY_LINES, pyKey),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at depth zero with nothing kept.' },
  { id: 'inspect', label: 'Track depth', description: 'Read a bracket and update how deeply nested the scan is.' },
  { id: 'update', label: 'Keep or drop', description: 'Keep a bracket unless it is part of a primitive outer pair.' },
  { id: 'done', label: 'Result', description: 'Return the text with each outer pair removed.' },
]

export const inputLabel = 'JSON object with s, for example {"s":"(()())"}'
export const complexity = 'O(n) time and O(n) output. Depth is the only state tracked while scanning. The visualizer accepts up to 200 brackets.'
export const examples = [
  { label: 'Two primitives', input: '{"s":"(()())(())"}' },
  { label: 'Flat pairs', input: '{"s":"()()()()"}' },
  { label: 'Deep nesting', input: '{"s":"(((())))"}' },
  { label: 'Single pair', input: '{"s":"()"}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string') throw new Error('Use {"s": "..."} with parentheses.')
  if (input.s.length < 2 || input.s.length > 200) throw new Error('Use between 2 and 200 characters.')
  let depth = 0
  for (const ch of input.s) {
    if (ch !== '(' && ch !== ')') throw new Error('Only parentheses are allowed.')
    depth += ch === '(' ? 1 : -1
    if (depth < 0) throw new Error('A closing parenthesis has no opener.')
  }
  if (depth !== 0) throw new Error('Every opening parenthesis needs a closer.')
  return { s: input.s }
}

export function buildTrace({ s }) {
  const frames = []
  let depth = 0
  const kept = []
  frames.push(frame('start', 'depth = 0', 'depth = 0', 'Start at depth 0 with an empty result.', { s, depth, kept: '' }))
  for (let index = 0; index < s.length; index++) {
    const ch = s[index]
    frames.push(frame('inspect', 'for ch in s', 'for ch in s', `Read ${ch} at position ${index}.`, { s, index, ch, depth, kept: kept.join('') }))
    if (ch === '(') {
      frames.push(frame('inspect', 'if ch is "("', 'if ch == "("', `An opener at depth ${depth}.`, { s, index, ch, depth, kept: kept.join('') }))
      if (depth > 0) {
        kept.push(ch)
        frames.push(frame('update', 'if depth > 0: keep', 'if depth > 0:', 'Depth is above zero, so this opener is inside an outer pair. Keep it.', { s, index, ch, depth, kept: kept.join('') }))
      } else {
        frames.push(frame('update', 'if depth > 0: keep', 'if depth > 0:', 'Depth is zero, so this opener starts a primitive section. Drop it.', { s, index, ch, depth, kept: kept.join('') }))
      }
      depth += 1
      frames.push(frame('inspect', 'depth = depth + 1', 'depth += 1', `Depth becomes ${depth}.`, { s, index, ch, depth, kept: kept.join('') }))
    } else {
      depth -= 1
      frames.push(frame('inspect', 'depth = depth - 1', 'depth -= 1', `A closer lowers depth to ${depth}.`, { s, index, ch, depth, kept: kept.join('') }))
      if (depth > 0) {
        kept.push(ch)
        frames.push(frame('update', 'if new depth > 0', 'if depth:', 'Still inside an outer pair, so keep this closer.', { s, index, ch, depth, kept: kept.join('') }))
      } else {
        frames.push(frame('update', 'if new depth > 0', 'if depth:', 'Depth returned to zero, so this closer ends the primitive. Drop it.', { s, index, ch, depth, kept: kept.join('') }))
      }
    }
  }
  const result = kept.join('')
  frames.push(frame('done', 'return kept', 'return "".join', `Result: ${result || 'empty text'}.`, { s, depth, kept: result, result }))
  return { input: { s }, result, frames }
}
