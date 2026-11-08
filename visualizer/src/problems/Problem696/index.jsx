import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Runs', description: 'Group equal neighbouring characters into runs.' },
    { id: 'pair', label: 'Pair of runs', description: 'Two neighbouring runs contribute the shorter of their lengths.' },
    { id: 'done', label: 'Total', description: 'Sum the contributions of every neighbouring pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Binary string (JSON string of 0 and 1)',
  url: 'https://leetcode.com/problems/count-binary-substrings/',
  complexity: 'O(n) time and O(number of runs) space.',
  examples: [
    { label: 'Mixed runs', input: '"0011100"' },
    { label: 'Long runs', input: '"000111"' },
    { label: 'Alternating', input: '"0101"' },
    { label: 'Single character', input: '"0"' },
    { label: 'Shortest pair', input: '"01"' },
    { label: 'Equal runs of 0s and 1s', input: '"0011"' },
    { label: 'Long run: 1200 characters', input: '"100000001110101101011010110001011011100100000101111100110011011100001000100111000010010000110011100111000111101111110101100011101011010001101000100101001001100010000010110100001011011010100101101001011100000001000010001100010100000011000000100101101101110111001000101000100100010010001100110001111001111011000101101111010110010101101010000010001110001101110100000111110010110010001000001100110100000101000000100011111100110110111000101111101101110001010111011111101001000110101011011010010001101110100110110011110101001010101010111000111010010010100001100101000000100010110000001000001010101011011110001111111110010101011101011110011000011100100110000001011000000101111111010010100111010011000010110111101111000100011001111001111010010111001001100100000011010111101001011011111100101101010110001000101110100100110100111100011101000001001101111101101000100000111101111010010010101111100111011111011001001101101001100101011011010111011001110010000001100100111111100101100010001101001010100000001000011000100000010101101011110110111001101110000101010010111101011010111001111001111111110100000110001101111110101010010001011100001111010100110010000101001011011111100000000111010010010111101111000111100010"' },
  ],
}

export default function CountBinarySubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Run lengths (character in brackets)" length={step.runs.length} active={step.index ?? -1}
      valueAt={i => `${step.runs[i]}`}
      roleAt={i => (step.index !== null && i === step.index ? 'cur' : step.index !== null && i === step.index - 1 ? 'prev' : run.runChars[i])} />
    <output aria-label="Total so far">{`Total ${step.total}${step.add !== undefined ? ` (+${step.add})` : ''}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the minimum:</strong> the shorter run limits how many matched pairs can sit across the boundary.</p>
  </>} />
}
