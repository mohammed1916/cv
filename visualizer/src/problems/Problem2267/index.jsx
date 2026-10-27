import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'early', label: 'Early check', description: 'A quick test rules out every path.' },
    { id: 'start', label: 'Start', description: 'The first parenthesis gives balance 1.' },
    { id: 'cell', label: 'Cell', description: 'Move the balances from the cells above and to the left by this cell.' },
    { id: 'done', label: 'Complete', description: 'Check whether balance 0 is reachable at the end.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of parentheses (JSON object with grid rows of ( and ), up to 6 by 6)',
  url: 'https://leetcode.com/problems/check-if-there-is-a-valid-parentheses-string-path/',
  complexity: 'O(m * n * (m + n)) time, since a balance never exceeds the path length. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Valid path', input: '{"grid":["(()",")()"]}' },
    { label: 'Wrong start', input: '{"grid":[")(","()"]}' },
  ],
}

export default function ValidParenthesesPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.grid.map(row => [...row])} label="Grid" activeCell={{ row: step.row, col: step.col }} />
    <MatrixGrid matrix={step.table} label="Reachable balances (· = not yet, ∅ = none)" activeCell={{ row: step.row, col: step.col }} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A path reads as a parentheses string. It is valid when its running balance never drops below zero and ends at zero.</p>
    <p>Different paths can reach a cell with different balances, so each cell keeps the set of balances that reach it.</p>
  </>} />
}
