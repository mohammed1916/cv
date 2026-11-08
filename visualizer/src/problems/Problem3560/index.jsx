import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LogCutView from './LogCutView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3560', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, m and k',
  url: 'https://leetcode.com/problems/find-minimum-log-transportation-cost/',
  complexity: 'O(1) time and space. The compare step shows at most 8 sample cuts to explain the choice; the solution itself does not loop.',
  examples: [
    { label: 'One long log', input: '{"n":3,"m":13,"k":9}' },
    { label: 'Both fit', input: '{"n":7,"m":7,"k":7}' },
    { label: 'Longest possible log', input: '{"n":20,"m":1,"k":10}' },
    { label: 'Just over the limit', input: '{"n":12,"m":11,"k":11}' },
    { label: 'Smallest k, single logs', input: '{"n":1,"m":1,"k":2}' },
    { label: 'Longer log at 2k', input: '{"n":4,"m":2,"k":2}' },
    { label: 'Equal logs at k', input: '{"n":3,"m":3,"k":3}' },
    { label: 'Long run: k = 5000', input: '{"n":6000,"m":3000,"k":5000}' },
  ],
}

export default function FindMinimumLogTransportationCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LogCutView run={run} step={step} />} renderReasoning={() => <>
    <p>Three trucks and two logs allow exactly one cut, and valid inputs never have both logs over the limit. So only the longest log can need cutting.</p>
    <p>Its two pieces have a fixed sum, and a fixed sum gives the smallest product when the parts are as far apart as possible. The largest legal piece is k, so the cut is k and longest minus k.</p>
  </>} />
}
