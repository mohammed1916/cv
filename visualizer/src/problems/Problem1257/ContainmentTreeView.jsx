import "./ContainmentTreeView.css";

function buildChildren(regions) {
  const children = new Map();
  for (const row of regions) children.set(row[0], [...(children.get(row[0]) ?? []), ...row.slice(1)]);
  return children;
}

function RegionNode({ name, children, run, step }) {
  const marked = step.marked.includes(name);
  const isCurrent = name === step.node && step.phase !== "done";
  const isAnswer = step.answer === name;
  const tags = [];
  if (name === run.input.region1) tags.push("region1");
  if (name === run.input.region2) tags.push("region2");
  const cls = ["ct-node", marked ? "ct-marked" : "", isCurrent ? "ct-current" : "", isAnswer ? "ct-answer" : ""].join(" ");
  const kids = children.get(name) ?? [];
  return (
    <li className="ct-item">
      <span className={cls}>
        <span className="ct-name">{name}</span>
        {tags.map((t) => <span key={t} className="ct-tag">{t}</span>)}
        {isCurrent && step.phase !== "start" && <span className="ct-tag">current</span>}
        {isAnswer && <span className="ct-tag">answer</span>}
      </span>
      {kids.length > 0 && (
        <ul className="ct-children">
          {kids.map((k) => <RegionNode key={k} name={k} children={children} run={run} step={step} />)}
        </ul>
      )}
    </li>
  );
}

export default function ContainmentTreeView({ run, step }) {
  const children = buildChildren(run.input.regions);
  const parents = new Set(run.input.regions.flatMap((row) => row.slice(1)));
  const root = run.input.regions.map((row) => row[0]).find((name) => !parents.has(name));
  return (
    <figure className="ct-view" aria-label="Region containment tree">
      <ul className="ct-tree" aria-label="Regions from the top down">
        <RegionNode name={root} children={children} run={run} step={step} />
      </ul>
      <figcaption className="ct-caption">
        <span>Marked regions: {step.marked.length ? step.marked.join(", ") : "none yet"}.</span>{" "}
        <span>{step.answer ? `Answer: ${step.answer}.` : `Climbing from ${step.node ?? "nothing yet"}.`}</span>
      </figcaption>
    </figure>
  );
}
