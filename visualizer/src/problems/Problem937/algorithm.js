export function parseInput(text) {
  const logs = JSON.parse(text)
  if (!Array.isArray(logs) || !logs.length || logs.length > 30) throw new Error('Enter a JSON array of 1 to 30 log strings (the visualization caps it at 30).')
  const ids = new Set()
  for (const log of logs) {
    if (typeof log !== 'string' || !/^[a-z0-9]+ [a-z0-9]+( [a-z0-9]+)*$/.test(log) || log.length > 100) throw new Error(`Invalid log ${JSON.stringify(log)}: use "identifier word word..." with lowercase letters and digits only.`)
    const [ident, ...words] = log.split(' ')
    const allDigits = words.every(w => /^[0-9]+$/.test(w)), allLetters = words.every(w => /^[a-z]+$/.test(w))
    if (!allDigits && !allLetters) throw new Error(`Log ${JSON.stringify(log)}: every word after the identifier must be all letters or all digits (as a whole log).`)
    if (ids.has(ident)) throw new Error(`Duplicate identifier "${ident}".`)
    ids.add(ident)
  }
  return logs
}

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function buildTrace(logs) {
  const kinds = logs.map(() => '')
  const letters = [], digits = []
  const frames = [{ phase: 'start', activeLine: 2, kinds: [...kinds], order: [...logs], message: 'Letter logs get sorted by content then identifier; digit logs keep their original relative order at the end.' }]
  logs.forEach((log, i) => {
    const sp = log.indexOf(' ')
    const ident = log.slice(0, sp), rest = log.slice(sp + 1)
    if (/[0-9]/.test(rest[0])) {
      digits.push(log); kinds[i] = 'digit'
      frames.push({ phase: 'classify', activeLine: 6, index: i, kinds: [...kinds], order: [...logs], message: `"${log}" starts with a digit after the identifier: digit-log, appended in encounter order.` })
    } else {
      letters.push([rest, ident, log]); kinds[i] = 'letter'
      frames.push({ phase: 'classify', activeLine: 8, index: i, kinds: [...kinds], order: [...logs], message: `"${log}" is a letter-log: store the key (content "${rest}", identifier "${ident}").` })
    }
  })
  letters.sort((a, b) => cmp(a[0], b[0]) || cmp(a[1], b[1]))
  const sortedLetters = letters.map(l => l[2])
  frames.push({ phase: 'sort', activeLine: 9, kinds: sortedLetters.map(() => 'letter').concat(digits.map(() => 'digit')), order: [...sortedLetters, ...digits], message: `Sort letter-logs by (content, identifier): ${sortedLetters.length} letter-log(s) now ordered.` })
  const result = [...sortedLetters, ...digits]
  frames.push({ phase: 'done', activeLine: 10, kinds: result.map((_, i) => (i < sortedLetters.length ? 'letter' : 'digit')), order: result, message: 'Append the digit logs after the sorted letter logs.' })
  return { input: [...logs], result, frames }
}

export const code = `def reorderLogFiles(logs):
    letters, digits = [], []
    for log in logs:
        ident, rest = log.split(' ', 1)
        if rest[0].isdigit():
            digits.append(log)
        else:
            letters.append((rest, ident, log))
    letters.sort()
    return [l[2] for l in letters] + digits`.split('\n').map((text, index) => ({ line: index + 1, text }))
