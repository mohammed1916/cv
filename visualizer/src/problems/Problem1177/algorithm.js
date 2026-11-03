export const phases = [
  { id: 'prefix', label: 'Parity masks', description: 'Build prefix masks: bit j is set when letter j has an odd count so far.' },
  { id: 'query', label: 'Check queries', description: 'XOR two prefix masks to get the odd letters of a substring, then compare the pair count with k.' },
  { id: 'done', label: 'Complete', description: 'Return one answer per query.' },
]

const CODE = [
  'function answerQueries(text, queries):',
  '  mask[0] = 0',
  '  for i from 0 to n - 1:',
  '    mask[i+1] = mask[i] XOR bit(text[i])',
  '  for [l, r, k] in queries:',
  '    odd = popcount(mask[r+1] XOR mask[l])',
  '    need = floor(odd / 2)',
  '    answers.append(need <= k)',
  '  return answers',
]
const PY = [
  'def answer_queries(text, queries):',
  '    mask = [0]',
  '    for ch in text:',
  '        mask.append(mask[-1] ^ (1 << (ord(ch) - 97)))',
  '    answers = []',
  '    for l, r, k in queries:',
  '        odd = bin(mask[r + 1] ^ mask[l]).count("1")',
  '        need = odd // 2',
  '        answers.append(need <= k)',
  '    return answers',
]

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')

const L = { prefix: 2, step: 4, query: 5, odd: 6, need: 7, answer: 8, ret: 9 }
const P = { prefix: 2, step: 4, query: 6, odd: 7, need: 8, answer: 9, ret: 10 }

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const bitOf = ch => 1 << (ch.charCodeAt(0) - 97)
const lettersOf = mask => [...ALPHABET].filter((_, bit) => (mask >> bit) & 1)

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"text": "abca", "queries": [[0, 3, 0]]}.') }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with text and queries.')
  const { text: word, queries } = input
  if (typeof word !== 'string' || !/^[a-z]{1,30}$/.test(word)) throw new Error('text must be 1 to 30 lowercase letters a to z.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('queries must hold 1 to 10 items.')
  queries.forEach((query, i) => {
    const [l, r, k] = Array.isArray(query) ? query : []
    const valid = [l, r, k].every(Number.isInteger) && l >= 0 && r >= l && r < word.length && k >= 0 && k <= word.length
    if (!valid) throw new Error(`Query ${i + 1} must be [left, right, k] with 0 ≤ left ≤ right < ${word.length} and k ≥ 0.`)
  })
  return { text: word, queries }
}

export function buildTrace({ text, queries }) {
  const frames = []
  const masks = [0]
  const answers = []
  const state = { text, index: null, letter: null, masks, query: null, letters: [], odd: null, need: null, k: null, answer: null, answers }
  const push = (phase, key, message) => frames.push({
    phase, activeLine: L[key], pythonLine: P[key], message,
    snapshot: { ...state, masks: [...masks], answers: [...answers], letters: [...state.letters] },
  })

  push('prefix', 'prefix', 'Start with mask 0: the empty prefix has no letter with an odd count.')
  for (let i = 0; i < text.length; i++) {
    masks.push(masks[i] ^ bitOf(text[i]))
    Object.assign(state, { index: i, letter: text[i] })
    push('prefix', 'step', `Toggle ${text[i]} at index ${i}. Its parity flips, and the mask is now ${masks[i + 1]}.`)
  }

  for (const [l, r, k] of queries) {
    const letters = lettersOf(masks[r + 1] ^ masks[l])
    const odd = letters.length
    const need = Math.floor(odd / 2)
    const answer = need <= k
    Object.assign(state, { query: [l, r, k], letters, odd, need: null, k, answer: null, index: null, letter: null })
    push('query', 'odd', `Substring ${l} to ${r}: ${odd} letter${odd === 1 ? '' : 's'} with an odd count${odd ? ` (${letters.join(', ')})` : ''}.`)
    Object.assign(state, { need })
    push('query', 'need', `One odd letter may stay in the center, so the rest must be paired. That takes ${need} replacement${need === 1 ? '' : 's'}.`)
    answers.push(answer)
    Object.assign(state, { answer, answers: [...answers] })
    push('query', 'answer', `${need} ≤ ${k}? ${answer ? 'Yes, so this substring can become a palindrome.' : 'No, so it cannot.'}`)
  }

  Object.assign(state, { query: null, letters: [], odd: null, need: null, k: null, answer: null })
  push('done', 'ret', `Answers in query order: ${answers.map(a => (a ? 'true' : 'false')).join(', ')}.`)
  return { input: { text, queries }, result: answers, frames }
}
