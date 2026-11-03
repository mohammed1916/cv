export const phases = [
  { id: 'start', label: 'Read', description: 'Read the text and the replacement pairs.' },
  { id: 'scan', label: 'Scan', description: 'Copy a literal run to the output.' },
  { id: 'hit', label: 'Memo hit', description: 'Reuse an expansion that is already known.' },
  { id: 'enter', label: 'Expand', description: 'Expand a referenced key, following its own references first.' },
  { id: 'store', label: 'Memoise', description: 'Remember the finished expansion of a key.' },
  { id: 'done', label: 'Result', description: 'Return the fully expanded text.' },
]

const KEY = /^[a-z]{1,3}$/

// Split a string into literal runs and %key% references. Throws on an unclosed % or an empty key.
function tokenise(s) {
  const tokens = []
  let i = 0
  while (i < s.length) {
    if (s[i] === '%') {
      const j = s.indexOf('%', i + 1)
      if (j < 0) throw new Error('Every % needs a closing %.')
      const key = s.slice(i + 1, j)
      if (!KEY.test(key)) throw new Error(`Reference %${key}% needs a key of 1 to 3 lowercase letters.`)
      tokens.push({ kind: 'ref', key })
      i = j + 1
    } else {
      let j = i
      while (j < s.length && s[j] !== '%') j++
      tokens.push({ kind: 'lit', value: s.slice(i, j) })
      i = j
    }
  }
  return tokens
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with text and replacements.')
  const { text: source, replacements } = input
  if (typeof source !== 'string' || source.length < 1 || source.length > 40 || !/^[a-z%\- ]+$/.test(source)) throw new Error('text has 1 to 40 characters: lowercase letters, spaces, hyphens and %key% references.')
  if (!Array.isArray(replacements) || replacements.length < 1 || replacements.length > 6) throw new Error('replacements lists 1 to 6 [key, value] pairs.')
  const map = new Map()
  for (const pair of replacements) {
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') throw new Error('Each replacement is a [key, value] pair of strings.')
    if (!KEY.test(pair[0])) throw new Error(`Key ${pair[0]} needs 1 to 3 lowercase letters.`)
    if (map.has(pair[0])) throw new Error(`Key ${pair[0]} appears twice.`)
    if (!/^[a-z%\- ]{1,40}$/.test(pair[1])) throw new Error(`Value of ${pair[0]} uses lowercase letters, spaces, hyphens and %key% references.`)
    map.set(pair[0], pair[1])
  }
  // Validate references and reject cycles so the expansion always ends.
  const check = (key, path) => {
    if (path.includes(key)) throw new Error('Substitutions must not depend on themselves.')
    for (const token of tokenise(map.get(key))) {
      if (token.kind === 'ref') {
        if (!map.has(token.key)) throw new Error(`Reference %${token.key}% has no replacement.`)
        check(token.key, [...path, key])
      }
    }
  }
  for (const key of map.keys()) check(key, [])
  for (const token of tokenise(source)) {
    if (token.kind === 'ref' && !map.has(token.key)) throw new Error(`Reference %${token.key}% has no replacement.`)
  }
  return { text: source, replacements: [...map.entries()] }
}

export const code = [
  'apply substitutions',
  '  tokenise text into literal runs and %key% references',
  '  define expand(s):',
  '    out = empty',
  '    for each token of s',
  '      if it is a literal run, append it to out',
  '      else if key is memoised, append its memo to out',
  '      else expand the replacement of key, memoise it, append it',
  '    return out',
  '  return expand(text)',
].map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function buildTrace({ text, replacements }) {
  const map = new Map(replacements)
  const memo = new Map()
  const stack = []
  const frames = []
  let topOutput = ''
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, stack: stack.slice(), memo: [...memo.entries()], output: topOutput, text, ...extra,
  })
  push('start', L('apply substitutions'), P('def apply_substitutions'), `Read ${text.length} characters of text and ${map.size} replacement${map.size === 1 ? '' : 's'}.`)
  const expand = (label, s, top) => {
    let out = ''
    for (const token of tokenise(s)) {
      if (token.kind === 'lit') {
        out += token.value
        if (top) topOutput += token.value
        push('scan', L('for each token'), P('for kind, value'), `${label}: copy the literal run "${token.value}".`, { token: token.value })
        continue
      }
      if (memo.has(token.key)) {
        const known = memo.get(token.key)
        out += known
        if (top) topOutput += known
        push('hit', L('else if key is memoised'), P('elif value in memo'), `%${token.key}% is already memoised as "${known}".`, { token: token.key })
        continue
      }
      stack.push(token.key)
      push('enter', L('expand the replacement'), P('memo[value] = expand'), `Expand %${token.key}% = "${map.get(token.key)}" before appending it.`, { token: token.key })
      const value = expand(`%${token.key}%`, map.get(token.key), false)
      memo.set(token.key, value)
      stack.pop()
      out += value
      if (top) topOutput += value
      push('store', L('expand the replacement'), P('memo[value] = expand'), `%${token.key}% expands to "${value}" and is memoised.`, { token: token.key })
    }
    return out
  }
  const result = expand('text', text, true)
  push('done', L('return expand(text)'), P('return expand(text)'), `The fully expanded text is "${result}".`, { result })
  return { input: { text, replacements: [...map.entries()] }, result, frames }
}

export const python = `def apply_substitutions(text, pairs):
    replacements = dict(pairs)
    memo = {}

    def tokens(s):
        out = []
        i = 0
        while i < len(s):
            if s[i] == '%':
                j = s.index('%', i + 1)
                out.append(('ref', s[i + 1:j]))
                i = j + 1
            else:
                j = i
                while j < len(s) and s[j] != '%':
                    j += 1
                out.append(('lit', s[i:j]))
                i = j
        return out

    def expand(s):
        out = []
        for kind, value in tokens(s):
            if kind == 'lit':
                out.append(value)
            elif value in memo:
                out.append(memo[value])
            else:
                memo[value] = expand(replacements[value])
                out.append(memo[value])
        return ''.join(out)

    return expand(text)
`
