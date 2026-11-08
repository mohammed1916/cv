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
    { label: 'Single transaction', input: '{"transactions":["ann,0,10,rome"]}' },
    { label: 'Equal amounts', input: '{"transactions":["bo,5,500,oslo","bo,9,500,oslo"]}' },
    { label: 'Boundary time and amount', input: '{"transactions":["cy,0,1,paris","cy,1000,2000,paris"]}' },
    { label: 'Long run: 50 transactions', input: '{"transactions":["cy,552,1572,lima","cy,932,1477,lima","eve,658,41,lima","fay,385,1050,rome","eve,450,1915,lima","bo,610,321,paris","eve,154,455,rome","bo,257,143,paris","eve,108,1634,lima","dan,641,93,oslo","eve,103,1789,paris","ann,862,432,paris","fay,437,362,lima","eve,474,1911,rome","eve,570,1118,rome","dan,326,1380,rome","eve,507,1351,oslo","dan,374,1010,rome","eve,694,1015,oslo","ann,653,1438,paris","fay,871,1183,rome","eve,284,99,rome","ann,540,684,rome","bo,280,809,rome","ann,222,1877,rome","bo,727,953,lima","bo,784,586,lima","bo,360,1021,lima","dan,172,1705,rome","bo,409,1855,rome","cy,253,842,lima","bo,854,1373,oslo","ann,196,1267,paris","eve,12,1544,oslo","fay,408,286,lima","fay,640,539,rome","ann,522,517,lima","dan,774,1417,lima","bo,927,1054,lima","fay,315,143,oslo","eve,598,522,oslo","dan,562,1252,paris","eve,475,1943,rome","ann,835,873,oslo","eve,387,1435,paris","cy,44,70,rome","ann,240,90,oslo","cy,305,224,lima","bo,960,973,oslo","cy,517,182,rome"]}' },
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
