// LeetCode 2868: The Wording Game (draft rules).
// Alice opens with her smallest word. Then players alternate, each choosing from their own list a word that is
// lexicographically larger than the last word played and whose first letter is the same as the last word's first letter
// or the next letter of the alphabet. A player with no legal word loses.
// Since every played word is larger than the one before it, a word is never reused, so the game state is (last word, mover).

const ALPHA = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with alice and bob word lists.')
  const { alice, bob } = input
  const valid = list => Array.isArray(list) && list.length <= 6 && list.every(w => typeof w === 'string' && w.length >= 1 && w.length <= 5 && ALPHA.test(w))
  if (!valid(alice) || alice.length < 1) throw new Error('alice has 1 to 6 lowercase words of length 1 to 5.')
  if (!valid(bob)) throw new Error('bob has up to 6 lowercase words of length 1 to 5.')
  if (new Set(alice).size !== alice.length || new Set(bob).size !== bob.length) throw new Error('Words in each list are distinct.')
  return { alice: [...alice].sort(), bob: [...bob].sort() }
}

const CODE_TEXT = [
  'does Alice win with optimal play',
  '  opening ← smallest word in alice',
  '  RETURN NOT win(opening, Bob to move)',
  'FUNCTION win(last, mover)',
  '  IF the result for (last, mover) is cached THEN return it',
  '  FOR each word w in mover\'s list',
  '    IF w is larger than last and starts with last\'s letter or the next letter THEN',
  '      IF NOT win(w, other player) THEN cache true and return true',
  '  cache false and return false',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const PYTHON_TEXT = `def alice_wins(alice, bob):
    lists = {"alice": sorted(alice), "bob": sorted(bob)}
    memo = {}

    def win(last, mover):
        key = (last, mover)
        if key in memo:
            return memo[key]
        other = "bob" if mover == "alice" else "alice"
        for word in lists[mover]:
            if word <= last:
                continue
            if word[0] != last[0] and word[0] != chr(ord(last[0]) + 1):
                continue
            if not win(word, other):
                memo[key] = True
                return True
        memo[key] = False
        return False

    opening = min(alice)
    return not win(opening, "bob")
`

export const python = PYTHON_TEXT

const P = s => {
  const index = PYTHON_TEXT.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'open', label: 'Opening', description: 'Alice plays her smallest word.' },
  { id: 'state', label: 'State', description: 'Look at the last word and whose turn it is.' },
  { id: 'try', label: 'Try', description: 'Test one legal word for the mover.' },
  { id: 'settle', label: 'Settle', description: 'A reply decides this word.' },
  { id: 'done', label: 'Result', description: 'Report whether Alice wins.' },
]

const nextLetter = ch => String.fromCharCode(ch.charCodeAt(0) + 1)

export function buildTrace({ alice, bob }) {
  const lists = { alice, bob }
  const memo = new Map()
  const played = []
  const frames = []
  const snap = extra => ({ alice, bob, played: [...played], ...extra })
  const opening = alice[0]
  frames.push(snap({ phase: 'open', activeLine: L('opening ← smallest word'), pythonLine: P('opening = min(alice)'), last: opening, mover: 'bob', candidates: [], word: null, value: null, message: `Alice opens with ${opening}.` }))
  played.push(opening)
  const win = (last, mover) => {
    const key = `${last}|${mover}`
    if (memo.has(key)) return memo.get(key)
    const other = mover === 'alice' ? 'bob' : 'alice'
    const candidates = lists[mover].filter(w => w > last && (w[0] === last[0] || w[0] === nextLetter(last[0])))
    frames.push(snap({ phase: 'state', activeLine: L('IF the result for'), pythonLine: P('key = (last, mover)'), last, mover, candidates, word: null, value: null, message: `${mover === 'alice' ? 'Alice' : 'Bob'} to move after ${last}; ${candidates.length} legal word${candidates.length === 1 ? '' : 's'}.` }))
    let result = false
    for (const w of lists[mover]) {
      if (!(w > last && (w[0] === last[0] || w[0] === nextLetter(last[0])))) continue
      frames.push(snap({ phase: 'try', activeLine: L('IF w is larger than last'), pythonLine: P('if word <= last:'), last, mover, candidates, word: w, value: null, message: `${mover === 'alice' ? 'Alice' : 'Bob'} tries ${w}.` }))
      played.push(w)
      const childWin = win(w, other)
      played.pop()
      frames.push(snap({ phase: 'settle', activeLine: L('IF NOT win(w, other player)'), pythonLine: P('if not win(word, other):'), last, mover, candidates, word: w, value: !childWin, message: childWin ? `${other} can answer ${w}, so ${w} does not win.` : `${other} has no winning answer to ${w}; ${mover} wins.` }))
      if (!childWin) { result = true; break }
    }
    memo.set(key, result)
    return result
  }
  const aliceWins = !win(opening, 'bob')
  frames.push(snap({ phase: 'done', activeLine: L('RETURN NOT win'), pythonLine: P('return not win(opening, "bob")'), last: opening, mover: null, candidates: [], word: null, value: aliceWins, message: aliceWins ? 'Alice wins with optimal play.' : 'Bob wins with optimal play.' }))
  return { input: { alice, bob }, result: aliceWins, frames }
}
