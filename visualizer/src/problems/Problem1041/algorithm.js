export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the origin facing north.' },
  { id: 'step', label: 'Execute', description: 'Apply one instruction: move forward, or turn left or right.' },
  { id: 'pass', label: 'Pass ends', description: 'One full pass of the program is finished; the robot may have drifted.' },
  { id: 'done', label: 'Answer', description: 'The robot is bounded exactly when it is back at the origin after four passes.' },
]

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]
const NAMES = ['north', 'east', 'south', 'west']

export const code = `function isRobotBounded(instructions) {
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  let x = 0
  let y = 0
  let d = 0
  for (let pass = 0; pass < 4; pass++) {
    for (const c of instructions) {
      if (c === 'G') {
        x += dirs[d][0]
        y += dirs[d][1]
      } else if (c === 'L') {
        d = (d + 3) % 4
      } else {
        d = (d + 1) % 4
      }
    }
  }
  return x === 0 && y === 0
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def is_bounded(instructions):
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    x = y = 0
    d = 0
    for _ in range(4):
        for c in instructions:
            if c == 'G':
                dx, dy = dirs[d]
                x, y = x + dx, y + dy
            elif c == 'L':
                d = (d + 3) % 4
            else:
                d = (d + 1) % 4
    return x == 0 and y == 0
`

export function parseInput(text) {
  const s = String(text).trim().replace(/^"(.*)"$/, '$1')
  if (!/^[GLR]{1,100}$/.test(s)) throw new Error('Use only the letters G, L and R, between 1 and 100 characters.')
  return s
}

export function buildTrace(instructions) {
  const input = instructions
  let x = 0
  let y = 0
  let d = 0
  const path = [[0, 0]]
  const frames = [{ phase: 'start', activeLine: 2, pythonLine: 3, message: 'Start at the origin facing north.', snapshot: { x, y, heading: NAMES[d], pass: 0, index: -1, path: [...path] } }]
  for (let pass = 1; pass <= 4; pass++) {
    for (let i = 0; i < input.length; i++) {
      const c = input[i]
      if (c === 'G') {
        x += DIRS[d][0]
        y += DIRS[d][1]
        path.push([x, y])
      } else if (c === 'L') {
        d = (d + 3) % 4
      } else {
        d = (d + 1) % 4
      }
      const activeLine = c === 'G' ? 9 : c === 'L' ? 12 : 14
      const pythonLine = c === 'G' ? 9 : c === 'L' ? 11 : 13
      const effect = c === 'G' ? `move to (${x}, ${y})` : `now facing ${NAMES[d]}`
      frames.push({ phase: 'step', activeLine, pythonLine, message: `Pass ${pass}, instruction ${i + 1} (${c}): ${effect}.`, snapshot: { x, y, heading: NAMES[d], pass, index: i, path: [...path] } })
    }
    frames.push({ phase: 'pass', activeLine: 6, pythonLine: 5, message: `End of pass ${pass}: at (${x}, ${y}) facing ${NAMES[d]}.`, snapshot: { x, y, heading: NAMES[d], pass, index: input.length - 1, path: [...path] } })
  }
  const result = x === 0 && y === 0
  frames.push({ phase: 'done', activeLine: 18, pythonLine: 14, message: result ? 'Back at the origin after four passes, so the robot stays in a circle.' : 'Not at the origin after four passes, so the robot drifts away forever.', snapshot: { x, y, heading: NAMES[d], pass: 4, index: input.length - 1, path: [...path] } })
  return { input, result, frames }
}
