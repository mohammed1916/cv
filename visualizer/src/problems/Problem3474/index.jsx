import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Fill the word with a.' },
    { id: 'force', label: 'T windows', description: 'Write str2 where the pattern says T.' },
    { id: 'check', label: 'F windows', description: 'Find windows that equal str2.' },
    { id: 'fix', label: 'Break', description: 'Change one free letter to b.' },
    { id: 'fail', label: 'Fail', description: 'No valid word exists.' },
    { id: 'done', label: 'Result', description: 'Report the smallest word.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with str1 (T and F letters) and str2 (lowercase letters)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-generated-string/',
  complexity: 'Roughly O(n * m) time for the constraint sweeps. The visualization caps str1 at 8 letters and str2 at 4.',
  examples: [
    { label: 'Example', input: '{"str1":"TFT","str2":"ab"}' },
    { label: 'Impossible', input: '{"str1":"TT","str2":"ab"}' },
  ],
}

export default function LexicographicallySmallestGeneratedString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Word" length={step.word.length} valueAt={i => step.word[i]}
      active={step.at !== undefined && step.at >= 0 ? step.at : -1}
      roleAt={i => (step.fixed[i] ? 'fixed' : '')} />
    <output aria-label="Window status">{`window ${step.window >= 0 ? step.window : 'none'} ${step.kind || ''}, ${step.ok === false ? 'impossible' : step.ok ? 'done' : 'working'}`}</output>
  </>} renderReasoning={() => <>
    <p>Positions forced by a T must hold str2 exactly, so they are written first and marked as fixed.</p>
    <p>Free positions stay a. An F window that equals str2 is broken by changing its rightmost free letter to b, which keeps the word as small as possible.</p>
  </>} />
}
