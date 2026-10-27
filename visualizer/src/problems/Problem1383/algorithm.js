export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, speed, efficiency, k } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('"n" is an integer from 1 to 8 in this visualization.')
  if (!Array.isArray(speed) || speed.length !== n) throw new Error('"speed" needs one value per engineer.')
  if (!Array.isArray(efficiency) || efficiency.length !== n) throw new Error('"efficiency" needs one value per engineer.')
  if ([...speed, ...efficiency].some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Speeds and efficiencies are integers from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > n) throw new Error('"k" is an integer from 1 to n.')
  return { n, speed, efficiency, k }
}

export function buildTrace({ n, speed, efficiency, k }) {
  const MOD = 1000000007
  const order = speed.map((_, i) => i).sort((a, b) => efficiency[b] - efficiency[a] || speed[b] - speed[a] || a - b)
  const team = []
  let total = 0
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), current: -1, team: [], removed: -1, total, best, message: 'Engineers are visited from the highest efficiency down.' }]
  for (const i of order) {
    team.push(i)
    total += speed[i]
    let removed = -1
    if (team.length > k) {
      let at = 0
      for (let j = 1; j < team.length; j++) if (speed[team[j]] < speed[team[at]]) at = j
      removed = team[at]
      total -= speed[removed]
      team.splice(at, 1)
    }
    best = Math.max(best, total * efficiency[i])
    frames.push({ phase: 'consider', activeLine: L('add the engineer'), current: i, team: [...team], removed, total, best, message: `Engineer ${i} (efficiency ${efficiency[i]}) joins. Team speed sum ${total}, best ${best}.` })
  }
  const result = best % MOD
  frames.push({ phase: 'done', activeLine: L('return best modulo'), current: -1, team: [...team], removed: -1, total, best, message: `Maximum performance: ${result}.` })
  return { input: { n, speed, efficiency, k }, result, frames }
}

export const code = `maximum performance of a team of at most k engineers, given speed and efficiency
  sort engineers by efficiency, highest first
  set best to 0, and set the team total to 0
  keep a min heap of the speeds of the team
  for each engineer in that order
    add the engineer speed to the heap and to the total
    if the heap holds more than k speeds then remove the smallest speed from the total
    set best to the larger of best and total times this engineer efficiency
  return best modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def max_performance(n, speed, efficiency, k):
    MOD = 10 ** 9 + 7
    engineers = sorted(zip(efficiency, speed), reverse=True)
    heap = []
    total = 0
    best = 0
    for eff, sp in engineers:
        heapq.heappush(heap, sp)
        total += sp
        if len(heap) > k:
            total -= heapq.heappop(heap)
        best = max(best, total * eff)
    return best % MOD
`
