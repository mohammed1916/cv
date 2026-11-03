import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with customers, contacts and invoices (JSON lists)',
  url: 'https://leetcode.com/problems/number-of-trusted-contacts-of-a-customer/',
  complexity: 'One pass over contacts to build per-user totals, then one lookup per invoice. The visualization caps the tables at 8 customers, 10 contacts and 8 invoices.',
  examples: [
    { label: 'Sample', input: '{"customers":[{"customer_id":1,"customer_name":"Ana","email":"ana@x.io"},{"customer_id":2,"customer_name":"Ben","email":"ben@x.io"},{"customer_id":3,"customer_name":"Cy","email":"cy@x.io"}],"contacts":[{"user_id":1,"contact_name":"Ben","contact_email":"ben@x.io"},{"user_id":1,"contact_name":"Zed","contact_email":"zed@y.io"},{"user_id":2,"contact_name":"Ana","contact_email":"ana@x.io"}],"invoices":[{"invoice_id":13,"user_id":3,"price":90},{"invoice_id":11,"user_id":1,"price":50},{"invoice_id":12,"user_id":2,"price":20}]}' },
    { label: 'No contacts', input: '{"customers":[{"customer_id":4,"customer_name":"Dee","email":"dee@x.io"}],"contacts":[],"invoices":[{"invoice_id":21,"user_id":4,"price":15}]}' },
  ],
}

function Table({ caption, rows }) {
  const keys = rows[0] ? Object.keys(rows[0]) : []
  return <figure>
    <figcaption>{caption}</figcaption>
    {rows.length === 0 ? <p>No rows.</p> : <table>
      <thead><tr>{keys.map(key => <th key={key} scope="col">{key}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {keys.map(key => <td key={key}>{row[key] === null || row[key] === undefined ? 'NULL' : String(row[key])}</td>)}
      </tr>)}</tbody>
    </table>}
  </figure>
}

export default function TrustedContactsOfCustomer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Table caption={step.caption} rows={step.rows} />
    <output aria-label="Row count">{`${step.rows.length} row${step.rows.length === 1 ? '' : 's'} in ${step.caption.toLowerCase()}`}</output>
  </>} renderReasoning={() => <>
    <p>Trust is a membership test: a contact counts when its email appears among the customer emails.</p>
    <p>Totals are computed per user first, then joined onto each invoice. A missing total becomes 0, so customers with no contacts still appear.</p>
  </>} />
}
