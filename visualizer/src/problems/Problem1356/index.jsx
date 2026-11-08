import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, phases, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values (JSON array of integers)',
  complexity: 'O(n log n) time for the sort and O(n log 10) time to count bits, with O(n) extra space.',
  examples: [
    { label: 'Sample', input: '[0,1,2,3,4,5,6,7,8]' },
    { label: 'Powers', input: '[512,256,1,2,768]' },
    { label: 'Small', input: '[15,7,3]' },
    { label: "Single value", input: "[0]" },
    { label: "Equal values", input: "[8,8,8,8]" },
    { label: "Sixteen values, extremes", input: "[1000,512,256,128,64,32,16,8,4,2,1,0,1000,999,512,1]" },
    { label: "Long run: sixteen random values", input: "[826,334,390,343,822,729,778,258,446,237,29,256,922,530,837,963]" },
  ],
}

export default function SortByOneBits() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const { values, counted, ordered, focus } = step.snapshot
      const countOf = v => counted.find(([x]) => x === v)?.[1]
      return <>
        <IndexedSequence label="Input values" length={values.length} valueAt={i => values[i]} active={values.indexOf(focus)}
          roleAt={i => (countOf(values[i]) !== undefined ? 'counted' : '')} />
        <RecordStateTable label="Bit counts" columns={['value', 'binary', 'ones']} activeRow={values.indexOf(focus)}
          rows={values.map(v => ({ value: v, binary: v.toString(2), ones: countOf(v) ?? '—' }))} />
        {ordered && <RecordStateTable label="Sorted by ones, then value" columns={['position', 'value', 'ones']}
          rows={ordered.map((v, i) => ({ position: i, value: v, ones: countOf(v) }))} />}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
