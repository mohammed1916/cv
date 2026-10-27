const VOWELS = 'aeiou'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.word !== 'string' || input.word.length < 1 || input.word.length > 16 || !/^[a-z]+$/.test(input.word)) throw new Error('Give word as 1 to 16 lowercase letters.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > 4) throw new Error('k is an integer from 0 to 4.')
  return { word: input.word, k: input.k }
}

export function buildTrace({ word, k }) {
  const n = word.length
  const frames = [{ phase: 'start', activeLine: L('set exact to'), need: k, left: 0, right: 0, total: 0, message: `Count substrings with at least ${k} consonants, then subtract those with at least ${k + 1}.` }]
  // Counts substrings that hold all five vowels and at least `need` consonants.
  const countAtLeast = need => {
    const counts = new Map()
    let consonants = 0, right = 0, total = 0
    const complete = () => counts.size === 5 && consonants >= need
    for (let left = 0; left < n; left++) {
      while (right < n && !complete()) {
        const letter = word[right]
        if (VOWELS.includes(letter)) counts.set(letter, (counts.get(letter) ?? 0) + 1)
        else consonants++
        right++
        frames.push({ phase: 'extend', activeLine: L('while right is inside word'), need, left, right, total, message: `Add ${letter}. The window ${left} to ${right - 1} needs ${need} consonants with all vowels.` })
      }
      if (complete()) {
        total += n - right + 1
        frames.push({ phase: 'count', activeLine: L('add word length minus right'), need, left, right, total, message: `Ends ${right - 1} to ${n - 1} complete the substring from ${left} for need ${need}. Running total ${total}.` })
      }
      const letter = word[left]
      if (VOWELS.includes(letter)) {
        counts.set(letter, counts.get(letter) - 1)
        if (counts.get(letter) === 0) counts.delete(letter)
      } else consonants--
      frames.push({ phase: 'shrink', activeLine: L('remove the letter at left'), need, left: left + 1, right, total, message: `Remove ${letter} from the left. The next start is ${left + 1}.` })
    }
    return total
  }
  const atLeastK = countAtLeast(k)
  const atLeastK1 = countAtLeast(k + 1)
  const exact = atLeastK - atLeastK1
  frames.push({ phase: 'done', activeLine: L('return exact'), need: k, left: 0, right: n, total: exact, message: `${atLeastK} substrings have at least ${k} consonants and ${atLeastK1} have at least ${k + 1}, so ${exact} have exactly ${k}.` })
  return { input: { word, k }, result: exact, frames }
}

export const code = `count substrings with all vowels and k consonants (word, k)
  set exact to count at least k minus count at least k plus one
  return exact
count at least need (word)
  set counts to an empty map and right to zero
  set total to zero
  for each left index
    while right is inside word and the window is not complete
      add the letter at right and move right one step
    if the window is complete then add word length minus right plus one to total
    remove the letter at left from the window
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_vowel_substrings(word, k):
    vowels = set('aeiou')
    n = len(word)
    def count_at_least(need):
        counts = {}
        consonants = 0
        right = 0
        total = 0
        for left in range(n):
            while right < n and not (len(counts) == 5 and consonants >= need):
                letter = word[right]
                if letter in vowels:
                    counts[letter] = counts.get(letter, 0) + 1
                else:
                    consonants += 1
                right += 1
            if len(counts) == 5 and consonants >= need:
                total += n - right + 1
            letter = word[left]
            if letter in vowels:
                counts[letter] -= 1
                if counts[letter] == 0:
                    del counts[letter]
            else:
                consonants -= 1
        return total
    return count_at_least(k) - count_at_least(k + 1)
`
