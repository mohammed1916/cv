export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the first character with an empty output.' },
  { id: 'read', label: 'Read token', description: 'Look at the current position and decide which token it starts.' },
  { id: 'emit', label: 'Emit text', description: 'Append the interpreted text for the token and move past it.' },
  { id: 'done', label: 'Complete', description: 'Return the interpreted text.' },
]

export function parseInput(text) {
  const command = JSON.parse(text)
  if (typeof command !== 'string' || !/^(G|\(\)|\(al\))+$/.test(command)) throw new Error('Enter a JSON string made only of the tokens G, (), and (al).')
  if (command.length > 100) throw new Error('The command can be at most 100 characters.')
  return command
}

// Pseudocode line numbers used by activeLine, and Python line numbers used by pythonLine.
const C = { start: 2, index: 3, loop: 4, isG: 5, isParen: 6, isAl: 7, done: 8 }
const PY = { start: 2, index: 3, loop: 4, isG: 5, isParen: 8, isAl: 11, done: 14 }

export function buildTrace(command) {
  const frames = []
  const out = []
  let i = 0
  const push = (phase, line, message, snapshot) => frames.push({ phase, activeLine: C[line], pythonLine: PY[line], snapshot, message })
  const snap = (extra = {}) => ({ index: i, output: out.join(''), ...extra })

  push('start', 'start', `Read ${command.length} characters from left to right. Each token maps to one piece of text.`, snap({ token: null }))
  while (i < command.length) {
    let token, text, line, len
    if (command[i] === 'G') { token = 'G'; text = 'G'; line = 'isG'; len = 1 }
    else if (command.startsWith('()', i)) { token = '()'; text = 'o'; line = 'isParen'; len = 2 }
    else { token = '(al)'; text = 'al'; line = 'isAl'; len = 4 }
    push('read', 'loop', `Position ${i} starts the token ${token}.`, snap({ token }))
    out.push(text)
    push('emit', line, `${token} becomes "${text}".`, { index: i, output: out.join(''), token })
    i += len
  }
  const result = out.join('')
  push('done', 'done', `Return "${result}".`, { index: command.length, output: result, token: null })
  return { input: command, result, frames }
}

export const code = `interpret (command):
  out = empty text
  i = 0
  while i < length of command:
    if command[i] is G: append "G", move 1
    else if next two characters are (): append "o", move 2
    else: append "al", move 4
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def interpret(command):
    out = []
    i = 0
    while i < len(command):
        if command[i] == "G":
            out.append("G")
            i += 1
        elif command[i:i + 2] == "()":
            out.append("o")
            i += 2
        else:
            out.append("al")
            i += 4
    return "".join(out)
`
