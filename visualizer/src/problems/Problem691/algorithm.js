export function parseInput(text) {
  const data = JSON.parse(text)
  const { stickers, target } = data ?? {}
  if (!Array.isArray(stickers) || stickers.length < 1 || stickers.length > 8 || stickers.some(s => typeof s !== 'string' || !/^[a-z]{1,10}$/.test(s))) throw new Error('stickers must be 1–8 lowercase words of 1–10 letters.')
  if (typeof target !== 'string' || !/^[a-z]{1,8}$/.test(target)) throw new Error('target must be 1–8 lowercase letters.')
  return { stickers, target }
}

// BFS over the remaining count of each distinct target letter. A sticker removes up to its own letter counts
// (extra letters are wasted); a state is reached once, so the first time all counts reach zero is the minimum.
export function buildTrace({ stickers, target }) {
  const letters = [...new Set(target)]
  const need = letters.map(ch => [...target].filter(c => c === ch).length)
  const stickerCounts = stickers.map(s => letters.map(ch => [...s].filter(c => c === ch).length))
  const key = s => s.join(',')
  const start = need
  const dist = new Map([[key(start), { count: 0, used: [] }]])
  const queue = [start]
  const frames = [{ phase: 'start', letters, remaining: [...need], used: [], result: null, activeLine: L('start the queue with the full need'), message: `Need ${letters.map((ch, i) => `${ch}×${need[i]}`).join(', ')}.` }]
  let answer = null
  for (let q = 0; q < queue.length && answer === null; q++) {
    const state = queue[q]
    const { count, used } = dist.get(key(state))
    for (let i = 0; i < stickers.length; i++) {
      const next = state.map((n, j) => Math.max(0, n - stickerCounts[i][j]))
      if (next.every((n, j) => n === state[j]) || dist.has(key(next))) continue
      const nextUsed = [...used, stickers[i]]
      dist.set(key(next), { count: count + 1, used: nextUsed })
      frames.push({ phase: 'apply', letters, remaining: [...next], used: nextUsed, sticker: stickers[i], result: null, activeLine: L('record next with one more sticker'), message: `Apply "${stickers[i]}": remaining ${letters.map((ch, j) => `${ch}×${next[j]}`).join(', ')}.` })
      if (next.every(n => n === 0)) {
        answer = count + 1
        frames.push({ phase: 'done', letters, remaining: [...next], used: nextUsed, result: answer, activeLine: L('if every remaining count is zero'), message: `Spelled with ${answer} stickers: ${nextUsed.join(', ')}.` })
        break
      }
      queue.push(next)
    }
  }
  if (answer === null) frames.push({ phase: 'done', letters, remaining: [...need], used: [], result: -1, activeLine: L('return -1'), message: 'The stickers cannot spell the target.' })
  return { input: { stickers, target }, result: answer ?? -1, letters, frames }
}

export const code = `letters = the distinct letters of target, and need = how many of each letter target requires
start the queue with the full need, at distance 0
while the queue is not empty
  take the next state of remaining counts from the front of the queue
  for each sticker
    next = remaining counts after the sticker covers as many needed letters as it has
    if next was already seen or did not change, skip it
    record next with one more sticker
    if every remaining count is zero, return that sticker count
    add next to the queue
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def min_stickers(stickers, target):
    letters = sorted(set(target))
    need = tuple(target.count(ch) for ch in letters)
    counts = [tuple(sticker.count(ch) for ch in letters) for sticker in stickers]
    dist = {need: 0}
    queue = deque([need])
    while queue:
        state = queue.popleft()
        for sticker_counts in counts:
            nxt = tuple(max(0, n - c) for n, c in zip(state, sticker_counts))
            if nxt in dist or nxt == state:
                continue
            dist[nxt] = dist[state] + 1
            if all(n == 0 for n in nxt):
                return dist[nxt]
            queue.append(nxt)
    return -1
`