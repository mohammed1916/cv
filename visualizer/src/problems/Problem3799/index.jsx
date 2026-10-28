import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no squares found.' },
    { id: 'check', label: 'Check choice', description: 'Test four distinct words at the corners.' },
    { id: 'done', label: 'Complete', description: 'Report every word square in sorted order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON object with words)',
  url: 'https://leetcode.com/problems/word-squares-ii/',
  complexity: 'O(n^4) time for trying every choice of four words. The visualization caps the list at 8 words.',
  examples: [
    { label: 'Two squares', input: '{"words":["able","area","echo","also"]}' },
    { label: 'None', input: '{"words":["code","cafe","eden","edge"]}' },
  ],
}

const ROLES = ['top', 'left', 'right', 'bottom']

export default function WordSquaresII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { words } = run.input
    const roleAt = i => {
      if (!step.tuple) return ''
      const at = step.tuple.indexOf(i)
      return at >= 0 ? ROLES[at] : ''
    }
    return <IndexedSequence label="Words" length={words.length} valueAt={i => words[i]} active={-1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The top word starts the square, its last letter must start the right word, and the bottom word must match the left word's last letter and the right word's last letter.</p>
  </>} />
}
