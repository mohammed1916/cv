import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty map', description: 'No words are stored yet.' },
    { id: 'insert', label: 'Insert word', description: 'Store the word; a repeated word replaces its value.' },
    { id: 'sum', label: 'Prefix sum', description: 'Add the values of every stored word that starts with the prefix.' },
    { id: 'done', label: 'Results', description: 'One sum per sum operation, in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array of ["insert", word, value] or ["sum", prefix])',
  url: 'https://leetcode.com/problems/map-sum-pairs/',
  complexity: 'O(k) per insert and O(n · k) per sum for n stored words of length up to k, using the scan shown here.',
  examples: [
    { label: 'Prefix grows', input: '[["insert","bell",4],["sum","be"],["insert","bee",2],["insert","bell",1],["sum","be"]]' },
    { label: 'No match', input: '[["insert","cat",5],["sum","do"]]' },
  ],
}

export default function MapSumPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Stored words" columns={['word', 'value', 'matches prefix']}
      rows={step.entries.map(([word, value]) => ({
        word, value,
        'matches prefix': step.op && step.op[0] === 'sum' && word.startsWith(step.op[1]) ? 'yes' : 'no',
      }))} />
    <RecordStateTable label="Sum answers so far" columns={['answer']} rows={step.outputs.map(answer => ({ answer }))} />
    <output aria-label="Current prefix">{step.op ? `${step.op[0]} ${step.op[1]}${step.total !== null && step.total !== undefined ? ` = ${step.total}` : ''}` : 'Waiting'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why scan the keys here:</strong> a plain scan keeps the logic visible; a trie that stores running sums at each prefix node would answer a query without visiting every key.</p>
  </>} />
}
