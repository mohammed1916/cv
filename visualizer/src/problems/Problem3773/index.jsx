import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RunsView from './RunsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Begin at the first character.' },
    { id: 'run', label: 'Run', description: 'A maximal run of equal characters is measured.' },
    { id: 'tally', label: 'Tally', description: 'Count this run length.' },
    { id: 'done', label: 'Result', description: 'Report the largest tally.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/maximum-number-of-equal-length-runs/',
  complexity: 'O(n) time and O(n) space for a string of length n. The visualization caps s at 30 characters.',
  examples: [
    { label: 'Mostly singles', input: '{"s":"pqrsttuuu"}' },
    { label: 'Pairs and triples', input: '{"s":"xxyyzzzaaaab"}' },
  ],
}

export default function MaximumNumberOfEqualLengthRuns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RunsView run={run} step={step} />} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Each maximal run is measured once, then runs are grouped by length. The answer is the largest group size, whatever character fills the runs.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
