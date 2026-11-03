export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with order and friends.')
  const { order, friends } = input
  if (!Array.isArray(order) || order.length < 1 || order.length > 12) throw new Error('order is a list of 1 to 12 IDs (the visualization caps it at 12).')
  const n = order.length
  if (new Set(order).size !== n || order.some(v => !Number.isInteger(v) || v < 1 || v > n)) throw new Error('order needs one distinct ID per position, each from 1 to n.')
  if (!Array.isArray(friends) || friends.length < 1 || friends.length > Math.min(8, n)) throw new Error('friends has 1 to min(8, n) IDs.')
  if (friends.some((v, i) => !Number.isInteger(v) || v < 1 || v > n || (i > 0 && v <= friends[i - 1]))) throw new Error('friends is a strictly increasing list of IDs from 1 to n.')
  return { order, friends }
}

export function buildTrace({ order, friends }) {
  const mine = new Set(friends)
  const answer = []
  const frames = []
  frames.push({ pythonLine: P('mine = set'), phase: 'start', activeLine: L('mark each friend'), index: -1, id: null, kept: [], message: `Mark ${friends.length} friend IDs.` })
  order.forEach((id, i) => {
    const hit = mine.has(id)
    if (hit) answer.push(id)
    frames.push({
      pythonLine: P(hit ? 'answer.append' : 'if participant in mine'), phase: hit ? 'keep' : 'skip', activeLine: L(hit ? 'append it' : 'if the participant'),
      index: i, id, kept: [...answer], message: hit ? `Participant ${id} is a friend, so it is kept.` : `Participant ${id} is not a friend.`,
    })
  })
  frames.push({ pythonLine: P('return answer'), phase: 'done', activeLine: L('return the answer'), index: -1, id: null, kept: [...answer], message: `Friends in finishing order: ${answer.join(', ')}.` })
  return { input: { order, friends }, result: answer, frames }
}

export const code = `return the friends' IDs in finishing order
mark each friend ID in a set
set an empty answer list
for each participant in finishing order
  if the participant is a friend, append it to the answer
return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def restore_finishing_order(order, friends):
    mine = set(friends)
    answer = []
    for participant in order:
        if participant in mine:
            answer.append(participant)
    return answer
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
