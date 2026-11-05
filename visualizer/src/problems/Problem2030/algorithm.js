export const phases = [
  { id: 'start', label: 'Targets', description: 'Count the required letter in s and set the number of letters still needed.' },
  { id: 'position', label: 'Next position', description: 'Each answer position takes the smallest letter whose earliest remaining copy still leaves a valid completion.' },
  { id: 'pick', label: 'Pick letter', description: 'Choosing that copy leaves enough characters after it for the rest of the answer and the required letters.' },
  { id: 'done', label: 'Result', description: 'Return the k-length answer.' },
]

export const code = `function smallestSubsequence(s, k, letter, repetition) {
  const n = s.length
  const countIn = text => text.split(letter).length - 1
  const answer = []
  let prev = -1
  let picked = 0
  for (let len = 0; len < k; len++) {
    let placed = false
    for (let c = 97; c <= 122 && !placed; c++) {
      const ch = String.fromCharCode(c)
      const j = s.indexOf(ch, prev + 1)
      if (j === -1) continue
      const left = k - len - 1
      const pickedAfter = picked + (ch === letter ? 1 : 0)
      const need = Math.max(0, repetition - pickedAfter)
      if (left <= n - j - 1 && need <= countIn(s.slice(j + 1)) && need <= left) {
        answer.push(ch)
        prev = j
        picked = pickedAfter
        placed = true
      }
    }
  }
  return answer.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_subsequence(s, k, letter, repetition):
    n = len(s)
    answer = []
    prev = -1
    picked = 0
    for length in range(k):
        placed = False
        for code in range(97, 123):
            if placed:
                break
            ch = chr(code)
            j = s.find(ch, prev + 1)
            if j == -1:
                continue
            left = k - length - 1
            picked_after = picked + (1 if ch == letter else 0)
            need = max(0, repetition - picked_after)
            if left <= n - j - 1 and need <= s[j + 1:].count(letter) and need <= left:
                answer.append(ch)
                prev = j
                picked = picked_after
                placed = True
    return ''.join(answer)
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"leet","k":3,"letter":"e","repetition":1}.') }
  const { s, k, letter, repetition } = obj || {}
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z]+$/.test(s)) throw new Error('s must be 1 to 30 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error('k must be from 1 to the length of s.')
  if (typeof letter !== 'string' || !/^[a-z]$/.test(letter)) throw new Error('letter must be one lowercase letter.')
  if (!Number.isInteger(repetition) || repetition < 0 || repetition > k) throw new Error('repetition must be from 0 to k.')
  if (s.split(letter).length - 1 < repetition) throw new Error('s must contain the letter at least repetition times.')
  return { s, k, letter, repetition }
}

export function buildTrace({ s, k, letter, repetition }) {
  const frames = []
  const n = s.length
  const answer = []
  let prev = -1
  let picked = 0
  const countIn = text => text.split(letter).length - 1
  const add = (phase, c, p, message, ch, j) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { s, k, letter, repetition, answer: answer.slice(), prev, j, ch, picked },
  })
  add('start', 'const countIn', 'def', `Need ${repetition} copies of ${letter} in an answer of length ${k}.`, null, -1)
  for (let len = 0; len < k; len++) {
    let placed = false
    for (let code = 97; code <= 122 && !placed; code++) {
      const ch = String.fromCharCode(code)
      const j = s.indexOf(ch, prev + 1)
      if (j === -1) continue
      const left = k - len - 1
      const pickedAfter = picked + (ch === letter ? 1 : 0)
      const need = Math.max(0, repetition - pickedAfter)
      if (left <= n - j - 1 && need <= countIn(s.slice(j + 1)) && need <= left) {
        answer.push(ch)
        prev = j
        picked = pickedAfter
        placed = true
        add('pick', 'answer.push(ch)', 'answer.append(ch)', `Position ${len}: take ${ch} at index ${j}; ${need} ${letter} still needed.`, ch, j)
      }
    }
    add('position', 'for (let c = 97', 'for code in range(97', `Position ${len} chosen.`, placed ? answer[answer.length - 1] : null, prev)
  }
  add('done', 'return answer.join', "return ''.join", `Answer: ${answer.join('')}.`, null, prev)
  return { input: { s, k, letter, repetition }, result: answer.join(''), frames }
}
