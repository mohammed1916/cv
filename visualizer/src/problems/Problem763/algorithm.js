export const code = `function partitionLabels(s):
  last = map from each letter to its last index in s
  sizes = empty list
  start = 0, end = 0
  for each index i and letter c in s:
    end = the larger of end and last[c]
    if i equals end then
      append end - start + 1 to sizes
      start = i + 1
  return sizes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}
    sizes = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            sizes.append(end - start + 1)
            start = i + 1
    return sizes`

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[a-z]{1,200}$/.test(s)) throw new Error('Enter a JSON string of 1-200 lowercase letters (visualization cap of 200).')
  return s
}

export function buildTrace(s) {
  const last = {}
  for (let i = 0; i < s.length; i++) last[s[i]] = i
  const lastList = Object.entries(last).sort()
  const sizes = [], cuts = []
  const frames = [{ phase: 'start', activeLine: L('last ='), pythonLine: 2, i: -1, start: 0, end: 0, sizes: [], cuts: [], last: lastList, message: `Record the last index of each letter: ${lastList.map(([c, i]) => `${c}@${i}`).join(' ')}.` }]
  let start = 0, end = 0
  for (let i = 0; i < s.length; i++) {
    const prev = end
    end = Math.max(end, last[s[i]])
    frames.push({ phase: 'extend', activeLine: L('end = the larger'), pythonLine: 6, i, start, end, sizes: [...sizes], cuts: [...cuts], last: lastList,
      message: end > prev ? `'${s[i]}' last appears at ${last[s[i]]}, so the current part must reach at least index ${end}.` : `'${s[i]}' last appears at ${last[s[i]]}, within the current reach ${end}; no change.` })
    if (i === end) {
      sizes.push(end - start + 1); cuts.push(i)
      frames.push({ phase: 'cut', activeLine: L('append end - start'), pythonLine: 8, i, start, end, sizes: [...sizes], cuts: [...cuts], last: lastList,
        message: `Index ${i} equals the reach, so every letter in [${start}..${end}] ends here. Cut a part of size ${end - start + 1}.` })
      start = i + 1
    }
  }
  frames.push({ phase: 'done', activeLine: L('return sizes'), pythonLine: 10, i: s.length - 1, start, end, sizes: [...sizes], cuts: [...cuts], last: lastList, message: `Part sizes: [${sizes.join(', ')}].` })
  return { input: s, result: sizes, frames }
}
