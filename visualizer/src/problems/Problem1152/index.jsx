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
    { label: 'Minimum visits from one user', input: '{"visits":[["ann",1,"home"],["ann",2,"shop"],["ann",3,"cart"]]}' },
    { label: 'Equal times for one user', input: '{"visits":[["cy",2,"home"],["cy",2,"shop"],["cy",2,"cart"]]}' },
    { label: 'Zero and large times', input: '{"visits":[["dan",0,"home"],["dan",1000,"shop"],["dan",1000000,"cart"]]}' },
    { label: 'Long run: 30 visits', input: '{"visits":[["bo",46,"help"],["cy",57,"shop"],["ann",153,"cart"],["dan",167,"cart"],["cy",19,"news"],["ann",125,"home"],["ann",140,"cart"],["bo",17,"help"],["cy",137,"home"],["dan",7,"cart"],["ann",182,"cart"],["dan",176,"news"],["bo",1,"shop"],["bo",30,"home"],["dan",7,"home"],["eve",176,"help"],["ann",25,"shop"],["eve",24,"news"],["cy",19,"shop"],["eve",33,"home"],["bo",120,"news"],["ann",4,"news"],["cy",65,"shop"],["eve",106,"cart"],["eve",125,"home"],["cy",44,"help"],["ann",37,"cart"],["eve",41,"shop"],["cy",155,"cart"],["dan",194,"news"]]}' },
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
