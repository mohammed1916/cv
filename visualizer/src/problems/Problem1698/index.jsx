import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Lowercase text as a JSON string (up to 30 letters)',
  url: 'https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/',
  complexity: 'O(n^3) time for this explicit enumeration: n^2 substrings, each costing up to n characters to copy and hash.',
  examples: [
    { label: 'Repeated letter', input: '"aaa"' },
    { label: 'Alternating', input: '"abab"' },
    { label: 'Distinct letters', input: '"abc"' },
    { label: 'Mixed repeats', input: '"banana"' },
  ],
}

function DistinctSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { start, end, text, isNew, count } = step.snapshot
    const text0 = run.input
    return <>
      <IndexedSequence label="Characters" length={text0.length} active={Math.max(0, start)}
        valueAt={index => text0[index]}
        roleAt={index => (start >= 0 && index >= start && index < end ? 'in substring' : '')} />
      <dl aria-label="Substring check">
        <dt>Current substring</dt><dd>{start >= 0 ? `"${text}" from ${start} to ${end - 1}` : 'none yet'}</dd>
        <dt>Status</dt><dd>{step.phase === 'done' ? 'all substrings checked' : isNew === null ? 'about to record' : isNew ? 'new text' : isNew === false ? 'repeat text, not counted again' : 'not started'}</dd>
        <dt>Distinct count</dt><dd>{count}</dd>
      </dl>
      {step.phase === 'done' && <output aria-label="Distinct substrings">Distinct substrings: {step.snapshot.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p>Each substring is identified by its characters, not by its position. Two positions with the same text are one distinct substring.</p>
    <p>Enumerating every start and end covers all substrings; a set keeps only the first copy of each text. This is clear and correct, though not the fastest method for long strings.</p>
  </>} />
}

export default withProblemStory(DistinctSubstrings, storyGuide);
