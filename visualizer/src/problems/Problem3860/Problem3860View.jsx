import './Problem3860View.css'

// Each address is split into local and domain. Its key is shown in the bucket list, and repeats stack onto the same bucket.
export default function Problem3860View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="eg-view" aria-label="Email normalization">
        <p className="eg-empty">Press Play to normalize each address and sort it into a group.</p>
      </section>
    )
  }

  const { emails } = run.input

  return (
    <section className="eg-view" aria-label="Email normalization">
      <div className="eg-columns">
        <div className="eg-panel" aria-label="Addresses">
          <h3>Addresses</h3>
          <ol className="eg-list">
            {emails.map((email, i) => {
              const state = step.phase === 'done' || i < step.index ? 'past' : i === step.index ? 'cur' : 'todo'
              return (
                <li key={i} className={`eg-row eg-row--${state}`}>
                  <span className="eg-icon" aria-hidden="true">{state === 'cur' ? '▶' : state === 'past' ? '✓' : '·'}</span>
                  <code>{email}</code>
                </li>
              )
            })}
          </ol>
        </div>
        <div className="eg-panel" aria-label="Current step">
          <h3>This address</h3>
          {step.raw ? (
            <dl className="eg-facts">
              <dt>local</dt><dd><code>{step.local}</code></dd>
              <dt>domain</dt><dd><code>{step.domain}</code></dd>
              <dt>key</dt><dd><code>{step.key ?? 'pending'}</code></dd>
            </dl>
          ) : (
            <p className="eg-empty">No address is active.</p>
          )}
          {step.isNew !== null && (
            <p className={`eg-badge ${step.isNew ? 'eg-badge--new' : 'eg-badge--seen'}`}>{step.isNew ? '+ new group' : '= same group'}</p>
          )}
        </div>
      </div>
      <div className="eg-panel" aria-label="Groups">
        <h3>Groups so far: {step.groups.length}</h3>
        {step.groups.length === 0 ? <p className="eg-empty">No groups yet.</p> : (
          <ul className="eg-buckets">
            {step.groups.map(group => (
              <li key={group.key} className={group.key === step.key ? 'eg-bucket eg-bucket--cur' : 'eg-bucket'}>
                <code>{group.key}</code>
                <span className="eg-count" aria-label={`${group.count} addresses`}>{group.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="eg-total">{step.phase === 'done' ? `Answer: ${run.result}` : step.message}</p>
    </section>
  )
}
