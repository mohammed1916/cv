export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.parent) || typeof data.s !== 'string') throw new Error('Use an object with an array parent and a string s, for example {"parent":[-1,0,0,1,1,2],"s":"aababa"}.')
  const n = data.parent.length
  if (n < 1 || n > 10) throw new Error('parent must have 1 to 10 entries.')
  if (data.s.length !== n || !/^[a-z]+$/.test(data.s)) throw new Error('s must be lowercase letters with one letter per node.')
  if (data.parent[0] !== -1) throw new Error('The root (node 0) must have parent -1.')
  for (let i = 1; i < n; i++) {
    const p = data.parent[i]
    if (!Number.isInteger(p) || p < 0 || p >= n) throw new Error('Each parent must be a node number from 0 to n minus 1.')
    // Walking up from every node must reach the root, which rules out cycles.
    let v = i
    for (let steps = 0; v !== 0 && steps <= n; steps++) v = data.parent[v]
    if (v !== 0) throw new Error('The parent array must describe a tree with root 0.')
  }
  return { parent: data.parent, s: data.s }
}

export function buildTrace(input) {
  const { parent, s } = input
  const n = parent.length
  const children = Array.from({ length: n }, () => [])
  for (let v = 1; v < n; v++) children[parent[v]].push(v)
  for (const list of children) list.sort((a, b) => a - b)
  const text = Array.from({ length: n }, () => '')
  const answer = Array.from({ length: n }, () => false)
  const frames = [{ phase: 'start', activeLine: L('call visit on node 0'), node: 0, text: '', palindrome: null, answer: answer.slice(), result: null, message: 'Visit the tree from the root. Each node finishes after its children, so its string is built from theirs.' }]
  const visit = x => {
    for (const c of children[x]) visit(c)
    text[x] = children[x].map(c => text[c]).join('') + s[x]
    answer[x] = text[x] === [...text[x]].reverse().join('')
    frames.push({ phase: 'node', activeLine: L('set answer'), node: x, text: text[x], palindrome: answer[x], answer: answer.slice(), result: null, message: `Node ${x} builds ${text[x]}, which ${answer[x] ? 'is' : 'is not'} a palindrome.` })
  }
  visit(0)
  frames.push({ phase: 'done', activeLine: L('return answer'), node: -1, text: '', palindrome: null, answer: answer.slice(), result: answer, message: 'Every node has its palindrome answer.' })
  return { input, result: answer, frames }
}

export const code = `palindrome check for every node (parent, s)
  set children of each node to its children in increasing order
  define visit(x)
    for each child c of x in order
      visit(c)
    set text of x to the child texts in order followed by s[x]
    set answer[x] to true if text of x reads the same both ways
  call visit on node 0
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def dfs_palindromes(parent, s):
    n = len(parent)
    children = [[] for _ in range(n)]
    for v in range(1, n):
        children[parent[v]].append(v)
    for c in children:
        c.sort()
    text = [''] * n
    answer = [False] * n

    def visit(x):
        for c in children[x]:
            visit(c)
        text[x] = ''.join(text[c] for c in children[x]) + s[x]
        answer[x] = text[x] == text[x][::-1]

    visit(0)
    return answer
`
