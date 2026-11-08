import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function Grid({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={cell}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'JSON object with a samples list (sample_id, dna_sequence, species)',
  url: 'https://leetcode.com/problems/dna-pattern-recognition/description/',
  complexity: 'O(total length) time: each sequence is read a constant number of times. The flags are a knowledge-derived teaching version.',
  examples: [
    { label: 'Example', input: '{"samples":[{"sample_id":3,"dna_sequence":"ATGGGCTGA","species":"cat"},{"sample_id":1,"dna_sequence":"ATGCCGTAA","species":"mouse"},{"sample_id":5,"dna_sequence":"TGAAAT","species":"owl"},{"sample_id":2,"dna_sequence":"GATTACA","species":"fly"}]}' },
    { label: 'Single', input: '{"samples":[{"sample_id":9,"dna_sequence":"CCCATAG","species":"dog"}]}' },
    { label: 'Single sample', input: '{"samples":[{"sample_id":4,"dna_sequence":"ACGT","species":"Fox"}]}' },
    { label: 'Equal sequences from one species', input: '{"samples":[{"sample_id":9,"dna_sequence":"AAA","species":"Owl"},{"sample_id":2,"dna_sequence":"AAA","species":"Owl"}]}' },
    { label: 'Largest id and 30 bases', input: '{"samples":[{"sample_id":2147483647,"dna_sequence":"ACGTACGTACGTACGTACGTACGTACGTAC","species":"Wolf"}]}' },
    { label: 'Long run: 12 samples', input: '{"samples":[{"sample_id":50,"dna_sequence":"GGATGCTCACGTGTATGTCGATTCAAAGGG","species":"Species 0"},{"sample_id":51,"dna_sequence":"ATTGGAGTTCACGGAGTTCGGTACTCCTCT","species":"Species 1"},{"sample_id":52,"dna_sequence":"TGGTGTGGCGCTTATCGGGTGTACTGATGA","species":"Species 2"},{"sample_id":53,"dna_sequence":"TCTAACACCTCCATAGTATAATTAATGATG","species":"Species 0"},{"sample_id":54,"dna_sequence":"ACAATAATCACTGTATCTAAAACGGGTGAC","species":"Species 1"},{"sample_id":55,"dna_sequence":"GGGAGTTTACATAAGCCCTTCAAGCAAGAA","species":"Species 2"},{"sample_id":56,"dna_sequence":"TTTACGATTTTGGACCTATCCGTCCGACAG","species":"Species 0"},{"sample_id":57,"dna_sequence":"TCAACTCATGGCCGTGAAGGTGATAGCATT","species":"Species 1"},{"sample_id":58,"dna_sequence":"TTAATCAAGACTCCGGTCCCGAAAAAGAAA","species":"Species 2"},{"sample_id":59,"dna_sequence":"CTCCTCTGAGTTAATTGCCACAAGGACATG","species":"Species 0"},{"sample_id":60,"dna_sequence":"AGGTCACCCTGGCCTCCGGAGCTGAACGGG","species":"Species 1"},{"sample_id":61,"dna_sequence":"CATGGTCACTCACTAGGGTACGCGGTGGCA","species":"Species 2"}]}' },
  ],
}

export default function Problem3475() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {Object.entries(run.input).map(([name, rows]) => <section key={name}><h3>{name} (input)</h3><Grid rows={rows} /></section>)}
    <section><h3>Flags so far</h3><Grid rows={step.rows} /></section>
    <output aria-label="Result">{`Samples flagged: ${run.result.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Each sample gets three independent yes-or-no checks: where the sequence starts, how it ends, and whether three equal bases appear side by side.</p>
    <p>The flags are then written as 1 or 0 and returned in sample_id order.</p>
  </>} />
}
