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
    { label: "Single winery", input: '{"Wineries":[{"id":50,"country":"Lebanon","points":44,"winery":"Bekaa Terrace"}]}' },
    { label: "Equal points keep both", input: '{"Wineries":[{"id":1,"country":"Chile","points":41,"winery":"Andes"},{"id":2,"country":"Chile","points":41,"winery":"Valle"}]}' },
    { label: "Boundary points", input: '{"Wineries":[{"id":1,"country":"Spain","points":0,"winery":"Ermita"},{"id":2,"country":"Spain","points":100,"winery":"Bodega Mar"}]}' },
    { label: "Long run: 24 wineries", input: '{"Wineries":[{"id":1,"country":"Portugal","points":34,"winery":"Estate 1"},{"id":2,"country":"Chile","points":22,"winery":"Estate 2"},{"id":3,"country":"Portugal","points":51,"winery":"Estate 3"},{"id":4,"country":"Chile","points":27,"winery":"Estate 4"},{"id":5,"country":"Georgia","points":15,"winery":"Estate 5"},{"id":6,"country":"Spain","points":79,"winery":"Estate 6"},{"id":7,"country":"Portugal","points":46,"winery":"Estate 7"},{"id":8,"country":"Georgia","points":37,"winery":"Estate 8"},{"id":9,"country":"Chile","points":62,"winery":"Estate 9"},{"id":10,"country":"Georgia","points":86,"winery":"Estate 10"},{"id":11,"country":"Spain","points":43,"winery":"Estate 11"},{"id":12,"country":"Spain","points":72,"winery":"Estate 12"},{"id":13,"country":"Portugal","points":80,"winery":"Estate 13"},{"id":14,"country":"Portugal","points":44,"winery":"Estate 14"},{"id":15,"country":"Spain","points":48,"winery":"Estate 15"},{"id":16,"country":"Spain","points":58,"winery":"Estate 16"},{"id":17,"country":"Georgia","points":83,"winery":"Estate 17"},{"id":18,"country":"Georgia","points":29,"winery":"Estate 18"},{"id":19,"country":"Georgia","points":82,"winery":"Estate 19"},{"id":20,"country":"Portugal","points":14,"winery":"Estate 20"},{"id":21,"country":"Spain","points":17,"winery":"Estate 21"},{"id":22,"country":"Georgia","points":65,"winery":"Estate 22"},{"id":23,"country":"Chile","points":78,"winery":"Estate 23"},{"id":24,"country":"Georgia","points":82,"winery":"Estate 24"}]}' },
  ],
}

export default function TopThreeWineries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <WineryPipelineView run={run} step={step} />} renderReasoning={() => <>
    <p>A winery can have many rows, so totals come first. Ranking the raw rows would compare single rows instead of whole wineries.</p>
    <p>Ranking runs inside each country, using total descending and then name. Grouping leaves each winery once per country, so this order has no ties and every place is unique.</p>
    <p>The last step turns up to three rows per country into one row with three columns. Grouping by country and picking each place with a conditional keeps countries with fewer wineries, and an absent place becomes NULL, which is replaced by the fixed phrase.</p>
  </>} />
}
