export const phases = [
  { id: 'start', label: 'Start', description: 'Load the free-slot counter for each car type.' },
  { id: 'check', label: 'Check type', description: 'Read only the counter for the requested car type.' },
  { id: 'accept', label: 'Accept', description: 'The counter has room, so one slot is taken and the answer is true.' },
  { id: 'reject', label: 'Reject', description: 'The counter is empty, so the answer is false and no counter changes.' },
  { id: 'done', label: 'Complete', description: 'Every request has an answer, returned in request order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"slots": [2, 1, 1], "cars": [1, 3, 1]}.')
  const { slots, cars } = input
  if (!Array.isArray(slots) || slots.length !== 3 || !slots.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('slots lists three integers from 0 to 1000: big, medium, small.')
  if (!Array.isArray(cars) || cars.length < 1 || cars.length > 30 || !cars.every(v => [1, 2, 3].includes(v))) throw new Error('cars lists 1 to 30 requests, each 1 (big), 2 (medium) or 3 (small).')
  return { slots, cars }
}

const NAMES = ['', 'big', 'medium', 'small']

export const code = `parking system (slots, cars):
  left = copy of slots
  answers = empty list
  for each car type in cars:
    if left[type - 1] > 0:
      left[type - 1] -= 1
      append true to answers
    else:
      append false to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def parking_system(slots, cars):
    left = list(slots)
    answers = []
    for car in cars:
        if left[car - 1] > 0:
            left[car - 1] -= 1
            answers.append(True)
        else:
            answers.append(False)
    return answers
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (phase, pseudo, py, message, snapshot) => ({ phase, activeLine: L(pseudo), pythonLine: P(py), message, snapshot })

export function buildTrace({ slots, cars }) {
  const left = [...slots]
  const answers = []
  const snap = (type, verdict) => ({ left: [...left], type, verdict, answers: [...answers] })
  const frames = [at('start', 'left = copy', 'left = list(', `Three counters hold the free slots: big ${slots[0]}, medium ${slots[1]}, small ${slots[2]}.`, snap(null, null))]
  for (let i = 0; i < cars.length; i++) {
    const type = cars[i]
    const name = NAMES[type]
    frames.push(at('check', 'if left[type - 1] > 0', 'if left[car - 1] > 0', `Request ${i + 1} is a ${name} car. Only the ${name} counter (${left[type - 1]} free) matters.`, snap(type, null)))
    if (left[type - 1] > 0) {
      left[type - 1] -= 1
      answers.push(true)
      frames.push(at('accept', 'left[type - 1] -= 1', 'left[car - 1] -= 1', `Accept: one ${name} slot is taken, ${left[type - 1]} left for that type.`, snap(type, true)))
    } else {
      answers.push(false)
      frames.push(at('reject', 'append false', 'answers.append(False)', `Reject: no ${name} slot is free. The other counters are unchanged.`, snap(type, false)))
    }
  }
  frames.push(at('done', 'return answers', 'return answers', `Answers in request order: ${answers.map(String).join(', ')}.`, snap(null, null)))
  return { input: { slots, cars }, result: answers, frames }
}
