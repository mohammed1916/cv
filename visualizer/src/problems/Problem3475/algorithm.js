// Knowledge-derived teaching model of a SQL flag-per-row task. Not the official statement.
// Flags (1 or 0): starts with ATG; ends with TAA, TAG or TGA; contains three identical bases in a row.

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Samples table.' },
  { id: 'prefix', label: 'Prefix', description: 'Test the start of each sequence.' },
  { id: 'suffix', label: 'Suffix', description: 'Test the end of each sequence.' },
  { id: 'run', label: 'Run', description: 'Look for three identical bases in a row.' },
  { id: 'order', label: 'Order', description: 'Sort the flagged rows by sample_id.' },
]

export const sql = `SELECT sample_id,
       CASE WHEN dna_sequence LIKE 'ATG%' THEN 1 ELSE 0 END AS starts_with_atg,
       CASE WHEN dna_sequence REGEXP '(TAA|TAG|TGA)$' THEN 1 ELSE 0 END AS ends_with_stop,
       CASE WHEN dna_sequence REGEXP '(A{3}|C{3}|G{3}|T{3})' THEN 1 ELSE 0 END AS has_run
FROM samples
ORDER BY sample_id;`

export const python = `def dna_flags(samples):
    seq = samples["dna_sequence"]
    out = samples[["sample_id"]].copy()
    out["starts_with_atg"] = seq.str.startswith("ATG").astype(int)
    out["ends_with_stop"] = seq.str.contains(r"(TAA|TAG|TGA)$", regex=True).astype(int)
    out["has_run"] = seq.str.contains(r"(A{3}|C{3}|G{3}|T{3})", regex=True).astype(int)
    return out.sort_values("sample_id")`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
function L(text) {
  const index = sqlLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
function P(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.samples) || input.samples.length > 12) throw new Error('Use an object with a samples list of at most 12 rows.')
  const samples = input.samples.map(row => {
    if (!Number.isInteger(row?.sample_id) || typeof row.dna_sequence !== 'string' || typeof row.species !== 'string') throw new Error('Each sample needs an integer sample_id, a dna_sequence and a species.')
    if (!/^[ACGT]{1,30}$/.test(row.dna_sequence)) throw new Error('dna_sequence uses only A, C, G and T, up to 30 letters.')
    return { sample_id: row.sample_id, dna_sequence: row.dna_sequence, species: row.species }
  })
  return { samples }
}

const copy = list => list.map(row => ({ ...row }))
const flag = value => (value ? 1 : 0)

export function buildTrace(input) {
  const frames = []
  const done = []
  frames.push({ phase: 'load', activeLine: L('FROM samples'), pythonLine: P('def dna_flags'), message: `Loaded ${input.samples.length} samples.`, rows: copy(input.samples) })
  for (const sample of input.samples) {
    const seq = sample.dna_sequence
    const starts = flag(seq.startsWith('ATG'))
    frames.push({ phase: 'prefix', activeLine: L("LIKE 'ATG%'"), pythonLine: P('startswith'), message: `sample ${sample.sample_id}: starts with ATG = ${starts}.`, rows: copy(done) })
    const ends = flag(/(TAA|TAG|TGA)$/.test(seq))
    frames.push({ phase: 'suffix', activeLine: L("REGEXP '(TAA"), pythonLine: P('(TAA'), message: `sample ${sample.sample_id}: ends with a stop codon = ${ends}.`, rows: copy(done) })
    const run = flag(/(A{3}|C{3}|G{3}|T{3})/.test(seq))
    done.push({ sample_id: sample.sample_id, starts_with_atg: starts, ends_with_stop: ends, has_run: run })
    frames.push({ phase: 'run', activeLine: L("REGEXP '(A{3}"), pythonLine: P('(A{3}'), message: `sample ${sample.sample_id}: three identical bases in a row = ${run}.`, rows: copy(done) })
  }
  const result = [...done].sort((a, b) => a.sample_id - b.sample_id)
  frames.push({ phase: 'order', activeLine: L('ORDER BY'), pythonLine: P('return out'), message: `Returned ${result.length} rows ordered by sample_id.`, rows: copy(result) })
  return { input, result, frames }
}
