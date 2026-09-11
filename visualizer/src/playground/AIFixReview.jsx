import { useState } from 'react'
import PlaygroundDialog from './PlaygroundDialog'
import { lineDiff } from './ai/suggestPythonFix.js'

export default function AIFixReview({ proposal, beforeSource, beforeInput, onAccept, onReject }) {
  const [open, setOpen] = useState(true)
  const sourceDiff = lineDiff(beforeSource, proposal.source).filter((line) => line.type !== 'same')
  const inputDiff = lineDiff(beforeInput, proposal.inputSource).filter((line) => line.type !== 'same')
  return (<>
    <button type="button" onClick={() => setOpen(true)}>Review proposed changes</button>
    {open && <PlaygroundDialog title={proposal.reviewTitle ?? 'Review AI fix'} onClose={() => setOpen(false)}>
    <div className="runtime-playground__ai-fix-review">
      <strong>{proposal.reviewTitle ?? 'AI fix awaiting review'}</strong>
      <p>{proposal.summary}</p>
      {proposal.changes.length > 0 && <ul>{proposal.changes.map((change) => <li key={change}>{change}</li>)}</ul>}
      {[['Code changes', sourceDiff], ['Input changes', inputDiff]].map(([label, lines]) => <section key={label}>
        <h3>{label}</h3>
        <div className="runtime-playground__ai-diff" aria-label={label}>
          {lines.map((line, index) => <code className={`is-${line.type}`} key={`${line.type}-${index}`}><b>{line.type === 'add' ? '+' : '-'}</b>{line.text || ' '}</code>)}
          {lines.length === 0 && <span>No changes.</span>}
        </div>
      </section>)}
      <div className="runtime-playground__ai-fix-actions">
        <button type="button" onClick={onReject}>Reject</button>
        <button type="button" className="runtime-playground__button--primary" onClick={onAccept}>Accept and run</button>
      </div>
    </div>
    </PlaygroundDialog>}
  </>)
}
