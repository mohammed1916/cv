import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecordStateTable from "../../components/shared/RecordStateTable";
import { Sequence, Vars } from "./SeqKit";
import { code, python, phases, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1169",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"transactions": ["name,time,amount,city", ...]}',
  url: "https://leetcode.com/problems/invalid-transactions/description/",
  complexity: "O(n^2) time and O(n) space for n transactions. The visualization caps n at 50.",
  examples: [
    { label: "Large amount", input: '{"transactions":["mia,5,1500,oslo","mia,900,20,oslo"]}' },
    { label: "Close trips", input: '{"transactions":["ren,10,300,kyoto","ren,40,200,kyoto","ren,100,400,lima"]}' },
    { label: "Same city", input: '{"transactions":["sam,0,90,nara","sam,30,90,nara"]}' },
  ],
};

export default function InvalidTransactionsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const s = step.snapshot
        const flagged = new Set(s.flagged || [])
        const rows = run.input.map((text, index) => {
          const [name, time, amount, city] = text.split(',')
          return { index, name, time, amount, city, invalid: flagged.has(index) ? 'yes' : 'no' }
        })
        const names = rows.map(row => row.name)
        const pointers = {}
        if (s.i >= 0) pointers.i = s.i
        if (s.j >= 0 && s.j !== s.i) pointers.j = s.j
        const marks = Object.fromEntries([...flagged].map(index => [index, 'pending']))
        return <>
          <Sequence label="Transactions (dashed = flagged invalid)" values={names} pointers={pointers} marks={marks} />
          <RecordStateTable label="Fields of each transaction" columns={['index', 'name', 'time', 'amount', 'city', 'invalid']} rows={rows} activeRow={s.i} />
          <Vars vars={{ 'i (checked)': s.i >= 0 ? s.i : null, 'j (compared)': s.j >= 0 ? s.j : null, 'flagged so far': flagged.size }} />
          <p>{step.message}</p>
        </>
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
