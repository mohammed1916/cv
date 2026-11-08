import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import EmailDedupeView from './EmailDedupeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { meta } from './meta'

const customer = (customer_id, name, email) => ({ customer_id, name, email })
const sample = customers => JSON.stringify({ customers })

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a customers table (customer_id, name, email)',
  url: 'https://leetcode.com/problems/drop-duplicate-rows/',
  complexity: 'O(n) time and O(n) space for n rows, with one map lookup per row. The visualization caps the table at 14 rows.',
  examples: [
    { label: 'Repeated emails', input: sample([customer(101, 'Priya', 'priya@mail.test'), customer(102, 'Tomas', 'tomas@mail.test'), customer(103, 'Priyanka', 'priya@mail.test'), customer(104, 'Wen', 'wen@mail.test'), customer(105, 'Tom', 'tomas@mail.test'), customer(106, 'Priya R', 'priya@mail.test')]) },
    { label: 'Every email differs', input: sample([customer(7, 'Noor', 'noor@mail.test'), customer(8, 'Sami', 'sami@mail.test'), customer(9, 'Ines', 'ines@mail.test')]) },
    { label: 'One shared email', input: sample([customer(31, 'Kofi', 'desk@mail.test'), customer(32, 'Lena', 'desk@mail.test'), customer(33, 'Omar', 'desk@mail.test')]) },
    { label: 'Empty table', input: sample([]) },
    { label: "Single customer", input: "{\"customers\":[{\"customer_id\":1,\"name\":\"Ana\",\"email\":\"ana@x.test\"}]}" },
    { label: "Two rows share one email", input: "{\"customers\":[{\"customer_id\":2,\"name\":\"Bo\",\"email\":\"bo@x.test\"},{\"customer_id\":3,\"name\":\"Bea\",\"email\":\"bo@x.test\"}]}" },
    { label: "Maximum rows, all emails distinct", input: "{\"customers\":[{\"customer_id\":100,\"name\":\"C0\",\"email\":\"c0@x.test\"},{\"customer_id\":101,\"name\":\"C1\",\"email\":\"c1@x.test\"},{\"customer_id\":102,\"name\":\"C2\",\"email\":\"c2@x.test\"},{\"customer_id\":103,\"name\":\"C3\",\"email\":\"c3@x.test\"},{\"customer_id\":104,\"name\":\"C4\",\"email\":\"c4@x.test\"},{\"customer_id\":105,\"name\":\"C5\",\"email\":\"c5@x.test\"},{\"customer_id\":106,\"name\":\"C6\",\"email\":\"c6@x.test\"},{\"customer_id\":107,\"name\":\"C7\",\"email\":\"c7@x.test\"},{\"customer_id\":108,\"name\":\"C8\",\"email\":\"c8@x.test\"},{\"customer_id\":109,\"name\":\"C9\",\"email\":\"c9@x.test\"},{\"customer_id\":110,\"name\":\"C10\",\"email\":\"c10@x.test\"},{\"customer_id\":111,\"name\":\"C11\",\"email\":\"c11@x.test\"}]}" },
    { label: "Long run: 12 customers, four emails", input: "{\"customers\":[{\"customer_id\":200,\"name\":\"rdj\",\"email\":\"m0@x.test\"},{\"customer_id\":201,\"name\":\"pzqd\",\"email\":\"m1@x.test\"},{\"customer_id\":202,\"name\":\"yab\",\"email\":\"m3@x.test\"},{\"customer_id\":203,\"name\":\"dx\",\"email\":\"m1@x.test\"},{\"customer_id\":204,\"name\":\"pa\",\"email\":\"m3@x.test\"},{\"customer_id\":205,\"name\":\"ogi\",\"email\":\"m1@x.test\"},{\"customer_id\":206,\"name\":\"vc\",\"email\":\"m2@x.test\"},{\"customer_id\":207,\"name\":\"fzgeh\",\"email\":\"m3@x.test\"},{\"customer_id\":208,\"name\":\"ziw\",\"email\":\"m2@x.test\"},{\"customer_id\":209,\"name\":\"fstz\",\"email\":\"m1@x.test\"},{\"customer_id\":210,\"name\":\"gd\",\"email\":\"m2@x.test\"},{\"customer_id\":211,\"name\":\"bmnv\",\"email\":\"m3@x.test\"}]}" },
  ],
}

export default function DropDuplicateRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <EmailDedupeView run={run} step={step} />} renderReasoning={() => <>
    <p>Only the email decides whether two rows are duplicates. Names and ids can differ and the later row is still removed.</p>
    <p>Reading from the top means the first row with an email reaches the map before any repeat, so a map hit always marks a later row. Rows are never reordered.</p>
    <p>In pandas the whole scan is one call: <code>customers.drop_duplicates(subset=["email"])</code>, whose default is to keep the first row.</p>
  </>} />
}
