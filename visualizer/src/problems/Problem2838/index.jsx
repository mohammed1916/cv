import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeroSearchView from './HeroSearchView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with heroes (strengths) and monsters ([strength, coins] pairs)',
  url: 'https://leetcode.com/problems/maximum-coins-heroes-can-collect/',
  complexity: 'O((m + h) log m) time for m monsters and h heroes after sorting: one sort, one prefix pass and a binary search per hero. The visualization caps heroes at 6 and monsters at 8.',
  examples: [
    { label: 'Three monsters', input: '{"heroes":[4,1],"monsters":[[2,10],[5,7],[3,1]]}' },
    { label: 'Equal strength', input: '{"heroes":[5,10],"monsters":[[5,3],[11,9]]}' },
    { label: "Single hero, single monster", input: "{\"heroes\":[3],\"monsters\":[[3,4]]}" },
    { label: "Equal monsters", input: "{\"heroes\":[5,5],\"monsters\":[[5,2],[5,2],[5,2]]}" },
    { label: "Maximum values", input: "{\"heroes\":[20,20,20,20,20,20],\"monsters\":[[20,20],[20,20],[20,20],[20,20],[20,20],[20,20],[20,20],[20,20]]}" },
    { label: "Long run: 6 heroes, 8 seeded monsters", input: "{\"heroes\":[12,9,10,15,4,9],\"monsters\":[[17,14],[6,15],[19,8],[12,17],[17,10],[10,11],[3,8],[16,17]]}" },
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
