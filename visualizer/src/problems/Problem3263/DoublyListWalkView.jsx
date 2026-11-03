import "./DoublyListWalkView.css";

// Nodes sit in list order with a two-way link between neighbours. The cursor marks the node being read,
// and the output array fills in beneath the list as each value is appended.
export default function DoublyListWalkView({ run, step }) {
  if (!run || !step) return <p className="dlw-empty">Press Play to walk the list forward.</p>;
  const { nodes } = step;
  if (nodes.length === 0) return <p className="dlw-empty">The list is empty; the walk returns [].</p>;

  return (
    <section className="dlw-view" aria-label="Doubly linked list forward walk">
      <div className="dlw-list" role="list" aria-label="Nodes in list order">
        {nodes.map((node, i) => (
          <div className="dlw-item" role="listitem" key={i}>
            {i === 0 && <span className="dlw-tag">head</span>}
            <div className={`dlw-node${i === step.current ? " dlw-node--current" : ""}${step.result.length > i ? " dlw-node--read" : ""}`}>
              <span className="dlw-node__value">{node.val}</span>
              <span className="dlw-node__pos">#{i}</span>
            </div>
            {i < nodes.length - 1 && (
              <span className={`dlw-link${step.current === i ? " dlw-link--next" : ""}`} aria-hidden="true">⇄</span>
            )}
          </div>
        ))}
      </div>
      <p className="dlw-pointer">
        {step.current === -1 ? "Cursor: null (the walk has ended)" : `Cursor on node #${step.current}, following next`}
      </p>
      <div className="dlw-output" aria-label="Output array">
        <span className="dlw-output__label">result</span>
        <code>[{step.result.join(", ")}]</code>
      </div>
    </section>
  );
}
