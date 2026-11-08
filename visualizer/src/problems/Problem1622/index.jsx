import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1622',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops, a list of [name, value] pairs (JSON)',
  url: 'https://leetcode.com/problems/fancy-sequence/',
  complexity: 'O(1) time for addAll and multAll, and O(log p) for append and getIndex because of one modular inverse or product. O(n) space for n appends.',
  examples: [
    { label: 'Mixed calls', input: JSON.stringify({ ops: [['append', 2], ['addAll', 3], ['append', 7], ['multAll', 2], ['getIndex', 0], ['addAll', 3], ['append', 10], ['multAll', 2], ['getIndex', 2], ['getIndex', 9]] }) },
    { label: 'Empty read', input: JSON.stringify({ ops: [['getIndex', 0], ['append', 5], ['getIndex', 0]] }) },
    { label: 'Big factor', input: JSON.stringify({ ops: [['append', 4], ['multAll', 1000], ['getIndex', 0]] }) },
    { label: "Single getIndex on an empty sequence", input: "{\"ops\":[[\"getIndex\",0]]}" },
    { label: "Multiply then add", input: "{\"ops\":[[\"append\",2],[\"multAll\",3],[\"addAll\",1],[\"getIndex\",0]]}" },
    { label: "Largest allowed value", input: "{\"ops\":[[\"append\",1000000006],[\"multAll\",1000],[\"getIndex\",0]]}" },
    { label: "Long run: 40 operations", input: "{\"ops\":[[\"multAll\",201],[\"getIndex\",5],[\"multAll\",289],[\"addAll\",817396],[\"addAll\",769432],[\"append\",524696],[\"append\",225734],[\"multAll\",30],[\"addAll\",452184],[\"getIndex\",18],[\"multAll\",972],[\"getIndex\",9],[\"getIndex\",0],[\"addAll\",110952],[\"getIndex\",11],[\"addAll\",93113],[\"getIndex\",10],[\"addAll\",522589],[\"addAll\",265745],[\"getIndex\",9],[\"addAll\",24132],[\"addAll\",240959],[\"multAll\",987],[\"multAll\",326],[\"append\",579743],[\"getIndex\",16],[\"multAll\",323],[\"multAll\",398],[\"addAll\",146207],[\"append\",582013],[\"getIndex\",9],[\"getIndex\",4],[\"append\",460496],[\"append\",317201],[\"getIndex\",7],[\"addAll\",753939],[\"addAll\",107645],[\"multAll\",451],[\"getIndex\",15],[\"getIndex\",17]]}" },
  ],
}

export default function FancyWorkspace() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const snap = step.snapshot
    const focus = snap.op === 'getIndex' && !snap.done && snap.arg < snap.values.length ? snap.arg : -1
    return <>
      <IndexedSequence label="Real values" length={snap.values.length} valueAt={i => snap.values[i]} active={focus}
        roleAt={i => (snap.op === 'append' && i === snap.values.length - 1 ? 'new' : '')} />
      <output aria-label="Lazy state">{`Multiplier ${snap.mul}, offset ${snap.add}, raw stored ${snap.stored.join(', ') || 'none'}`}</output>
      <output aria-label="Answers">{`Answers so far: [${snap.results.join(', ')}]`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>addAll and multAll only change one shared multiplier and offset, so each one is constant time. Stored values are kept so that their real value is raw times the multiplier plus the offset, which is why appends divide out the current transform first.</p>
  </>} />
}
