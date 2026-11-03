export const code = [
  'given the starting number n',
  'keep a variable current set to n',
  'each call returns current',
  'then add one to current',
  'return the list of answers',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input.init) || input.init < -20 || input.init > 20) throw new Error('init is an integer from -20 to 20.')
  if (!Number.isInteger(input.calls) || input.calls < 1 || input.calls > 10) throw new Error('calls is an integer from 1 to 10.')
  return { init: input.init, calls: input.calls }
}

export function buildTrace({ init, calls }) {
  const frames = []
  const answers = []
  let current = init
  const view = (focus, summary) => ({ title: 'Counter', rows: answers.map((value, index) => `call ${index + 1} returned ${value}`), focus, summary })
  step(frames, 'start', 'keep a variable current', `Counter starts at ${init}.`, { title: 'Counter', rows: [`current ${current}`], focus: 0, summary: '' })
  for (let call = 1; call <= calls; call++) {
    answers.push(current)
    step(frames, 'call', 'each call returns current', `Call ${call} returns ${current}.`, view(answers.length - 1, ''))
    current += 1
    step(frames, 'advance', 'then add one', `Current moves to ${current}.`, view(answers.length - 1, `current ${current}`))
  }
  step(frames, 'done', 'return the list', 'Answers recorded.', view(-1, JSON.stringify(answers)))
  return { result: answers, frames }
}
