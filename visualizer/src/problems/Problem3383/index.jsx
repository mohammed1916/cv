import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RuneGraphView from './RuneGraphView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3383',
  phases: [
    { id: 'start', label: 'Arrows', description: 'Start the reachability table from direct edges.' },
    { id: 'closure', label: 'Closure', description: 'Let each middle rune join paths.' },
    { id: 'components', label: 'Groups', description: 'Runes that reach each other share a group.' },
    { id: 'incoming', label: 'Incoming', description: 'Record arrows that enter a group.' },
    { id: 'start-rune', label: 'Initial', description: 'Initial runes cover their group.' },
    { id: 'source', label: 'Check', description: 'Test each group with no way in.' },
    { id: 'done', label: 'Result', description: 'Report the groups that need a start.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (rune count), initial (rune ids) and edges ([from, to] pairs)',
  url: 'https://leetcode.com/problems/minimum-runes-to-add-to-cast-spell/',
  complexity: 'O(n^3) time for the transitive closure and O(n^2) space for the table; the visualization caps n at 8. Reading used here: an edge is followed only in its direction, and the answer is the number of groups with no incoming arrow and no initial rune.',
  examples: [
    { label: 'One source', input: '{"n":6,"initial":[0],"edges":[[0,1],[1,2],[3,2],[4,5],[5,4]]}' },
    { label: 'No initial rune', input: '{"n":4,"initial":[],"edges":[[0,1],[1,0],[2,3]]}' },
    { label: 'Single rune', input: '{"n":1,"initial":[0],"edges":[]}' },
    { label: 'Two sources share a target', input: '{"n":3,"initial":[0,1],"edges":[[0,2],[1,2]]}' },
    { label: 'Full edge budget', input: '{"n":8,"initial":[0],"edges":[[0,1],[1,4],[2,7],[3,2],[4,5],[5,0],[6,3],[7,6],[0,1],[1,4],[2,7],[3,2],[4,5],[5,0],[6,3],[7,6]]}' },
    { label: 'Long run: 8 runes', input: '{"n":8,"initial":[0,3],"edges":[[1,6],[5,0],[1,1],[1,3],[6,6],[3,3],[1,1],[5,3],[7,7],[5,7],[5,2],[6,3],[6,0],[4,4]]}' },
  ],
}

export default function MinimumRunesToAdd() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RuneGraphView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>Runes that reach each other form one group, and arrows between groups form an ordering. A group with no arrow in and no initial rune can only be started directly.</p>
          <p>{step.phase === 'done' ? `Adding one rune to each such group covers everything: ${step.answer} added.` : step.message}</p>
        </>
      )}
    />
  )
}
