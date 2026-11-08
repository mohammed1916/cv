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
    { label: "One customer, one invoice, no contacts", input: "{\"customers\":[{\"customer_id\":1,\"customer_name\":\"Solo\",\"email\":\"solo@x.io\"}],\"contacts\":[],\"invoices\":[{\"invoice_id\":7,\"user_id\":1,\"price\":0}]}" },
    { label: "Equal prices stay in invoice order", input: "{\"customers\":[{\"customer_id\":1,\"customer_name\":\"Ana\",\"email\":\"ana@x.io\"},{\"customer_id\":2,\"customer_name\":\"Ben\",\"email\":\"ben@x.io\"}],\"contacts\":[],\"invoices\":[{\"invoice_id\":9,\"user_id\":2,\"price\":50},{\"invoice_id\":3,\"user_id\":1,\"price\":50}]}" },
    { label: "Eight customers, ten contacts, eight invoices", input: "{\"customers\":[{\"customer_id\":1,\"customer_name\":\"Ana\",\"email\":\"ana@x.io\"},{\"customer_id\":2,\"customer_name\":\"Ben\",\"email\":\"ben@x.io\"},{\"customer_id\":3,\"customer_name\":\"Cy\",\"email\":\"cy@x.io\"},{\"customer_id\":4,\"customer_name\":\"Dee\",\"email\":\"dee@x.io\"},{\"customer_id\":5,\"customer_name\":\"Eli\",\"email\":\"eli@x.io\"},{\"customer_id\":6,\"customer_name\":\"Fay\",\"email\":\"fay@x.io\"},{\"customer_id\":7,\"customer_name\":\"Gus\",\"email\":\"gus@x.io\"},{\"customer_id\":8,\"customer_name\":\"Hal\",\"email\":\"hal@x.io\"}],\"contacts\":[{\"user_id\":1,\"contact_name\":\"Gus\",\"contact_email\":\"k0@z.io\"},{\"user_id\":2,\"contact_name\":\"Gus\",\"contact_email\":\"gus@x.io\"},{\"user_id\":3,\"contact_name\":\"Dee\",\"contact_email\":\"k2@z.io\"},{\"user_id\":4,\"contact_name\":\"Cy\",\"contact_email\":\"cy@x.io\"},{\"user_id\":5,\"contact_name\":\"Dee\",\"contact_email\":\"k4@z.io\"},{\"user_id\":6,\"contact_name\":\"Fay\",\"contact_email\":\"fay@x.io\"},{\"user_id\":7,\"contact_name\":\"Ana\",\"contact_email\":\"k6@z.io\"},{\"user_id\":8,\"contact_name\":\"Dee\",\"contact_email\":\"dee@x.io\"},{\"user_id\":1,\"contact_name\":\"Eli\",\"contact_email\":\"k8@z.io\"},{\"user_id\":2,\"contact_name\":\"Fay\",\"contact_email\":\"fay@x.io\"}],\"invoices\":[{\"invoice_id\":40,\"user_id\":1,\"price\":48},{\"invoice_id\":41,\"user_id\":2,\"price\":11},{\"invoice_id\":42,\"user_id\":3,\"price\":179},{\"invoice_id\":43,\"user_id\":4,\"price\":180},{\"invoice_id\":44,\"user_id\":5,\"price\":29},{\"invoice_id\":45,\"user_id\":6,\"price\":121},{\"invoice_id\":46,\"user_id\":7,\"price\":99},{\"invoice_id\":47,\"user_id\":8,\"price\":50}]}" },
    { label: "Long run: generated contacts and invoices", input: "{\"customers\":[{\"customer_id\":1,\"customer_name\":\"Ana\",\"email\":\"ana@x.io\"},{\"customer_id\":2,\"customer_name\":\"Ben\",\"email\":\"ben@x.io\"},{\"customer_id\":3,\"customer_name\":\"Cy\",\"email\":\"cy@x.io\"},{\"customer_id\":4,\"customer_name\":\"Dee\",\"email\":\"dee@x.io\"},{\"customer_id\":5,\"customer_name\":\"Eli\",\"email\":\"eli@x.io\"},{\"customer_id\":6,\"customer_name\":\"Fay\",\"email\":\"fay@x.io\"},{\"customer_id\":7,\"customer_name\":\"Gus\",\"email\":\"gus@x.io\"},{\"customer_id\":8,\"customer_name\":\"Hal\",\"email\":\"hal@x.io\"}],\"contacts\":[{\"user_id\":8,\"contact_name\":\"Gus\",\"contact_email\":\"k0@z.io\"},{\"user_id\":2,\"contact_name\":\"Gus\",\"contact_email\":\"gus@x.io\"},{\"user_id\":4,\"contact_name\":\"Dee\",\"contact_email\":\"k2@z.io\"},{\"user_id\":3,\"contact_name\":\"Cy\",\"contact_email\":\"cy@x.io\"},{\"user_id\":8,\"contact_name\":\"Dee\",\"contact_email\":\"k4@z.io\"},{\"user_id\":7,\"contact_name\":\"Fay\",\"contact_email\":\"fay@x.io\"},{\"user_id\":2,\"contact_name\":\"Ana\",\"contact_email\":\"k6@z.io\"},{\"user_id\":3,\"contact_name\":\"Dee\",\"contact_email\":\"dee@x.io\"},{\"user_id\":1,\"contact_name\":\"Eli\",\"contact_email\":\"k8@z.io\"},{\"user_id\":2,\"contact_name\":\"Fay\",\"contact_email\":\"fay@x.io\"}],\"invoices\":[{\"invoice_id\":40,\"user_id\":2,\"price\":48},{\"invoice_id\":41,\"user_id\":5,\"price\":11},{\"invoice_id\":42,\"user_id\":2,\"price\":179},{\"invoice_id\":43,\"user_id\":4,\"price\":180},{\"invoice_id\":44,\"user_id\":1,\"price\":29},{\"invoice_id\":45,\"user_id\":7,\"price\":121},{\"invoice_id\":46,\"user_id\":3,\"price\":99},{\"invoice_id\":47,\"user_id\":1,\"price\":50}]}" },
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
