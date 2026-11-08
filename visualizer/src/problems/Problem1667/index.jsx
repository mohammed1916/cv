import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1667',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rows as JSON: [{"user_id": integer, "name": letters}, ...]',
  url: 'https://leetcode.com/problems/fix-names-in-a-table/',
  complexity: 'Teaching model of the SQL rewrite: one pass over the rows plus a sort by user_id. The rows here are JavaScript objects, not a database table.',
  examples: [
    { label: 'Mixed case', input: '[{"user_id":9,"name":"mARIA"},{"user_id":2,"name":"tom"},{"user_id":5,"name":"JOHN"}]' },
    { label: 'Single letter', input: '[{"user_id":4,"name":"x"},{"user_id":1,"name":"yusuf"}]' },
    { label: 'One user', input: '[{"user_id":1,"name":"Ann"}]' },
    { label: 'Repeated names, unique ids', input: '[{"user_id":2,"name":"Lee"},{"user_id":5,"name":"Lee"}]' },
    { label: 'Largest list', input: '[{"user_id":1000,"name":"A"},{"user_id":1007,"name":"Ab"},{"user_id":1014,"name":"Abc"},{"user_id":1021,"name":"Abcd"},{"user_id":1028,"name":"Abcde"},{"user_id":1035,"name":"Abcdef"},{"user_id":1042,"name":"Abcdefg"},{"user_id":1049,"name":"Abcdefgh"},{"user_id":1056,"name":"Abcdefghi"},{"user_id":1063,"name":"Abcdefghij"},{"user_id":1070,"name":"Abcdefghijk"},{"user_id":1077,"name":"Abcdefghijkl"},{"user_id":1084,"name":"Abcdefghijklm"},{"user_id":1091,"name":"Abcdefghijklmn"},{"user_id":1098,"name":"Abcdefghijklmno"},{"user_id":1105,"name":"Abcdefghijklmnop"},{"user_id":1112,"name":"Abcdefghijklmnopq"},{"user_id":1119,"name":"Abcdefghijklmnopqr"},{"user_id":1126,"name":"Abcdefghijklmnopqrs"},{"user_id":1133,"name":"Abcdefghijklmnopqrst"},{"user_id":1140,"name":"A"},{"user_id":1147,"name":"Ab"},{"user_id":1154,"name":"Abc"},{"user_id":1161,"name":"Abcd"},{"user_id":1168,"name":"Abcde"},{"user_id":1175,"name":"Abcdef"},{"user_id":1182,"name":"Abcdefg"},{"user_id":1189,"name":"Abcdefgh"},{"user_id":1196,"name":"Abcdefghi"},{"user_id":1203,"name":"Abcdefghij"}]' },
    { label: 'Long run: 30 rows', input: '[{"user_id":2000,"name":"NBGBJsle"},{"user_id":2003,"name":"cgWlFQNwzwMaz"},{"user_id":2006,"name":"GCEpj"},{"user_id":2009,"name":"edHAyuDyyDNbE"},{"user_id":2012,"name":"TCHqNDwApr"},{"user_id":2015,"name":"ahZtBUN"},{"user_id":2018,"name":"PzrGuUEtJV"},{"user_id":2021,"name":"VtdnqgsvBsr"},{"user_id":2024,"name":"Y"},{"user_id":2027,"name":"twtdmmrtKOnGaVQbp"},{"user_id":2030,"name":"CtHERTUOxM"},{"user_id":2033,"name":"RHzczOxcviMqhj"},{"user_id":2036,"name":"DaS"},{"user_id":2039,"name":"AVuRoWHhgNSFOOBlEuK"},{"user_id":2042,"name":"lQhmlsQDZDFYgo"},{"user_id":2045,"name":"VCbSbPEqlcbIrYVnRDZz"},{"user_id":2048,"name":"J"},{"user_id":2051,"name":"xPPwHmXfbdMQ"},{"user_id":2054,"name":"dXzTtZRTZrwoFEWeat"},{"user_id":2057,"name":"hfwBuAPqQBZpvrTqsNfa"},{"user_id":2060,"name":"LjfMZuzxYAOGPGmNan"},{"user_id":2063,"name":"td"},{"user_id":2066,"name":"KypO"},{"user_id":2069,"name":"UJRbEFHLJOUxLaodvT"},{"user_id":2072,"name":"nvEqYJqcPknyYdJCo"},{"user_id":2075,"name":"jieCKdSOUUAfzhBGmSvq"},{"user_id":2078,"name":"WEzhhEKJQZZZiFm"},{"user_id":2081,"name":"jDc"},{"user_id":2084,"name":"zbkLzmt"},{"user_id":2087,"name":"G"}]' },
  ],
}

export default function FixNamesInTable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, output, original, fixed } = step.snapshot
    return <>
      <table aria-label="Input rows" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead><tr><th>user_id</th><th>name as stored</th></tr></thead>
        <tbody>{run.input.map((row, i) => <tr key={row.user_id} style={{ background: i === index ? 'var(--surface2)' : 'transparent' }}>
          <td>{row.user_id}</td><td>{row.name}</td></tr>)}</tbody>
      </table>
      <table aria-label="Output rows" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>user_id</th><th>name</th></tr></thead>
        <tbody>{output.length === 0 ? <tr><td colSpan={2}>empty</td></tr> : output.map(row => <tr key={row.user_id}>
          <td>{row.user_id}</td><td>{row.name}</td></tr>)}</tbody>
      </table>
      {fixed && <p>{original} becomes {fixed}.</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Rewrite:</strong> the first character is uppercased and the rest lowercased, so every name uses the same casing.</p>
    <p><strong>Order:</strong> the result is sorted by user_id, the only ordering the task asks for.</p>
  </>} />
}
