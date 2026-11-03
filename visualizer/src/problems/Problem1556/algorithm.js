export const phases = [
  { id: 'start', label: 'Start', description: 'Write the number as digits, then read from the right so each group of three is complete before the next.' },
  { id: 'read', label: 'Read digit', description: 'Take the next digit from the right and place it at the front of the output.' },
  { id: 'group', label: 'Insert dot', description: 'After every three digits, and before any digits further left, insert a dot.' },
  { id: 'done', label: 'Complete', description: 'The output has a dot between each group of three digits.' },
]

export function parseInput(text) {
  const t = text.trim()
  if (!/^(0|[1-9]\d*)$/.test(t) || Number(t) > 2147483647) throw new Error('Enter a whole number from 0 to 2147483647 with no leading zeros.')
  return Number(t)
}

export const code = `digits = text of n
out = ""
count = 0
for d in digits, from right to left:
    out = d + out
    count += 1
    if count % 3 == 0 and more digits remain:
        out = "." + out
return out`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def thousand_separator(n):
    digits = str(n)
    out = ""
    count = 0
    for d in reversed(digits):
        out = d + out
        count += 1
        if count % 3 == 0 and count < len(digits):
            out = "." + out
    return out
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(n) {
  const digits = String(n)
  const frames = []
  let out = ''
  let count = 0
  const snap = extra => ({ digits, out, count, ...extra })
  frames.push({ phase: 'start', activeLine: L('digits = '), pythonLine: P('digits = '), snapshot: snap({ index: -1 }),
    message: `The number ${n} has ${digits.length} digit${digits.length === 1 ? '' : 's'}. Work from the right.` })
  for (let i = digits.length - 1; i >= 0; i--) {
    out = digits[i] + out
    count += 1
    frames.push({ phase: 'read', activeLine: L('out = d + out'), pythonLine: P('out = d + out'), snapshot: snap({ index: i }),
      message: `Digit ${digits[i]} goes to the front, giving "${out}".` })
    if (count % 3 === 0 && i > 0) {
      out = '.' + out
      frames.push({ phase: 'group', activeLine: L('if count % 3'), pythonLine: P('if count % 3'), snapshot: snap({ index: i }),
        message: `Three digits are complete and more digits remain to the left, so insert a dot: "${out}".` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return out'), pythonLine: P('return out'), snapshot: snap({ index: -1 }),
    message: `Result: ${out}.` })
  return { input: n, result: out, frames }
}
