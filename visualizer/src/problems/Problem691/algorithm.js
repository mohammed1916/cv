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
  const frames = [{ phase: 'start', letters, remaining: [...need], used: [], result: null, activeLine: 2, message: `Need ${letters.map((ch, i) => `${ch}×${need[i]}`).join(', ')}.` }]
  let answer = null
  for (let q = 0; q < queue.length && answer === null; q++) {
    const state = queue[q]
    const { count, used } = dist.get(key(state))
    for (let i = 0; i < stickers.length; i++) {
      const next = state.map((n, j) => Math.max(0, n - stickerCounts[i][j]))
      if (next.every((n, j) => n === state[j]) || dist.has(key(next))) continue
      const nextUsed = [...used, stickers[i]]
      dist.set(key(next), { count: count + 1, used: nextUsed })
      frames.push({ phase: 'apply', letters, remaining: [...next], used: nextUsed, sticker: stickers[i], result: null, activeLine: 6, message: `Apply "${stickers[i]}": remaining ${letters.map((ch, j) => `${ch}×${next[j]}`).join(', ')}.` })
      if (next.every(n => n === 0)) {
        answer = count + 1
        frames.push({ phase: 'done', letters, remaining: [...next], used: nextUsed, result: answer, activeLine: 9, message: `Spelled with ${answer} stickers: ${nextUsed.join(', ')}.` })
        break
      }
      queue.push(next)
    }
  }
  if (answer === null) frames.push({ phase: 'done', letters, remaining: [...need], used: [], result: -1, activeLine: 9, message: 'The stickers cannot spell the target.' })
  return { input: { stickers, target }, result: answer ?? -1, letters, frames }
}

export const code = `def minStickers(stickers, target):
    # BFS over remaining letter counts; each sticker removes at most its own letters.
    ...
    return steps if all counts are zero else -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
