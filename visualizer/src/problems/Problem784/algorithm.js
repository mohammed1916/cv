export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[a-zA-Z0-9]+$/.test(s)) throw new Error('Enter a JSON string of 1-12 letters/digits, e.g. "a1b2".')
  if ((s.match(/[a-zA-Z]/g) || []).length > 8) throw new Error('For visualization, use at most 8 letters (at most 256 permutations).')
  return s
}
export function buildTrace(s) {
  const result = []
  const frames = [{ phase: 'start', activeLine: 1, index: 0, path: '', count: 0, message: 'Start a depth-first search with an empty prefix. Each letter doubles the number of outputs; digits do not.' }]
  const dfs = (i, path) => {
    if (i === s.length) {
      result.push(path)
      frames.push({ phase: 'emit', activeLine: 5, index: i, path, count: result.length, message: `All ${s.length} characters are fixed, so "${path}" is a complete permutation.` })
      return
    }
    const ch = s[i]
    if (/[a-zA-Z]/.test(ch)) {
      frames.push({ phase: 'branch', activeLine: 7, index: i, path, count: result.length, message: `"${ch}" is a letter: try lowercase first, then uppercase.` })
      dfs(i + 1, path + ch.toLowerCase())
      frames.push({ phase: 'branch', activeLine: 9, index: i, path, count: result.length, message: `Back at index ${i}: now try the uppercase "${ch.toUpperCase()}".` })
      dfs(i + 1, path + ch.toUpperCase())
    } else {
      frames.push({ phase: 'digit', activeLine: 11, index: i, path, count: result.length, message: `"${ch}" is a digit and has only one form; append it unchanged.` })
      dfs(i + 1, path + ch)
    }
  }
  dfs(0, '')
  frames.push({ phase: 'done', activeLine: 13, index: s.length, path: '', count: result.length, message: `Done: ${result.length} permutations.` })
  return { input: s, result, frames }
}
export const code = `def letterCasePermutation(s):
    res = []
    def dfs(i, path):
        if i == len(s):
            res.append(path)
            return
        if s[i].isalpha():
            dfs(i + 1, path + s[i].lower())
            dfs(i + 1, path + s[i].upper())
        else:
            dfs(i + 1, path + s[i])
    dfs(0, "")
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
