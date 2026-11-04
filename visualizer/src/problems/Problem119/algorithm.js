export const phases = [
  { id: 'start', label: 'Start row', description: 'Row 0 is a single 1. The row is built in place from there.' },
  { id: 'level', label: 'Next level', description: 'Add one slot at the right end; it will be filled by the update pass.' },
  { id: 'update', label: 'Update cell', description: 'Each cell becomes itself plus its left neighbour, moving from right to left.' },
  { id: 'done', label: 'Return row', description: 'The row now holds the requested Pascal row.' },
]

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 0 || value > 33 || String(text).trim() === '') throw new Error('Enter an integer row index from 0 to 33.')
  return value
}

export function buildTrace(rowIndex) {
  const frames = []
  const row = [1]
  frames.push({ phase: 'start', activeLine: 2, message: 'Row 0 is [1]. The running row starts here.', snapshot: { row: [...row], level: 0, cell: 0 } })
  for (let level = 1; level <= rowIndex; level++) {
    row.push(0)
    frames.push({ phase: 'level', activeLine: 4, message: `Build row ${level}. Append a new slot at the right end, initially 0.`, snapshot: { row: [...row], level, cell: level } })
    for (let j = level; j >= 1; j--) {
      row[j] += row[j - 1]
      frames.push({ phase: 'update', activeLine: 6, message: `Cell ${j} becomes ${row[j] - row[j - 1]} + ${row[j - 1]} = ${row[j]}. The left neighbour still holds the old row, so going right to left is safe.`, snapshot: { row: [...row], level, cell: j } })
    }
  }
  frames.push({ phase: 'done', activeLine: 7, message: `Row ${rowIndex} is complete: ${row.join(', ')}.`, snapshot: { row: [...row], level: rowIndex, cell: -1 } })
  return { input: rowIndex, result: row, frames }
}

export const code = [
  'FUNCTION pascalRow(rowIndex)',
  '    row ← [1]',
  '    FOR level FROM 1 TO rowIndex',
  '        APPEND 0 TO row',
  '        FOR j FROM level DOWN TO 1',
  '            row[j] ← row[j] + row[j - 1]',
  '    RETURN row',
]

export const python = `def pascal_row(row_index):
    row = [1]
    for level in range(1, row_index + 1):
        row.append(0)
        for j in range(level, 0, -1):
            row[j] += row[j - 1]
    return row`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
