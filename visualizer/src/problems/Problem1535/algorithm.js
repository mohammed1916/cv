export const phases = [
  { id: 'start', label: 'Start', description: 'The first element is champion with no wins. The rest wait in the line.' },
  { id: 'stay', label: 'Champion stays', description: 'The champion is larger, so it wins this duel and the challenger goes to the back of the line.' },
  { id: 'replace', label: 'New champion', description: 'The challenger is larger, so it takes over with one win and the old champion goes to the back.' },
  { id: 'done', label: 'Winner', description: 'The champion has k wins in a row.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [2, 9, 4], "k": 1}.')
  const { arr, k } = input
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 12 || !arr.every(v => Number.isInteger(v) && v >= 1 && v <= 99)) throw new Error('arr is a list of 2 to 12 integers from 1 to 99.')
  if (new Set(arr).size !== arr.length) throw new Error('arr values must be distinct.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { arr, k }
}

export const code = `find the winner (arr, k):
  champion = arr[0]
  wins = 0
  queue = the rest of arr, in order
  repeat:
    challenger = front of queue, removed
    if champion > challenger:
      wins = wins + 1
      add challenger to the back of queue
    else:
      add champion to the back of queue
      champion = challenger
      wins = 1
    if wins == k:
      return champion`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def find_winner(arr, k):
    champion = arr[0]
    wins = 0
    queue = deque(arr[1:])
    while True:
        challenger = queue.popleft()
        if champion > challenger:
            wins += 1
            queue.append(challenger)
        else:
            queue.append(champion)
            champion = challenger
            wins = 1
        if wins == k:
            return champion
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace({ arr, k }) {
  const frames = []
  let champion = arr[0]
  let wins = 0
  const queue = arr.slice(1)
  const snap = (challenger, outcome) => ({ champion, wins, k, queue: [...queue], challenger, outcome })
  frames.push({ phase: 'start', ...at('champion = arr[0]', 'champion = arr[0]'), message: `${champion} is champion with 0 wins. The line is ${queue.join(', ')}. The first to reach ${k} wins in a row takes the prize.`, snapshot: snap(null, null) })
  for (;;) {
    const challenger = queue.shift()
    if (champion > challenger) {
      wins += 1
      queue.push(challenger)
      frames.push({ phase: 'stay', ...at('if champion > challenger', 'if champion > challenger'), message: `${champion} beats ${challenger}. Wins in a row: ${wins} of ${k}. ${challenger} goes to the back.`, snapshot: snap(challenger, 'stay') })
    } else {
      const old = champion
      queue.push(champion)
      champion = challenger
      wins = 1
      frames.push({ phase: 'replace', ...at('champion = challenger', 'champion = challenger'), message: `${challenger} beats ${old}. ${challenger} is the new champion with 1 win. ${old} goes to the back.`, snapshot: snap(challenger, 'replace') })
    }
    if (wins === k) {
      frames.push({ phase: 'done', ...at('return champion', 'return champion'), message: `${champion} has ${k} wins in a row, so it is the winner.`, snapshot: snap(null, null) })
      break
    }
  }
  return { input: { arr, k }, result: champion, frames }
}
