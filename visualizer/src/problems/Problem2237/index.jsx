import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2237',
  phases: [
    { id: 'setup', label: 'Start', description: 'Start the difference array.' },
    { id: 'mark', label: 'Mark', description: 'Mark where each lamp starts and stops adding light.' },
    { id: 'sweep', label: 'Sweep', description: 'Add the marks left to right to get each position’s brightness.' },
    { id: 'done', label: 'Result', description: 'Count the positions that meet their requirement.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n":4,"lights":[[1,1],[3,0]],"requirement":[0,1,1,2]}',
  url: 'https://leetcode.com/problems/count-positions-on-street-with-required-brightness/',
  complexity: 'O(n + L) time and O(n) space for n positions and L lamps. Each lamp costs two updates to the difference array.',
  examples: [
    { label: 'Example', input: '{"n":4,"lights":[[1,1],[3,0]],"requirement":[0,1,1,2]}' },
    { label: 'Short street', input: '{"n":4,"lights":[[0,2]],"requirement":[1,1,1,0]}' },
  ],
}

export default function StreetBrightness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.n
    return <>
      <IndexedSequence label="brightness by position" length={n} valueAt={i => (step.brightness[i] ?? '?')} active={step.at}
        roleAt={i => (i >= step.brightness.length ? '' : step.passes[i] ? 'meets' : 'short')} />
      <IndexedSequence label="requirement" length={n} valueAt={i => run.input.requirement[i]} active={step.at} roleAt={() => ''} />
      <output aria-label="Positions that meet the requirement">{`${step.count} meet the requirement`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Each lamp adds light to one continuous stretch. Instead of adding to every position, mark the start of the stretch with +1 and the cell after its end with -1.</p>
    <p>A running sum over the marks gives each position's brightness in one pass, and that brightness is compared with its requirement.</p>
  </>} />
}
