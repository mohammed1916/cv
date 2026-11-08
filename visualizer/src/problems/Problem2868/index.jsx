import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WordingBoardView from './WordingBoardView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with alice and bob word lists (e.g. {"alice":["ab"],"bob":["ac"]})',
  url: 'https://leetcode.com/problems/the-wording-game/',
  complexity: 'O(A * B * L) time with memoization over the last word and mover, where A and B are the list sizes and L is the word length. The visualization caps each list at 6 words of length 5; the official bounds are not verified here.',
  examples: [
    { label: 'Bob stuck', input: '{"alice":["ab"],"bob":["ac"]}' },
    { label: 'Chain of letters', input: '{"alice":["a","c"],"bob":["b"]}' },
    { label: 'Longer game', input: '{"alice":["ba","acd","dd"],"bob":["c","d","db"]}' },
    { label: "Alice alone with one word", input: "{\"alice\":[\"a\"],\"bob\":[]}" },
    { label: "Same word for both players", input: "{\"alice\":[\"a\"],\"bob\":[\"a\"]}" },
    { label: "Six words each, maximum length 5", input: "{\"alice\":[\"abcde\",\"zzzzz\",\"m\",\"xy\",\"q\",\"ab\"],\"bob\":[\"abcde\",\"zzzzz\",\"m\",\"xy\",\"q\",\"ab\"]}" },
    { label: "Long run: six words each", input: "{\"alice\":[\"ko\",\"vboen\",\"cu\",\"sw\",\"yx\",\"yotq\"],\"bob\":[\"sjwpc\",\"pxd\",\"rbg\",\"subo\",\"bep\",\"iobs\"]}" },
  ],
}

export default function Problem2868Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <WordingBoardView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>Each state is the last word played and who moves. A player wins a state when some legal word leaves the other player in a losing state.</p>
      <p>{run ? `Alice wins: ${run.result ? 'yes' : 'no'}.` : ''}</p>
    </>} />
}
