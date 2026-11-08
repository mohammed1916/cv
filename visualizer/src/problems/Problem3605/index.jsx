import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StabilitySearchView from './StabilitySearchView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3605',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and maxC',
  url: 'https://leetcode.com/problems/minimum-stability-factor-of-array/',
  complexity: 'O(n log n log V) to build the table with gcds up to V, then O(n log V) per limit across O(log n) limits. The official length is up to 100000; the visualization caps nums at 14 entries.',
  examples: [
    { label: 'Two long runs', input: '{"nums":[12,18,24,30,5,14,21,7,9],"maxC":2}' },
    { label: 'Budget too small', input: '{"nums":[6,10,15,4,8,3,9],"maxC":1}' },
    { label: 'All ones, no edits', input: '{"nums":[1,1,1],"maxC":0}' },
    { label: 'Single value, no edits', input: '{"nums":[1],"maxC":0}' },
    { label: 'Equal values', input: '{"nums":[6,6,6],"maxC":1}' },
    { label: 'Largest values allowed', input: '{"nums":[1000000000,999999999,1000000000],"maxC":3}' },
    { label: 'Long run: 14 values', input: '{"nums":[241,706,580,801,267,598,128,113,311,187,272,291,807,172],"maxC":4}' },
  ],
}

export default function MinimumStabilityFactor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <StabilitySearchView run={run} step={step} />} renderReasoning={() => <>
    <p>Replacing a value with 1 is the strongest edit, because any window containing a 1 has gcd 1. So every edit is a 1, and the task is only about where to put them.</p>
    <p>If a limit can be reached with maxC edits, any larger limit can too, as it demands less. That monotone shape allows a binary search on the limit, so the question becomes: how many edits does a given limit need?</p>
    <p>Holding stable stretches to length L means no window of L + 1 values may be stable. Scanning from the left, the first stable window must lose a value, and its last position is the best choice: that position lies in every later window that any other position of this window would have broken. Everything up to it is now safe, so the scan jumps past it.</p>
    <p>A window's gcd comes from two table cells that may overlap, which is harmless as gcd ignores repeats. The scan therefore reads each window in two lookups instead of walking it.</p>
  </>} />
}
