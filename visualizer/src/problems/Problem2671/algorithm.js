const MAX_COMMANDS = 12
const MAX_VALUE = 5
const OPS = ['add', 'deleteOne', 'hasFrequency']

export function parseInput(text) {
  const commands = JSON.parse(text)
  if (!Array.isArray(commands) || commands.length < 1 || commands.length > MAX_COMMANDS) throw new Error(`Use an array of 1 to ${MAX_COMMANDS} commands.`)
  for (const cmd of commands) {
    if (!Array.isArray(cmd) || cmd.length !== 2 || !OPS.includes(cmd[0])) throw new Error('Each command is [op, value] with op add, deleteOne or hasFrequency.')
    if (!Number.isInteger(cmd[1]) || cmd[1] < 1 || cmd[1] > MAX_VALUE) throw new Error(`Values and frequencies are integers from 1 to ${MAX_VALUE}.`)
  }
  return commands
}

export const code = `answer a list of frequency tracker commands
  set count to an empty map from value to how many times it is held
  set freq to an empty map from count to how many values have that count
  set answers to an empty list
  for each command [op, value] in order
    if op is add then
      move value up one count in count and in freq
      append nothing to answers
    otherwise if op is deleteOne then
      if value has a positive count then move value down one count in count and in freq
      append nothing to answers
    otherwise
      append whether freq has at least one value with count equal to value
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Move one value between count buckets, keeping the count-of-counts table exact.
function shift(count, freq, value, delta) {
  const before = count.get(value) ?? 0
  const after = before + delta
  if (before > 0) {
    freq.set(before, freq.get(before) - 1)
    if (freq.get(before) === 0) freq.delete(before)
  }
  if (after > 0) {
    count.set(value, after)
    freq.set(after, (freq.get(after) ?? 0) + 1)
  } else {
    count.delete(value)
  }
}

export function buildTrace(commands) {
  const count = new Map()
  const freq = new Map()
  const result = []
  const frames = [{ phase: 'start', index: -1, op: null, value: null, counts: {}, answer: null, activeLine: L('set count'), message: 'Start with no values held.' }]
  commands.forEach(([op, value], i) => {
    let answer = null
    let message
    let line
    if (op === 'add') {
      shift(count, freq, value, 1)
      line = L('move value up one count')
      message = `Add ${value}; it now has count ${count.get(value)}.`
    } else if (op === 'deleteOne') {
      if ((count.get(value) ?? 0) > 0) shift(count, freq, value, -1)
      line = L('if value has a positive count')
      message = `Delete one ${value} if it is held.`
    } else {
      answer = (freq.get(value) ?? 0) > 0
      line = L('append whether freq')
      message = `Is there a value held exactly ${value} times? ${answer ? 'Yes' : 'No'}.`
    }
    result.push(op === 'hasFrequency' ? answer : null)
    frames.push({ phase: op, index: i, op, value, counts: Object.fromEntries(count), answer, activeLine: line, message })
  })
  frames.push({ phase: 'done', index: commands.length - 1, op: null, value: null, counts: Object.fromEntries(count), answer: null, activeLine: L('return answers'), message: 'All commands processed.' })
  return { input: commands, result, frames }
}

export const python = `def frequency_tracker(commands):
    count = {}
    freq = {}
    answers = []
    for op, value in commands:
        if op == 'add' or (op == 'deleteOne' and count.get(value, 0) > 0):
            delta = 1 if op == 'add' else -1
            before = count.get(value, 0)
            after = before + delta
            if before > 0:
                freq[before] -= 1
                if freq[before] == 0:
                    del freq[before]
            if after > 0:
                count[value] = after
                freq[after] = freq.get(after, 0) + 1
            else:
                del count[value]
            answers.append(None)
        elif op == 'deleteOne':
            answers.append(None)
        else:
            answers.append(freq.get(value, 0) > 0)
    return answers
`
