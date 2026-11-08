import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const WORKERS = [
  { id: 'fizz', label: 'fizz', rule: 'divisible by 3' },
  { id: 'buzz', label: 'buzz', rule: 'divisible by 5' },
  { id: 'fizzbuzz', label: 'fizzbuzz', rule: 'divisible by 15' },
  { id: 'number', label: 'number', rule: 'neither' },
]

const definition = {
  number: '1195',
  phases: [
    { id: 'start', label: 'Start', description: 'No output yet.' },
    { id: 'fizzbuzz', label: 'Both', description: 'Divisible by 3 and 5: the fizzbuzz worker prints.' },
    { id: 'fizz', label: 'Three', description: 'Divisible by 3 only: the fizz worker prints.' },
    { id: 'buzz', label: 'Five', description: 'Divisible by 5 only: the buzz worker prints.' },
    { id: 'number', label: 'Number', description: 'Neither: the number worker prints the number.' },
    { id: 'done', label: 'Result', description: 'Every value printed in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, an integer from 1 to 30',
  url: 'https://leetcode.com/problems/fizz-buzz-multithreaded/',
  complexity: 'O(n) total work. In the threaded version each worker waits on a shared turn counter.',
  examples: [
    { label: 'Example', input: '{"n":15}' },
    { label: 'Short', input: '{"n":5}' },
    { label: 'Single number', input: '{\"n\":1}' },
    { label: 'Multiple of 3 only', input: '{\"n\":3}' },
    { label: 'Long run: largest allowed n', input: '{\"n\":30}' },
  ],
}

export default function FizzBuzzMultithreaded() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.n
    const printed = step.state.length
    const current = step.phase === 'start' || step.phase === 'done' ? null : printed
    return <>
      <div aria-label="Shared turn counter" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {WORKERS.map(worker => <div key={worker.id} data-worker={worker.id} style={{
          flex: '1 1 120px', padding: 8, boxSizing: 'border-box',
          border: step.phase === worker.id ? '2px solid var(--text)' : '1px solid var(--border)',
          background: step.phase === worker.id ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'var(--surface2)',
          color: 'var(--text)',
        }}>
          <strong>{worker.label} thread</strong>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>prints when the number is {worker.rule}</div>
        </div>)}
      </div>
      <ol aria-label="Turn counter" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
        {Array.from({ length: n }, (_, k) => {
          const value = k + 1
          const done = value <= printed
          const isNow = current !== null && value === current
          return <li key={value} data-role={isNow ? 'now' : done ? 'printed' : 'waiting'} style={{
            minWidth: 40, padding: '6px 4px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: isNow ? '2px solid var(--text)' : '1px solid var(--border)',
            background: done ? 'var(--surface2)' : 'transparent',
            color: done ? 'var(--text)' : 'var(--text-dim)',
          }}>
            <div>{value}</div>
            <small>{done ? step.state[k] : 'wait'}</small>
          </li>
        })}
      </ol>
      <output aria-label="Printed so far">{`Printed: ${step.state.join(' ') || 'nothing yet'}`}</output>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each worker owns one output kind and only prints when the shared counter reaches a number it owns.</p>
    <p>The visualization replays the same turn order on one thread, so the printed sequence matches the threaded version.</p>
  </>} />
}
