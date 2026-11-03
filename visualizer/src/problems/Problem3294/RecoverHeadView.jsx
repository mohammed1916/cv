import "./RecoverHeadView.css";

// The given node is marked first. The cursor then climbs left through prev links to the head, and
// finally walks right through next links, appending each value to the output.
export default function RecoverHeadView({ run, step }) {
  if (!run || !step) return <p className="rhv-empty">Press Play to climb to the head and read the list.</p>;
  const { nodes } = step;
  const phaseLabel = { start: "Given node", climb: "Climb prev", head: "Head found", collect: "Read node", advance: "Follow next", done: "Finished" }[step.phase];

  return (
    <section className="rhv-view" aria-label="Recover head then read a doubly linked list">
      <div className="rhv-list" role="list" aria-label="Nodes in list order">
        {nodes.map((node, i) => {
          const cls = [
            "rhv-node",
            i === run.input.node ? "rhv-node--given" : "",
            i === step.head && step.phase !== "start" ? "rhv-node--head" : "",
            i === step.current ? "rhv-node--cursor" : "",
            isRead(step, i) ? "rhv-node--read" : "",
          ].filter(Boolean).join(" ");
          return (
            <div className="rhv-item" role="listitem" key={i}>
              <div className={cls}>
                <span className="rhv-node__value">{node.val}</span>
                <span className="rhv-node__pos">#{i}</span>
              </div>
              {i < nodes.length - 1 && <span className="rhv-link" aria-hidden="true">⇄</span>}
            </div>
          );
        })}
      </div>
      <p className="rhv-phase"><strong>{phaseLabel}</strong>{step.current >= 0 ? `, cursor at #${step.current}` : ", cursor is null"}</p>
      <div className="rhv-output" aria-label="Output array">
        <span className="rhv-output__label">result</span>
        <code>[{step.result.join(", ")}]</code>
      </div>
    </section>
  );
}

// A node is read once the output has grown past its position in the forward walk.
function isRead(step, i) {
  const headIndex = step.head;
  const offset = i - headIndex;
  return offset >= 0 && offset < step.result.length;
}
