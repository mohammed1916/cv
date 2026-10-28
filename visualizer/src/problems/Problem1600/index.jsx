import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function FamilyNode({ member, visit }) {
  const role = member.name === visit ? 'active' : member.alive ? '' : 'dead'
  return <li data-role={role}>
    <span>{member.name}{member.alive ? '' : ' (dead)'}</span>
    {member.children.length > 0 && <ul>{member.children.map(child => <FamilyNode key={child.name} member={child} visit={visit} />)}</ul>}
  </li>
}

const definition = {
  phases: [
    { id: 'start', label: 'King', description: 'The king starts alive with no children.' },
    { id: 'birth', label: 'Birth', description: 'A child is added as the youngest child of a parent.' },
    { id: 'death', label: 'Death', description: 'A person is marked dead but stays in the family tree.' },
    { id: 'walk', label: 'Walk', description: 'Visit a person, then their children in birth order.' },
    { id: 'order', label: 'Order', description: 'The living people in walk order form the inheritance order.' },
    { id: 'done', label: 'Complete', description: 'Every order request has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with king and operations (birth, death, order)',
  url: 'https://leetcode.com/problems/throne-inheritance/',
  complexity: 'birth and death take O(1) time; an order request takes O(n) time for n people.',
  examples: [
    { label: 'Example', input: '{"king":"king","operations":[["birth","king","andy"],["birth","king","bob"],["birth","king","catherine"],["birth","andy","matthew"],["birth","bob","alex"],["birth","bob","asha"],["order"],["death","bob"],["order"]]}' },
  ],
}

export default function ThroneInheritance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul className="throne-family" aria-label="Family tree">
      <FamilyNode member={step.family} visit={step.visit} />
    </ul>
    <output aria-label="Latest order">{step.answer ? `Order: ${step.answer.join(', ')}` : `Last operation: ${step.op ? step.op.join(' ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Children are stored in birth order, so a walk from the king that visits children in that order is the inheritance order.</p>
    <p>A death only marks a person as not alive. Their children still inherit, so the tree itself is never cut.</p>
  </>} />
}
