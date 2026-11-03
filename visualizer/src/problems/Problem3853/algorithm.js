export const code = [
  'current starts as s',
  'repeat while a merge is possible',
  'find the close equal pair with the smallest left index, then the smallest right index',
  'if there is no such pair then stop',
  'remove the right character of that pair',
  'return the current string',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 16 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 16 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const cur = [...s]
  const frames = [{ cur: cur.join(''), pair: null, phase: 'setup', activeLine: L('current starts'), message: `Start with ${cur.join('')}.` }]
  for (;;) {
    let pair = null
    outer: for (let i = 0; i < cur.length; i++) {
      for (let j = i + 1; j < cur.length; j++) {
        if (cur[i] === cur[j] && j - i <= k) { pair = [i, j]; break outer }
      }
    }
    if (!pair) {
      frames.push({ cur: cur.join(''), pair: null, phase: 'done', activeLine: L('if there is no such pair'), message: 'No close equal pair is left.' })
      break
    }
    frames.push({ cur: cur.join(''), pair, phase: 'pair', activeLine: L('find the close equal pair'), message: `Characters ${cur[pair[0]]} at ${pair[0]} and ${cur[pair[1]]} at ${pair[1]} are close.` })
    cur.splice(pair[1], 1)
    frames.push({ cur: cur.join(''), pair: null, phase: 'merge', activeLine: L('remove the right character'), message: `Right one merged into the left; now ${cur.join('')}.` })
  }
  const result = cur.join('')
  frames.push({ cur: result, pair: null, phase: 'done', activeLine: L('return the current string'), message: `Result ${result}.` })
  return { input: { s, k }, result, frames }
}

export const python = `def merge_close_characters(s, k):
    cur = list(s)
    while True:
        pair = None
        for i in range(len(cur)):
            for j in range(i + 1, len(cur)):
                if cur[i] == cur[j] and j - i <= k:
                    pair = (i, j)
                    break
            if pair:
                break
        if pair is None:
            break
        del cur[pair[1]]
    return ''.join(cur)`
