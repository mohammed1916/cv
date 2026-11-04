export const phases = [
  { id: 'start', label: 'Start', description: 'An empty prefix needs no operations.' },
  { id: 'end', label: 'Prefix', description: 'Choose the next prefix length to solve.' },
  { id: 'plain', label: 'As is', description: 'Price the last piece without reversing it.' },
  { id: 'flip', label: 'Reversed', description: 'Price the same piece after paying one reverse.' },
  { id: 'relax', label: 'Compare', description: 'Keep this cut if it gives the cheapest prefix.' },
  { id: 'trace', label: 'Walk back', description: 'Follow the winning cuts from the end to the start.' },
  { id: 'done', label: 'Result', description: 'Report the cost of the whole word.' },
]

const MAX_LENGTH = 12

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with word1 and word2.')
  const { word1, word2 } = input
  for (const word of [word1, word2]) {
    if (typeof word !== 'string' || !/^[a-z]+$/.test(word)) throw new Error('word1 and word2 use lowercase letters only.')
    if (word.length > MAX_LENGTH) throw new Error(`The visualization takes words of up to ${MAX_LENGTH} letters.`)
  }
  if (word1.length !== word2.length) throw new Error('word1 and word2 must have the same length.')
  return { word1, word2 }
}

export const code = `fewest operations to turn word1 into word2
  to price a piece: walk its positions in order
    a matching letter costs nothing
    a wrong letter that undoes an earlier open mismatch joins it as one swap
    any other wrong letter opens a mismatch and costs 1
  dp[0] = 0
  for each prefix length end
    for each start of the last piece
      price the piece as it stands
      price the piece reversed, plus 1 for the reverse
      dp[end] = smallest of dp[start] + cheaper of the two
  return dp[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter
from math import inf


def min_operations(word1, word2):
    def price(have, want):
        open_pairs = Counter()
        cost = 0
        for a, b in zip(have, want):
            if a == b:
                continue
            if open_pairs[(b, a)] > 0:
                open_pairs[(b, a)] -= 1
            else:
                open_pairs[(a, b)] += 1
                cost += 1
        return cost

    n = len(word1)
    dp = [0] + [inf] * n
    for end in range(1, n + 1):
        for start in range(end):
            have, want = word1[start:end], word2[start:end]
            plain = price(have, want)
            flipped = 1 + price(have[::-1], want)
            dp[end] = min(dp[end], dp[start] + min(plain, flipped))
    return dp[n]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Pseudocode line missing: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.trim().split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line missing: ${text}`)
  return index + 1
}

// Lines the letters up and labels every position: match, swap partner or replace.
export function alignPiece(have, want) {
  const cells = [...have].map((letter, p) => ({ have: letter, want: want[p], kind: 'match', partner: null }))
  const open = new Map()
  const swaps = []
  const replaces = []
  let cost = 0
  cells.forEach((cell, p) => {
    if (cell.have === cell.want) return
    const waiting = open.get(cell.want + cell.have)
    if (waiting?.length) {
      const q = waiting.shift()
      cell.kind = 'swap'
      cell.partner = q
      cells[q].kind = 'swap'
      cells[q].partner = p
      swaps.push([q, p])
    } else {
      const key = cell.have + cell.want
      if (!open.has(key)) open.set(key, [])
      open.get(key).push(p)
      cell.kind = 'replace'
      cost++
    }
  })
  cells.forEach((cell, p) => { if (cell.kind === 'replace') replaces.push(p) })
  return { cells, cost, swaps, replaces }
}

const reversed = text => [...text].reverse().join('')

export function buildTrace({ word1, word2 }) {
  const n = word1.length
  const dp = [0, ...Array(n).fill(null)]
  const choice = Array(n + 1).fill(null)
  const frames = []
  let candidates = []
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, n,
    dp: [...dp], end: null, start: null, align: null, reversedPiece: false, candidates: candidates.map(c => ({ ...c })), plan: null, ...extra,
  })

  emit('start', L('dp[0] = 0'), P('dp = [0]'), 'dp[i] will hold the fewest operations for the first i letters. No letters need no work.', { end: 0 })
  for (let end = 1; end <= n; end++) {
    candidates = []
    emit('end', L('for each prefix length'), P('for end in range'), `Solve the first ${end} letter${end === 1 ? '' : 's'}: try every place the last piece could begin.`, { end })
    for (let start = 0; start < end; start++) {
      const have = word1.slice(start, end), want = word2.slice(start, end)
      const plain = alignPiece(have, want)
      emit('plain', L('price the piece as it stands'), P('plain = price'), `"${have}" to "${want}" as it stands: ${describe(plain)}.`, { end, start, align: plain })
      const flipped = alignPiece(reversed(have), want)
      emit('flip', L('price the piece reversed'), P('flipped = 1 + price'), `Reverse "${have}" to "${reversed(have)}" for 1, then ${describe(flipped)}. Total ${flipped.cost + 1}.`, { end, start, align: flipped, reversedPiece: true })
      const useFlip = flipped.cost + 1 < plain.cost
      const piece = useFlip ? flipped.cost + 1 : plain.cost
      const total = dp[start] + piece
      const improved = dp[end] === null || total < dp[end]
      if (improved) {
        dp[end] = total
        choice[end] = { start, useFlip, align: useFlip ? flipped : plain, have, want, cost: piece }
      }
      candidates.push({ start, piece: `"${have}"`, 'as is': plain.cost, 'reversed + 1': flipped.cost + 1, 'dp[start] + piece': total, keep: improved ? 'best so far' : '' })
      emit('relax', L('dp[end] = smallest'), P('dp[end] = min'), improved
        ? `dp[${start}] + ${piece} = ${total} is the best way to reach ${end} so far, so dp[${end}] = ${total}.`
        : `dp[${start}] + ${piece} = ${total} does not beat dp[${end}] = ${dp[end]}.`, { end, start, align: useFlip ? flipped : plain, reversedPiece: useFlip })
    }
  }

  const plan = []
  candidates = []
  for (let at = n; at > 0; at = choice[at].start) {
    const c = choice[at]
    plan.unshift({ start: c.start, end: at, have: c.have, want: c.want, reversed: c.useFlip, cost: c.cost, cells: c.align.cells, swaps: c.align.swaps, replaces: c.align.replaces })
    emit('trace', L('dp[end] = smallest'), P('dp[end] = min'), `dp[${at}] came from a piece starting at ${c.start}: "${c.have}" to "${c.want}" for ${c.cost}.`, { end: at, start: c.start, align: c.align, reversedPiece: c.useFlip, plan: plan.map(p => ({ ...p })) })
  }
  const result = dp[n]
  emit('done', L('return dp[n]'), P('return dp[n]'), `Return ${result}, using ${plan.length} piece${plan.length === 1 ? '' : 's'}.`, { end: n, plan })
  return { input: { word1, word2 }, result, plan, frames }
}

function describe({ cost, swaps, replaces }) {
  const parts = []
  if (swaps.length) parts.push(`${swaps.length} swap${swaps.length === 1 ? '' : 's'}`)
  if (replaces.length) parts.push(`${replaces.length} replace${replaces.length === 1 ? '' : 's'}`)
  return parts.length ? `${parts.join(' and ')}, cost ${cost}` : 'every letter already matches, cost 0'
}
