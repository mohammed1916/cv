import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'day1', label: 'Day 1', description: 'Best amount of each currency reached from the start.' },
    { id: 'day2', label: 'Day 2', description: 'Best route from each currency back to the start.' },
    { id: 'done', label: 'Result', description: 'Combine the two days at each middle currency.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with initialCurrency, pairs1, rates1, pairs2 and rates2',
  url: 'https://leetcode.com/problems/maximize-amount-after-two-days-of-conversions/description/',
  complexity: 'O(n * m) per day with Bellman-Ford style relaxation. The visualization caps each day at 5 pairs.',
  examples: [
    { label: 'Invented market', input: JSON.stringify({ initialCurrency: 'AA', pairs1: [['AA', 'BB']], rates1: [2], pairs2: [['BB', 'AA']], rates2: [3] }) },
    { label: 'Middle hop', input: JSON.stringify({ initialCurrency: 'AA', pairs1: [['AA', 'BB'], ['BB', 'CC']], rates1: [1.5, 2], pairs2: [['CC', 'AA']], rates2: [1.25] }) },
    { label: 'No trades', input: '{"initialCurrency":"AA","pairs1":[],"rates1":[],"pairs2":[],"rates2":[]}' },
    { label: 'Equal rates', input: '{"initialCurrency":"AA","pairs1":[["AA","BB"]],"rates1":[1],"pairs2":[["BB","AA"]],"rates2":[1]}' },
    { label: 'Largest rate limit', input: '{"initialCurrency":"A","pairs1":[["A","B"],["B","C"],["C","D"],["D","E"],["E","F"]],"rates1":[10,10,10,10,10],"pairs2":[["F","A"]],"rates2":[10]}' },
    { label: 'Long run: five pairs a day', input: '{"initialCurrency":"AB","pairs1":[["FD","AC"],["DA","BC"],["ED","DA"],["DC","FA"],["FE","EA"]],"rates1":[1.5,3.5,3.5,5,2.5],"pairs2":[["CA","CE"],["DA","BC"],["AA","CD"],["FA","EC"],["AC","AE"]],"rates2":[1.75,1.25,1.75,2.25,0.5]}' },
  ],
}

export default function MaximizeAmountAfterTwoDays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Best amounts by currency">
      <thead><tr><th>Currency</th><th>Best day 1</th><th>Best day 2 return</th><th>Combined</th></tr></thead>
      <tbody>{step.rows.map(row => <tr key={row.name}>
        <td>{row.name}</td>
        <td>{row.day1.toFixed(3)}</td>
        <td>{row.day2.toFixed(3)}</td>
        <td>{row.product.toFixed(3)}</td>
      </tr>)}</tbody>
    </table>
    {step.result !== undefined && <output aria-label="Best amount">{`Best ${run.input.initialCurrency} amount ${step.result.toFixed(4)}`}</output>}
  </>} renderReasoning={() => <>
    <p>Day one and day two are independent legs of the same trip. For a middle currency c, the best outcome is the best day one amount of c times the best day two return from c.</p>
    <p>Each leg is a path problem where the value is multiplied at every hop, so the relaxation keeps the largest product rather than the smallest.</p>
  </>} />
}
