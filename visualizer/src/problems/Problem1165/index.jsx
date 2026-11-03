import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, pythonLineMap, phases, parseInput, buildTrace } from './algorithm'

const definition = {
  number: '1165',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"keyboard": "26 distinct letters", "word": "lowercase letters"}',
  url: 'https://leetcode.com/problems/single-row-keyboard/description/',
  complexity: 'O(26 + n) time and O(26) space for a word of n letters. The visualization caps the word at 200 letters.',
  examples: [
    { label: 'Reversed alphabet', input: '{"keyboard":"zyxwvutsrqponmlkjihgfedcba","word":"abca"}' },
    { label: 'Repeats', input: '{"keyboard":"zyxwvutsrqponmlkjihgfedcba","word":"aaa"}' },
    { label: 'Short hop', input: '{"keyboard":"qwertyuiopasdfghjklzxcvbnm","word":"hello"}' },
  ],
}

export default function SingleRowKeyboardVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const snap = step.snapshot
        return <>
          <IndexedSequence
            label="Keyboard row"
            length={run.input.keyboard.length}
            active={snap.position}
            valueAt={index => run.input.keyboard[index]}
            roleAt={index => index === snap.from ? 'from' : ''}
          />
          <IndexedSequence
            label="Typed letters"
            length={run.input.word.length}
            active={snap.letterIndex}
            valueAt={index => run.input.word[index]}
            roleAt={() => ''}
          />
        </>
      }}
      renderReasoning={({ step }) => <p>Total travel so far: {step.snapshot.total}</p>}
    />
  )
}
