import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Two queues', description: 'Queue R and D senators by position.' },
    { id: 'ban', label: 'Ban opponent', description: 'The front senator bans the next opponent and rejoins later.' },
    { id: 'done', label: 'Complete', description: 'The party with senators left wins.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Senate (JSON string of R and D)',
  url: 'https://leetcode.com/problems/dota2-senate/',
  complexity: 'O(n) time with two queues; each senator is dequeued and requeued at most a constant number of times per round.',
  examples: [
    { label: 'Radiant wins', input: '"RD"' },
    { label: 'Dire wins', input: '"RDD"' },
    { label: 'Longer', input: '"DDRRR"' },
  ],
}

export default function DotaSenate() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Radiant queue (positions)" items={step.radiant.map(String)} note="front acts first" />
    <StackLane title="Dire queue (positions)" items={step.dire.map(String)} note="front acts first" />
    <output aria-label="Round">Round {step.round}{step.winner ? ` · ${step.actor} bans ${step.victim}` : ''}{step.result ? ` · winner ${step.result}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the front acts:</strong> the senator who acts first always bans the next opponent to ensure victory, and rejoining after n positions keeps the order consistent.</p>
  </>} />
}
