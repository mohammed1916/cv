import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '978',
  title: 'Longest Turbulent Subarray',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr: a list of whole numbers from 0 to 99',
  url: 'https://leetcode.com/problems/longest-turbulent-subarray/',
  complexity: 'O(n) time: one pass with a window that only moves forward. O(1) extra space.',
  examples: [
    { label: 'Zigzag run', input: JSON.stringify({ arr: [3, 7, 2, 9, 4, 4, 1] }) },
    { label: 'Straight climb', input: JSON.stringify({ arr: [4, 8, 12, 16] }) },
    { label: 'Equal values', input: JSON.stringify({ arr: [5, 5, 1, 6, 2] }) },
  ],
}

const SIGN = { 1: 'up', [-1]: 'down', 0: 'flat' }

export default function Problem978() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const arr = run.input.arr
    const inWindow = index => step.l !== null && index >= step.l && index <= step.r
    return <section aria-label="Values with the turbulent window" style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'flex-end' }}>
        {arr.map((value, index) => {
          const role = step.l === index ? 'l' : step.r === index ? 'r' : ''
          return <div key={index} data-index={index} data-in-window={inWindow(index)} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
            <small style={{ color: 'var(--text-muted)' }}>{role || ' '}</small>
            <div style={{
              minWidth: 48, padding: '6px 8px', borderRadius: 6, textAlign: 'center', color: 'var(--text)',
              border: `2px solid ${inWindow(index) ? 'var(--primary)' : 'var(--border)'}`,
              background: inWindow(index) ? 'var(--primary-glow)' : 'var(--surface)',
            }}>
              <small style={{ display: 'block', color: 'var(--text-muted)' }}>[{index}]</small>
              <strong>{value}</strong>
            </div>
            {index < arr.length - 1 && <small style={{ color: 'var(--text-muted)' }}>{SIGN[Math.sign(arr[index + 1] - arr[index])]}</small>}
          </div>
        })}
      </div>
      <p style={{ margin: 0, color: 'var(--text)' }}>Window: {step.l === null ? 'none' : `${step.l} to ${step.r}, length ${step.r - step.l + 1}`}. Longest so far: {step.best}.</p>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Under each gap: the direction of that step, up, down or flat. A turbulent window alternates up and down.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
