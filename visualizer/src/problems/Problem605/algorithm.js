export function parseInput(text) {
  const data = JSON.parse(text)
  const { flowerbed, n } = data ?? {}
  if (!Array.isArray(flowerbed) || flowerbed.length < 1 || flowerbed.length > 20000 || flowerbed.some(v => v !== 0 && v !== 1)) throw new Error('flowerbed must be a JSON array of 1–20,000 values, each 0 or 1.')
  if (!Number.isInteger(n) || n < 0 || n > flowerbed.length) throw new Error('n must be an integer from 0 to the length of flowerbed.')
  if (flowerbed.some((v, i) => v === 1 && (flowerbed[i - 1] === 1 || flowerbed[i + 1] === 1))) throw new Error('flowerbed already has adjacent flowers, which the rules forbid.')
  return { flowerbed, n }
}

export function buildTrace({ flowerbed, n }) {
  const bed = [...flowerbed]
  let planted = 0
  const frames = [{ phase: 'start', index: -1, planted, need: n, bed: [...bed], activeLine: 2, message: `Plant greedily from the left; need ${n} flowers.` }]
  for (let i = 0; i < bed.length && planted < n; i++) {
    const free = bed[i] === 0 && bed[i - 1] !== 1 && bed[i + 1] !== 1
    if (free) {
      bed[i] = 1
      planted++
      frames.push({ phase: 'plant', index: i, planted, need: n, bed: [...bed], activeLine: 6, message: `Plot ${i} is free: plant here. Total ${planted}.` })
    } else {
      frames.push({ phase: 'skip', index: i, planted, need: n, bed: [...bed], activeLine: 4, message: `Plot ${i} is ${bed[i] === 1 ? 'taken' : 'next to a flower'}; skip it.` })
    }
  }
  const result = planted >= n
  frames.push({ phase: 'done', index: bed.length - 1, planted, need: n, bed: [...bed], result, activeLine: 8, message: result ? `Planted ${planted} ≥ ${n}: possible.` : `Only ${planted} fit: impossible.` })
  return { input: { flowerbed, n }, result, frames }
}

export const code = `def canPlaceFlowers(flowerbed, n):
    for i in range(len(flowerbed)):
        if n == 0: break
        if flowerbed[i] == 0 and (i == 0 or flowerbed[i-1] == 0) and (i + 1 == len(flowerbed) or flowerbed[i+1] == 0):
            flowerbed[i] = 1
            n -= 1
    return n == 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
