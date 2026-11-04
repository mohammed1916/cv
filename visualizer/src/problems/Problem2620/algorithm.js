const CODE = [
  'function makeCounter(n) {',
  '  let current = n',
  '  return function () {',
  '    const answer = current',
  '    current += 1',
  '    return answer',
  '  }',
  '}',
]

const PY = [
  'def make_counter(n):',
  '    current = n',
  '    def call():',
  '        nonlocal current',
  '        answer = current',
  '        current += 1',
  '        return answer',
  '    return call',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The closure stores the starting number.' },
  { id: 'call', label: 'Call', description: 'Each call returns the stored value.' },
  { id: 'advance', label: 'Advance', description: 'The stored value grows by one for the next call.' },
  { id: 'done', label: 'Result', description: 'All answers recorded.' },
]

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
  const view = (focus, summary) => ({ title: 'Counter', rows: answers.map((value, index) => `call ${index + 1} returned ${value}`), answers: answers.slice(), current, focus, summary })
  frames.push({ pythonLine: at(PY, 'current = n'), activeLine: at(CODE, 'let current = n'), phase: 'start', message: `Counter starts at ${init}.`, view: view(-1, '') })
  for (let call = 1; call <= calls; call++) {
    answers.push(current)
    frames.push({ pythonLine: at(PY, 'return answer'), activeLine: at(CODE, 'return answer'), phase: 'call', message: `Call ${call} returns ${current}.`, view: view(answers.length - 1, '') })
    current += 1
    frames.push({ pythonLine: at(PY, 'current += 1'), activeLine: at(CODE, 'current += 1'), phase: 'advance', message: `Current moves to ${current}.`, view: view(answers.length - 1, `current ${current}`) })
  }
  frames.push({ pythonLine: at(PY, 'return call'), activeLine: at(CODE, '}'), phase: 'done', message: 'Answers recorded.', view: view(-1, JSON.stringify(answers)) })
  return { result: answers, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
