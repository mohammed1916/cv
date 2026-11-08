import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TargetCostView from './TargetCostView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 1 to 1000000000)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-equal-iii/',
  complexity: 'With D distinct values up to V, finding divisors takes O(D·√V) and the tallies take time proportional to the total divisor count, at most 1344 per value. At full size, trial division by primes up to √V is needed in place of the simple loop. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'A chain and a stranger', input: '{"nums":[4,8,16,7]}' },
    { label: 'Duplicates win', input: '{"nums":[9,9,9,4,5]}' },
    { label: 'A 1 in the array', input: '{"nums":[1,6,10]}' },
    { label: 'Already equal', input: '{"nums":[11,11]}' },
    { label: 'All ones', input: '{"nums":[1,1,1]}' },
    { label: "Single entry", input: '{"nums":[3]}' },
    { label: "Equal entries", input: '{"nums":[6,6,6]}' },
    { label: "Largest values at the limit", input: '{"nums":[1000000000,500000000,1000000000]}' },
    { label: "Long run: 12 entries", input: '{"nums":[51,36,5,59,38,14,42,54,59,43,62,27]}' },
  ],
}

export default function MinimumOperationsToMakeArrayEqualIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <TargetCostView run={run} step={step} />} renderReasoning={() => <>
    <p>One operation jumps straight to any multiple or any divisor above 1, however far. So getting x to a target T costs 0 if they are equal, 1 if one divides the other, and otherwise 2: go through a common divisor above 1, or up to their least common multiple and back down.</p>
    <p>A least common multiple of the whole array costs at most one per element, so the answer never exceeds n. To beat it, a target must save more through exact matches than it loses on elements two operations away. With a target outside the array nothing matches exactly, so only values in the array can beat n.</p>
    <p>The cost for target v is therefore 2n minus the elements related to v minus the copies of v. Listing each value's divisors finds all related pairs without comparing every pair.</p>
    <p>The value 1 is special: a division needs k smaller than the element, so the result is always above 1. 1 is a valid target only if every element is already 1.</p>
  </>} />
}
