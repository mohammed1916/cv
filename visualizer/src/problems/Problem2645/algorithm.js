export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || typeof obj.word !== 'string') throw new Error('Use an object with a string key word.')
  const { word } = obj
  if (word.length < 1 || word.length > 40 || !/^[a-c]+$/.test(word)) throw new Error('word is 1 to 40 letters, each a, b or c.')
  return { word }
}

const PATTERN = 'abc'

export function buildTrace(input) {
  const { word } = input
  let need = 0
  let added = 0
  const frames = [{ phase: 'start', activeLine: L('set need to 0'), index: -1, need, added, message: 'Scan the word while expecting a, then b, then c, repeating.' }]
  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    while (ch !== PATTERN[need]) {
      added += 1
      frames.push({ phase: 'insert', activeLine: L('while ch is not the letter at need'), index: i, need, added, message: `Insert a ${PATTERN[need]} before ${ch} so the block can continue.` })
      need = (need + 1) % 3
    }
    frames.push({ phase: 'match', activeLine: L('for each letter ch'), index: i, need, added, message: `Letter ${ch} matches the expected ${PATTERN[need]}.` })
    need = (need + 1) % 3
  }
  if (need !== 0) {
    added += 3 - need
    frames.push({ phase: 'tail', activeLine: L('if need is not 0'), index: -1, need, added, message: `The word ends partway through a block, so ${3 - need} letter(s) must be appended.` })
  }
  frames.push({ phase: 'done', activeLine: L('return added'), index: -1, need, added, message: `Minimum insertions: ${added}.` })
  return { input, word, result: added, frames }
}

export const code = `minimum letters to add so the word becomes repeated abc blocks
  set need to 0 and added to 0
  for each letter ch of the word
    while ch is not the letter at need of abc
      add 1 to added
      move need forward by one
    move need forward by one
  if need is not 0 then
    add 3 minus need to added
  return added`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_additions(word):
    need = 0
    added = 0
    for ch in word:
        while ch != 'abc'[need]:
            added += 1
            need = (need + 1) % 3
        need = (need + 1) % 3
    if need != 0:
        added += 3 - need
    return added
`
