export const phases = [
  { id: 'start', label: 'Split versions', description: 'Split each dotted version into its integer parts.' },
  { id: 'compare', label: 'Compare parts', description: 'Compare the parts at the same position; a missing part counts as zero.' },
  { id: 'decide', label: 'Decide', description: 'The first unequal pair decides the answer.' },
  { id: 'done', label: 'Result', description: 'Return 1, -1 or 0 for the comparison.' },
]

export const code = `compare versions (version1, version2):
  parts1 = version1 split at dots, as integers
  parts2 = version2 split at dots, as integers
  for each index i up to the longer list:
    a = parts1[i] or 0 when missing
    b = parts2[i] or 0 when missing
    if a is not b:
      return 1 when a > b, else -1
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def compare_version(version1, version2):
    parts1 = [int(part) for part in version1.split('.')]
    parts2 = [int(part) for part in version2.split('.')]
    for i in range(max(len(parts1), len(parts2))):
        a = parts1[i] if i < len(parts1) else 0
        b = parts2[i] if i < len(parts2) else 0
        if a != b:
            return 1 if a > b else -1
    return 0
`

const pc = needle => code.findIndex(line => line.text.includes(needle)) + 1
const py = needle => python.split('\n').findIndex(line => line.includes(needle)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"version1": "1.10", "version2": "1.9"}.')
  const { version1, version2 } = input
  for (const [name, value] of [['version1', version1], ['version2', version2]]) {
    if (typeof value !== 'string' || value.length > 60 || !/^\d+(\.\d+)*$/.test(value)) {
      throw new Error(`${name} is digits separated by single dots, up to 60 characters.`)
    }
    if (value.split('.').some(part => part.length > 6)) throw new Error(`Each part of ${name} has at most 6 digits.`)
  }
  return { version1, version2 }
}

export function buildTrace({ version1, version2 }) {
  const parts1 = version1.split('.').map(Number)
  const parts2 = version2.split('.').map(Number)
  const frames = []
  const snap = (index, a, b, result) => ({ version1, version2, parts1, parts2, index, a, b, result })
  const push = (phase, pcNeedle, pyNeedle, message, snapshot) =>
    frames.push({ phase, activeLine: pc(pcNeedle), pythonLine: py(pyNeedle), message, snapshot })

  push('start', 'parts1 = version1', 'parts1 = [', `Parts are [${parts1.join(', ')}] and [${parts2.join(', ')}].`, snap(null, null, null, null))
  let result = 0
  const length = Math.max(parts1.length, parts2.length)
  for (let i = 0; i < length; i++) {
    const a = i < parts1.length ? parts1[i] : 0
    const b = i < parts2.length ? parts2[i] : 0
    push('compare', 'a = parts1', 'a = parts1', `Position ${i}: ${a} against ${b}${a === b ? ', equal so far.' : '.'}`, snap(i, a, b, null))
    if (a !== b) {
      result = a > b ? 1 : -1
      push('decide', 'return 1 when', 'return 1 if', `${a} differs from ${b}, so the answer is ${result}.`, snap(i, a, b, result))
      break
    }
  }
  push('done', 'return 0', 'return 0', `Comparison result: ${result}.`, snap(null, null, null, result))
  return { input: { version1, version2 }, result, frames }
}
