export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 10) throw new Error('Enter 1 to 10 reward values.')
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Each reward value is an integer from 1 to 50.')
  return values
}

export function buildTrace(values) {
  const reach = new Set([0])
  const distinct = [...new Set(values)].sort((a, b) => a - b)
  const frames = [{ phase: 'start', value: null, reach: [...reach], added: [], total: 0, activeLine: L('set reachable to'), message: 'Start with total 0 reachable. Rewards are taken in increasing order.' }]
  for (const v of distinct) {
    // Only totals below v can take v next; read them before adding new totals.
    const added = [...reach].filter(s => s < v).map(s => s + v).filter(t => !reach.has(t))
    for (const t of added) reach.add(t)
    frames.push({ phase: 'value', value: v, reach: [...reach].sort((a, b) => a - b), added: added.sort((a, b) => a - b), total: Math.max(...reach), activeLine: L('add total s plus v'), message: added.length ? `Reward ${v} extends totals below it: ${added.join(', ')} become reachable.` : `Reward ${v} extends nothing new.` })
  }
  const result = Math.max(...reach)
  frames.push({ phase: 'done', value: null, reach: [...reach].sort((a, b) => a - b), added: [], total: result, activeLine: L('return the largest'), message: `Largest reachable total: ${result}.` })
  return { input: values, result, frames }
}

export const code = `maximum final total from the reward values
  set reachable to {0}
  for each distinct reward v in increasing order
    for each total s reachable before v with s less than v
      add total s plus v to reachable
  return the largest reachable total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_total_reward(reward_values):
    reach = {0}
    for v in sorted(set(reward_values)):
        reach |= {s + v for s in reach if s < v}
    return max(reach)
`
