// Filter Characters by Frequency. Count each letter across the whole string, then keep every
// occurrence of letters whose total frequency is strictly below k, in the original order.

const MAX_LENGTH = 20
const MAX_K = 10

const CODE_TEXT = [
  'FUNCTION filterByFrequency(s, k)',
  '    freq ← count of each letter in s',
  '    result ← empty text',
  '    FOR each character c in s, left to right',
  '        IF freq[c] < k THEN append c to result',
  '    RETURN result',
]

const PY = [
  'def filter_by_frequency(s, k):',
  '    freq = {}',
  '    for ch in s:',
  '        freq[ch] = freq.get(ch, 0) + 1',
  '    result = []',
  '    for ch in s:',
  '        if freq[ch] < k:',
  '            result.append(ch)',
  '    return "".join(result)',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(filter_by_frequency(data["s"], data["k"])))',
]

const PHASES = [
  { id: 'count', label: 'Count', description: 'Total each letter across the whole string.' },
  { id: 'keep', label: 'Keep', description: 'The letter is rarer than k.' },
  { id: 'drop', label: 'Drop', description: 'The letter is too frequent.' },
  { id: 'done', label: 'Result', description: 'Report the filtered text.' },
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
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Use an object with s and k.')
  const { s, k } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s has 1 to ${MAX_LENGTH} lowercase letters.`)
  if (!Number.isInteger(k) || k < 1 || k > MAX_K) throw new Error(`k is an integer from 1 to ${MAX_K}.`)
  return { s, k }
}

export function buildTrace({ s, k }) {
  const freq = {}
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1
  const frames = [{ pythonLine: P('freq = {}'), phase: 'count', activeLine: L('freq ← count'), freq: { ...freq }, index: null, kept: '', message: `Letter totals: ${Object.entries(freq).map(([c, n]) => `${c}×${n}`).join(' ')}.` }]
  let result = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (freq[ch] < k) {
      result += ch
      frames.push({ pythonLine: P('result.append(ch)'), phase: 'keep', activeLine: L('IF freq[c] < k'), freq: { ...freq }, index: i, kept: result, message: `${ch} occurs ${freq[ch]} time${freq[ch] === 1 ? '' : 's'}, below ${k}, so it stays.` })
    } else {
      frames.push({ pythonLine: P('if freq[ch] < k'), phase: 'drop', activeLine: L('IF freq[c] < k'), freq: { ...freq }, index: i, kept: result, message: `${ch} occurs ${freq[ch]} times, not below ${k}, so it is removed.` })
    }
  }
  frames.push({ pythonLine: P('return "".join'), phase: 'done', activeLine: L('RETURN result'), freq: { ...freq }, index: null, kept: result, message: result === '' ? 'Nothing survives the filter.' : `Filtered text: ${result}.` })
  return { input: { s, k }, result, frames }
}
