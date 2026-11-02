import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Known', description: 'Build each user’s language set.' },
    { id: 'share', label: 'Shared', description: 'The two users already share a language.' },
    { id: 'bad', label: 'No share', description: 'Both users join the needy set.' },
    { id: 'count', label: 'Teach', description: 'Count needy users who already know a language.' },
    { id: 'done', label: 'Result', description: 'Teach the rest of the needy users.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, languages (one list per user) and friendships (1-based pairs)',
  url: 'https://leetcode.com/problems/minimum-number-of-people-to-teach/',
  complexity: 'O(F * L + n * U) time for F friendships, L languages per user and U needy users. The visualization caps the input size.',
  examples: [
    { label: 'Example', input: '{"n":2,"languages":[[1],[2],[1,2]],"friendships":[[1,2],[1,3],[2,3]]}' },
    { label: 'Already shared', input: '{"n":3,"languages":[[1,3],[2],[1,2],[3]],"friendships":[[1,3],[2,3]]}' },
  ],
}

export default function MinimumNumberOfPeopleToTeach() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Friendships" length={run.input.friendships.length}
      valueAt={i => run.input.friendships[i].join('-')} active={step.at}
      roleAt={i => (step.bad || []).includes(i) ? 'bad' : i <= step.at ? 'ok' : ''} />
    <output aria-label="Teaching count">{`needy users ${step.need}, language ${step.lang ?? '-'} covers ${step.count ?? '-'}, result ${step.result ?? 'pending'}`}</output>
  </>} renderReasoning={() => <>
    <p>A friendship fails only when the two users share no language. Both users of a failing friendship must learn one common language.</p>
    <p>Teaching one language L to the needy group costs the group size minus the number of needy users who already know L. Pick the language that covers the most.</p>
  </>} />
}
