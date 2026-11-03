import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

function PrefixTable({ snapshot }) {
  return <table aria-label="Prefix costs">
    <thead><tr><th scope="col">Books</th><th scope="col">Best height</th></tr></thead>
    <tbody>{snapshot.dp.map((value, index) => <tr key={index} style={index === snapshot.end ? { fontWeight: 700 } : undefined}>
      <td>{index}</td><td>{value ?? 'unsolved'}</td>
    </tr>)}</tbody>
  </table>
}

function ShelfStrip({ snapshot }) {
  if (snapshot.start === undefined) return null
  return <p aria-label="Last shelf">Last shelf: books {snapshot.start}–{snapshot.end} · width {snapshot.width} of {snapshot.shelfWidth} · tallest {snapshot.tallest}</p>
}

export default function ShelfPartitionVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <PrefixTable snapshot={step.snapshot} />
      <ShelfStrip snapshot={step.snapshot} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>}
    renderReasoning={() => <p>Each prefix ends with one final shelf. Growing that shelf backward from the end gives every fitting choice; the cheapest is the best earlier prefix plus this shelf's tallest book.</p>} />
}
