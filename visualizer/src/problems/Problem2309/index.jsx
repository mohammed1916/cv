import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare two empty sets.' },
    { id: 'collect', label: 'Collect', description: 'Sort each letter by case.' },
    { id: 'check', label: 'Check letter', description: 'Test from Z down to A.' },
    { id: 'done', label: 'Complete', description: 'Return the letter or an empty string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "s" (English letters), JSON',
  url: 'https://leetcode.com/problems/greatest-english-letter-in-upper-and-lower-case/',
  complexity: 'O(n + 26) time and O(1) extra space. The visualization caps s at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"lEeTcOdE"}' },
    { label: 'Example 2', input: '{"s":"arRAzFif"}' },
    { label: 'None', input: '{"s":"AbCdEfGhIjK"}' },
    { label: 'Single letter', input: '{"s":"q"}' },
    { label: 'Two letters, both cases', input: '{"s":"aA"}' },
    { label: 'No letter in both cases', input: '{"s":"abcXYZ"}' },
    { label: 'Longest input, 30 letters', input: '{"s":"ZzZzZzZzZzZzZzZzZzZzZzZzZzZzZz"}' },
    { label: 'Long run: 30 letters', input: '{"s":"sDcAfzqskFcVkUnfNGewGYCPcmgyZd"}' },
  ],
}

export default function GreatestEnglishLetterInUpperAndLowerCase() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Characters of s' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Scanning the alphabet from Z downward finds the greatest qualifying letter first, so the scan can stop at the first match.</p>
    <p>Storing the two cases in separate sets turns each check into a membership test.</p>
  </>} />
}
