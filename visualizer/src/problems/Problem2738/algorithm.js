// SQL walkthrough. The sample table is invented. A word counts only when it has a space on both sides.
export const SQL = `WITH targets AS (
  SELECT 'bull' AS word
  UNION ALL SELECT 'bear'
)
SELECT t.word, COUNT(f.file_name) AS occurrences
FROM targets t
LEFT JOIN Files f
  ON INSTR(f.content, CONCAT(' ', t.word, ' ')) > 0
GROUP BY t.word
ORDER BY t.word;`

export const sql = SQL
export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))
const sqlLine = fragment => {
  const index = code.findIndex(line => line.text.includes(fragment))
  if (index < 0) throw new Error(`SQL has no line containing "${fragment}"`)
  return index + 1
}

export const python = `import pandas as pd

def count_occurrences(files):
    rows = []
    for word in ["bear", "bull"]:
        pattern = " " + word + " "
        matches = sum(1 for content in files["content"] if pattern in content)
        rows.append({"word": word, "occurrences": matches})
    return pd.DataFrame(rows)`
const PY_LINES = python.split('\n')
const pyLine = fragment => {
  const index = PY_LINES.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Python has no line containing "${fragment}"`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Files', description: 'Each file body is the text to scan.' },
  { id: 'match', label: 'Match', description: 'Look for the word with a space on each side.' },
  { id: 'count', label: 'Count', description: 'Count the files that contain the word at least once.' },
  { id: 'done', label: 'Result', description: 'One row per word, zero when no file contains it.' },
]

export const TARGETS = ['bull', 'bear']
export const sample = {
  files: [
    { file_name: 'a.txt', content: 'The bull ran past the bear.' },
    { file_name: 'b.txt', content: 'Bulls and bears, a bull market.' },
    { file_name: 'c.txt', content: 'Bullish outlook.' },
    { file_name: 'd.txt', content: 'Nothing here.' },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.files) || input.files.length > 12) throw new Error('Provide a files array of at most 12 rows.')
  const names = new Set(input.files.map(f => f.file_name))
  if (names.size !== input.files.length) throw new Error('file_name must be unique.')
  for (const f of input.files) {
    if (typeof f.file_name !== 'string' || typeof f.content !== 'string') throw new Error('Each file needs a file_name and text content.')
  }
  return input
}

const hasWord = (content, word) => content.includes(` ${word} `)

export function buildTrace(input) {
  const { files } = input
  const frames = []
  const frame = (phase, sqlFragment, pyFragment, message, rows) => frames.push({
    phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: rows.map(row => ({ ...row })),
  })
  frame('load', 'LEFT JOIN Files', 'for content in files', 'Start with every file body.', files.map(f => ({ file_name: f.file_name, content: f.content })))
  const result = []
  for (const word of TARGETS) {
    const rows = files.map(f => ({ file_name: f.file_name, word, has: hasWord(f.content, word) ? 'yes' : 'no' }))
    frame('match', 'INSTR(f.content', 'pattern = " "', `Look for " ${word} " (a space on each side) in each file.`, rows)
    const occurrences = rows.filter(r => r.has === 'yes').length
    result.push({ word, occurrences })
    frame('count', 'COUNT(f.file_name)', 'matches = sum', `${word} is in ${occurrences} file${occurrences === 1 ? '' : 's'}.`, result)
  }
  frame('done', 'ORDER BY t.word', 'return pd.DataFrame', 'Both words are listed, including any zero.', result)
  return { input, result, frames }
}
