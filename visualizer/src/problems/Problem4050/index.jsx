import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ScoreStripView from './ScoreStripView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Zero points, with the offset set up.' },
    { id: 'total', label: 'Total', description: 'Pick the next total to solve.' },
    { id: 'consider', label: 'Try a run', description: 'Test one run length for this total.' },
    { id: 'improve', label: 'Improve', description: 'This run gives fewer days.' },
    { id: 'done', label: 'Result', description: 'Show the answer and one day sequence.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'A whole number n (e.g. 7)',
  url: 'https://leetcode.com/problems/minimum-days-to-score-exactly-n-points/',
  complexity: 'O(n * sqrt(n)) time and O(n) space: each total tries the run lengths whose triangular number fits. The visualization caps n at 60; the official limit is 100000.',
  examples: [
    { label: 'Two runs', input: '7' },
    { label: 'Small total', input: '2' },
    { label: "Smallest n", input: "1" },
    { label: "Largest n", input: "60" },
    { label: "Middle n", input: "33" },
    { label: "Long run: n = 59", input: "59" },
  ],
}

export default function MinimumDaysToScoreExactlyN() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ScoreStripView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
