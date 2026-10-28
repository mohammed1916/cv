export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'banned_words,message') throw new Error('Use an object with exactly the keys "message" and "banned_words".')
  const { message, banned_words: bannedWords } = value
  const words = list => Array.isArray(list) && list.length >= 1 && list.length <= 8 && list.every(w => typeof w === 'string' && /^[a-z]{1,12}$/.test(w))
  if (!words(message)) throw new Error('message is 1 to 8 lowercase words of up to 12 letters.')
  if (!words(bannedWords)) throw new Error('banned_words is 1 to 8 lowercase words of up to 12 letters.')
  return { message, banned_words: bannedWords }
}

export function buildTrace({ message, banned_words: bannedWords }) {
  const banned = new Set(bannedWords)
  const frames = [{ phase: 'start', activeLine: L('set banned to the set of banned words'), active: -1, roles: {}, state: { count: 0 }, message: `A message is spam when at least two of its words are banned. Banned: ${[...banned].join(', ')}.` }]
  let count = 0
  message.forEach((word, i) => {
    const hit = banned.has(word)
    if (hit) count += 1
    frames.push({ phase: 'scan', activeLine: L(hit ? 'add 1 to count' : 'if word is in banned'), active: i, roles: { [i]: hit ? 'banned' : 'allowed' }, state: { word, count }, message: hit ? `"${word}" is banned. Banned words found: ${count}.` : `"${word}" is not banned.` })
  })
  const result = count >= 2
  frames.push({ phase: 'done', activeLine: L('return count is at least 2'), active: -1, roles: {}, state: { count, spam: result }, message: result ? `${count} banned words, so this is spam.` : `${count} banned word${count === 1 ? '' : 's'}; at least 2 are needed.` })
  return { input: { message, banned_words: bannedWords }, result, items: message, frames }
}

export const code = `report whether the message is spam
  set banned to the set of banned words
  set count to 0
  for each word in message
    if word is in banned then
      add 1 to count
  return count is at least 2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def report_spam(message, banned_words):
    banned = set(banned_words)
    count = 0
    for word in message:
        if word in banned:
            count += 1
    return count >= 2
`
