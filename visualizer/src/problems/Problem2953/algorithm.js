export function parseInput(text) {
  const input = JSON.parse(text)
  const { word, k } = input ?? {}
  if (typeof word !== 'string' || word.length < 1 || word.length > 20 || !/^[a-z]+$/.test(word)) throw new Error('word has 1 to 20 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { word, k }
}

export function buildTrace({ word, k }) {
  const frames = []
  let total = 0
  frames.push({ pythonLine: P('total = 0'), phase: 'start', activeLine: L('let total = 0'), at: -1, segStart: 0, segEnd: 0, need: 0, exact: 0, total, message: 'Start with no complete substrings.' })
  let start = 0
  for (let end = 1; end <= word.length; end++) {
    if (end === word.length || Math.abs(word.charCodeAt(end) - word.charCodeAt(end - 1)) > 2) {
      const seg = word.slice(start, end)
      frames.push({ pythonLine: P('total += count_segment'), phase: 'segment', activeLine: L('if (end === word.length'), at: end - 1, segStart: start, segEnd: end, need: 0, exact: 0, total, message: `Segment ${start}..${end - 1} (${seg}): neighbours stay within two letters.` })
      total += countSegment(seg, k, frames, start, end, total)
      start = end
    }
  }
  frames.push({ pythonLine: P('return total'), phase: 'done', activeLine: L('return total'), at: -1, segStart: 0, segEnd: 0, need: 0, exact: 0, total, message: `${total} complete substring${total === 1 ? '' : 's'}.` })
  return { input: { word, k }, result: total, frames }
}

function countSegment(seg, k, frames, segStart, segEnd, runningTotal) {
  let result = 0
  for (let need = 1; need <= 26; need++) {
    const size = need * k
    if (size > seg.length) break
    const counts = Array(26).fill(0)
    let exact = 0
    for (let i = 0; i < seg.length; i++) {
      const r = seg.charCodeAt(i) - 97
      counts[r] += 1
      if (counts[r] === k) exact += 1
      else if (counts[r] === k + 1) exact -= 1
      if (i >= size) {
        const l = seg.charCodeAt(i - size) - 97
        counts[l] -= 1
        if (counts[l] === k) exact += 1
        else if (counts[l] === k - 1) exact -= 1
      }
      const full = i >= size - 1 && exact === need
      frames.push({ pythonLine: P('if i >= size - 1 and exact == need'), phase: 'window', activeLine: L('if (i >= size - 1'), at: segStart + i, segStart, segEnd, need, exact, total: runningTotal + result, message: `Window of ${size} letters ending at ${segStart + i}: ${exact} letter${exact === 1 ? '' : 's'} appear exactly ${k} times${full ? ', so it counts' : ''}.` })
      if (full) {
        result += 1
        frames.push({ pythonLine: P('result += 1'), phase: 'match', activeLine: L('result += 1'), at: segStart + i, segStart, segEnd, need, exact, total: runningTotal + result, message: `Complete substring found: need ${need} letter${need === 1 ? '' : 's'}, each ${k} times.` })
      }
    }
  }
  return result
}

export const code = `function countCompleteSubstrings(word, k) {
  let total = 0
  let start = 0
  for (let end = 1; end <= word.length; end++) {
    if (end === word.length || Math.abs(word.charCodeAt(end) - word.charCodeAt(end - 1)) > 2) {
      total += countSegment(word.slice(start, end), k)
      start = end
    }
  }
  return total
}
function countSegment(seg, k) {
  let result = 0
  for (let need = 1; need <= 26; need++) {
    const size = need * k
    if (size > seg.length) break
    const counts = Array(26).fill(0)
    let exact = 0
    for (let i = 0; i < seg.length; i++) {
      const r = seg.charCodeAt(i) - 97
      counts[r] += 1
      if (counts[r] === k) exact += 1
      else if (counts[r] === k + 1) exact -= 1
      if (i >= size) {
        const l = seg.charCodeAt(i - size) - 97
        counts[l] -= 1
        if (counts[l] === k) exact += 1
        else if (counts[l] === k - 1) exact -= 1
      }
      if (i >= size - 1 && exact === need) result += 1
    }
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_complete_substrings(word, k):
    total = 0
    start = 0
    for end in range(1, len(word) + 1):
        if end == len(word) or abs(ord(word[end]) - ord(word[end - 1])) > 2:
            total += count_segment(word[start:end], k)
            start = end
    return total

def count_segment(seg, k):
    result = 0
    for need in range(1, 27):
        size = need * k
        if size > len(seg):
            break
        counts = [0] * 26
        exact = 0
        for i, ch in enumerate(seg):
            r = ord(ch) - 97
            counts[r] += 1
            if counts[r] == k:
                exact += 1
            elif counts[r] == k + 1:
                exact -= 1
            if i >= size:
                l = ord(seg[i - size]) - 97
                counts[l] -= 1
                if counts[l] == k:
                    exact += 1
                elif counts[l] == k - 1:
                    exact -= 1
            if i >= size - 1 and exact == need:
                result += 1
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
