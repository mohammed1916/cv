const LETTERS = /^[a-z]+$/
const MAX_NODES = 15
const MAX_LENGTH = 40
const MAX_LEAF = 8

const label = path => (path === '' ? 'root' : path)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with k and root.')
  const { k, root } = input
  if (!Number.isInteger(k)) throw new Error('k is an integer.')
  let count = 0
  const check = (node, path) => {
    if (!node || typeof node !== 'object' || !Number.isInteger(node.len) || node.len < 1) throw new Error(`Node ${label(path)} needs an integer len of at least 1.`)
    if (++count > MAX_NODES) throw new Error(`Use at most ${MAX_NODES} nodes.`)
    if (node.text !== undefined) {
      if (typeof node.text !== 'string' || !LETTERS.test(node.text) || node.text.length > MAX_LEAF || node.text.length !== node.len) throw new Error(`Leaf ${label(path)} needs 1 to ${MAX_LEAF} lowercase letters whose count equals len.`)
      return
    }
    if (!node.left || !node.right) throw new Error(`Node ${label(path)} needs left and right children, or a text leaf.`)
    check(node.left, path + 'L')
    check(node.right, path + 'R')
    if (node.len !== node.left.len + node.right.len) throw new Error(`Node ${label(path)} len must equal its children's lengths added together.`)
  }
  check(root, '')
  if (root.len > MAX_LENGTH) throw new Error(`The represented string has at most ${MAX_LENGTH} characters.`)
  if (k < 1 || k > root.len) throw new Error(`k is between 1 and ${root.len}.`)
  return { k, root }
}

export function buildTrace({ k, root }) {
  const frames = []
  const visited = []
  let node = root
  let path = ''
  let index = k
  const push = extra => frames.push({ visited: [...visited], path, index, total: root.len, goTo: null, leftLen: null, ...extra })
  push({ pythonLine: P('node = root'), phase: 'start', activeLine: L('set node to the root'), message: `Find position ${k} (1-based) in a string of ${root.len} characters without expanding it.` })
  while (node.text === undefined) {
    const leftLen = node.left.len
    if (index <= leftLen) {
      push({ pythonLine: P('if index <= node'), phase: 'left', activeLine: L('if index is at most'), goTo: 'left', leftLen, message: `${index} is at most ${leftLen}, the length of the left part of ${label(path)}. Descend left.` })
      visited.push(path)
      node = node.left
      path += 'L'
    } else {
      const old = index
      index -= leftLen
      push({ pythonLine: P('index -= node'), phase: 'right', activeLine: L('subtract the length'), goTo: 'right', leftLen, message: `${old} is past the left part (${leftLen}). Subtract it to get ${index} and descend right.` })
      visited.push(path)
      node = node.right
      path += 'R'
    }
  }
  const ch = node.text[index - 1]
  push({ pythonLine: P('return node'), phase: 'leaf', activeLine: L('return the character'), message: `Leaf ${label(path)} holds "${node.text}"; position ${index} inside it is "${ch}".` })
  push({ pythonLine: P('return node'), phase: 'done', activeLine: L('return the character'), message: `The ${k}th character is "${ch}".` })
  return { input: { k, root }, result: ch, frames }
}

export const code = `kth character of a rope tree, k is 1-based
  set node to the root and index to k
  while node is an internal node
    if index is at most the length of node.left
      set node to node.left
    else
      subtract the length of node.left from index
      set node to node.right
  return the character at position index in the leaf text`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `def kth_character(root, k):
    node = root
    index = k
    while "text" not in node:
        if index <= node["left"]["len"]:
            node = node["left"]
        else:
            index -= node["left"]["len"]
            node = node["right"]
    return node["text"][index - 1]
`

const P = s => {
  const i = python.split('\n').findIndex(l => l.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
