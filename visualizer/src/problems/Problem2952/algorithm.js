export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with coins and target.')
  const { coins, target } = data
  if (!Array.isArray(coins) || coins.length < 1 || coins.length > 8) throw new Error('coins must have 1 to 8 entries.')
  if (coins.some(v => !Number.isInteger(v) || v < 1 || v > 60)) throw new Error('Coin values are integers from 1 to 60.')
  if (!Number.isInteger(target) || target < 1 || target > 60) throw new Error('target is an integer from 1 to 60.')
  return { coins, target }
}

export function buildTrace(input) {
  const coins = [...input.coins].sort((a, b) => a - b)
  const { target } = input
  let reach = 0
  let next = 0
  const added = []
  const frames = [{ phase: 'start', activeLine: L('sort the coins'), index: -1, next, reach, added: [], message: 'Every sum from 1 to reach can be made. Start with reach at zero.' }]
  while (reach < target) {
    if (next < coins.length && coins[next] <= reach + 1) {
      reach += coins[next]
      next += 1
      frames.push({ phase: 'use', activeLine: L('use that coin'), index: next - 1, next, reach, added: [...added], message: `Coin ${coins[next - 1]} fits, so sums up to ${reach} are reachable.` })
    } else {
      const coin = reach + 1
      added.push(coin)
      reach += coin
      frames.push({ phase: 'add', activeLine: L('add a coin of value'), index: -1, next, reach, added: [...added], message: `No coin fits, so add ${coin}. Sums up to ${reach} are reachable.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return added'), index: -1, next, reach, added: [...added], message: `Coins to add: ${added.length}.` })
  return { input, result: added.length, frames }
}

export const code = `minimum coins to add so every value up to target is reachable:
  sort the coins from smallest to largest
  set reach to zero, meaning every sum from 1 to reach can be made
  set added to zero
  while reach is less than target
    if the next coin is at most reach plus one then
      use that coin and add its value to reach
    otherwise
      add a coin of value reach plus one and add it to reach
      increase added by one
  return added`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_coins_to_add(coins, target):
    cs = sorted(coins)
    reach = 0
    added = 0
    i = 0
    while reach < target:
        if i < len(cs) and cs[i] <= reach + 1:
            reach += cs[i]
            i += 1
        else:
            reach += reach + 1
            added += 1
    return added
`
