import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && !Number.isInteger(v))) throw new Error('Values must be integers or null.')
  return arr
}

// State of a subtree's root: NEEDS = not watched yet, CAMERA = has a camera, WATCHED = watched without a camera.
const NEEDS = 0, CAMERA = 1, WATCHED = 2

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const states = new Map()
  const frames = [{ phase: 'start', activeLine: L('cameras = 0'), node: null, states: {}, cameras: 0, message: 'Work from the leaves upward. Place a camera only when a node cannot be watched otherwise.' }]
  let cameras = 0
  // Post-order: children are decided before their parent.
  const visit = node => {
    if (!node) return WATCHED
    const left = visit(node.left), right = visit(node.right)
    let state
    let message
    if (left === NEEDS || right === NEEDS) {
      cameras++
      state = CAMERA
      message = `${node.value} has a child that needs watching, so it gets a camera.`
    } else if (left === CAMERA || right === CAMERA) {
      state = WATCHED
      message = `${node.value} is watched by a child's camera.`
    } else {
      state = NEEDS
      message = `${node.value}'s children are both watched without cameras, so ${node.value} must wait for its parent.`
    }
    states.set(node.id, state)
    frames.push({ phase: 'visit', activeLine: L(state === CAMERA ? 'cameras += 1' : 'return'), node: node.id, states: Object.fromEntries(states), cameras, message })
    return state
  }
  if (visit(root) === NEEDS) {
    cameras++
    frames.push({ phase: 'root', activeLine: L('if visit(root)'), node: root.id, states: Object.fromEntries(states), cameras, message: 'The root itself is not watched, so it gets a camera.' })
  }
  frames.push({ phase: 'done', activeLine: L('return cameras'), node: null, states: Object.fromEntries(states), cameras, message: `${cameras} camera(s) cover the tree.` })
  return { input: arr, root: treeFromLevelOrder(arr), result: cameras, frames }
}

export const code = `def minCameraCover(root):
    cameras = 0
    def visit(node):
        nonlocal cameras
        if not node:
            return WATCHED
        left, right = visit(node.left), visit(node.right)
        if left == NEEDS or right == NEEDS:
            cameras += 1
            return CAMERA
        if left == CAMERA or right == CAMERA:
            return WATCHED
        return NEEDS
    if visit(root) == NEEDS:
        cameras += 1
    return cameras`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
