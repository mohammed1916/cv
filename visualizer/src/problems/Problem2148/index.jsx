import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2148',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON',
  url: 'https://leetcode.com/problems/count-elements-with-strictly-smaller-and-greater-elements/',
  complexity: 'O(n) time and O(1) extra space beyond the bounds.',
  examples: [
    { label: 'Two in the middle', input: '[11,7,2,15,7]' },
    { label: 'All equal', input: '[5,5,5]' },
    { label: 'Single value', input: '[4]' },
    { label: 'Two distinct values', input: '[1,2]' },
    { label: 'Repeated extremes', input: '[2,1,2,1,3]' },
    { label: 'Extreme values', input: '[-100000,0,100000]' },
    { label: 'Long run: 40 values', input: '[36560,41793,77990,21349,-11189,46400,-49429,-52847,-80744,-94935,-19448,-83987,-47535,82538,98455,-82985,51524,-260,-45544,-70202,-83846,83393,18576,-11011,-99163,-45183,82667,-94678,-97759,35726,96374,29912,22497,14597,-62230,36444,88839,-68515,62288,-17645]' },
  ],
}

export default function Problem2148Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Values (smallest ${step.low}, largest ${step.high})`} length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i} roleAt={i => step.marks[i] === 'min' ? 'min' : step.marks[i] === 'max' ? 'max' : ''} />
          <p>Counted so far: {step.count}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
