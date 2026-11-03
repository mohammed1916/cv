import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Target', description: 'Sort the letters to get the target.' },
    { id: 'level', label: 'Level', description: 'Strings reachable after each operation.' },
    { id: 'done', label: 'Result', description: 'Report the number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters, up to 8)',
  url: 'https://leetcode.com/problems/minimum-operations-to-sort-a-string/',
  complexity: 'The search visits reachable orders of the letters, so its cost grows fast. The visual caps s at 8 letters.',
  examples: [
    { label: 'One step', input: '{"s":"abdc"}' },
    { label: 'Reversed', input: '{"s":"cba"}' },
  ],
}

export default function MinimumOperationsToSortAString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Reachable strings">{step.level.map((text, index) => <li key={index}><code>{text}</code></li>)}</ul>
    <output aria-label="Operation count">{`Operations so far: ${step.ops} · strings in this level: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>A move re-sorts a stretch of letters, as long as that stretch is shorter than the whole word. The search keeps every string reachable after the same number of operations and stops at the first level that contains the sorted string.</p>
    <p>Strings already seen are skipped, so each string is expanded once.</p>
  </>} />
}
