import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2129',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Title of words separated by single spaces',
  url: 'https://leetcode.com/problems/capitalize-the-title/',
  complexity: 'O(n) time over the characters of the title.',
  question: "Capitalise the title of a sentence: short words become lowercase, and longer words get an uppercase first letter.",
  approaches: [
    { name: "Per-word transform", intuition: "Check each word's length and rewrite its letters in one pass.", time: "O(n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Mixed lengths', input: 'river BEND on a hill' },
    { label: 'Short only', input: 'Go to IT' }, { label: "Single word", input: "Go" }, { label: "Equal length words", input: "aa bb cc" }, { label: "Largest title", input: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" }, { label: "Long run: 100 characters", input: "pZoQVoE rPYAZ VksUb vOsngisFB EftZIIt uEAjWMgrn uLEWLouqf dksZy TncWl TPYI dih UMxGo pMcHLB" },
  ],
}

export default function Problem2129Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Words" columns={['word', 'length', 'rule', 'result']} rows={step.rows} activeRow={step.i} />
          <p>Title so far: {step.built}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
