import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the beautiful string s.' },
    { id: 'scan', label: 'Scan position', description: 'Look for a raise at the current position, from right to left.' },
    { id: 'place', label: 'Raise', description: 'Raise one letter so it avoids the two letters before it.' },
    { id: 'fill', label: 'Fill', description: 'Fill the later positions with the smallest safe letters.' },
    { id: 'done', label: 'Complete', description: 'Report the result, or an empty string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (a beautiful string) and k (4 to 26)',
  url: 'https://leetcode.doocs.org/en/lc/2663/',
  complexity: 'O(n * k) time in this build, O(n) extra space.',
  examples: [
    { label: 'Example 1', input: '{"s": "abcz", "k": 26}' },
    { label: 'Example 2', input: '{"s": "dc", "k": 4}' },
  ],
}

export default function SmallestBeautiful() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <output aria-label="Current string">{`String: ${step.text || '(empty)'}${step.index >= 0 ? `, position ${step.index}` : ''}`}</output>
  )} renderReasoning={() => <>
    <p>A palindrome of length 2 or 3 is the only kind to avoid locally, so each letter just needs to differ from the two before it.</p>
    <p>Raising the rightmost possible position gives the smallest string above s, and filling the rest with the smallest safe letters finishes it.</p>
  </>} />
}
