import AlgorithmWorkspace from '../../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../../components/shared/IndexedSequence';
import TrieStateDiagram from '../../../components/shared/TrieStateDiagram';
import RecordStateTable from '../../../components/shared/RecordStateTable';
import PointStateDiagram from '../../../components/shared/PointStateDiagram';
import LinkedListGraph from '../../../components/shared/LinkedListGraph';
import styles from './SequenceStory.module.css';

const display = value => value === null ? '·' : typeof value === 'object' ? JSON.stringify(value) : String(value);

function Matrix({ values, label, cell, otherCell }) {
  return <div className={styles.matrix}><table>
    <caption>{label}</caption>
    <thead><tr><th scope="col">row / col</th>{values[0].map((_, c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
    <tbody>{values.map((row, r) => <tr key={r}><th scope="row">{r}</th>{row.map((value, c) => {
      const active = cell?.[0] === r && cell?.[1] === c;
      const compared = otherCell?.[0] === r && otherCell?.[1] === c;
      return <td key={c} className={active ? styles.active : compared ? styles.compared : ''} aria-label={`row ${r}, column ${c}: ${display(value)}${active ? ', current' : compared ? ', comparison' : ''}`}>{display(value)}</td>;
    })}</tr>)}</tbody>
  </table></div>;
}

export default function SequenceStory({ definition }) {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const sequence = typeof step.sequence === 'string' ? [...step.sequence] : step.sequence;
      const matrix = step.matrix ?? (Array.isArray(sequence?.[0]) ? sequence : null);
      return <>
        {step.trieNodes && <TrieStateDiagram nodes={step.trieNodes} activeNode={step.activeNode} />}
        {step.pointState && <PointStateDiagram {...step.pointState} />}
        {step.linkedList && <LinkedListGraph {...step.linkedList} />}
        {step.sourceRecords ? <RecordStateTable {...step.sourceRecords} /> : matrix ? <Matrix values={matrix} label={step.matrixLabel ?? 'Source matrix'} cell={step.cell} otherCell={step.otherCell} /> :
          <IndexedSequence label="Input / working sequence" length={sequence.length} valueAt={i => display(sequence[i])} active={step.index}
            roleAt={i => step.marks?.[i] ?? (step.window && i >= step.window[0] && i <= step.window[1] ? 'in window' : '')} />}
        {step.outputMatrix && <Matrix values={step.outputMatrix} label={step.outputMatrixLabel ?? 'Output matrix (dots are unwritten cells)'} cell={step.outputCell} />}
        {step.additionalSourceRecords?.map((records,index) => <RecordStateTable key={`${records.label}-${index}`} {...records} />)}
        {step.resultRecords && <RecordStateTable {...step.resultRecords} />}
        {step.output && <IndexedSequence label="Output / stack — dots are unwritten slots" length={step.output.length} active={step.outputIndex ?? step.output.length - 1} valueAt={i => display(step.output[i])} />}
        {step.table && <table><caption>{step.tableCaption ?? (definition.title === 'Degree of an Array' ? 'Value, frequency, and enclosing span' : step.tableHeaders ? 'Algorithm state' : 'Occurrence counts')}</caption>
          <thead><tr>{(step.tableHeaders ?? (step.table[0]?.length === 4 ? ['Value','Count','First','Last'] : ['Value','Count'])).map(label => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>{step.table.map((row,i) => <tr key={i}>{row.map((value,j) => <td key={j}>{display(value)}</td>)}</tr>)}</tbody></table>}
        {Object.keys(step.metrics).length > 0 && <dl className={styles.metrics}>{Object.entries(step.metrics).map(([key,value]) => <div key={key}><dt>{key.replace(/([a-z])([A-Z])/g, '$1 $2')}</dt><dd>{display(value)}</dd></div>)}</dl>}
        {step.phase === 'done' && <output aria-label="Algorithm result">Result: {display(step.result)}</output>}
      </>;
    }}
    renderReasoning={() => <>
      <h3>What this achieves</h3><p>{definition.strategy}</p>
      <h3>Try the boundaries</h3><ul>{definition.examples.slice(1).map(e => <li key={e.label}>{e.label}</li>)}</ul>
      <p>Pseudocode follows the playback steps. The Python view, when available, contains a complete solution. Complexity describes the algorithm; replay also stores state snapshots.</p>
    </>} />;
}
