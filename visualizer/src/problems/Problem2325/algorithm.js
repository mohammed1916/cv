export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || typeof data.key !== 'string' || typeof data.message !== 'string') throw new Error('Use {"key": "...", "message": "..."}.')
  const { key, message } = data
  if (!/^[a-z ]+$/.test(key)) throw new Error('The key holds lowercase letters and spaces only.')
  if (new Set(key.replace(/ /g, '')).size !== 26) throw new Error('The key must contain all 26 letters, repeats allowed.')
  if (message.length < 1 || message.length > 40) throw new Error('Use a message of 1 to 40 characters.')
  if (!/^[a-z ]+$/.test(message)) throw new Error('The message holds lowercase letters and spaces only.')
  return { key, message }
}

export function buildTrace(input) {
  const { key, message } = input
  const table = new Map()
  const frames = []
  const maps = () => [{ name: 'table', keyLabel: 'cipher', valueLabel: 'plain', isSet: false, entries: [...table] }]
  frames.push({ phase: 'start', activeLine: L('table is an empty map'), maps: maps(), ops: [], text: '', result: '', message: 'The key lists the cipher letters in the order they take the plain letters a, b, c, and so on.' })
  let next = 'a'
  for (const ch of key) {
    if (ch === ' ' || table.has(ch)) continue
    table.set(ch, next)
    frames.push({ phase: 'map', activeLine: L('set table of the letter to next'), maps: maps(),
      ops: [{ map: 'table', type: 'insert', key: ch, value: next }], text: '', result: '',
      message: `Key letter ${ch} becomes ${next}.` })
    next = String.fromCharCode(next.charCodeAt(0) + 1)
  }
  let decoded = ''
  for (const ch of message) {
    if (ch === ' ') {
      decoded += ' '
      frames.push({ phase: 'decode', activeLine: L('keep the space'), maps: maps(), ops: [], text: decoded, result: decoded, message: 'A space stays a space.' })
      continue
    }
    const plain = table.get(ch)
    decoded += plain
    frames.push({ phase: 'decode', activeLine: L('replace it with table'), maps: maps(),
      ops: [{ map: 'table', type: 'lookup', via: 'get', key: ch, hit: true, value: plain, hitNote: 'every message letter appears in the key', missNote: 'not reached for valid input' }],
      text: decoded, result: decoded, message: `${ch} decodes to ${plain}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the decoded text'), maps: maps(), ops: [], text: decoded, result: decoded, message: `Decoded message: ${decoded}.` })
  return { input, result: decoded, frames }
}

export const code = `decode a message with a substitution key
table is an empty map from key letter to plain letter
next = a
for each letter in the key, skipping spaces
  if the letter is not in table then
    set table of the letter to next
    move next to the following letter
for each character in the message
  if it is a space then
    keep the space
  otherwise replace it with table of the character
return the decoded text`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def decode_message(key, message):
    table = {}
    nxt = ord('a')
    for ch in key:
        if ch != ' ' and ch not in table:
            table[ch] = chr(nxt)
            nxt += 1
    out = []
    for ch in message:
        if ch == ' ':
            out.append(' ')
        else:
            out.append(table[ch])
    return ''.join(out)
`
