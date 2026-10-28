export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with keys upper, lower and colsum.')
  const { upper, lower, colsum } = obj
  if (!Number.isInteger(upper) || !Number.isInteger(lower) || upper < 0 || lower < 0 || upper > 20 || lower > 20) throw new Error('upper and lower are integers from 0 to 20.')
  if (!Array.isArray(colsum) || colsum.length < 1 || colsum.length > 20) throw new Error('colsum is an array of 1 to 20 entries.')
  if (colsum.some(v => v !== 0 && v !== 1 && v !== 2)) throw new Error('Each colsum entry is 0, 1 or 2.')
  return { upper, lower, colsum }
}

export function buildTrace(input) {
  const { upper, lower, colsum } = input
  const top = []
  const bottom = []
  const placed = colsum.map(() => '')
  const twos = colsum.filter(v => v === 2).length
  let up = upper - twos
  let low = lower - twos
  const frames = [{ phase: 'start', activeLine: L('set upRemaining'), index: -1, placed: [...placed], up, low, message: `Columns with sum 2 use one 1 from each row, leaving ${up} for the top row and ${low} for the bottom row.` }]
  colsum.forEach((total, j) => {
    let label
    if (total === 2) { top.push(1); bottom.push(1); label = 'both' }
    else if (total === 0) { top.push(0); bottom.push(0); label = 'none' }
    else if (up > 0) { top.push(1); bottom.push(0); up -= 1; label = 'top' }
    else { top.push(0); bottom.push(1); low -= 1; label = 'bottom' }
    placed[j] = label
    const line = { both: 'put a 1 in both rows', none: 'put a 0 in both rows', top: 'put a 1 in the top row', bottom: 'put a 1 in the bottom row' }[label]
    const text = { both: 'a 1 in both rows', none: 'zeros in both rows', top: 'its 1 in the top row', bottom: 'its 1 in the bottom row' }[label]
    frames.push({ phase: 'column', activeLine: L(line), index: j, placed: [...placed], up, low, message: `Column ${j} has sum ${total}, so it gets ${text}.` })
  })
  const ok = up === 0 && low === 0
  const result = ok ? [top, bottom] : []
  frames.push({ phase: 'done', activeLine: L(ok ? 'return the two rows' : 'return an empty matrix'), index: -1, placed: [...placed], up, low, message: ok ? 'Both row sums and every column sum are met.' : 'A row quota is left unfilled, so no matrix fits.' })
  return { input, result, frames }
}

export const code = `reconstruct a two-row binary matrix
  set upRemaining and lowRemaining to the quotas after the sum 2 columns
  for each column j from 1 to n
    if colsum[j] is 2 then
      put a 1 in both rows of column j
    else if colsum[j] is 0 then
      put a 0 in both rows of column j
    else if upRemaining is above 0 then
      put a 1 in the top row of column j
      subtract 1 from upRemaining
    else
      put a 1 in the bottom row of column j
      subtract 1 from lowRemaining
  if upRemaining is 0 and lowRemaining is 0 then
    return the two rows
  return an empty matrix`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reconstruct_matrix(upper, lower, colsum):
    twos = sum(1 for total in colsum if total == 2)
    up_remaining = upper - twos
    low_remaining = lower - twos
    top = []
    bottom = []
    for total in colsum:
        if total == 2:
            top.append(1)
            bottom.append(1)
        elif total == 0:
            top.append(0)
            bottom.append(0)
        elif up_remaining > 0:
            top.append(1)
            bottom.append(0)
            up_remaining -= 1
        else:
            top.append(0)
            bottom.append(1)
            low_remaining -= 1
    if up_remaining == 0 and low_remaining == 0:
        return [top, bottom]
    return []
`
