export function matchCount(a, b) {
  let m = 0
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) m++
  return m
}
export function parseInput(text) {
  const p = JSON.parse(text)
  if (!p || typeof p !== 'object' || !Array.isArray(p.words) || typeof p.secret !== 'string') throw new Error('Enter JSON like {"words":[...],"secret":"...","allowedGuesses":10}. The secret is the hidden master word that answers match counts.')
  const words = p.words
  const allowed = p.allowedGuesses === undefined ? 10 : p.allowedGuesses
  if (words.length < 1 || words.length > 30 || !words.every(w => typeof w === 'string' && /^[a-z]{1,6}$/.test(w) && w.length === words[0].length)) throw new Error('words must be 1-30 distinct lowercase strings of equal length 1-6 (visualization cap: 30 words).')
  if (new Set(words).size !== words.length) throw new Error('words must be distinct.')
  if (!words.includes(p.secret)) throw new Error('secret must be one of the words.')
  if (!Number.isInteger(allowed) || allowed < 1 || allowed > 30) throw new Error('allowedGuesses must be an integer from 1 to 30.')
  return { words, secret: p.secret, allowed }
}
export function bucketsFor(word, cand) {
  const counts = {}
  for (const x of cand) { const m = matchCount(word, x); counts[m] = (counts[m] || 0) + 1 }
  return counts
}
export function worstBucket(word, cand) { return Math.max(...Object.values(bucketsFor(word, cand))) }
export function buildTrace({ words, secret, allowed }) {
  let cand = [...words]
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, cand: [...cand], guesses: extra.guesses ?? 0, guess: null, ...extra })
  push('start', 2, `${words.length} candidate words; the hidden secret is one of them. We may ask the master at most ${allowed} times.`)
  let guesses = 0, solved = false
  while (cand.length && guesses < allowed) {
    let guess = cand[0], best = Infinity, worst = []
    for (const w of cand) { const wb = worstBucket(w, cand); if (wb < best) { best = wb; guess = w } worst.push(wb) }
    guesses++
    push('choose', 7, `Minimax choice: for each candidate, count how many candidates share each match score with it; "${guess}" has the smallest largest-bucket (${best}), so it splits the list most evenly.`, { guesses, guess, worst })
    const m = matchCount(guess, secret)
    if (m === guess.length) {
      solved = true
      push('ask', 10, `Master says ${m} of ${guess.length} letters match: "${guess}" is the secret. Solved in ${guesses} guess${guesses === 1 ? '' : 'es'}.`, { guesses, guess, m })
      break
    }
    const before = cand.length
    cand = cand.filter(w => matchCount(w, guess) === m)
    push('ask', 11, `Master says ${m} of ${guess.length} match. Keep only words with exactly ${m} matches against "${guess}": ${before} candidates become ${cand.length}.`, { guesses, guess, m, removed: before - cand.length, kept: [...cand] })
  }
  push('done', 12, solved ? `Secret "${secret}" found with ${guesses} of ${allowed} allowed guesses.` : `Out of guesses or candidates after ${guesses} guesses: the secret was not identified.`, { guesses })
  return { input: { words, secret, allowed }, result: solved, frames }
}
export const code = `function findSecretWord(words, secret, allowedGuesses)
  set cand to a copy of words and guesses to 0
  while cand is not empty and guesses < allowedGuesses
    for each candidate w in cand
      count, for every x in cand, how many share each match score with w
      note the largest bucket for w
    choose the guess with the smallest largest bucket (first one on ties)
    add one to guesses
    ask the master for the match count m between guess and secret
    if m equals the length of guess then return true
    keep only the candidates w in cand whose match count with guess is m
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def find_secret_word(words, secret, allowedGuesses=10):
    def match(a, b):
        return sum(x == y for x, y in zip(a, b))
    cand = list(words)
    guesses = 0
    while cand and guesses < allowedGuesses:
        best_guess, best_worst = None, None
        for w in cand:
            counts = {}
            for x in cand:
                m = match(w, x)
                counts[m] = counts.get(m, 0) + 1
            worst = max(counts.values())
            if best_worst is None or worst < best_worst:
                best_guess, best_worst = w, worst
        guess = best_guess
        guesses += 1
        m = match(guess, secret)
        if m == len(guess):
            return True
        cand = [w for w in cand if match(w, guess) == m]
    return False
`
