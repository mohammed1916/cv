export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with reward1, reward2 and k.')
  const { reward1, reward2, k } = data
  if (!Array.isArray(reward1) || !Array.isArray(reward2) || reward1.length !== reward2.length || reward1.length < 1 || reward1.length > 12) throw new Error('reward1 and reward2 must be equal-length arrays of 1 to 12 entries.')
  if ([...reward1, ...reward2].some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Rewards are integers from 1 to 1000.')
  if (!Number.isInteger(k) || k < 0 || k > reward1.length) throw new Error('k must be an integer from 0 to the number of cheese types.')
  return { reward1, reward2, k }
}

export function buildTrace(input) {
  const { reward1, reward2, k } = input
  const order = reward1.map((_, i) => i).sort((a, b) => (reward2[a] - reward1[a]) - (reward2[b] - reward1[b]))
  const assign = reward1.map(() => null)
  let total = 0
  let taken = 0
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), index: -1, assign: [...assign], total, message: 'Sort cheese types by how much more the first mouse gains than the second mouse.' }]
  frames[0].message = 'Sort cheese types by how much more the first mouse gains than the second mouse.'
  for (const i of order) {
    if (taken < k) {
      total += reward1[i]
      taken += 1
      assign[i] = 'first'
      frames.push({ phase: 'first', activeLine: L('give it to the first mouse'), index: i, assign: [...assign], total, message: `Cheese ${i} goes to the first mouse for ${reward1[i]} points. Total ${total}.` })
    } else {
      total += reward2[i]
      assign[i] = 'second'
      frames.push({ phase: 'second', activeLine: L('give it to the second mouse'), index: i, assign: [...assign], total, message: `Cheese ${i} goes to the second mouse for ${reward2[i]} points. Total ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, assign: [...assign], total, message: `Maximum points: ${total}.` })
  return { input, result: total, frames }
}

export const code = `maximum points for both mice:
  set total to zero
  sort the cheese types by reward2 minus reward1, smallest first
  for each cheese type in that order
    if the first mouse has taken fewer than k types then
      give it to the first mouse and add its reward1 to total
    otherwise
      give it to the second mouse and add its reward2 to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def mice_and_cheese(reward1, reward2, k):
    order = sorted(range(len(reward1)), key=lambda i: reward2[i] - reward1[i])
    total = 0
    taken = 0
    for i in order:
        if taken < k:
            total += reward1[i]
            taken += 1
        else:
            total += reward2[i]
    return total
`
