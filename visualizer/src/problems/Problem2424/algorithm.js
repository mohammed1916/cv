export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || input.n < 1 || input.n > 10) throw new Error('Use an object with n from 1 to 10.')
  if (!Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('ops has 1 to 20 calls.')
  const ops = input.ops.map(op => {
    if (Array.isArray(op) && op[0] === 'upload' && Number.isInteger(op[1]) && op[1] >= 1 && op[1] <= input.n) return ['upload', op[1]]
    if (Array.isArray(op) && op.length === 1 && op[0] === 'longest') return ['longest']
    throw new Error('Each call is ["upload", video] or ["longest"], with video from 1 to n.')
  })
  return { n: input.n, ops }
}

export function buildTrace({ n, ops }) {
  const uploaded = Array(n + 2).fill(false)
  let prefix = 0
  const frames = []
  const log = []
  const results = []
  ops.forEach((op, i) => {
    if (op[0] === 'upload') {
      uploaded[op[1]] = true
      const before = prefix
      while (uploaded[prefix + 1]) prefix++
      log.push({ name: 'upload', args: String(op[1]), returned: 'void' })
      results.push(null)
      frames.push({ phase: 'upload', activeLine: CL('this.uploaded[video] = true'), pythonLine: PL('self.uploaded[video] = True'), current: i, log: [...log], uploaded: [...uploaded].slice(1, n + 1), prefix, advanced: prefix - before, message: `Video ${op[1]} is uploaded. ${prefix > before ? `The prefix grows from ${before} to ${prefix}.` : `The prefix stays at ${prefix} because video ${prefix + 1} is still missing.`}` })
    } else {
      log.push({ name: 'longest', args: '', returned: String(prefix) })
      results.push(prefix)
      frames.push({ phase: 'longest', activeLine: CL('return this.prefix'), pythonLine: PL('return self.prefix'), current: i, log: [...log], uploaded: [...uploaded].slice(1, n + 1), prefix, advanced: 0, message: `The longest uploaded prefix is ${prefix}.` })
    }
  })
  return { input: { n, ops }, result: results.filter(v => v !== null), frames }
}

export const code = `class LUPrefix {
  constructor(n) {
    this.uploaded = Array(n + 2).fill(false);
    this.prefix = 0;
  }
  upload(video) {
    this.uploaded[video] = true;
    while (this.uploaded[this.prefix + 1]) this.prefix++;
  }
  longest() {
    return this.prefix;
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `class LUPrefix:
    def __init__(self, n):
        self.uploaded = [False] * (n + 2)
        self.prefix = 0

    def upload(self, video):
        self.uploaded[video] = True
        while self.uploaded[self.prefix + 1]:
            self.prefix += 1

    def longest(self):
        return self.prefix
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
