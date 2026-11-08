import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RenameColumnsView from './RenameColumnsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with students (rows holding id, first, last and age)',
  url: 'https://leetcode.com/problems/rename-columns/',
  complexity: 'O(c) header changes for c columns. A plain rename touches labels, so the values are not rewritten; this view shows up to 12 rows.',
  examples: [
    { label: 'Three students', input: '{"students":[{"id":11,"first":"Priya","last":"Nair","age":15},{"id":12,"first":"Tomas","last":"Ruiz","age":17},{"id":13,"first":"Lena","last":"Okafor","age":14}]}' },
    { label: 'Shuffled columns', input: '{"students":[{"age":19,"last":"Haddad","id":40,"first":"Omar"},{"age":20,"last":"Sato","id":41,"first":"Yuki"}]}' },
    { label: 'Empty table', input: '{"students":[]}' },
    { label: "Single student", input: "{\"students\":[{\"id\":1,\"first\":\"Ana\",\"last\":\"Lee\",\"age\":18}]}" },
    { label: "Same name, different rows", input: "{\"students\":[{\"id\":2,\"first\":\"Sam\",\"last\":\"Ng\",\"age\":18},{\"id\":3,\"first\":\"Sam\",\"last\":\"Ng\",\"age\":19}]}" },
    { label: "Largest id, maximum rows", input: "{\"students\":[{\"id\":2147483647,\"first\":\"F0\",\"last\":\"L0\",\"age\":10},{\"id\":1,\"first\":\"F1\",\"last\":\"L1\",\"age\":11},{\"id\":2,\"first\":\"F2\",\"last\":\"L2\",\"age\":12},{\"id\":3,\"first\":\"F3\",\"last\":\"L3\",\"age\":13},{\"id\":4,\"first\":\"F4\",\"last\":\"L4\",\"age\":14},{\"id\":5,\"first\":\"F5\",\"last\":\"L5\",\"age\":15},{\"id\":6,\"first\":\"F6\",\"last\":\"L6\",\"age\":16},{\"id\":7,\"first\":\"F7\",\"last\":\"L7\",\"age\":17},{\"id\":8,\"first\":\"F8\",\"last\":\"L8\",\"age\":18},{\"id\":9,\"first\":\"F9\",\"last\":\"L9\",\"age\":19},{\"id\":10,\"first\":\"F10\",\"last\":\"L10\",\"age\":20},{\"id\":11,\"first\":\"F11\",\"last\":\"L11\",\"age\":21}]}" },
    { label: "Long run: 12 students", input: "{\"students\":[{\"age\":17,\"last\":\"fldtxt\",\"id\":76,\"first\":\"ukww\"},{\"age\":25,\"last\":\"oeu\",\"id\":4,\"first\":\"hads\"},{\"age\":28,\"last\":\"qwc\",\"id\":290,\"first\":\"nvktv\"},{\"age\":23,\"last\":\"gmrznl\",\"id\":297,\"first\":\"yqbz\"},{\"age\":25,\"last\":\"mcuy\",\"id\":84,\"first\":\"ttrw\"},{\"age\":22,\"last\":\"iukski\",\"id\":426,\"first\":\"tjceou\"},{\"age\":23,\"last\":\"kjzm\",\"id\":14,\"first\":\"xmr\"},{\"age\":30,\"last\":\"inupqn\",\"id\":86,\"first\":\"cbn\"},{\"age\":30,\"last\":\"ehcn\",\"id\":462,\"first\":\"ahjm\"},{\"age\":28,\"last\":\"ggobk\",\"id\":19,\"first\":\"agjbkf\"},{\"age\":15,\"last\":\"jqjw\",\"id\":383,\"first\":\"nkkgf\"},{\"age\":30,\"last\":\"xve\",\"id\":16,\"first\":\"mnqm\"}]}" },
  ],
}

export default function RenameColumns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RenameColumnsView run={run} step={step} />} renderReasoning={() => <>
    <p>Renaming changes what a column is called, never what it holds. No row moves and no value is copied into a different slot.</p>
    <p>A mapping keyed by the old name is safer than listing four new names in order: if the table arrives with its columns shuffled, every label still lands on the right data. Try the shuffled example to see it.</p>
  </>} />
}
