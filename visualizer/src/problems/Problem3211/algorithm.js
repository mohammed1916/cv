export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('Use an integer length from 1 to 8.')
  return n
}

export function buildTrace(n) {
  const answer = []
  const frames = [{ phase: 'start', activeLine: L('start with the empty prefix'), prefix: '', answer: [...answer], message: 'Start with the empty string and try to extend it one bit at a time.' }]
  const extend = prefix => {
    if (prefix.length === n) {
      answer.push(prefix)
      frames.push({ phase: 'emit', activeLine: L('add it to the answer'), prefix, answer: [...answer], message: `"${prefix}" has length ${n} and no two adjacent zeros, so it joins the answer.` })
      return
    }
    for (const bit of ['0', '1']) {
      if (bit === '0' && prefix.endsWith('0')) {
        frames.push({ phase: 'skip', activeLine: L('skip a 0'), prefix: prefix + bit, answer: [...answer], message: `Appending 0 to "${prefix}" would make two adjacent zeros, so skip it.` })
        continue
      }
      frames.push({ phase: 'extend', activeLine: L('try appending each bit'), prefix: prefix + bit, answer: [...answer], message: `Append ${bit} to "${prefix}".` })
      extend(prefix + bit)
    }
  }
  extend('')
  frames.push({ phase: 'done', activeLine: L('return the answer'), prefix: '', answer: [...answer], message: `${answer.length} strings of length ${n} have no two adjacent zeros.` })
  return { input: n, result: answer, frames }
}

export const code = `binary strings of length n with no two adjacent zeros:
  start with the empty prefix
  when the prefix has length n, add it to the answer
  otherwise try appending each bit in order, 0 then 1
    skip a 0 when the prefix already ends in 0
    otherwise repeat this step with the longer prefix
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
