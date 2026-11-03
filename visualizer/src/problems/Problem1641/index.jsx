import withProblemStory from '../../components/shared/withProblemStory'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import storyGuide from './storyGuide.json'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Length as a JSON integer from 1 to 50',
  url: 'https://leetcode.com/problems/count-sorted-vowel-strings/',
  complexity: 'O(n) time with five running counts; O(1) extra space.',
  examples: [
    { label: 'Five', input: '5' },
    { label: 'Two', input: '2' },
    { label: 'Long', input: '33' },
  ],
}

function EndingTable({ snapshot }) {
  const { vowels, ends, length, total } = snapshot
  return <>
    <p>Strings of length {length}, grouped by their last vowel.</p>
    <table>
      <thead><tr>{vowels.map(v => <th key={v} scope="col">ends in {v}</th>)}</tr></thead>
      <tbody><tr>{ends.map((c, k) => <td key={k} style={{ textAlign: 'center', fontSize: 18 }}>{c}</td>)}</tr></tbody>
    </table>
    <output aria-label="Total strings">Total: {total}</output>
  </>
}

function SortedVowels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <EndingTable snapshot={step.snapshot} />} renderReasoning={() => <>
    <p>A non-decreasing string is fixed by how many times each vowel appears, so each sorted string corresponds to one multiset of letters.</p>
    <p>The running sums carry the count of every shorter string that can be extended by the next vowel.</p>
  </>} />
}

export default withProblemStory(SortedVowels, storyGuide)
