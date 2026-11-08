import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RopeTreeView from './RopeTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start at the root with the 1-based index.' },
    { id: 'left', label: 'Go left', description: 'The index falls inside the left part.' },
    { id: 'right', label: 'Go right', description: 'Skip the left part, then descend right.' },
    { id: 'leaf', label: 'Leaf', description: 'Read the character from the leaf text.' },
    { id: 'done', label: 'Result', description: 'Report the kth character.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with k and root: {len, left, right} or {len, text}',
  url: 'https://leetcode.com/problems/extract-kth-character-from-the-rope-tree/',
  complexity: 'O(h) time and O(1) extra space for a tree of height h, reading only stored lengths on the way down. The visualization caps the tree at 15 nodes and 40 characters.',
  examples: [
    { label: 'Split at the top', input: '{"k":5,"root":{"len":8,"left":{"len":4,"left":{"len":2,"text":"ca"},"right":{"len":2,"text":"ts"}},"right":{"len":4,"left":{"len":1,"text":"e"},"right":{"len":3,"text":"dog"}}}}' },
    { label: 'Single leaf', input: '{"k":3,"root":{"len":3,"text":"run"}}' },
    { label: 'Right spine', input: '{"k":6,"root":{"len":6,"left":{"len":1,"text":"x"},"right":{"len":5,"left":{"len":2,"text":"yz"},"right":{"len":3,"text":"abc"}}}}' },
    { label: 'Single letter', input: '{"k":1,"root":{"len":1,"text":"q"}}' },
    { label: 'Equal halves', input: '{"k":4,"root":{"len":8,"left":{"len":4,"text":"abcd"},"right":{"len":4,"text":"abcd"}}}' },
    { label: 'k at the full length', input: '{"k":8,"root":{"len":8,"left":{"len":5,"text":"hello"},"right":{"len":3,"text":"abc"}}}' },
    { label: 'Long run: 15 nodes, 40 characters', input: '{"k":17,"root":{"len":40,"left":{"len":20,"left":{"len":10,"left":{"len":5,"text":"abcde"},"right":{"len":5,"text":"fghij"}},"right":{"len":10,"left":{"len":5,"text":"klmno"},"right":{"len":5,"text":"pqrst"}}},"right":{"len":20,"left":{"len":10,"left":{"len":5,"text":"uvwxy"},"right":{"len":5,"text":"zabcd"}},"right":{"len":10,"left":{"len":5,"text":"efghi"},"right":{"len":5,"text":"jklmn"}}}}}' },
  ],
}

export default function ExtractKthCharacterFromRopeTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RopeTreeView run={run} step={step} />}
    renderReasoning={() => <>
      <p>A rope node stores the total length of its subtree. The left child's length says how many positions lie to the left, so one comparison picks the side.</p>
      <p>When the index moves right, the left length is subtracted first so the index is relative to the right child.</p>
    </>} />
}
