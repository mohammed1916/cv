import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Start with an empty result."
  },
  {
    "id": "word",
    "label": "Word",
    "description": "Take the next word."
  },
  {
    "id": "part",
    "label": "Piece",
    "description": "Read one piece of the split word."
  },
  {
    "id": "keep",
    "label": "Keep",
    "description": "Keep a non-empty piece."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Report the pieces in order."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with words and separator (JSON), e.g. {\"words\":[\"one.two\"],\"separator\":\".\"}",
  url: "https://leetcode.com/problems/split-strings-by-separator/",
  complexity: "O(total length of words) time. The visualization caps input at 20 words of up to 30 characters.",
  examples: [
  {
    "label": "Example 1",
    "input": "{\"words\":[\"one.two.three\",\"four.five\",\"six\"],\"separator\":\".\"}"
  },
  {
    "label": "Example 2",
    "input": "{\"words\":[\"|||\"],\"separator\":\"|\"}"
  }
],
}

export default function SplitStringsBySeparatorVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={step.word}
      roleAt={i => (i === step.word ? 'window' : '')} />
    <output aria-label="Result">{`Result: [${step.result.map(s => `"${s}"`).join(', ')}]`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
