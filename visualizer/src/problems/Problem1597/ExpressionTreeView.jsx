import "./ExpressionTreeView.css";

const GAP_X = 56;
const GAP_Y = 64;
const PAD = 34;

// In-order x positions for every node reachable from the operand stack.
function layout(nodes, roots) {
  const pos = {};
  let x = 0;
  let deepest = 0;
  const walk = (id, depth) => {
    if (id === null || id === undefined) return;
    const node = nodes[id];
    walk(node.left, depth + 1);
    pos[id] = { x: x++, y: depth };
    deepest = Math.max(deepest, depth);
    walk(node.right, depth + 1);
  };
  roots.forEach(root => {
    walk(root, 0);
    x += 0.6;
  });
  return { pos, columns: Math.max(1, Math.ceil(x)), rows: deepest + 1 };
}

export default function ExpressionTreeView({ run, step }) {
  const nodes = step.nodes;
  const { pos, columns, rows } = layout(nodes, step.operands);
  const width = columns * GAP_X + PAD * 2;
  const height = rows * GAP_Y + PAD * 2;
  const isOperator = value => value === "+" || value === "-" || value === "*" || value === "/";
  const tokens = run.input.tokens;

  return (
    <div className="expr-view">
      <ol className="expr-tokens" aria-label="Tokens from left to right">
        {tokens.map((tok, i) => (
          <li
            key={i}
            className={i === step.token ? "is-current" : i < step.token ? "is-done" : ""}
            aria-current={i === step.token ? "step" : undefined}
          >
            {tok}
          </li>
        ))}
      </ol>

      <div className="expr-stacks">
        <section className="expr-stack" aria-label="Operators stack, top first">
          <h4>Operators (top first)</h4>
          <div className="expr-cells">
            {[...step.operators].reverse().map((op, i) => (
              <span key={i} className={op === "(" ? "cell paren" : "cell op"}>{op}</span>
            ))}
            {step.operators.length === 0 && <span className="empty">empty</span>}
          </div>
        </section>
        <section className="expr-stack" aria-label="Operands stack, top last">
          <h4>Operands (top last)</h4>
          <div className="expr-cells">
            {step.operands.map(id => (
              <span key={id} className={nodes[id].left === null ? "cell leaf" : "cell subtree"}>
                {nodes[id].val}
              </span>
            ))}
            {step.operands.length === 0 && <span className="empty">empty</span>}
          </div>
        </section>
      </div>

      <svg className="expr-tree" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Expression tree built so far">
        {Object.keys(pos).map(key => {
          const id = Number(key);
          const node = nodes[id];
          const here = pos[id];
          const kids = [node.left, node.right].filter(k => k !== null);
          return kids.map(kid => {
            const child = pos[kid];
            return (
              <line
                key={`${id}-${kid}`}
                x1={PAD + here.x * GAP_X}
                y1={PAD + here.y * GAP_Y}
                x2={PAD + child.x * GAP_X}
                y2={PAD + child.y * GAP_Y}
                className="expr-edge"
              />
            );
          });
        })}
        {Object.keys(pos).map(key => {
          const id = Number(key);
          const { x, y } = pos[id];
          const cls = ["expr-node", isOperator(nodes[id].val) ? "is-op" : "is-leaf"];
          if (id === step.made) cls.push("is-new");
          return (
            <g key={id} className={cls.join(" ")} transform={`translate(${PAD + x * GAP_X} ${PAD + y * GAP_Y})`}>
              <circle r="18" />
              <text textAnchor="middle" dominantBaseline="central">{nodes[id].val}</text>
            </g>
          );
        })}
      </svg>

      <p className="expr-result" aria-live="polite">
        {step.phase === "done" && run.result !== null ? `Value: ${run.result}` : "Value after the tree is complete."}
      </p>
    </div>
  );
}
