import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'List the lines and gaps.' },
    { id: 'try', label: 'Try side', description: 'Is it also a vertical gap?' },
    { id: 'found', label: 'Found', description: 'This is the largest common side.' },
    { id: 'done', label: 'Complete', description: 'Return the area modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "m", "n", "h_fences" and "v_fences", JSON',
  url: 'https://leetcode.com/problems/maximum-square-area-by-removing-fences-from-a-field/',
  complexity: 'O(h squared + v squared) time for the gap sets. The visualization caps each side at 10 and four fences per direction.',
  examples: [
    { label: 'Example 1', input: '{"m":4,"n":3,"h_fences":[2,3],"v_fences":[2]}' },
    { label: 'Example 2', input: '{"m":6,"n":7,"h_fences":[2],"v_fences":[4]}' },
  ],
}

export default function MaximumSquareAreaByRemovingFencesFromAField() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Candidate sides (largest first)' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A square is possible when one side length is a gap between two horizontal lines and also a gap between two vertical lines.</p>
    <p>Removing fences only deletes gaps, so using every fence gives the largest possible set of sides.</p>
  </>} />
}
