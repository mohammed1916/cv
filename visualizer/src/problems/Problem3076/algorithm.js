export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 'arr') throw new Error('Use a JSON object with exactly one key, arr.')
  const { arr } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 8) throw new Error('arr must be an array of 1 to 8 strings.')
  if (arr.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error('Each string must be 1 to 6 lowercase letters.')
  return { arr }
}

export function buildTrace({ arr }) {
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('set answers to an empty list'), index: -1, sub: '', answers: [], message: 'Look at each string in turn.' }]
  arr.forEach((s, i) => {
    const others = arr.filter((_, j) => j !== i)
    let found = ''
    for (let len = 1; len <= s.length && found === ''; len++) {
      const subs = [...new Set(Array.from({ length: s.length - len + 1 }, (_, j) => s.slice(j, j + len)))].sort()
      for (const sub of subs) {
        if (found !== '') break
        const shared = others.some(o => o.includes(sub))
        frames.push({ phase: shared ? 'shared' : 'uncommon', activeLine: L('if sub appears in no other string'), index: i, sub, answers: [...answers], message: shared ? `${sub} appears in another string, so it does not count.` : `${sub} appears in no other string. It is the answer for ${s}.` })
        if (!shared) found = sub
      }
    }
    answers.push(found)
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, sub: '', answers: [...answers], message: `Answers: ${JSON.stringify(answers)}.` })
  return { input: { arr }, result: answers, frames }
}

export const code = `shortest uncommon substring for each string:
  set answers to an empty list
  for each string s at index i
    set found to empty text
    for each length L from 1 to the length of s, while found is still empty
      for each substring sub of s with length L, in sorted order, while found is still empty
        if sub appears in no other string then
          set found to sub
    add found to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_uncommon(arr):
    answers = []
    for i, s in enumerate(arr):
        others = arr[:i] + arr[i + 1:]
        found = ''
        for L in range(1, len(s) + 1):
            if found:
                break
            subs = sorted({s[j:j + L] for j in range(len(s) - L + 1)})
            for sub in subs:
                if not any(sub in o for o in others):
                    found = sub
                    break
        answers.append(found)
    return answers
`
