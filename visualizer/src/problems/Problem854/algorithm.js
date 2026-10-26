export function parseInput(text) {
  const v = JSON.parse(text)
  if (!Array.isArray(v) || v.length !== 2 || v.some(s => typeof s !== 'string')) throw new Error('Enter a JSON array of two strings, e.g. ["abc","bca"].')
  const [s1, s2] = v
  if (s1.length < 1 || s1.length > 8 || s1.length !== s2.length) throw new Error('Both strings must have the same length, between 1 and 8 (visualization cap).')
  if (!/^[a-f]+$/.test(s1) || !/^[a-f]+$/.test(s2)) throw new Error('Use only the letters a to f.')
  if ([...s1].sort().join('') !== [...s2].sort().join('')) throw new Error('The strings must be anagrams of each other.')
  return { s1, s2 }
}

export function buildTrace({ s1, s2 }) {
  const frames = []
  const queue = [s1]
  const seen = new Set([s1])
  let steps = 0
  const snap = () => queue.slice(0, 20)
  frames.push({ phase: 'start', activeLine: 2, message: `Start BFS from "${s1}". Each level is one more swap; the target is "${s2}".`, cur: s1, next: null, i: -1, j: -1, steps, queue: snap(), queueSize: 1, seenSize: 1 })
  while (queue.length) {
    const level = queue.length
    for (let t = 0; t < level; t++) {
      const cur = queue.shift()
      frames.push({ phase: 'pop', activeLine: 7, message: `Pop "${cur}" at distance ${steps}.`, cur, next: null, i: -1, j: -1, steps, queue: snap(), queueSize: queue.length, seenSize: seen.size })
      if (cur === s2) {
        frames.push({ phase: 'done', activeLine: 9, message: `"${cur}" equals the target, so the minimum number of swaps is ${steps}.`, cur, next: null, i: -1, j: -1, steps, queue: snap(), queueSize: queue.length, seenSize: seen.size })
        return { input: { s1, s2 }, result: steps, frames }
      }
      let i = 0
      while (cur[i] === s2[i]) i++
      frames.push({ phase: 'mismatch', activeLine: 12, message: `First mismatch is index ${i}: need "${s2[i]}" there but have "${cur[i]}". Only swaps that fix this index are worth trying.`, cur, next: null, i, j: -1, steps, queue: snap(), queueSize: queue.length, seenSize: seen.size })
      for (let j = i + 1; j < cur.length; j++) {
        if (cur[j] === s2[i] && cur[j] !== s2[j]) {
          const next = cur.slice(0, i) + cur[j] + cur.slice(i + 1, j) + cur[i] + cur.slice(j + 1)
          if (!seen.has(next)) {
            seen.add(next); queue.push(next)
            frames.push({ phase: 'enqueue', activeLine: 18, message: `Swap indices ${i} and ${j}: "${next}" is new, so enqueue it for distance ${steps + 1}.`, cur, next, i, j, steps, queue: snap(), queueSize: queue.length, seenSize: seen.size })
          } else {
            frames.push({ phase: 'skip', activeLine: 16, message: `Swap indices ${i} and ${j} gives "${next}", already seen at an equal or shorter distance; skip it.`, cur, next, i, j, steps, queue: snap(), queueSize: queue.length, seenSize: seen.size })
          }
        }
      }
    }
    steps++
  }
  frames.push({ phase: 'done', activeLine: 20, message: 'Queue exhausted without reaching the target.', cur: s1, next: null, i: -1, j: -1, steps, queue: [], queueSize: 0, seenSize: seen.size })
  return { input: { s1, s2 }, result: -1, frames }
}

export const code = `def kSimilarity(s1, s2):
    queue = deque([s1])
    seen = {s1}
    steps = 0
    while queue:
        for _ in range(len(queue)):
            cur = queue.popleft()
            if cur == s2:
                return steps
            i = 0
            while cur[i] == s2[i]:
                i += 1
            for j in range(i + 1, len(cur)):
                if cur[j] == s2[i] and cur[j] != s2[j]:
                    nxt = cur[:i] + cur[j] + cur[i+1:j] + cur[i] + cur[j+1:]
                    if nxt not in seen:
                        seen.add(nxt)
                        queue.append(nxt)
        steps += 1
    return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
