import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeroSearchView from './HeroSearchView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with heroes (strengths) and monsters ([strength, coins] pairs)',
  url: 'https://leetcode.com/problems/maximum-coins-heroes-can-collect/',
  complexity: 'O((m + h) log m) time for m monsters and h heroes after sorting: one sort, one prefix pass and a binary search per hero. The visualization caps heroes at 6 and monsters at 8; the official bounds and the >= rule are not verified here.',
  examples: [
    { label: 'Three monsters', input: '{"heroes":[4,1],"monsters":[[2,10],[5,7],[3,1]]}' },
    { label: 'Equal strength', input: '{"heroes":[5,10],"monsters":[[5,3],[11,9]]}' },
  ],
}

export default function Problem2838Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <HeroSearchView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>Sorting the monsters lets each hero&apos;s beatable set be a prefix. Prefix sums turn that prefix into a coin total, and a binary search finds its length.</p>
      <p>{run ? `Totals: ${run.result.join(', ')}.` : ''}</p>
    </>} />
}
