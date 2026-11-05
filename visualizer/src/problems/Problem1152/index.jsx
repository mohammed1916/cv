import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'
import RecordStateTable from '../../components/shared/RecordStateTable'

const definition = {
  number: '1152',
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the visits by time.' },
    { id: 'user', label: 'User', description: 'Count each distinct three-site pattern for this user once.' },
    { id: 'done', label: 'Result', description: 'Pick the most shared pattern.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with visits: [user, time, site] entries',
  url: 'https://leetcode.com/problems/analyze-user-website-visit-pattern/',
  complexity: 'O(u * v^3) for u users with at most v visits each, plus a sort. The visualization caps the input at 30 visits.',
  examples: [
    { label: 'Example', input: '{"visits":[["ann",1,"home"],["ann",2,"shop"],["ann",3,"cart"],["bo",1,"home"],["bo",2,"shop"],["bo",4,"cart"],["cy",1,"shop"],["cy",2,"home"],["cy",3,"cart"]]}' },
    { label: 'Tie', input: '{"visits":[["a",1,"x"],["a",2,"y"],["a",3,"z"],["b",1,"x"],["b",2,"y"],["b",3,"w"]]}' },
  ],
}

export default function AnalyzeUserWebsiteVisitPattern() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <section aria-label="Visit timelines">
      <p><strong>Each user's sites in time order</strong> (the user being counted is bold)</p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
        {step.timelines.map(({ user, sites }) => <li key={user} style={{ fontWeight: step.user === user ? 700 : 400, color: 'var(--text)' }}>
          <span>{user}: </span>{sites.map((site, index) => <span key={index}>{index > 0 ? ' → ' : ''}{site}</span>)}
        </li>)}
      </ul>
    </section>
    <RecordStateTable label="Users sharing each three-site pattern" columns={['pattern', 'users']} rows={step.rows} />
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A user is counted once per pattern even when the same three sites appear more than once in that user's history.</p>
    <p>Sorting by time first means every three-site combination is read in the order the user visited them.</p>
  </>} />
}
