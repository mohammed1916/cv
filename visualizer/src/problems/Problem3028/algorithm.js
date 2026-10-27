export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums holds 1 to 30 steps.')
  if (nums.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Each step is an integer from -10 to 10.')
  return { nums }
}

export function buildTrace(input) {
  let position = 0
  let returns = 0
  const frames = [{ phase: 'start', activeLine: L('set position to 0'), index: -1, position, returns, message: 'The ant starts on the boundary, at position 0.' }]
  input.nums.forEach((step, i) => {
    position += step
    const back = position === 0
    if (back) returns += 1
    frames.push({ phase: back ? 'return' : 'move', activeLine: L(back ? 'if position equals 0' : 'add the value to position'), index: i, position, returns,
      message: `Move ${step}: the ant is at ${position}. ${back ? 'It is back on the boundary, so the count rises to ' + returns + '.' : 'It is not on the boundary.'}` })
  })
  frames.push({ phase: 'done', activeLine: L('return returns'), index: -1, position, returns, message: `The ant returned to the boundary ${returns} time${returns === 1 ? '' : 's'}.` })
  return { input, result: returns, frames }
}

export const code = `count the returns to the boundary
  set position to 0 and returns to 0
  for each value in nums in order
    add the value to position
    if position equals 0 then add 1 to returns
  return returns`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ant_on_boundary(nums):
    position = 0
    returns = 0
    for step in nums:
        position += step
        if position == 0:
            returns += 1
    return returns
`
