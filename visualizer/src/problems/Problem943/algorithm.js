export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('Enter a JSON array of 1 to 8 words (the visualization caps it at 8 words).')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,12}$/.test(w))) throw new Error('Each word must be 1 to 12 lowercase letters.')
  if (new Set(words).size !== words.length) throw new Error('Words must be unique.')
  for (let i = 0; i < words.length; i++) for (let j = 0; j < words.length; j++)
    if (i !== j && words[i].includes(words[j])) throw new Error(`"${words[j]}" is a substring of "${words[i]}"; the problem guarantees no word is a substring of another.`)
  return words
}

export function buildTrace(words) {
  const n = words.length
  const ov = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (i === j) continue
    for (let k = Math.min(words[i].length, words[j].length); k > 0; k--) {
      if (words[i].endsWith(words[j].slice(0, k))) { ov[i][j] = k; break }
    }
  }
  const full = (1 << n) - 1
  const dp = Array.from({ length: 1 << n }, () => Array(n).fill(-1))
  const par = Array.from({ length: 1 << n }, () => Array(n).fill(-1))
  const maskText = mask => '{' + words.filter((_, i) => mask >> i & 1).join(', ') + '}'
  const frames = [{ phase: 'start', activeLine: L('Let n be the number of words'), pythonLine: 2, mask: 0, row: dp[0].slice(), parRow: par[0].slice(), message: `${n} word(s). Visit each exactly once; the shorter the result, the more consecutive words overlap.` }]
  frames.push({ phase: 'overlap', activeLine: L('if word i ends with'), pythonLine: 8, mask: 0, row: dp[0].slice(), parRow: par[0].slice(), ov: ov.map(r => [...r]), message: 'ov[i][j] = longest suffix of word i that is a prefix of word j: appending j after i adds only len(j) - ov[i][j] letters.' })
  for (let i = 0; i < n; i++) dp[1 << i][i] = 0
  for (let mask = 1; mask <= full; mask++) {
    let bestHere = -1
    for (let last = 0; last < n; last++) {
      if (dp[mask][last] < 0) continue
      bestHere = Math.max(bestHere, dp[mask][last])
      for (let nxt = 0; nxt < n; nxt++) {
        if (mask >> nxt & 1) continue
        const nm = mask | 1 << nxt
        const val = dp[mask][last] + ov[last][nxt]
        if (val > dp[nm][nxt]) { dp[nm][nxt] = val; par[nm][nxt] = last }
      }
    }
    frames.push({ phase: 'dp', activeLine: L('for each mask from 1 to full'), pythonLine: 16, mask, row: dp[mask].slice(), parRow: par[mask].slice(), message: `Subset ${maskText(mask)}: dp[mask][last] is the best total overlap ending at word 'last' (-1 = unreachable). Its values are final here and are relaxed into the supersets with one more word.` })
  }
  let last = 0
  for (let i = 1; i < n; i++) if (dp[full][i] > dp[full][last]) last = i
  const best = dp[full][last]
  frames.push({ phase: 'pick', activeLine: L('let last be the word with the best'), pythonLine: 28, mask: full, row: dp[full].slice(), parRow: par[full].slice(), last, message: `Full set: the best ending word is "${words[last]}" with total overlap ${best}.` })
  const order = []
  let mask = full, cur = last
  while (cur !== -1) {
    order.push(cur)
    const next = par[mask][cur]
    frames.push({ phase: 'backtrack', activeLine: L('backtrack from (full, last)'), pythonLine: 31, mask, row: dp[mask].slice(), parRow: par[mask].slice(), last: cur, order: [...order], message: `Backtrack: "${words[cur]}" came after ${next === -1 ? 'nothing (it is the first word)' : `"${words[next]}"`}.` })
    mask ^= 1 << cur
    cur = next
  }
  order.reverse()
  let res = words[order[0]]
  frames.push({ phase: 'build', activeLine: L('start res with the first word'), pythonLine: 34, mask: full, row: dp[full].slice(), parRow: par[full].slice(), order: [...order], res, message: `Start with "${res}".` })
  for (let k = 0; k + 1 < order.length; k++) {
    const a = order[k], b = order[k + 1]
    res += words[b].slice(ov[a][b])
    frames.push({ phase: 'build', activeLine: L('append word b without'), pythonLine: 36, mask: full, row: dp[full].slice(), parRow: par[full].slice(), order: [...order], res, message: `Append "${words[b].slice(ov[a][b])}" (skip ${ov[a][b]} overlapping letters of "${words[b]}"): ${res}` })
  }
  frames.push({ phase: 'done', activeLine: L('return res'), pythonLine: 37, mask: full, row: dp[full].slice(), parRow: par[full].slice(), order: [...order], res, message: `Shortest superstring: "${res}" (length ${res.length}).` })
  return { input: [...words], result: res, ov, frames }
}

export const code = `Let n be the number of words, and let ov[i][j] be the longest suffix of word i that is a prefix of word j
for each pair (i, j) with i not equal to j
  for k from the shorter word length down to 1
    if word i ends with the first k letters of word j, set ov[i][j] to k and stop
Let full be the mask with all n bits set, and dp[mask][last] the best total overlap of a chain visiting mask and ending at last
for each word i, set dp[1 << i][i] to 0
for each mask from 1 to full
  for each last with dp[mask][last] at least 0
    for each word nxt not in mask
      let val be dp[mask][last] + ov[last][nxt]
      if val is more than dp[mask | 1 << nxt][nxt], store val and record last as the parent
let last be the word with the best dp[full][last]
backtrack from (full, last) through the parents to get the visiting order, then reverse it
start res with the first word, and for each consecutive pair (a, b) append word b without its first ov[a][b] letters
return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_superstring(words):
    n = len(words)
    ov = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                for k in range(min(len(words[i]), len(words[j])), 0, -1):
                    if words[i].endswith(words[j][:k]):
                        ov[i][j] = k
                        break
    full = (1 << n) - 1
    dp = [[-1] * n for _ in range(1 << n)]
    par = [[-1] * n for _ in range(1 << n)]
    for i in range(n):
        dp[1 << i][i] = 0
    for mask in range(1, 1 << n):
        for last in range(n):
            if dp[mask][last] < 0:
                continue
            for nxt in range(n):
                if mask >> nxt & 1:
                    continue
                nm = mask | 1 << nxt
                val = dp[mask][last] + ov[last][nxt]
                if val > dp[nm][nxt]:
                    dp[nm][nxt] = val
                    par[nm][nxt] = last
    last = max(range(n), key=lambda i: dp[full][i])
    order, mask = [], full
    while last != -1:
        order.append(last)
        mask, last = mask ^ (1 << last), par[mask][last]
    order.reverse()
    res = words[order[0]]
    for a, b in zip(order, order[1:]):
        res += words[b][ov[a][b]:]
    return res`
