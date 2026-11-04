export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('Use an integer length from 1 to 8.')
  return n
}

export function buildTrace(n) {
  const answer = []
  const frames = [{ pythonLine: 13, phase: 'start', activeLine: L("build('')"), prefix: '', answer: [...answer], message: 'Start with the empty string and try to extend it one bit at a time.' }]
  const extend = prefix => {
    if (prefix.length === n) {
      answer.push(prefix)
      frames.push({ pythonLine: 6, phase: 'emit', activeLine: L('answer.push(prefix)'), prefix, answer: [...answer], message: `"${prefix}" has length ${n} and no two adjacent zeros, so it joins the answer.` })
      return
    }
    for (const bit of ['0', '1']) {
      if (bit === '0' && prefix.endsWith('0')) {
        frames.push({ pythonLine: 10, phase: 'skip', activeLine: L("if (bit === '0'"), prefix: prefix + bit, answer: [...answer], message: `Appending 0 to "${prefix}" would make two adjacent zeros, so skip it.` })
        continue
      }
      frames.push({ pythonLine: 11, phase: 'extend', activeLine: L('for (const bit of'), prefix: prefix + bit, answer: [...answer], message: `Append ${bit} to "${prefix}".` })
      extend(prefix + bit)
    }
  }
  extend('')
  frames.push({ pythonLine: 14, phase: 'done', activeLine: L('return answer'), prefix: '', answer: [...answer], message: `${answer.length} strings of length ${n} have no two adjacent zeros.` })
  return { input: n, result: answer, frames }
}

export const code = `function validBinaryStrings(n) {
  const answer = []
  const build = prefix => {
    if (prefix.length === n) {
      answer.push(prefix)
      return
    }
    for (const bit of ['0', '1']) {
      if (bit === '0' && prefix.endsWith('0')) continue
      build(prefix + bit)
    }
  }
  build('')
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def valid_strings(n):
    answer = []

    def extend(prefix):
        if len(prefix) == n:
            answer.append(prefix)
            return
        for bit in '01':
            if bit == '0' and prefix.endswith('0'):
                continue
            extend(prefix + bit)

    extend('')
    return answer
`
