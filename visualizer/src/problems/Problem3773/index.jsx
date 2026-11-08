import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RunsView from './RunsView'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

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
    { label: "Single letter", input: "{\"s\":\"z\"}" },
    { label: "One run of equal letters", input: "{\"s\":\"bbbb\"}" },
    { label: "Longest allowed string", input: "{\"s\":\"abcdefghijklmnopqrstuvwxyzabcd\"}" },
    { label: "Long run: 30 letters", input: "{\"s\":\"cabccaacaccacccbbcbaccabbcaaba\"}" },
  ],
}

export default function MaximumNumberOfEqualLengthRuns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} roleAt={i => { const r = step.runs && step.current >= 0 ? step.runs[step.current] : null; if (!r) return ''; return i === r.start ? 'l' : i === r.start + r.length - 1 ? 'r' : i > r.start && i < r.start + r.length - 1 ? 'window' : '' }} /><RunsView run={run} step={step} /></>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Each maximal run is measured once, then runs are grouped by length. The answer is the largest group size, whatever character fills the runs.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
