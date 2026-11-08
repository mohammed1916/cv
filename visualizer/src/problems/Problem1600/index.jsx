import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function FamilyNode({ member, visit }) {
  const role = member.name === visit ? 'active' : member.alive ? '' : 'dead'
  return <li data-role={role} style={{ listStyle: 'none' }}>
    <span style={{
      display: 'inline-block', margin: '3px 0', padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', color: 'var(--text)',
      border: `${role === 'active' ? 2 : 1}px solid ${role === 'active' ? 'var(--primary)' : 'var(--border)'}`,
      background: role === 'active' ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'var(--surface2)',
      textDecoration: member.alive ? 'none' : 'line-through', opacity: member.alive ? 1 : 0.6,
    }}>{member.name}{member.alive ? '' : ' (dead)'}</span>
    {member.children.length > 0 && <ul style={{ borderLeft: '1px solid var(--border)', margin: '0 0 0 14px', paddingLeft: 14 }}>
      {member.children.map(child => <FamilyNode key={child.name} member={child} visit={visit} />)}
    </ul>}
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
    { label: 'Invented family', input: '{"king":"ruth","operations":[["birth","ruth","ivo"],["birth","ruth","lena"],["birth","ivo","tom"],["order"],["death","lena"],["birth","lena","ada"],["order"]]}' },
    { label: "King alone", input: "{\"king\":\"arthur\",\"operations\":[[\"order\"]]}" },
    { label: "Siblings in birth order", input: "{\"king\":\"leo\",\"operations\":[[\"birth\",\"leo\",\"ada\"],[\"birth\",\"leo\",\"bo\"],[\"order\"]]}" },
    { label: "Death, then order", input: "{\"king\":\"leo\",\"operations\":[[\"birth\",\"leo\",\"ada\"],[\"death\",\"leo\"],[\"order\"]]}" },
    { label: "Long run: 20 operations", input: "{\"king\":\"king\",\"operations\":[[\"birth\",\"king\",\"ada\"],[\"birth\",\"king\",\"bo\"],[\"birth\",\"ada\",\"cy\"],[\"birth\",\"bo\",\"dan\"],[\"order\"],[\"death\",\"ada\"],[\"order\"],[\"birth\",\"cy\",\"eve\"],[\"birth\",\"king\",\"fay\"],[\"death\",\"dan\"],[\"order\"],[\"birth\",\"eve\",\"gus\"],[\"birth\",\"fay\",\"hal\"],[\"death\",\"king\"],[\"order\"],[\"birth\",\"gus\",\"ivy\"],[\"death\",\"bo\"],[\"order\"],[\"birth\",\"hal\",\"jo\"],[\"order\"]]}" },
  ],
}

export default function ThroneInheritance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Family tree" style={{ paddingLeft: 0 }}>
      <FamilyNode member={step.family} visit={step.visit} />
    </ul>
    <p style={{ color: 'var(--text-muted)' }}>Children are listed in birth order, oldest first. Struck-through names are dead and are skipped in an order walk, but they keep their place in the tree.</p>
    <output aria-label="Latest order">{step.answer ? `Order: ${step.answer.join(', ')}` : `Last operation: ${step.op ? step.op.join(' ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Children are stored in birth order, so a walk from the king that visits children in that order is the inheritance order.</p>
    <p>A death only marks a person as not alive. Their children still inherit, so the tree itself is never cut.</p>
  </>} />
}
