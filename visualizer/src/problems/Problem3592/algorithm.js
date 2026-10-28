export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with numWays, for example {"numWays":[1,2,2,3,4]}.')
  const { numWays } = data
  if (!Array.isArray(numWays) || numWays.length < 1 || numWays.length > 10) throw new Error('numWays must have 1 to 10 entries.')
  if (numWays.some(x => !Number.isInteger(x) || x < 0 || x > 50)) throw new Error('Each count is an integer from 0 to 50.')
  return { numWays: [...numWays] }
}

export function buildTrace(input) {
  const { numWays } = input
  const n = numWays.length
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  const coins = []
  const frames = [{ phase: 'start', activeLine: L('set ways[0] to 1'), amount: 0, coins: [], message: 'With no coins, only the empty amount has one way.' }]
  for (let i = 1; i <= n; i++) {
    const need = numWays[i - 1] - ways[i]
    if (need < 0 || need > 1) {
      frames.push({ phase: 'done', activeLine: L('return an empty list'), amount: i, coins: [], message: `Amount ${i} needs ${numWays[i - 1]} ways, but the coins so far give ${ways[i]}. No coin can close that gap, so the answer is empty.` })
      return { input, result: [], frames }
    }
    if (need === 1) {
      coins.push(i)
      for (let a = i; a <= n; a++) ways[a] += ways[a - i]
      frames.push({ phase: 'coin', activeLine: L('add coin i'), amount: i, coins: [...coins], message: `Amount ${i} is short by one way, so coin ${i} is a denomination.` })
    } else {
      frames.push({ phase: 'match', activeLine: L('for each amount i from 1 to n'), amount: i, coins: [...coins], message: `Amount ${i} already has ${ways[i]} ways, so no coin is needed.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return coins'), amount: n, coins: [...coins], message: `The denominations are ${coins.join(', ') || 'none'}.` })
  return { input, result: coins, frames }
}

export const code = `inverse coin change (numWays)
  let n be the length of numWays
  set ways[0] to 1 and every other ways entry to 0
  set coins to an empty list
  for each amount i from 1 to n
    set need to numWays[i - 1] minus ways[i]
    if need is less than 0 or more than 1 then return an empty list
    if need is 1 then add coin i to coins and update ways for every amount from i up to n
  return coins`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def inverse_coin_change(numWays):
    n = len(numWays)
    ways = [0] * (n + 1)
    ways[0] = 1
    coins = []
    for i in range(1, n + 1):
        need = numWays[i - 1] - ways[i]
        if need < 0 or need > 1:
            return []
        if need == 1:
            coins.append(i)
            for a in range(i, n + 1):
                ways[a] += ways[a - i]
    return coins
`
