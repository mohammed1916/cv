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
  ],
}

export default function DropDuplicateRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <EmailDedupeView run={run} step={step} />} renderReasoning={() => <>
    <p>Only the email decides whether two rows are duplicates. Names and ids can differ and the later row is still removed.</p>
    <p>Reading from the top means the first row with an email reaches the map before any repeat, so a map hit always marks a later row. Rows are never reordered.</p>
    <p>In pandas the whole scan is one call: <code>customers.drop_duplicates(subset=["email"])</code>, whose default is to keep the first row.</p>
  </>} />
}
