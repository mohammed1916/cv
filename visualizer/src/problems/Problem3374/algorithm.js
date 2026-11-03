// Knowledge-derived teaching model (not the official statement): each word starts with an uppercase letter
// and the rest of the word is lowercase. Here a word starts at the beginning of the text, after a space,
// or after a hyphen. SQL uses capitalize_words(), a helper this teaching model assumes exists (MySQL has no built-in).

const SQL_LINES = [
  'SELECT content_id,',
  '       capitalize_words(LOWER(content_text)) AS content_text',
  'FROM Content',
  'ORDER BY content_id;',
]

const PY_LINES = [
  'import re',
  'def capitalize_words(content):',
  '    df = pd.DataFrame(content)',
  "    lowered = df['content_text'].str.lower()",
  "    df['content_text'] = lowered.apply(lambda t: re.sub(r'(^|[ -])([a-z])', lambda m: m.group(1) + m.group(2).upper(), t))",
  "    return df.sort_values('content_id')[['content_id', 'content_text']].to_dict('records')",
]

export const sql = SQL_LINES.join('\n')
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every content row.' },
  { id: 'lower', label: 'Lowercase', description: 'Start from an all-lowercase copy.' },
  { id: 'capitalize', label: 'Capitalize', description: 'Uppercase each letter that starts a word.' },
  { id: 'order', label: 'Order', description: 'Sort by content_id.' },
  { id: 'output', label: 'Result', description: 'Show the normalized rows.' },
]

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const sqlAt = fragment => lineOf(SQL_LINES, fragment)
const pyAt = fragment => lineOf(PY_LINES, fragment)

export function capitalizeWords(text) {
  return text.toLowerCase().replace(/(^|[ -])([a-z])/g, (match, separator, letter) => separator + letter.toUpperCase())
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.content)) throw new Error('Use an object with a content array.')
  if (input.content.length > 12) throw new Error('Use at most 12 rows for the teaching view.')
  const ids = new Set()
  for (const row of input.content) {
    if (!Number.isInteger(row.content_id) || ids.has(row.content_id)) throw new Error('Each content_id must be a unique integer.')
    ids.add(row.content_id)
    if (typeof row.content_text !== 'string' || row.content_text.length < 1 || row.content_text.length > 40 || !/^[A-Za-z0-9 -]+$/.test(row.content_text)) {
      throw new Error('content_text is 1 to 40 letters, digits, spaces or hyphens.')
    }
  }
  return { content: input.content.map(row => ({ ...row })) }
}

export function buildTrace({ content }) {
  const frames = []
  const snap = rows => rows.map(row => ({ ...row }))
  frames.push({ phase: 'load', activeLine: sqlAt('FROM Content'), pythonLine: pyAt('DataFrame'), message: `Loaded ${content.length} rows.`, rows: snap(content) })

  const lowered = content.map(row => ({ content_id: row.content_id, content_text: row.content_text.toLowerCase() }))
  frames.push({ phase: 'lower', activeLine: sqlAt('LOWER('), pythonLine: pyAt('lowered = df'), message: 'Lowercase every letter first.', rows: snap(lowered) })

  const done = []
  for (const row of content) {
    done.push({ content_id: row.content_id, content_text: capitalizeWords(row.content_text) })
    frames.push({ phase: 'capitalize', activeLine: sqlAt('capitalize_words'), pythonLine: pyAt('re.sub'), message: `"${row.content_text}" becomes "${done.at(-1).content_text}".`, rows: snap(done) })
  }

  const sorted = [...done].sort((a, b) => a.content_id - b.content_id)
  frames.push({ phase: 'order', activeLine: sqlAt('ORDER BY'), pythonLine: pyAt('sort_values'), message: 'Sort by content_id.', rows: snap(sorted) })
  frames.push({ phase: 'output', activeLine: sqlAt('SELECT content_id'), pythonLine: pyAt('return df'), message: `Result has ${sorted.length} rows.`, rows: snap(sorted), result: true })
  return { input: { content }, result: sorted, frames }
}
