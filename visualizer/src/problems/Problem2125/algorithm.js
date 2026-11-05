// LeetCode 2125: Number of Laser Beams in a Bank.
// Only rows with devices matter. Each device in one such row links to every device in the next such row,
// so consecutive non-empty rows with counts a and b contribute a * b beams.

export function parseInput(text) {
  let bank
  try { bank = JSON.parse(text) } catch { throw new Error('Use a JSON array of binary strings, e.g. ["011001","000000","010100"].') }
  if (!Array.isArray(bank) || bank.length < 1 || bank.length > 12) throw new Error('Use 1 to 12 rows.')
  const width = bank[0].length
  if (bank.some(row => typeof row !== 'string' || row.length !== width || !/^[01]+$/.test(row))) throw new Error('Every row must be a binary string of the same length.')
  return { bank }
}

export const code = `function laserBeams(bank) {
  let previous = 0
  let total = 0
  for (const row of bank) {
    const devices = [...row].filter(ch => ch === '1').length
    if (devices === 0) continue
    total += previous * devices
    previous = devices
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: laser_beams
def laser_beams(bank):
    previous = 0
    total = 0
    for row in bank:
        devices = row.count("1")
        if devices == 0:
            continue
        total += previous * devices
        previous = devices
    return total
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'count', label: 'Count devices', description: 'Count the devices in this row.' },
  { id: 'skip', label: 'Empty row', description: 'A row with no devices does not break the chain of rows.' },
  { id: 'pair', label: 'Beams', description: 'Connect every device in the previous non-empty row to every device here.' },
  { id: 'done', label: 'Result', description: 'The total number of beams.' },
]

export function buildTrace({ bank }) {
  const frames = []
  let previous = 0
  let total = 0
  const rows = []
  bank.forEach((row, i) => {
    const devices = [...row].filter(ch => ch === '1').length
    if (devices === 0) {
      rows.push({ row: i, devices: 0, beams: 0, note: 'skipped' })
      frames.push({ phase: 'skip', activeLine: L('if (devices === 0)'), pythonLine: P('if devices == 0'), message: `Row ${i} has no devices and is skipped.`, i, rows: [...rows], total })
      return
    }
    const beams = previous * devices
    total += beams
    rows.push({ row: i, devices, beams, note: previous ? `${previous} x ${devices}` : 'first row' })
    frames.push({ phase: beams ? 'pair' : 'count', activeLine: L('total += previous'), pythonLine: P('total += previous'), message: `Row ${i} has ${devices} devices; ${previous} x ${devices} = ${beams} beams from the previous row.`, i, rows: [...rows], total })
    previous = devices
  })
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), message: `Total beams: ${total}.`, i: -1, rows: [...rows], total })
  return { input: { bank }, result: total, frames }
}
