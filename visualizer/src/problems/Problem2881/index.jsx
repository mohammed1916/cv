import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BonusColumnView from './BonusColumnView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with employees (rows of name and salary)',
  url: 'https://leetcode.com/problems/create-a-new-column/',
  complexity: 'O(n) time and O(n) extra space for the new column, where n is the number of rows. The visualization shows up to 12 rows.',
  examples: [
    { label: 'Small team', input: '{"employees":[{"name":"Mira","salary":1200},{"name":"Tomas","salary":950},{"name":"Noor","salary":3100},{"name":"Ivo","salary":2045}]}' },
    { label: 'One row, zero salary', input: '{"employees":[{"name":"Intern","salary":0}]}' },
    { label: 'Same name twice', input: '{"employees":[{"name":"Sam","salary":700},{"name":"Sam","salary":815}]}' },
    { label: "Single employee", input: "{\"employees\":[{\"name\":\"Ana\",\"salary\":1}]}" },
    { label: "Equal salaries", input: "{\"employees\":[{\"name\":\"Bo\",\"salary\":500},{\"name\":\"Cem\",\"salary\":500}]}" },
    { label: "Largest exact salary", input: "{\"employees\":[{\"name\":\"Max\",\"salary\":4503599627370495},{\"name\":\"Zero\",\"salary\":0}]}" },
    { label: "Long run: 12 employees", input: "{\"employees\":[{\"name\":\"pmim\",\"salary\":3884},{\"name\":\"bdc\",\"salary\":4902},{\"name\":\"ybviy\",\"salary\":518},{\"name\":\"lobiv\",\"salary\":1176},{\"name\":\"qoq\",\"salary\":3050},{\"name\":\"yrk\",\"salary\":4129},{\"name\":\"kjk\",\"salary\":3407},{\"name\":\"cthap\",\"salary\":4108},{\"name\":\"lqfifj\",\"salary\":4648},{\"name\":\"bxf\",\"salary\":827},{\"name\":\"lxz\",\"salary\":3245},{\"name\":\"xmpsq\",\"salary\":3952}]}" },
  ],
}

export default function CreateANewColumn() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BonusColumnView run={run} step={step} />} renderReasoning={() => <>
    <p>A pandas column behaves like one value: multiplying it by 2 multiplies each entry, without any explicit loop in your code.</p>
    <p>Assigning that result to a column name that does not exist yet adds it. pandas matches values by row label, so two employees sharing a name still keep their own bonus.</p>
  </>} />
}
