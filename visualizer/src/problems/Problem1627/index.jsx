import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Cities, threshold and queries (JSON)',
  url: 'https://leetcode.com/problems/graph-connectivity-with-threshold/',
  complexity: 'Union-find over divisor multiples. Near O(n log n) joins, with path walks in this teaching version. The visualization accepts n up to 30.',
  examples: [
    { label: 'Threshold 2', input: '{"n":10,"threshold":2,"queries":[[3,9],[4,6],[5,7],[8,10],[2,5]]}' },
    { label: 'Threshold 3', input: '{"n":12,"threshold":3,"queries":[[4,8],[5,10],[6,9],[7,11],[2,12]]}' },
    { label: 'Threshold 0', input: '{"n":6,"threshold":0,"queries":[[1,6],[2,5]]}' },
    { label: "Single city", input: "{\"n\":1,\"threshold\":0,\"queries\":[[1,1]]}" },
    { label: "Threshold equals n, no roads", input: "{\"n\":4,\"threshold\":4,\"queries\":[[1,2]]}" },
    { label: "Thirty cities, ten queries", input: "{\"n\":30,\"threshold\":1,\"queries\":[[1,30],[2,29],[3,28],[4,27],[5,26],[6,25],[7,24],[8,23],[9,22],[10,21]]}" },
    { label: "Long run: thirty cities", input: "{\"n\":30,\"threshold\":5,\"queries\":[[25,15],[26,29],[17,14],[28,6],[3,9],[21,2],[14,18],[24,20],[10,29],[21,3]]}" },
  ],
}

export default function GraphConnectivityWithThreshold() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cities (value shows each city's group root)" length={run.input.n} indexOffset={1}
      valueAt={i => `root ${step.roots[i + 1]}`}
      roleAt={i => (step.pair?.includes(i + 1) ? 'pair' : '')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.answers?.length ? `Answers so far: ${step.answers.map(v => (v ? 'connected' : 'separate')).join(', ')}.` : 'Each query only compares two group roots after all links are made.'}</p>
    <p>Cities a and b are connected when they share a divisor above the threshold. Linking each such divisor with its multiples covers every shared divisor, so one group per component is enough.</p>
  </>} />
}
