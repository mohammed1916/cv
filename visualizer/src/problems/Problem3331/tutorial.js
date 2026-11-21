import { CODE_LINES } from './algorithm.js'

// Authored reasons per DFS phase. Each scene names the current node and letter from the real frame.
const REASONS = {
  start: 'Every node should end up under its nearest ancestor with the same letter. Walking the tree in DFS order gives those ancestors, so we track the latest node for each letter.',
  build: 'Child lists are built from the parent array first, so the DFS can visit every child of a node.',
  enter: 'Entering a node means its ancestors are the nodes already on the path. The latest same-letter entry is the candidate new parent, so we save it before overwriting.',
  link: 'Recording this node as the latest one with its letter lets every node in its subtree find it as the nearest same-letter ancestor.',
  children: 'The exit marker is pushed before the children, so the node is finished only after its whole subtree has been processed.',
  exit: 'Leaving a node removes its letter from the path, so siblings and later branches do not see it as an ancestor.',
  merge: 'A finished subtree is added to its effective parent: the matching ancestor if one exists, otherwise the original parent.',
  done: 'Every subtree has been added to its effective parent, so the sizes are final.',
}

export function sizeTutorial({ run, step, previousStep }) {
  const line = CODE_LINES[step.activeLine - 1]?.trim() ?? ''
  const focus = [step.node, step.y].filter(id => id !== undefined && id >= 0)
  return {
    title: step.message.split('.')[0] || 'Next step',
    reason: REASONS[step.phase] ?? REASONS.start,
    action: step.message,
    variables: {
      node: step.node >= 0 ? step.node : '—',
      letter: step.node >= 0 ? run.input.s[step.node] : '—',
      last: JSON.stringify(step.last ?? {}),
      previous: previousStep ? `line ${previousStep.activeLine}` : 'none',
      code: line,
    },
    focus,
  }
}
