// Work backward from the target. Doubling is undone by halving, which only works on an even number. An odd target
// must have come from a subtraction, so undo it by adding one. Once the target is no larger than the start, the
// remaining gap is closed by subtracting one at a time.
export const code = String.raw`function brokenCalculatorSteps(startValue, target) {
  let steps = 0;
  let value = target;
  while (value > startValue) {
    if (value % 2 === 1) value += 1; // an odd value came from a subtraction, so undo it by adding one
    else value = value / 2; // an even value came from a doubling, so undo it by halving
    steps++;
  }
  return steps + (startValue - value); // subtract one for each step still needed from the start
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def broken_calculator_steps(start_value, target):
    steps = 0
    value = target
    while value > start_value:
        if value % 2 == 1:
            value += 1  # an odd value came from a subtraction, so undo it by adding one
        else:
            value //= 2  # an even value came from a doubling, so undo it by halving
        steps += 1
    return steps + (start_value - value)  # subtract one for each step still needed from the start`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'back', label: 'Work back', description: 'Undo one operation at a time, from the target toward the start.' },
  { id: 'finish', label: 'Finish', description: 'Close the remaining gap with subtractions.' },
  { id: 'done', label: 'Count', description: 'Total operations.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const startValue = input && input.startValue
  const target = input && input.target
  for (const [name, value] of [['startValue', startValue], ['target', target]]) {
    if (!Number.isInteger(value) || value < 1 || value > 1000000000) throw new Error(`${name} must be an integer from 1 to 1000000000.`)
  }
  return { startValue, target }
}

export function buildTrace({ startValue, target }) {
  let steps = 0
  let value = target
  const frames = []
  const chain = [target]
  while (value > startValue) {
    const before = value
    const op = value % 2 === 1 ? 'add one' : 'halve'
    if (value % 2 === 1) value += 1
    else value = value / 2
    steps++
    chain.push(value)
    frames.push({ phase: 'back', activeLine: L(op === 'add one' ? 'value += 1' : 'value = value / 2'), pythonLine: PY(op === 'add one' ? 'value += 1' : 'value //= 2'), before, after: value, op, steps, chain: [...chain], message: op === 'add one'
      ? `${before} is odd, so it came from a subtraction. Undo it by adding one: ${value}.`
      : `${before} is even, so it came from a doubling. Undo it by halving: ${value}.` })
  }
  const gap = startValue - value
  frames.push({ phase: 'finish', activeLine: L('return steps +'), pythonLine: PY('return steps +'), before: value, after: value, op: 'subtract', steps, chain: [...chain], gap,
    message: gap > 0 ? `The value ${value} is now below the start ${startValue}, so ${gap} subtraction(s) finish the job.` : `The value reached the start exactly, so no subtractions are needed.` })
  const result = steps + gap
  frames.push({ phase: 'done', activeLine: L('return steps +'), pythonLine: PY('return steps +'), before: value, after: value, op: null, steps: result, chain: [...chain], gap, message: `The minimum is ${result} operation(s).` })
  return { input: { startValue, target }, result, frames }
}
