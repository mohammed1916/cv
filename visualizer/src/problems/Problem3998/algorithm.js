export const code = `for each pattern decide whether some reachable string matches it
  set zeros to the count of zeros in s
  set fixed zeros to the count of zeros in the pattern and questions to the count of question marks
  set need to zeros minus fixed zeros
  if need is below 0 or above questions then answer false and go to the next pattern
  fill the first need question marks with zero and the rest with one, giving candidate t
  set zs and zt to 0
  for each index i
    add one to zs if s at i is zero, and add one to zt if t at i is zero
    if zt is below zs then answer false and stop
  answer true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def reachable_patterns(s, patterns):
    n = len(s)
    zeros = s.count("0")
    answers = []
    for pattern in patterns:
        fixed = pattern.count("0")
        questions = pattern.count("?")
        need = zeros - fixed
        if need < 0 or need > questions:
            answers.append(False)
            continue
        t = []
        used = 0
        for ch in pattern:
            if ch == "?" and used < need:
                t.append("0")
                used += 1
            elif ch == "?":
                t.append("1")
            else:
                t.append(ch)
        zs = zt = 0
        ok = True
        for i in range(n):
            zs += s[i] == "0"
            zt += t[i] == "0"
            if zt < zs:
                ok = False
                break
        answers.append(ok)
    return answers
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || !Array.isArray(input.patterns)) throw new Error('Use an object with s (string) and patterns (array).')
  const { s, patterns } = input
  if (s.length < 1 || s.length > 12 || !/^[01]+$/.test(s)) throw new Error('s is a binary string of 1 to 12 characters.')
  if (patterns.length < 1 || patterns.length > 5) throw new Error('Use 1 to 5 patterns in this visualization.')
  for (const p of patterns) {
    if (typeof p !== 'string' || p.length !== s.length || !/^[01?]+$/.test(p)) throw new Error('Each pattern uses 0, 1 or ? and matches the length of s.')
  }
  return { s, patterns }
}

export function decideOne(s, pattern) {
  const frames = []
  const n = s.length
  const zeros = [...s].filter(c => c === '0').length
  const fixed = [...pattern].filter(c => c === '0').length
  const questions = [...pattern].filter(c => c === '?').length
  const need = zeros - fixed
  if (need < 0 || need > questions) return { ok: false, t: null, frames, zeros, need, questions, failAt: -1 }
  let used = 0
  let t = ''
  for (const ch of pattern) {
    if (ch === '?' && used < need) { t += '0'; used += 1 } else if (ch === '?') t += '1'
    else t += ch
  }
  let zs = 0, zt = 0
  for (let i = 0; i < n; i++) {
    if (s[i] === '0') zs += 1
    if (t[i] === '0') zt += 1
    if (zt < zs) return { ok: false, t, frames, zeros, need, questions, failAt: i, zs, zt }
  }
  return { ok: true, t, frames, zeros, need, questions, failAt: -1 }
}

export function buildTrace({ s, patterns }) {
  const frames = []
  const answers = []
  const zerosTotal = [...s].filter(c => c === '0').length
  frames.push({ pythonLine: P('zeros = s.count'), phase: 'start', activeLine: L('set zeros to the count of zeros in s'), pattern: null, s, t: null, i: -1, zs: 0, zt: 0, answers: [], message: `s has ${zerosTotal} zero${zerosTotal === 1 ? '' : 's'}; each candidate must have the same count.` })
  patterns.forEach((pattern, idx) => {
    const r = decideOne(s, pattern)
    frames.push({ pythonLine: P('fixed = pattern.count'), phase: 'count', activeLine: L('set fixed zeros'), pattern, pIndex: idx, s, t: null, i: -1, zs: 0, zt: 0, answers: [...answers], need: r.need,
      message: `Pattern ${pattern}: needs ${r.need} question marks set to zero (${r.questions} available).` })
    if (r.need < 0 || r.need > r.questions) {
      answers.push(false)
      frames.push({ pythonLine: P('answers.append(False)'), phase: 'reject', activeLine: L('if need is below 0'), pattern, pIndex: idx, s, t: null, i: -1, zs: 0, zt: 0, answers: [...answers], need: r.need, message: `Count mismatch, so ${pattern} is false.` })
      return
    }
    frames.push({ pythonLine: P('t = []'), phase: 'fill', activeLine: L('fill the first need question marks'), pattern, pIndex: idx, s, t: r.t, i: -1, zs: 0, zt: 0, answers: [...answers], need: r.need, message: `Earliest question marks become zero: candidate ${r.t}.` })
    let zs = 0, zt = 0
    let ok = true
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '0') zs += 1
      if (r.t[i] === '0') zt += 1
      const bad = zt < zs
      frames.push({ pythonLine: P('zs += s[i]'), phase: bad ? 'fail' : 'check', activeLine: L('add one to zs if s at i is zero'), pattern, pIndex: idx, s, t: r.t, i, zs, zt, answers: [...answers], need: r.need,
        message: bad ? `At prefix ${i + 1}, candidate has ${zt} zeros but s has ${zs}; the sort cannot reach it.` : `Prefix ${i + 1}: candidate zeros ${zt} at least s zeros ${zs}.` })
      if (bad) { ok = false; break }
    }
    answers.push(ok)
    frames.push({ pythonLine: P('answers.append(ok)'), phase: ok ? 'accept' : 'reject', activeLine: L('answer true'), pattern, pIndex: idx, s, t: r.t, i: -1, zs: 0, zt: 0, answers: [...answers], need: r.need,
      message: ok ? `${pattern} is reachable through candidate ${r.t}.` : `${pattern} is not reachable.` })
  })
  frames.push({ pythonLine: P('return answers'), phase: 'done', activeLine: L('answer true'), pattern: null, s, t: null, i: -1, zs: 0, zt: 0, answers: [...answers], message: 'All patterns decided.' })
  return { input: { s, patterns }, result: answers, frames }
}
