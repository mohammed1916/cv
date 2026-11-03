const SQL = `WITH targets AS (
  SELECT 'bull' AS word
  UNION ALL SELECT 'bear'
),
padded AS (
  SELECT CONCAT(' ', REPLACE(REPLACE(LOWER(content), '.', ' '), ',', ' '), ' ') AS text
  FROM Files
)
SELECT t.word,
  COALESCE(SUM((LENGTH(p.text) - LENGTH(REPLACE(p.text, CONCAT(' ', t.word, ' '), ''))) / (LENGTH(t.word) + 2)), 0) AS occurrences
FROM targets t
LEFT JOIN padded p ON 1 = 1
GROUP BY t.word
ORDER BY t.word;`

const PY = `import pandas as pd

def count_occurrences(files):
    rows = []
    for word in ["bear", "bull"]:
        total = 0
        for content in files["content"]:
            text = str(content).lower().replace(".", " ").replace(",", " ")
            total += text.split().count(word)
        rows.append({"word": word, "occurrences": total})
    return pd.DataFrame(rows)
`

const TARGETS = ['bear', 'bull']
const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'load', label: 'Files', description: 'Each file body is the text to scan.' },
  { id: 'normalise', label: 'Normalise', description: 'Lowercase, and turn commas and periods into spaces so words stand alone.' },
  { id: 'count', label: 'Count', description: 'Count each target as a whole token.' },
  { id: 'done', label: 'Result', description: 'One row per word, zero when it never appears.' },
]
export const sample = {
  files: [
    { file_name: 'a.txt', content: 'The bull ran past the bear.' },
    { file_name: 'b.txt', content: 'Bears and bulls, a bull market.' },
    { file_name: 'c.txt', content: 'Bullish outlook.' },
    { file_name: 'd.txt', content: 'Nothing here.' },
  ],
}

// Teaching rule: a word is a run of letters separated by spaces, commas or periods.
const tokens = text => text.toLowerCase().replace(/[.,]/g, ' ').split(/\s+/).filter(Boolean)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.files)) throw new Error('Provide a files array.')
  const names = new Set(input.files.map(f => f.file_name))
  if (names.size !== input.files.length) throw new Error('file_name must be unique.')
  for (const f of input.files) {
    if (typeof f.content !== 'string') throw new Error(`File ${f.file_name} needs text content.`)
  }
  return input
}

export function buildTrace(input) {
  const { files } = input
  const frames = []
  frames.push(frame('load', 'FROM Files', 'for content in files', 'Start with every file body.', files.map(f => ({ file_name: f.file_name, content: f.content }))))
  const normalised = files.map(f => ({ file_name: f.file_name, words: tokens(f.content).join(' ') }))
  frames.push(frame('normalise', 'REPLACE(REPLACE(LOWER', 'text = str(content)', 'Lowercase and split each file into words.', normalised))
  const result = []
  for (const word of TARGETS) {
    const occurrences = files.reduce((sum, f) => sum + tokens(f.content).filter(t => t === word).length, 0)
    result.push({ word, occurrences })
    frames.push(frame('count', 'SUM((LENGTH', 'rows.append', `${word} appears ${occurrences} time(s) as a whole word.`, result))
  }
  frames.push(frame('done', 'ORDER BY t.word', 'return pd.DataFrame', 'Both words listed, including any zero.', result))
  return { input, result, frames }
}
