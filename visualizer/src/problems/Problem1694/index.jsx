import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Phone text as a JSON string (digits, spaces and dashes)',
  url: 'https://leetcode.com/problems/reformat-phone-number/',
  complexity: 'O(n) time and O(n) space: one pass collects digits and one pass emits blocks.',
  examples: [
    { label: 'Dashes and spaces', input: '"1-23 45"' },
    { label: 'Four digits left', input: '"12345678"' },
    { label: 'Seven digits', input: '"1 2 3 4 5 6 7"' },
    { label: 'Minimum length', input: '"90"' },
  ],
}

function ReformatPhone() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { digits, cursor, blocks } = step.snapshot
    return <>
      <IndexedSequence label="Digits kept (separators removed)" length={digits.length}
        active={cursor < digits.length ? cursor : -1} valueAt={index => digits[index]}
        roleAt={index => (index < cursor ? 'used' : '')} />
      <section aria-label="Blocks so far">
        <h3>Blocks so far</h3>
        <ol>{blocks.map((block, index) => <li key={`${index}-${block}`}>{block}</li>)}</ol>
        {blocks.length === 0 && <p>No blocks yet.</p>}
      </section>
      {step.phase === 'done' && <output aria-label="Formatted number">Result: {run.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p>Removing separators first means the grouping depends only on how many digits remain.</p>
    <p>Taking three at a time while more than four remain keeps every block at size three until the tail. The last four digits are split into two pairs so no block has size one.</p>
  </>} />
}

export default withProblemStory(ReformatPhone, storyGuide);
