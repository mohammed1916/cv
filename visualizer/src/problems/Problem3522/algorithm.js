export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with instructions and values.')
  const { instructions, values } = data
  if (!Array.isArray(instructions) || instructions.length < 1 || instructions.length > 20) throw new Error('instructions holds 1 to 20 entries.')
  if (instructions.some(v => v !== 'add' && v !== 'jump')) throw new Error('Each instruction is "add" or "jump".')
  if (!Array.isArray(values) || values.length !== instructions.length) throw new Error('values must have one entry per instruction.')
  if (values.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Each value is an integer from -10 to 10.')
  return { instructions, values }
}

export function buildTrace(input) {
  const { instructions, values } = input
  const executed = new Set()
  let i = 0
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('set score to 0'), i, score, executed: [], message: 'Start at instruction 0 with score 0.' }]
  for (;;) {
    if (i < 0 || i >= instructions.length) {
      frames.push({ phase: 'stop', activeLine: L('if i is outside'), i, score, executed: [...executed], message: `Index ${i} is outside the list, so the process stops.` })
      break
    }
    if (executed.has(i)) {
      frames.push({ phase: 'stop', activeLine: L('if i is outside'), i, score, executed: [...executed], message: `Instruction ${i} already ran, so the process stops before running it again.` })
      break
    }
    executed.add(i)
    if (instructions[i] === 'add') {
      score += values[i]
      frames.push({ phase: 'add', activeLine: L('if instruction i is add'), i, score, executed: [...executed], message: `Add ${values[i]} to the score, then move to instruction ${i + 1}.` })
      i += 1
    } else {
      const next = i + values[i]
      frames.push({ phase: 'jump', activeLine: L('otherwise move to i plus'), i, score, executed: [...executed], message: `Jump by ${values[i]} from ${i} to ${next}.` })
      i = next
    }
  }
  frames.push({ phase: 'done', activeLine: L('return score'), i, score, executed: [...executed], message: `The score is ${score}.` })
  return { input, result: score, frames }
}

export const code = `calculate the score after the instructions
  set score to 0, index i to 0, and mark no instruction as executed
  repeat
    if i is outside the list or instruction i has already executed then stop
    mark instruction i as executed
    if instruction i is add then add values[i] to score and move to i plus 1
    otherwise move to i plus values[i]
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def calculate_score(instructions, values):
    score = 0
    i = 0
    executed = set()
    while 0 <= i < len(instructions) and i not in executed:
        executed.add(i)
        if instructions[i] == "add":
            score += values[i]
            i += 1
        else:
            i += values[i]
    return score
`
