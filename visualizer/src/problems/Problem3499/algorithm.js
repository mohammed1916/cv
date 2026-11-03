const line = (text) => text.split('\n').map((t, index) => ({ line: index + 1, text: t }))

export const code = line(`count the active sections in s
  total = number of ones in s
  split s into runs of equal characters
  best = 0
  for each run of ones that has zero runs on both sides
    best = larger of best and (zeros on the left + zeros on the right)
  return total + best`)

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_active(s):
    runs = []
    for ch in s:
        if runs and runs[-1][0] == ch:
            runs[-1][1] += 1
        else:
            runs.append([ch, 1])
    ones = s.count('1')
    best = 0
    for k in range(1, len(runs) - 1):
        if runs[k][0] == '1':
            best = max(best, runs[k - 1][1] + runs[k + 1][1])
    return ones + best`

const MAX_LENGTH = 40

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a string s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[01]+$/.test(s)) throw new Error(`s is a binary string of 1 to ${MAX_LENGTH} characters.`)
  return { s }
}

// Knowledge-derived model: trading a run of ones that sits between two runs of zeros turns all of
// those zeros into ones, so the gain is exactly the two neighbouring zero runs.
export function buildTrace({ s }) {
  const runs = []
  for (const ch of s) {
    if (runs.length && runs[runs.length - 1].ch === ch) runs[runs.length - 1].len++
    else runs.push({ ch, len: 1 })
  }
  const total = [...s].filter(ch => ch === '1').length
  const frames = []
  let best = 0
  frames.push({ pythonLine: 7, phase: 'runs', activeLine: L('split s into runs'), runs, run: -1, total, best, result: null,
    message: `${runs.length} run${runs.length === 1 ? '' : 's'} found. Active sections now: ${total}.` })
  for (let k = 1; k < runs.length - 1; k++) {
    if (runs[k].ch !== '1') continue
    const gain = runs[k - 1].len + runs[k + 1].len
    best = Math.max(best, gain)
    frames.push({ pythonLine: 12, phase: 'trade', activeLine: L('for each run of ones'), runs, run: k, total, best, result: null,
      message: `Run of ${runs[k].len} ones has ${runs[k - 1].len} zeros left and ${runs[k + 1].len} right: gain ${gain}. Best gain ${best}.` })
  }
  const result = total + best
  frames.push({ pythonLine: 13, phase: 'done', activeLine: L('return total + best'), runs, run: -1, total, best, result,
    message: `Keep the trade with the best gain: ${total} + ${best} = ${result}.` })
  return { input: { s }, frames, result }
}
