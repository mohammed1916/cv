import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WineryPipelineView from './WineryPipelineView'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const row = (id, country, points, winery) => ({ id, country, points, winery })

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Wineries table (rows of id, country, points, winery)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n log n) over the source rows, for grouping and sorting within each country. The visualization caps the table at 24 rows.',
  examples: [
    {
      label: 'Repeat rows and a tie',
      input: JSON.stringify({ Wineries: [
        row(1, 'Portugal', 30, 'Rio Alto'), row(2, 'Chile', 72, 'Cerro Azul'), row(3, 'Portugal', 55, 'Quinta Sol'),
        row(4, 'Chile', 41, 'Valle Lindo'), row(5, 'Portugal', 25, 'Rio Alto'), row(6, 'Chile', 41, 'Andes Norte'),
        row(7, 'Chile', 18, 'Costa Fria'), row(8, 'Georgia', 63, 'Kakheti Hill'), row(9, 'Chile', 12, 'Cerro Azul'),
      ] }),
    },
    {
      label: 'One row only',
      input: JSON.stringify({ Wineries: [row(50, 'Lebanon', 44, 'Bekaa Terrace')] }),
    },
    {
      label: 'More than three',
      input: JSON.stringify({ Wineries: [
        row(1, 'Spain', 20, 'Dorado'), row(2, 'Spain', 90, 'Bodega Mar'), row(3, 'Spain', 45, 'Cuesta'),
        row(4, 'Spain', 45, 'Alameda'), row(5, 'Spain', 10, 'Ermita'),
      ] }),
    },
  ],
}

export default function TopThreeWineries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <WineryPipelineView run={run} step={step} />} renderReasoning={() => <>
    <p>A winery can have many rows, so totals come first. Ranking the raw rows would compare single rows instead of whole wineries.</p>
    <p>Ranking runs inside each country, using total descending and then name. Grouping leaves each winery once per country, so this order has no ties and every place is unique.</p>
    <p>The last step turns up to three rows per country into one row with three columns. Grouping by country and picking each place with a conditional keeps countries with fewer wineries, and an absent place becomes NULL, which is replaced by the fixed phrase.</p>
  </>} />
}
