export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with "messages" and "senders".')
  const { messages, senders } = data
  if (!Array.isArray(messages) || !Array.isArray(senders) || messages.length < 1 || messages.length > 8) throw new Error('"messages" and "senders" are arrays of 1 to 8 entries.')
  if (messages.length !== senders.length) throw new Error('"messages" and "senders" must have the same length.')
  if (messages.some(m => typeof m !== 'string' || !/^[A-Za-z]+( [A-Za-z]+)*$/.test(m))) throw new Error('Each message is words of letters separated by single spaces.')
  if (senders.some(s => typeof s !== 'string' || !/^[A-Za-z]+$/.test(s))) throw new Error('Each sender is a name of letters.')
  return { messages, senders }
}

export function buildTrace({ messages, senders }) {
  const totals = new Map()
  const frames = [{ phase: 'start', activeLine: L('totals = empty map'), index: -1, totals: {}, best: null, message: 'Nobody has sent a message yet.' }]
  for (let i = 0; i < messages.length; i++) {
    const words = messages[i].split(' ').length
    totals.set(senders[i], (totals.get(senders[i]) ?? 0) + words)
    frames.push({ phase: 'message', activeLine: L('totals[senders[i]] = totals'), index: i, totals: Object.fromEntries(totals), best: null, message: `${senders[i]} sends ${words} word${words === 1 ? '' : 's'}.` })
  }
  let best = null
  for (const sender of totals.keys()) {
    const better = best === null || totals.get(sender) > totals.get(best) || (totals.get(sender) === totals.get(best) && sender > best)
    if (better) best = sender
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, totals: Object.fromEntries(totals), best, message: `${best} has the largest word count, ${totals.get(best)}. Ties go to the name that sorts last.` })
  return { input: { messages, senders }, result: best, frames }
}

export const code = `sender with the largest word count
  totals = empty map
  for each index i
    words = number of words in messages[i]
    totals[senders[i]] = totals[senders[i]] + words
  best = none
  for each sender s in totals
    if best is none, or totals[s] is larger than totals[best], or they are equal and s sorts after best then
      best = s
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sender_with_largest_word_count(messages, senders):
    totals = {}
    for text, sender in zip(messages, senders):
        totals[sender] = totals.get(sender, 0) + len(text.split(' '))
    best = None
    for sender in totals:
        if best is None or totals[sender] > totals[best] or (totals[sender] == totals[best] and sender > best):
            best = sender
    return best
`
