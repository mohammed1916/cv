import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Exactly one way to earn 0 points before any type is used.' },
    { id: 'type', label: 'Next type', description: 'Add the copies of this question type, which can be used up to its limit.' },
    { id: 'cell', label: 'Count total', description: 'Sum the previous ways over 0 to the allowed number of copies.' },
    { id: 'done', label: 'Complete', description: 'Report the ways to reach the target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Input (JSON object with target and types as [count, marks] pairs)',
  url: 'https://leetcode.com/problems/number-of-ways-to-earn-points/',
  complexity: 'O(types * target * count) time and O(target) space. The visualization caps target at 30, counts at 8, and types at 4.',
  examples: [
    { label: 'Three kinds, target 13', input: '{"target":13,"types":[[5,3],[2,6],[4,2]]}' },
    { label: 'Example 2', input: '{"target":5,"types":[[8,1],[8,2],[8,5]]}' },
    { label: 'Single way', input: '{"target":18,"types":[[6,1],[3,2],[2,3]]}' },
    { label: 'Single point type', input: '{"target":1,"types":[[1,1]]}' },
    { label: 'Two identical types', input: '{"target":4,"types":[[2,2],[2,2]]}' },
    { label: 'Largest target with four types', input: '{"target":30,"types":[[8,12],[8,12],[8,12],[8,12]]}' },
    { label: 'No way to reach an odd target', input: '{"target":29,"types":[[2,4]]}' },
    { label: 'Long run: four types up to target 30', input: '{"target":30,"types":[[8,1],[7,3],[5,4],[6,7]]}' },
  ],
}

export default function EarnPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable
      title="ways[p]: ways to earn p points"
      values={[step.ways]}
      rowLabels={['ways']}
      activeCell={step.cell === null ? null : { row: 0, column: step.cell }}
    />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each question type is a bounded item: it can be taken between 0 and its count times, each time worth its marks.</p>
    <p>Adding one type at a time means every earlier total is already known, so the new total is the sum of the earlier totals that differ by 0, 1, … up to the type's limit.</p>
  </>} />
}
