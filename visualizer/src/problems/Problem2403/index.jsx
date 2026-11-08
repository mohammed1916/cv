import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import KillOrderView from './KillOrderView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty set costs nothing.' },
    { id: 'settle', label: 'Settle', description: 'Read the growth rate for this set.' },
    { id: 'improve', label: 'Improve', description: 'Adding this monster lowers the cost.' },
    { id: 'keep', label: 'Keep', description: 'The earlier route is at least as cheap.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest full route.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of monster powers (e.g. [7,3,9,5])',
  url: 'https://leetcode.com/problems/minimum-time-to-kill-all-monsters/',
  complexity: 'O(2^n * n) time and O(2^n) space for n monsters, using the kill-count growth rate. The visualization caps the input at 6 monsters with powers up to 60.',
  examples: [
    { label: 'Staircase', input: '[7,3,9,5]' },
    { label: 'Flat powers', input: '[1,1,1]' },
    { label: 'Mixed', input: '[4,12,6,2,9]' },
    { label: 'Single monster', input: '[9]' },
    { label: 'Largest powers', input: '[60,1,60,1,60,1]' },
    { label: 'Long run: 6 monsters', input: '[38,55,39,41,32,11]' },
  ],
}

export default function MinimumTimeToKillAllMonsters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <KillOrderView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The growth rate depends only on how many monsters are already dead, not which ones, so a subset of killed monsters fully describes the state.</p>
  </>} />
}
