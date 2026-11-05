export const phases = [
  { id: 'start', label: 'Platforms and names', description: 'Build every platform and experiment-name combination, even those with no experiments.' },
  { id: 'join', label: 'Left join', description: 'Attach the experiments that match each combination; unmatched combinations stay empty.' },
  { id: 'group', label: 'Count', description: 'Count the matched experiment ids per combination; empty groups count 0.' },
  { id: 'done', label: 'Result', description: 'Return all nine combinations with their counts.' },
]

export const code = `WITH
  P AS (SELECT 'Android' AS platform UNION SELECT 'IOS' UNION SELECT 'Web'),
  Exp AS (SELECT 'Reading' AS experiment_name UNION SELECT 'Sports' UNION SELECT 'Programming'),
  T AS (SELECT * FROM P, Exp)
SELECT platform, experiment_name, COUNT(experiment_id) AS num_experiments
FROM T AS t
LEFT JOIN Experiments USING (platform, experiment_name)
GROUP BY 1, 2;`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `PLATFORMS = ['Android', 'IOS', 'Web']
NAMES = ['Reading', 'Sports', 'Programming']

def count_experiments(experiments):
    result = []
    for platform in PLATFORMS:
        for name in NAMES:
            matched = [e for e in experiments if e[1] == platform and e[2] == name]
            result.append((platform, name, len(matched)))
    return result
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

const PLATFORMS = ['Android', 'IOS', 'Web']
const NAMES = ['Reading', 'Sports', 'Programming']

export function parseInput(text) {
  let rows
  try { rows = JSON.parse(text) } catch { throw new Error('Use a JSON array of [experiment_id, platform, experiment_name] rows.') }
  if (!Array.isArray(rows) || rows.length > 60) throw new Error('Give up to 60 experiment rows.')
  const ids = new Set()
  for (const row of rows) {
    if (!Array.isArray(row) || row.length !== 3) throw new Error('Each row is [experiment_id, platform, experiment_name].')
    const [id, platform, name] = row
    if (!Number.isInteger(id) || ids.has(id)) throw new Error('experiment_id must be a unique integer.')
    if (!PLATFORMS.includes(platform) || !NAMES.includes(name)) throw new Error('Platform must be Android, IOS or Web; name must be Reading, Sports or Programming.')
    ids.add(id)
  }
  return rows
}

export function buildTrace(rows) {
  const frames = []
  const add = (phase, c, p, message, extra) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { rows, combos: extra.combos ?? [], matched: extra.matched ?? [], counts: extra.counts ?? [], focus: extra.focus ?? null },
  })
  const combos = []
  for (const platform of PLATFORMS) for (const name of NAMES) combos.push([platform, name])
  add('start', 'P AS', 'PLATFORMS = ', 'Nine combinations exist before looking at the experiments.', { combos })
  const matched = combos.map(([p, n]) => rows.filter(r => r[1] === p && r[2] === n).map(r => r[0]))
  add('join', 'LEFT JOIN', 'matched = [e for e', 'Each combination collects its matching experiment ids; empty lists stay as empty groups.', { combos, matched })
  const counts = combos.map(([p, n], i) => [p, n, matched[i].length])
  add('group', 'COUNT(experiment_id)', 'len(matched)', 'Counting the ids gives zero for combinations with no experiment.', { combos, matched, counts })
  add('done', 'GROUP BY 1, 2', 'result.append', 'Return the nine rows.', { combos, matched, counts, focus: null })
  return { input: rows, result: counts, frames }
}
