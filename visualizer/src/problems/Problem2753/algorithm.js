export const phases = [
  { id: 'start', label: 'Start', description: 'The walker stands at the first house and knows only k.' },
  { id: 'seek', label: 'Seek', description: 'Walk right until an open door appears.' },
  { id: 'anchor', label: 'Anchor', description: 'Leave this open door alone: it is the landmark for a full lap.' },
  { id: 'move', label: 'Step', description: 'Take one of the k counted steps.' },
  { id: 'closed', label: 'Closed', description: 'A closed door tells the walker nothing new.' },
  { id: 'open', label: 'Open', description: 'An open door was reached after this many steps.' },
  { id: 'close', label: 'Close', description: 'Shut it so it can never be counted again.' },
  { id: 'done', label: 'Result', description: 'The last open door seen was the anchor, one lap away.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with street and k.')
  const { street, k } = input
  if (!Array.isArray(street) || street.length < 1 || street.length > 24) throw new Error('street has 1 to 24 houses here.')
  for (const door of street) if (door !== 0 && door !== 1) throw new Error('Each door is 1 for open or 0 for closed.')
  if (!street.includes(1)) throw new Error('At least one door must start open.')
  if (!Number.isInteger(k) || k < street.length || k > 60) throw new Error('k must be an integer from the number of houses up to 60.')
  return { street, k }
}

export const code = `count the houses on a ring, knowing only a bound k
  while the door in front is closed, step right
  this open door is the anchor, so do not close it yet
  set answer to 0
  repeat for step = 1 to k
    step right
    if the door in front is open
      set answer to step
      close that door
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def house_count(street, k):
    while not street.is_door_open():
        street.move_right()
    answer = 0
    for step in range(1, k + 1):
        street.move_right()
        if street.is_door_open():
            answer = step
            street.close_door()
    return answer
`

export function buildTrace({ street, k }) {
  const n = street.length
  const doors = street.slice()
  const tape = Array(k).fill(null)
  const frames = []
  let pos = 0
  let anchor = -1
  let step = 0
  let answer = 0
  const push = (phase, activeLine, pythonLine, message) => frames.push({
    phase, activeLine, pythonLine, message, doors: doors.slice(), pos, anchor, step, answer, tape: tape.slice(),
  })

  push('start', L('while the door'), 2, `Standing at the first house. All the walker knows is that there are at most ${k} houses.`)
  while (doors[pos] !== 1) {
    push('seek', L('while the door'), 3, 'This door is closed, so it cannot serve as a landmark. Step right.')
    pos = (pos + 1) % n
  }
  anchor = pos
  push('anchor', L('this open door'), 2, 'An open door. Leave it open: when the walker next finds it, exactly one lap has passed.')
  push('anchor', L('set answer to 0'), 4, 'No doors have been reached yet, so the answer starts at 0.')
  for (let i = 1; i <= k; i++) {
    pos = (pos + 1) % n
    step = i
    push('move', L('repeat for step') + 1, 6, `Step ${i} of ${k}: move one house to the right.`)
    if (doors[pos] === 1) {
      tape[i - 1] = 'open'
      answer = i
      push('open', L('set answer to step'), 8, pos === anchor
        ? `The door is open and it is the anchor again, so this could be the full lap. Answer becomes ${i}.`
        : `The door is open, so at least ${i} houses exist. Answer becomes ${i}.`)
      doors[pos] = 0
      push('close', L('close that door'), 9, pos === anchor
        ? 'Shut the anchor too. Every door on the ring is now closed, so no later step can change the answer.'
        : 'Shut it so that only the anchor can still be open when the walker comes round.')
    } else {
      tape[i - 1] = 'closed'
      push('closed', L('if the door in front'), 7, 'This door is closed. The answer stays as it is.')
    }
  }
  push('done', L('return answer'), 10, `All ${k} steps are used. The last open door was reached on step ${answer}, so there are ${answer} houses.`)
  return { input: { street, k }, result: answer, frames }
}
