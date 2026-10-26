import StoryWorkspace from '../../components/shared/StoryWorkspace'
import GameTreeScene from './GameTreeScene'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  inputLabel: 'Parent of each query (JSON array)',
  rules: [
    'Vertex 1 is the tree at the start. Query k attaches vertex k + 1 under an existing vertex.',
    'Every vertex keeps its three longest branch lengths in slots. A new branch that is not longer than any slot is pruned.',
    'After each query we score the tree: the largest second slot, plus one.',
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  examples: [
    { label: 'Sample', input: '[1,1,3,3,1,2,1,2,8]' },
    { label: 'Chain', input: '[1,2,3,4,5,6,7,8]' },
    { label: 'Star', input: '[1,1,1,1,1,1,1,1]' },
  ],
  url: 'https://codeforces.com/problemset/problem/2230/F',
}

export default function GameOnGrowingTree() {
  return <StoryWorkspace definition={definition} renderScene={({ frame, index }) => <GameTreeScene frame={frame} index={index} />} />
}
