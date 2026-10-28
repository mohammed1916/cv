export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.chunks) || !Array.isArray(data.queries)) throw new Error('Use {"chunks": [...], "queries": [...]}.')
  const { chunks, queries } = data
  if (chunks.length < 1 || chunks.length > 4) throw new Error('Use 1 to 4 chunks for the visualization.')
  if (chunks.some(c => typeof c !== 'string' || !/^[a-z -]*$/.test(c))) throw new Error('Chunks use lowercase letters, spaces and hyphens only.')
  if (chunks.join('').length > 24) throw new Error('The joined text is at most 24 characters.')
  if (queries.length < 1 || queries.length > 5) throw new Error('Use 1 to 5 queries.')
  if (queries.some(q => typeof q !== 'string' || !/^[a-z]+(-[a-z]+)*$/.test(q))) throw new Error('A query is a valid word: letters with single hyphens between letters.')
  return { chunks, queries }
}

const isLetter = c => c !== undefined && c >= 'a' && c <= 'z'

export function buildTrace(input) {
  const { chunks, queries } = input
  const s = chunks.join('')
  const counts = new Map()
  let current = ''
  const frames = [{ phase: 'start', activeLine: L('let s be'), i: -1, s, current, counts: [], answers: [], message: `Joined text: "${s}".` }]
  const flush = () => {
    if (current !== '') counts.set(current, (counts.get(current) ?? 0) + 1)
    current = ''
  }
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (isLetter(ch)) {
      current += ch
      frames.push({ phase: 'letter', activeLine: L('if ch is a lowercase letter'), i, s, current, counts: [...counts], answers: [], message: `Letter ${ch} extends the current word to "${current}".` })
    } else if (ch === '-' && isLetter(s[i - 1]) && isLetter(s[i + 1])) {
      current += ch
      frames.push({ phase: 'joiner', activeLine: L('if ch is a hyphen between'), i, s, current, counts: [...counts], answers: [], message: 'This hyphen sits between two letters, so it joins the word.' })
    } else {
      const finished = current
      flush()
      frames.push({ phase: 'separator', activeLine: L('add 1 to counts'), i, s, current: '', counts: [...counts], answers: [], message: finished ? `Separator at ${i} ends the word "${finished}".` : `Separator at ${i}; no word to end.` })
    }
  }
  flush()
  const answers = queries.map(q => counts.get(q) ?? 0)
  frames.push({ phase: 'answer', activeLine: L('append the count'), i: -1, s, current: '', counts: [...counts], answers, message: `Answers: [${answers.join(', ')}].` })
  frames.push({ phase: 'done', activeLine: L('return the answers list'), i: -1, s, current: '', counts: [...counts], answers, message: 'Each query has been looked up.' })
  return { input, result: answers, frames }
}

export const code = `count how often each query occurs as a valid word
  let s be the chunks joined in order
  let counts be an empty table from word to count
  let current be an empty word
  for each character ch of s at position i
    if ch is a lowercase letter then
      add ch to current
    else if ch is a hyphen between two letters then
      add ch to current
    else
      if current is not empty then
        add 1 to counts for current and clear current
  after the loop add 1 to counts for current if it is not empty
  for each query in order
    append the count of query in counts, or 0
  return the answers list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_valid_word_occurrences(chunks, queries):
    s = ''.join(chunks)
    counts = {}
    current = ''
    n = len(s)

    def is_letter(c):
        return 'a' <= c <= 'z'

    for i, ch in enumerate(s):
        if is_letter(ch):
            current += ch
        elif ch == '-' and 0 < i < n - 1 and is_letter(s[i - 1]) and is_letter(s[i + 1]):
            current += ch
        else:
            if current != '':
                counts[current] = counts.get(current, 0) + 1
            current = ''
    if current != '':
        counts[current] = counts.get(current, 0) + 1
    return [counts.get(q, 0) for q in queries]
`
