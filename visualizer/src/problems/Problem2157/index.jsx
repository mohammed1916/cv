import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2157',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Words as a JSON array',
  url: 'https://leetcode.com/problems/groups-of-strings/',
  complexity: 'O(n * 26 * 26) mask operations with union-find; O(n) space.',
  examples: [
    { label: 'Two groups', input: '["abc","ab","bcd","xyz","yz"]' },
    { label: 'Replace joins', input: '["ab","cd","ac","bd"]' },
    { label: 'Single word', input: '["a"]' },
    { label: 'Anagrams form one group', input: '["ab","ba"]' },
    { label: 'Two separate groups', input: '["abc","xyz"]' },
    { label: 'Twelve full-length words', input: '["abcdefgh","bcdefghi","cdefghij","defghijk","efghijkl","fghijklm","ghijklmn","hijklmno","ijklmnop","jklmnopq","klmnopqr","lmnopqrs"]' },
    { label: 'Long run: 12 words', input: '["lkeyx","arhmd","jiubcdgh","okythz","mnkfhb","m","zb","bjmwkolf","zn","afizetkn","qvifsb","vrm"]' },
  ],
}

export default function Problem2157Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <RecordStateTable label="Words, letter sets and group" columns={['word', 'letters', 'group']} rows={step.rows} activeRow={-1} />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
