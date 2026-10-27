export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 100000 || !/^[01]+$/.test(s)) throw new Error('Enter a JSON string of 1–100,000 characters, each 0 or 1.')
  return s
}

// Group the string into runs of equal bits. Each adjacent pair of runs contributes min(length) substrings.
export function buildTrace(s) {
  const runs = []
  for (let i = 0; i < s.length;) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    runs.push(j - i)
    i = j
  }
  let result = 0
  const frames = [{ phase: 'start', runs: [], pair: null, total: 0, activeLine: 2, message: `Group ${s.length} characters into ${runs.length} runs.` }]
  for (let r = 1; r < runs.length; r++) {
    const add = Math.min(runs[r - 1], runs[r])
    result += add
    frames.push({ phase: 'pair', runs: runs.slice(0, r + 1), pair: [r - 1, r], add, total: result, activeLine: 7, message: `Runs ${runs[r - 1]} and ${runs[r]}: min gives ${add} substrings.` })
  }
  frames.push({ phase: 'done', runs, pair: null, total: result, result, activeLine: 9, message: `Total: ${result}.` })
  return { input: s, result, runs, frames }
}

export const code = `set the run lengths list to empty and the current run length to 1
for each character after the first
  if it equals the previous character, extend the current run
  otherwise record the finished run length and start a new run at 1
record the last run length
return the sum over adjacent pairs of the smaller of the two run lengths`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 rolls the runs forward (line 4 here); line 5 returns the total (line 6 here).
export const LINE_MAP = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }

export const python = `def count_binary_substrings(s):
    runs = []
    current = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            current += 1
        else:
            runs.append(current)
            current = 1
    runs.append(current)
    return sum(min(a, b) for a, b in zip(runs, runs[1:]))`
