import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The screen is empty.' },
    { id: 'type', label: 'Type letter', description: 'A letter is appended to the end of the screen.' },
    { id: 'reverse', label: 'Type i', description: 'The faulty key reverses the whole screen.' },
    { id: 'done', label: 'Complete', description: 'Report what the screen shows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/faulty-keyboard/',
  complexity: 'O(n^2) time with string reversals, or O(n) with a flag. The visualization caps s at 100 letters.',
  question: "Type characters into a faulty keyboard where the letter i reverses the text typed so far, and return the final text.",
  approaches: [
    { name: "Reverse on each i", intuition: "Keep the text as a string and reverse it whenever the faulty letter appears.", time: "O(n^2) worst case", space: "O(n)" },
    { name: "Deque with a direction flag", intuition: "Track whether writes go to the front or back, flipping the flag on each i instead of reversing.", time: "O(n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Example 1', input: '{"s":"string"}' },
    { label: 'Example 2', input: '{"s":"poiinter"}' },
    { label: "Single letter", input: "{\"s\":\"a\"}" },
    { label: "Repeated letters", input: "{\"s\":\"aabbaa\"}" },
    { label: "All 26 letters", input: "{\"s\":\"abcdefghijklmnopqrstuvwxyz\"}" },
    { label: "Long run: 100 seeded letters", input: "{\"s\":\"xgvupungrqzavmxcrchchwpwpyjafifudyhijulmrqrwvsxkbchwnmlghixovovcbchcpmvqvgxqzovylcjcxwjilormpsnkbcfs\"}" },
  ],
}

export default function FaultyKeyboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Screen" length={step.text.length} valueAt={i => step.text[i]} active={-1} />
    <output aria-label="Screen text">{`Screen: ${step.text || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Typing i reverses everything typed so far, so each reversal changes which end new letters join.</p>
    <p>Reversing twice cancels out, which is the idea behind the flag-based solution.</p>
  </>} />
}
