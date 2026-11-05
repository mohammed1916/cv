export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.pref)) throw new Error('Use an object such as {"pref":[5,2,0,3,1]}.')
  const { pref } = data
  if (pref.length < 1 || pref.length > 12) throw new Error('pref has 1 to 12 entries.')
  if (!pref.every(v => Number.isInteger(v) && v >= 0 && v <= 15)) throw new Error('Values are integers from 0 to 15 in this visualization.')
  return { pref }
}

export function buildTrace({ pref }) {
  const answer = []
  const frames = [{ phase: 'start', pythonLine: P('answer = []'), activeLine: L('set answer to an empty list'), index: -1, answer: [], message: 'Each prefix xor is the previous prefix xor with one new value folded in, so xoring neighbors recovers the value.' }]
  for (let i = 0; i < pref.length; i++) {
    const value = i === 0 ? pref[0] : pref[i] ^ pref[i - 1]
    answer.push(value)
    frames.push({ phase: 'restore', pythonLine: (i === 0 ? P('answer.append(pref[0])') : P('answer.append(pref[i] ^ pref[i - 1])')), activeLine: i === 0 ? L('if i is 0') : L('otherwise pref[i] xor'), index: i, answer: [...answer], message: i === 0 ? `The first value equals the first prefix: ${value}.` : `pref[${i}] xor pref[${i - 1}] = ${pref[i]} xor ${pref[i - 1]} = ${value}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return answer'), activeLine: L('return answer'), index: -1, answer: [...answer], message: `Original array: [${answer.join(', ')}].` })
  return { input: { pref }, result: answer, frames }
}

export const code = `function restoreArray(pref) {
  const answer = [] // set answer to an empty list
  for (let i = 0; i < pref.length; i++) {
    // if i is 0 the value is pref[0]; otherwise pref[i] xor pref[i - 1]
    const value = i === 0 ? pref[0] : pref[i] ^ pref[i - 1]
    answer.push(value)
  }
  return answer // return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def restore_array(pref):
    answer = []
    for i in range(len(pref)):
        if i == 0:
            answer.append(pref[0])
        else:
            answer.append(pref[i] ^ pref[i - 1])
    return answer


const P = (s, n = 1) => { let c = 0; return python.split('\n').findIndex(l => l.includes(s) && ++c === n) + 1 }
`
