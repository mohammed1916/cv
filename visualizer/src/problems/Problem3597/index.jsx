import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PieceTrieView from './PieceTrieView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3597',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/partition-string/',
  complexity: 'O(n) time with the trie, since each character is one step along an edge, and O(n) space for the pieces. The official length reaches 100000; the visualization caps s at 40 characters.',
  examples: [
    { label: 'Pieces share prefixes', input: '{"s":"xyxzxxyy"}' },
    { label: 'Unfinished tail', input: '{"s":"qpqpq"}' },
    { label: 'One letter repeated', input: '{"s":"mmmmmm"}' },
    { label: 'Single character', input: '{"s":"k"}' },
  ],
}

export default function PartitionString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PieceTrieView run={run} step={step} />} renderReasoning={() => <>
    <p>A piece is cut the moment it stops matching what has been kept. Until then, the growing piece is itself a kept piece, so each new piece is an earlier piece plus exactly one character.</p>
    <p>That is why a trie fits: testing "was this seen?" is one edge step from where the walk already stands, with no need to rehash the growing string. A set of strings gives the same answer but rereads each piece.</p>
    <p>If the string runs out while the piece still matches something kept, that tail never became unique and is not part of the answer.</p>
  </>} />
}
