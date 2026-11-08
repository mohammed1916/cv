import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2034',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations: updates and queries (JSON)',
  url: 'https://leetcode.com/problems/stock-price-fluctuation/',
  complexity: 'update is O(1); maximum and minimum scan the stored prices in this visual (O(n) each).',
  examples: [
    { label: 'Overwrite', input: '[["update",[3,20]],["update",[5,8]],["minimum"],["update",[3,9]],["maximum"],["current"]]' }, { label: "Single update", input: "[[\"update\",[1,1]],[\"current\"]]" }, { label: "Equal prices", input: "[[\"update\",[1,7]],[\"update\",[2,7]],[\"maximum\"],[\"minimum\"]]" }, { label: "Largest price", input: "[[\"update\",[1,1]],[\"update\",[99999,1000]],[\"maximum\"],[\"minimum\"],[\"current\"]]" }, { label: "Long run: 40 operations", input: "[[\"update\",[1,500]],[\"current\"],[\"minimum\"],[\"update\",[4,79]],[\"current\"],[\"maximum\"],[\"current\"],[\"maximum\"],[\"update\",[9,835]],[\"update\",[10,261]],[\"update\",[11,353]],[\"update\",[12,936]],[\"update\",[13,288]],[\"update\",[14,564]],[\"current\"],[\"update\",[16,620]],[\"minimum\"],[\"update\",[18,287]],[\"update\",[19,917]],[\"update\",[20,34]],[\"update\",[21,153]],[\"current\"],[\"minimum\"],[\"update\",[24,44]],[\"current\"],[\"update\",[26,963]],[\"update\",[27,354]],[\"minimum\"],[\"update\",[29,620]],[\"current\"],[\"minimum\"],[\"update\",[32,68]],[\"minimum\"],[\"current\"],[\"update\",[35,288]],[\"update\",[36,377]],[\"minimum\"],[\"update\",[38,651]],[\"minimum\"],[\"update\",[40,144]]]" },
  ],
}

export default function StockPriceFluctuation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { op, prices, latest, results } = step.snapshot
    return <>
      <table aria-label="Stored prices by timestamp" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr><th style={{ padding: '2px 8px' }}>timestamp</th><th style={{ padding: '2px 8px' }}>price</th></tr></thead>
        <tbody>{prices.map(([t, p]) => <tr key={t} style={{ background: op && op[0] === 'update' && op[1][0] === t ? 'var(--primary-glow)' : 'transparent' }}>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{t}{t === latest ? ' (latest)' : ''}</td>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{p}</td>
        </tr>)}</tbody>
      </table>
      <p>Last operation: <strong>{op ? (op[0] === 'update' ? `update ${op[1][0]} to ${op[1][1]}` : op[0]) : 'none'}</strong>. Query answers: <strong>{results.length ? results.join(', ') : 'none'}</strong>.</p>
    </>
  }} renderReasoning={() => <p>A correction overwrites the price at its timestamp, and the latest timestamp identifies the current price. Maximum and minimum always reflect the stored prices after the last correction.</p>} />
}
