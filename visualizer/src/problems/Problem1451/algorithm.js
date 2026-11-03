export const phases = [
  { id: 'split', label: 'Split and lowercase', description: 'Split the sentence into words and lowercase them so only length decides order.' },
  { id: 'pick', label: 'Pick next word', description: 'Take the next word and leave an open place for it at its current position.' },
  { id: 'compare', label: 'Compare lengths', description: 'Look at the word just before the open place. A longer word must move right, but a tie keeps the earlier word first.' },
  { id: 'shift', label: 'Shift longer word', description: 'The longer word moves one place right, opening the place one step further left.' },
  { id: 'insert', label: 'Place word', description: 'No longer word is left of the open place, so the picked word settles there.' },
  { id: 'capitalize', label: 'Capitalize first word', description: 'Capitalize only the first word of the result.' },
  { id: 'done', label: 'Result', description: 'Return the rearranged sentence.' },
]

export const code = `function arrangeWords(text):
    words = lowercase each word of split(text)
    for i from 1 to length(words) - 1:
        current = words[i]
        j = i - 1
        while j >= 0 and length(words[j]) > length(current):
            words[j + 1] = words[j]
            j = j - 1
        words[j + 1] = current
    words[0] = capitalize(words[0])
    return join(words, " ")`

export const python = `def arrange_words(text):
    words = [w.lower() for w in text.split()]
    for i in range(1, len(words)):
        current = words[i]
        j = i - 1
        while j >= 0 and len(words[j]) > len(current):
            words[j + 1] = words[j]
            j -= 1
        words[j + 1] = current
    words[0] = words[0].capitalize()
    return " ".join(words)`

const lineOf = (source, fragment) => source.split('\n').findIndex(line => line.includes(fragment)) + 1
const C = fragment => lineOf(code, fragment)
const P = fragment => lineOf(python, fragment)

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[A-Za-z]+( [A-Za-z]+){0,49}$/.test(s)) throw new Error('Enter 1 to 50 words of letters, separated by single spaces.')
  return s
}

export function buildTrace(sentence) {
  const frames = []
  const arr = sentence.split(' ').map(w => w.toLowerCase())
  let hole = null
  let picked = null
  const snap = (compare = null) => ({
    order: arr.map((w, k) => k === hole ? null : w),
    hole, picked, compare,
  })
  const add = (phase, c, p, message, compare) => frames.push({ phase, activeLine: C(c), pythonLine: P(p), message, snapshot: snap(compare) })

  add('split', 'words = lowercase', 'words = [w.lower', `Split ${arr.length} word${arr.length === 1 ? '' : 's'} and lowercase them. Length alone decides the order.`)
  for (let i = 1; i < arr.length; i++) {
    picked = arr[i]
    hole = i
    add('pick', 'current = words[i]', 'current = words[i]', `Pick up "${picked}" (length ${picked.length}). Its place is open at position ${i}.`)
    while (true) {
      const j = hole - 1
      const longer = j >= 0 && arr[j].length > picked.length
      add('compare', 'while j', 'while j',
        j < 0 ? 'The front of the list is reached, so the picked word goes first.'
          : `Compare "${arr[j]}" (length ${arr[j].length}) with "${picked}" (length ${picked.length}).`, j)
      if (!longer) break
      arr[hole] = arr[j]
      hole = j
      add('shift', 'words[j + 1] = words[j]', 'words[j + 1] = words[j]', `"${arr[hole + 1]}" is longer, so it moves one place right.`, j)
    }
    arr[hole] = picked
    add('insert', 'words[j + 1] = current', 'words[j + 1] = current', `"${picked}" settles at position ${hole}.`)
    hole = null
    picked = null
  }
  arr[0] = arr[0][0].toUpperCase() + arr[0].slice(1)
  add('capitalize', 'capitalize(words[0])', 'words[0].capitalize()', `The first word is capitalized: "${arr[0]}".`)
  const result = arr.join(' ')
  frames.push({ phase: 'done', activeLine: C('return join'), pythonLine: P('return " ".join'), message: `Rearranged sentence: ${result}`, snapshot: snap() })
  return { input: sentence, result, frames }
}
