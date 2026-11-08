import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Days', description: 'Decide each arrival in day order.' },
    { id: 'done', label: 'Result', description: 'The number of discards.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arrivals, w and m',
  url: 'https://leetcode.com/problems/minimum-discards-to-balance-inventory/',
  complexity: 'O(n^2) in this straightforward version, because each day scans the kept list. A per-type queue would make it O(n).',
  examples: [
    { label: 'Example', input: '{"arrivals":[4,4,2,4,4],"w":3,"m":2}' },
    { label: 'Tight limit', input: '{"arrivals":[1,1,1,2,1],"w":4,"m":1}' },
    { label: 'One arrival', input: '{"arrivals":[1],"w":1,"m":1}' },
    { label: 'Equal arrivals', input: '{"arrivals":[5,5,5,5],"w":2,"m":1}' },
    { label: 'Largest arrivals', input: '{"arrivals":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],"w":20,"m":20}' },
    { label: 'Long run: 20 arrivals', input: '{"arrivals":[93,2,75,5,46,16,19,38,55,31,65,61,42,41,60,99,50,17,24,74],"w":10,"m":4}' },
  ],
}

export default function MinimumDiscardsBalanceInventory() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arrivals by day" length={run.input.arrivals.length} valueAt={i => run.input.arrivals[i]} active={step.at}
      roleAt={i => (i === step.start && step.at >= 0 ? 'l' : (i === step.at ? (step.keep === false ? 'discarded' : 'r') : (step.kept.includes(i) ? 'kept' : (step.at >= 0 && i > step.start && i < step.at ? 'window' : ''))))} />
    <output aria-label="Discard count">{`discards so far: ${step.discards}`}</output>
  </>} renderReasoning={() => <>
    <p>Each arrival is only checked against the window that ends on its own day. Earlier days already satisfy their windows, so the new arrival is the only one that can break a limit.</p>
    <p>A discard happens exactly when keeping the arrival would push its type above m inside the window of the last w days.</p>
  </>} />
}
