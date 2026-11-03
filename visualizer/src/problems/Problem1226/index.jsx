import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1226',
  phases: [
    { id: 'start', label: 'Table', description: 'All forks start on the table.' },
    { id: 'eat', label: 'Eat', description: 'Both forks were free, so the philosopher takes them in order.' },
    { id: 'wait', label: 'Wait', description: 'A neighbouring fork is in use.' },
    { id: 'finish', label: 'Finish', description: 'The philosopher puts both forks back.' },
    { id: 'done', label: 'Result', description: 'Show the event log.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n philosophers and events: ["hungry", p] or ["finish", p]',
  url: 'https://leetcode.com/problems/the-dining-philosophers/',
  complexity: 'O(1) per event with one fork per seat. Taking the lower numbered fork first removes the circular wait.',
  examples: [
    { label: 'Ordered', input: '{"n":3,"events":[["hungry",0],["hungry",1],["hungry",2],["finish",0],["hungry",1],["finish",1],["hungry",2],["finish",2]]}' },
  ],
}

export default function TheDiningPhilosophers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Fork state">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each philosopher needs the fork on the left and the fork on the right. If every philosopher holds one fork and waits for the other, nobody can eat.</p>
    <p>Always taking the lower numbered fork first breaks that circle, because the highest numbered fork can never be waited on by a philosopher holding a lower one.</p>
  </>} />
}
