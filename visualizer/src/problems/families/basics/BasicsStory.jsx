import AlgorithmWorkspace from '../../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../../components/shared/IndexedSequence';
import SearchWindow from '../../../components/shared/SearchWindow';
import HistogramBars from '../../../components/shared/HistogramBars';
import StructureTree from '../../../components/shared/StructureTree';
import TrieStateDiagram from '../../../components/shared/TrieStateDiagram';
import SvgViewport from '../../../components/shared/SvgViewport';
import styles from './BasicsStory.module.css';

function Graph({ input, step }) {
  const point = i => ({ x: 200 + 140 * Math.cos(i * 2 * Math.PI / input.n - Math.PI / 2), y: 185 + 140 * Math.sin(i * 2 * Math.PI / input.n - Math.PI / 2) });
  return <SvgViewport width={420} height={385}>
    <title>Breadth-first search: graph, active edge and shortest distances</title>
    {input.edges.map(([a, b], i) => {
      const from = point(a), to = point(b), active = (a === step.active && b === step.neighbor) || (b === step.active && a === step.neighbor);
      return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active ? 'var(--primary)' : 'var(--border)'} strokeWidth={active ? 4 : 2} />;
    })}
    {step.distance.map((distance, id) => {
      const p = point(id);
      return <g key={id} transform={`translate(${p.x},${p.y})`}><title>{`Vertex ${id}, distance ${distance ?? 'unreachable'}, parent ${step.parent[id] ?? 'none'}`}</title>
        <circle r={22} fill="var(--surface2)" stroke={id === step.active || step.queue.includes(id) ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={id === step.active ? 4 : 2} />
        <text textAnchor="middle" y={5} fill="var(--text)">{id}</text>
        <text textAnchor="middle" y={38} fill="var(--text-muted)" fontSize={11}>d={distance ?? '∞'}</text>
      </g>;
    })}
  </SvgViewport>;
}

export function BasicsScene({ kind, run, step }) {
  const input = run.input;
  return <div className={styles.scene}>
    <p className={styles.event} role="status">{step.message}</p>
    {['binary', 'lower'].includes(kind) && <SearchWindow nums={input.nums} target={input.target} step={step} exclusive={kind === 'lower'} />}
    {kind === 'linear' && <>
      <p>Target: <strong>{input.target}</strong> · checked: {step.checked.length} / {input.nums.length}</p>
      <IndexedSequence label="Unsorted candidates" length={input.nums.length} valueAt={i => input.nums[i]} active={step.index} roleAt={i => step.checked.includes(i) ? 'ruled out' : step.result === i ? 'match' : 'unchecked'} />
      {!input.nums.length && <p>There are no candidates to inspect.</p>}
    </>}
    {kind === 'histogram' && <>
      <HistogramBars heights={input.heights} step={step} />
      <IndexedSequence label="Monotonic stack · (earliest start, height)" length={step.stack.length} valueAt={i => `(${step.stack[i].start}, ${step.stack[i].h})`} active={step.stack.length - 1} />
      <p>Current rectangle area: {step.area} · best area: <strong>{step.best}</strong></p>
    </>}
    {kind === 'heap' && <>
      <p>{step.operation >= 0 ? `Operation ${step.operation + 1}: ${JSON.stringify(input.operations[step.operation])}` : 'Waiting for the first operation'}</p>
      <StructureTree nodes={step.heap.map((value, i) => ({ id: i, parent: i ? Math.floor((i - 1) / 2) : null, label: value, detail: `array[${i}]` }))} activeIds={step.indices} title="Min-heap as a complete binary tree" />
      <IndexedSequence label="The same heap in array storage" length={step.heap.length} valueAt={i => step.heap[i]} active={step.indices[0]} roleAt={i => step.indices.includes(i) ? 'compare / swap' : ''} />
      <p>Popped values: {JSON.stringify(step.output)}</p>
    </>}
    {kind === 'segment' && <>
      <p>{step.query ? `Inclusive query [${step.query.join(', ')}]` : `Operation: ${step.operation ?? 'build'}`}{step.contribution !== undefined ? ` · contribution ${step.contribution}` : ''}</p>
      <StructureTree nodes={step.nodes.map(node => ({ ...node, label: node.sum ?? '?', detail: `[${node.lo}, ${node.hi}]` }))} activeIds={[step.active]} title="Segment tree: each node stores an inclusive range sum" />
      <IndexedSequence label="Current array after assignments" length={step.nums.length} valueAt={i => step.nums[i]} roleAt={i => step.query && i >= step.query[0] && i <= step.query[1] ? 'in query' : ''} />
      <p>Query answers: {JSON.stringify(step.output)}</p>
    </>}
    {kind === 'trie' && <>
      <p>Input word / query: <strong>{step.word || '(root)'}</strong> · character index {step.index} · terminal nodes are marked “end”.</p>
      <TrieStateDiagram nodes={step.nodes} activeNode={step.activeNode} />
    </>}
    {kind === 'prefix' && <>
      <IndexedSequence label="Source array" length={input.nums.length} valueAt={i => input.nums[i]} active={step.index} roleAt={i => step.query && i >= step.query[0] && i <= step.query[1] ? 'in query' : ''} />
      <IndexedSequence label="Prefix sums · slot i stores the sum before i" length={step.prefix.length} valueAt={i => step.prefix[i]} active={step.index >= 0 ? step.index + 1 : -1} roleAt={i => step.reads?.includes(i) ? 'read for subtraction' : ''} />
      <p>Query answers: {JSON.stringify(step.output)}</p>
    </>}
    {kind === 'bfs' && <>
      <Graph input={input} step={step} />
      <IndexedSequence label="FIFO queue · front on the left" length={step.queue.length} valueAt={i => step.queue[i]} active={0} />
      <table><caption>Discovery state</caption><thead><tr><th>Vertex</th><th>Distance</th><th>Parent</th></tr></thead><tbody>{step.distance.map((distance, i) => <tr key={i}><td>{i}</td><td>{distance ?? 'unreachable'}</td><td>{step.parent[i] ?? '—'}</td></tr>)}</tbody></table>
    </>}
    {step.phase === 'done' && <output aria-label="Algorithm result">Result: {JSON.stringify(run.result)}</output>}
  </div>;
}

export default function BasicsStory({ definition, kind }) {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BasicsScene kind={kind} run={run} step={step} />}
    renderReasoning={() => <>
      <h3>{definition.title}</h3><p>{definition.goal}</p>
      <h3>The rule that stays true</h3><p>{definition.strategy}</p>
      <h3>Explore the boundaries</h3><ul>{definition.examples.slice(1).map(example => <li key={example.label}>{example.label}</li>)}</ul>
      <p>Use the timeline to compare the state before and after each read or update. Traces keep snapshots for playback; this storage is additional to the algorithm’s stated complexity.</p>
    </>} />;
}
