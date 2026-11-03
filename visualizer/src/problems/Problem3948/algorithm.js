export const code = `build the answer from the front
set p to 0
while p is inside the array
  set target to the mex of the remaining values
  empty seen and set e to p
  add a[e] to seen
  if seen holds every value below target, stop extending
  otherwise move e one step right
  append target to the answer
  set p to e plus one
return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def lex_max_mex_array(a):
    def mex(values):
        seen = set(values)
        m = 0
        while m in seen:
            m += 1
        return m

    answer = []
    p = 0
    while p < len(a):
        target = mex(a[p:])
        seen = set()
        e = p
        while True:
            seen.add(a[e])
            if all(v in seen for v in range(target)):
                break
            e += 1
        answer.append(target)
        p = e + 1
    return answer
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 12) throw new Error('Use a JSON array of 1 to 12 values.')
  if (!values.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('Each value is an integer from 0 to 20.')
  return values
}

function mexOf(values) {
  const seen = new Set(values)
  let m = 0
  while (seen.has(m)) m++
  return m
}

export function buildTrace(a) {
  const frames = []
  const answer = []
  let p = 0
  const push = (phase, codeText, pyText, state, message) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), ...state, answer: [...answer], message,
  })
  push('start', 'build the answer from the front', 'answer = []', { e: -1, target: null, seen: [] }, 'Start at index 0 with an empty answer.')
  while (p < a.length) {
    const target = mexOf(a.slice(p))
    push('suffix', 'set target to the mex', 'target = mex', { p, e: p, target, seen: [] }, `The remaining values from index ${p} have mex ${target}. The next segment must collect 0 to ${target - 1}.`)
    const seen = new Set()
    let e = p
    for (;;) {
      seen.add(a[e])
      const covered = Array.from({ length: target }, (_, v) => v).every(v => seen.has(v))
      push('extend', 'add a[e] to seen', 'seen.add(a[e])', { p, e, target, seen: [...seen], covered }, covered
        ? `Segment ${p} to ${e} holds every value below ${target}, so its mex is ${target}.`
        : `Segment ${p} to ${e} still misses a value below ${target}; extend it.`)
      if (covered) break
      e++
    }
    answer.push(target)
    push('cut', 'append target to the answer', 'answer.append(target)', { p, e, target, seen: [...seen], covered: true }, `Cut after index ${e}. Segment mex ${target} is the next answer value.`)
    p = e + 1
  }
  push('done', 'return the answer', 'return answer', { p, e: -1, target: null, seen: [] }, `Lexicographically greatest answer: [${answer.join(', ')}].`)
  return { input: a, result: answer, frames }
}
