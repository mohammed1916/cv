export function parseInput(text) {
  const limits = JSON.parse(text)
  if (!Array.isArray(limits) || limits.length < 1 || limits.length > 8) throw new Error('Use an array of 1 to 8 limits.')
  if (limits.some(v => !Number.isInteger(v) || v < 1 || v > 15)) throw new Error('Limits are integers from 1 to 15.')
  return limits
}

export function buildTrace(maximumHeight) {
  const order = maximumHeight.map((limit, index) => ({ limit, index })).sort((a, b) => b.limit - a.limit || a.index - b.index)
  const heights = maximumHeight.map(() => null)
  let previous = Infinity
  let total = 0
  const frames = [{ phase: 'sort', activeLine: L('sort the towers'), index: -1, heights: [...heights], total, message: 'Process the towers from the highest limit down.' }]
  for (const { limit, index } of order) {
    const height = Math.min(limit, previous - 1)
    if (height < 1) {
      frames.push({ phase: 'fail', activeLine: L('if the height is below 1'), index, heights: [...heights], total, message: `Tower ${index} cannot get a height of at least 1 that is unused. The answer is -1.` })
      frames.push({ phase: 'done', activeLine: L('return -1'), index: -1, heights: [...heights], total: -1, message: 'Impossible: return -1.' })
      return { input: maximumHeight, result: -1, frames }
    }
    heights[index] = height
    total += height
    previous = height
    frames.push({ phase: 'assign', activeLine: L('add the height to total'), index, heights: [...heights], total, message: `Tower ${index} (limit ${limit}) gets height ${height}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, heights: [...heights], total, message: `Maximum total height: ${total}.` })
  return { input: maximumHeight, result: total, frames }
}

export const code = `maximum total height of towers with unique heights:
  sort the towers by limit from largest to smallest
  set previous to infinity and total to 0
  for each tower do
    set its height to the lower of its limit and previous minus 1
    if the height is below 1 then
      return -1
    add the height to total and set previous to it
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_height(maximumHeight):
    previous = float('inf')
    total = 0
    for limit in sorted(maximumHeight, reverse=True):
        height = min(limit, previous - 1)
        if height < 1:
            return -1
        total += height
        previous = height
    return total
`
