import './JsonView.css'

// The text written so far, with the node just finished marked. Nesting depth shows how far the writer has climbed back out.
export default function JsonView({ view }) {
  const kindLabel = { array: 'array closed', object: 'object closed', string: 'string written', leaf: 'number, boolean or null written', done: 'complete' }[view.kind] ?? ''
  return <section className="json-view" aria-label="JSON output">
    <pre className="json-view__text" aria-label="Output text">{view.text || ' '}<span className="json-view__caret" aria-hidden="true">|</span></pre>
    <dl className="json-view__state">
      <div><dt>Last node</dt><dd>{kindLabel || '-'}</dd></div>
      <div><dt>Depth</dt><dd>{view.depth}</dd></div>
    </dl>
  </section>
}
