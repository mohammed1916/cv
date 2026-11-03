import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1002',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of lowercase words (JSON)',
  url: 'https://leetcode.com/problems/find-common-characters/',
  complexity: 'O(W * L + 26) time for W words of length L at most, and O(26) counting space.',
  examples: [
    { label: 'Repeats kept', input: '["pepper","paper","reap"]' },
    { label: 'Two words', input: '["ab","ba"]' },
    { label: 'Nothing shared', input: '["abc","xyz"]' },
  ],
}

export default function CommonCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { word, common, counts } = step.snapshot
    const countMap = new Map(counts ?? [])
    const commonMap = new Map(common ?? [])
    const letters = [...new Set([...countMap.keys(), ...commonMap.keys()])].sort()
    return <>
      <p>{word === null ? 'No word is being counted yet.' : `Counting "${word}"`}</p>
      <table aria-label="Letter counts" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>letter</th><th>this word</th><th>shared so far</th></tr></thead>
        <tbody>{letters.length === 0 ? <tr><td colSpan={3}>empty</td></tr> : letters.map(ch => <tr key={ch}>
          <td>{ch}</td><td>{countMap.get(ch) ?? '-'}</td><td>{commonMap.get(ch) ?? '-'}</td>
        </tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Per letter:</strong> a letter can appear only as often as it appears in the word that contains it least. Taking the minimum across words captures this.</p>
    <p><strong>Repeats:</strong> the result repeats each surviving letter by its final minimum count.</p>
  </>} />
}
