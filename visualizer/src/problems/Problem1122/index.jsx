import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { phases, parseInput, buildTrace, code, python } from './algorithm'
import { Sequence } from './SeqKit'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two arrays (JSON object with arr1 and arr2)',
  url: 'https://leetcode.com/problems/relative-sort-array/',
  complexity: 'O(n + m) time for counting and placing, where m is the largest value (30 here).',
  examples: [
    { label: 'Mixed', input: '{"arr1":[4,2,9,2,7,4,1],"arr2":[2,4,1]}' },
    { label: 'Every value listed', input: '{"arr1":[5,5,5],"arr2":[5]}' },
    { label: 'One listed', input: '{"arr1":[8,3,6],"arr2":[3]}' },
  ],
}

export default function RelativeSort() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot
      const pick = s.current === null || s.current === undefined ? -1 : s.listed.indexOf(s.current)
      const counts = s.counts
      const activeRow = counts.findIndex(c => c.value === s.current)
      return <div style={{ display: 'grid', gap: 12 }}>
        <Sequence label="arr2: the listed order" values={s.listed} pointers={pick >= 0 ? { pick } : {}} />
        <RecordStateTable label="Remaining counts in arr1" columns={['value', 'count']} rows={counts} activeRow={activeRow} />
        <Sequence label="Result so far" values={s.result.length ? s.result : ['-']} marks={Object.fromEntries(s.result.map((_, i) => [i, 'written']))} />
        <output aria-label="Result">{step.message}</output>
      </div>
    }}
    renderReasoning={() => <p>Count every value of arr1, then walk arr2 in order and write each listed value as many times as it was counted. Values not in arr2 go last, in ascending order.</p>} />
}
