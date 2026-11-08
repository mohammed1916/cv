import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitWordScanView from './DigitWordScanView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON string of lowercase letters (e.g. \"xfourtwoy\")",
  url: "https://leetcode.com/problems/convert-number-words-to-digits/",
  complexity: "O(n) time for a fixed list of ten digit words, since each position checks at most ten short words, and O(n) output space. The visualization caps the string at 40 letters.",
  examples: [
    { label: "Two words", input: "\"xfourtwoy\"" },
    { label: "Overlap is not revisited", input: "\"oneight\"" },
    { label: "Two in reverse order", input: "\"stwoone\"" },
    { label: "Single word", input: "\"one\"" },
    { label: "Repeated word", input: "\"twotwo\"" },
    { label: "Longest allowed string", input: "\"onetwoonetwoonetwoonetwoonetwoonetwofour\"" },
    { label: "Long run: 40 letters", input: "\"oreniersrhhftsirgexwwifvoovwfvnrgssnvesh\"" },
  ],
}

export default function Problem3758Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DigitWordScanView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
