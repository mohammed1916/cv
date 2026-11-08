import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty record', description: 'No scores yet.' },
    { id: 'score', label: 'Record score', description: 'An integer is pushed as a new score.' },
    { id: 'cancel', label: 'C: cancel', description: 'Remove the most recent score.' },
    { id: 'double', label: 'D: double', description: 'Push twice the most recent score.' },
    { id: 'sum', label: '+: add two', description: 'Push the sum of the two most recent scores.' },
    { id: 'done', label: 'Total', description: 'Add every score still on the record.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array of strings)',
  url: 'https://leetcode.com/problems/baseball-game/',
  complexity: 'O(n) time and O(n) space for the record.',
  examples: [
    { label: 'Cancel', input: '["4","7","C","D","+"]' },
    { label: 'Mixed signs', input: '["3","-1","+","D","C","6"]' },
    { label: 'Only cancels', input: '["2","C","9","C"]' },
    { label: 'One score', input: '["5"]' },
    { label: 'Equal scores', input: '["1","1","+","+"]' },
    { label: 'Largest scores', input: '["30000","30000","+"]' },
    { label: 'Long run: 300 operations', input: '["29528","-25267","-7895","-3497","C","-25706","-25161","11317","+","+","D","C","7427","D","C","C","+","+","C","-1920","D","D","+","C","10986","D","+","-28693","+","D","+","+","18273","22406","+","D","-14062","D","D","+","-15742","C","+","+","+","D","+","C","C","+","+","+","-12469","C","+","+","+","D","D","C","+","+","18113","D","D","C","+","C","D","+","+","+","+","+","C","D","C","-1911","C","C","+","C","C","5802","12827","-25115","C","C","C","+","+","D","+","C","C","-27768","C","C","-4152","D","D","C","D","C","D","C","D","+","-15643","D","4343","D","C","C","+","-5008","C","+","5693","21883","D","+","D","C","-22874","C","+","D","+","D","+","D","C","+","+","D","+","D","+","+","D","D","C","C","D","+","D","D","-20896","D","C","+","D","C","+","C","C","D","+","C","D","C","+","D","C","+","D","22990","22207","7382","D","12237","D","+","D","C","C","C","D","-24207","D","+","+","D","3337","+","C","+","D","D","+","C","D","-6537","C","D","C","D","+","-10742","834","-5600","C","+","+","D","C","+","D","C","C","+","+","D","D","+","C","D","D","D","D","+","10153","C","C","C","-23902","C","+","+","-20442","+","20505","D","C","D","C","-807","+","D","C","+","11424","-14150","D","D","C","C","-22093","C","D","D","C","+","27605","D","D","+","+","+","C","D","-6418","C","+","D","D","+","+","+","D","+","+","+","+","+","+","C","+","+","D","C","+","-26284","+","D","D","C","+","+","C","-4772","+","+","C","-12157","C","15648","D","D"]' },
  ],
}

export default function BaseballGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Score record" items={step.stack.map(String)} dropped={step.dropped.map(String)}
      note={step.op ? `operation ${step.op}` : 'start'} />
    <output aria-label="Running total">{`Total so far: ${step.stack.reduce((a, b) => a + b, 0)}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a stack:</strong> each operation only needs the latest one or two scores, which is exactly what the top of a stack gives.</p>
  </>} />
}
