export const phases = [
  { id: 'start', label: 'Start call', description: 'A read(n) call starts with an empty result and the leftover cache from earlier calls.' },
  { id: 'check', label: 'Cache check', description: 'Use cached characters first; only pull from the file when the cache is empty.' },
  { id: 'pull', label: 'Pull four', description: 'read4 copies up to four characters from the file and moves its position forward.' },
  { id: 'take', label: 'Copy out', description: 'Copy as many characters as still needed; keep any extra characters cached.' },
  { id: 'done', label: 'Return', description: 'Return what this call produced, possibly fewer than n at end of file.' },
]

export const code = `FUNCTION read(n)
    out ← empty
    WHILE length(out) < n
        IF cache is empty
            chunk ← read4()
            IF chunk is empty: BREAK
            cache ← chunk
        take ← min(n − length(out), length(cache))
        out ← out + first take characters of cache
        cache ← characters after those take
    RETURN out`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class Reader:
    def __init__(self, file):
        self.file = file
        self.pos = 0
        self.cache = ""

    def read4(self):
        chunk = self.file[self.pos:self.pos + 4]
        self.pos += len(chunk)
        return chunk

    def read(self, n):
        out = ""
        while len(out) < n:
            if not self.cache:
                chunk = self.read4()
                if not chunk:
                    break
                self.cache = chunk
            take = min(n - len(out), len(self.cache))
            out += self.cache[:take]
            self.cache = self.cache[take:]
        return out`

export const pythonLineMap = { 1: 12, 2: 13, 3: 14, 4: 15, 5: 16, 6: 17, 7: 19, 8: 20, 9: 21, 10: 22, 11: 23 }

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`) }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"file": "abcdefg", "calls": [3, 5]}.')
  const { file, calls } = input
  if (typeof file !== 'string' || file.length > 40 || !/^[a-z]*$/.test(file)) throw new Error('file is a string of at most 40 lowercase letters.')
  if (!Array.isArray(calls) || calls.length < 1 || calls.length > 8 || !calls.every(n => Number.isInteger(n) && n >= 1 && n <= 10)) {
    throw new Error('calls is a list of 1 to 8 integers, each from 1 to 10.')
  }
  return { file, calls }
}

export function buildTrace({ file, calls }) {
  let pos = 0
  let cache = ''
  const results = []
  const frames = []
  const snap = extra => ({ call: -1, n: 0, out: '', cache, pos, results: results.map(r => r.slice()), chunk: null, ...extra })
  calls.forEach((n, call) => {
    let out = ''
    frames.push({ phase: 'start', activeLine: 2, message: `Call ${call + 1}: read(${n}). Cache holds "${cache}".`, snapshot: snap({ call, n, out }) })
    while (out.length < n) {
      frames.push({ phase: 'check', activeLine: 4, message: cache ? `Cache holds "${cache}", so use it before reading the file.` : 'Cache is empty, so call read4().', snapshot: snap({ call, n, out }) })
      if (!cache) {
        const chunk = file.slice(pos, pos + 4)
        pos += chunk.length
        frames.push({ phase: 'pull', activeLine: 5, message: chunk ? `read4 returns "${chunk}" and the file position moves to ${pos}.` : 'read4 returns nothing: end of file.', snapshot: snap({ call, n, out, chunk }) })
        if (!chunk) break
        cache = chunk
      }
      const take = Math.min(n - out.length, cache.length)
      out += cache.slice(0, take)
      cache = cache.slice(take)
      frames.push({ phase: 'take', activeLine: 8, message: `Copy ${take} character(s); output is "${out}", cache is "${cache}".`, snapshot: snap({ call, n, out }) })
    }
    results.push(out)
    frames.push({ phase: 'done', activeLine: 11, message: `Call ${call + 1} returns "${out}" (${out.length} of ${n}).`, snapshot: snap({ call, n, out }) })
  })
  return { input: { file, calls }, result: results, frames }
}
