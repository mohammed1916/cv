import "./ParticleFlowView.css";

const CELL = 64;
const PAD = 44;
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

const KEY = (r, c) => `${r},${c}`;

function toSet(cells) {
  return new Set((cells || []).map(([r, c]) => KEY(r, c)));
}

// Wave colour: blue for Pacific only, orange for Atlantic only, violet when both reach (the answer).
function waveClass(inPacific, inAtlantic) {
  if (inPacific && inAtlantic) return "pf-cell--both";
  if (inPacific) return "pf-cell--pacific";
  if (inAtlantic) return "pf-cell--atlantic";
  return "pf-cell--dry";
}

function waveLabel(inPacific, inAtlantic) {
  if (inPacific && inAtlantic) return "reached by both";
  if (inPacific) return "Pacific only";
  if (inAtlantic) return "Atlantic only";
  return "not reached yet";
}

export default function ParticleFlowView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pf-view" aria-label="Pacific Atlantic water flow">
        <p className="pf-empty">Press Play to watch both oceans flood uphill across the grid.</p>
      </section>
    );
  }

  const { rows, cols, heights, answer } = run;
  const reach = step.reach;
  const pacific = toSet(reach.pacific);
  const atlantic = toSet(reach.atlantic);
  const frontier = toSet(reach.frontier);
  const answerSet = toSet(answer);
  const current = reach.current ? KEY(...reach.current) : null;
  const neighbour = reach.neighbour ? KEY(...reach.neighbour) : null;
  const width = PAD * 2 + cols * CELL;
  const height = PAD * 2 + rows * CELL;
  const x = (c) => PAD + c * CELL + CELL / 2;
  const y = (r) => PAD + r * CELL + CELL / 2;

  // Downhill flow arrows: from each cell toward neighbours that are equal or lower.
  const arrows = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (heights[nr][nc] > heights[r][c]) continue;
        // Short arrow from the cell centre toward the lower or equal neighbour.
        arrows.push({
          key: `${r},${c}->${nr},${nc}`,
          sx: x(c) + dc * 16,
          sy: y(r) + dr * 16,
          ex: x(c) + dc * 28,
          ey: y(r) + dr * 28,
        });
      }
    }
  }

  const verdictText = {
    accepted: "Accepted: the wave climbs here.",
    lower: "Blocked: lower than the current cell.",
    visited: "Already reached by this wave.",
  }[reach.verdict] ?? null;

  const oceanLabel = reach.ocean === "pacific" ? "Pacific wave" : reach.ocean === "atlantic" ? "Atlantic wave" : "Set-up";

  return (
    <section className="pf-view" aria-label="Pacific Atlantic water flow">
      <header className="pf-header">
        <h3 className="pf-title">Water flow grid</h3>
        <p className="pf-status" role="status">
          <strong>{oceanLabel}</strong>
          {" · "}Pacific {reach.pacific.length} cells, Atlantic {reach.atlantic.length} cells, both {answer.length}
        </p>
      </header>

      <div className="pf-stage">
        <svg
          className="pf-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${rows} by ${cols} height grid. ${reach.pacific.length} cells reached from Pacific, ${reach.atlantic.length} from Atlantic, ${answer.length} reached by both.`}
        >
          <defs>
            <marker id="pf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="pf-arrowhead" />
            </marker>
          </defs>

          {/* Ocean edges */}
          <text x={PAD + (cols * CELL) / 2} y={18} textAnchor="middle" className="pf-ocean-label pf-ocean-label--pacific">
            Pacific edge (top and left): P
          </text>
          <text x={width - 8} y={PAD + (rows * CELL) / 2} textAnchor="end" className="pf-ocean-label pf-ocean-label--atlantic" transform={`rotate(-90 ${width - 8} ${PAD + (rows * CELL) / 2})`}>
            Atlantic edge (bottom and right): A
          </text>
          <line x1={PAD} y1={PAD - 6} x2={PAD + cols * CELL} y2={PAD - 6} className="pf-edge pf-edge--pacific" />
          <line x1={PAD - 6} y1={PAD} x2={PAD - 6} y2={PAD + rows * CELL} className="pf-edge pf-edge--pacific" />
          <line x1={PAD} y1={PAD + rows * CELL + 6} x2={PAD + cols * CELL} y2={PAD + rows * CELL + 6} className="pf-edge pf-edge--atlantic" />
          <line x1={PAD + cols * CELL + 6} y1={PAD} x2={PAD + cols * CELL + 6} y2={PAD + rows * CELL} className="pf-edge pf-edge--atlantic" />

          {/* Cells: wave colour, frontier, current, neighbour, answer */}
          {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
            const id = KEY(r, c);
            const inP = pacific.has(id);
            const inA = atlantic.has(id);
            const classes = ["pf-cell", waveClass(inP, inA)];
            if (frontier.has(id)) classes.push("pf-cell--frontier");
            if (id === current) classes.push("pf-cell--current");
            if (id === neighbour) classes.push("pf-cell--neighbour");
            if (answerSet.has(id)) classes.push("pf-cell--answer");
            const label = `Row ${r}, column ${c}, height ${heights[r][c]}, ${waveLabel(inP, inA)}${frontier.has(id) ? ", on the frontier" : ""}${id === current ? ", current cell" : ""}${id === neighbour ? ", being checked" : ""}${answerSet.has(id) ? ", in the answer" : ""}`;
            return (
              <g key={id} className={classes.join(" ")} aria-label={label}>
                <rect x={PAD + c * CELL + 3} y={PAD + r * CELL + 3} width={CELL - 6} height={CELL - 6} rx={6} />
                <text x={x(c)} y={y(r) - 6} textAnchor="middle" className="pf-height">{heights[r][c]}</text>
                <text x={x(c)} y={y(r) + 14} textAnchor="middle" className="pf-mark">
                  {inP && inA ? "P+A" : inP ? "P" : inA ? "A" : ""}
                  {frontier.has(id) ? " F" : ""}
                  {answerSet.has(id) ? " *" : ""}
                </text>
              </g>
            );
          }))}

          {/* Downhill flow arrows */}
          <g className="pf-arrows" aria-hidden="true">
            {arrows.map((arrow) => (
              <line key={arrow.key} x1={arrow.sx} y1={arrow.sy} x2={arrow.ex} y2={arrow.ey} className="pf-arrow" markerEnd="url(#pf-arrow)" />
            ))}
          </g>

          {/* Neighbour check connector */}
          {current && neighbour && (
            <line x1={x(reach.current[1])} y1={y(reach.current[0])} x2={x(reach.neighbour[1])} y2={y(reach.neighbour[0])} className="pf-check" />
          )}
        </svg>
      </div>

      <div className="pf-readout">
        {verdictText && <p className={`pf-verdict pf-verdict--${reach.verdict}`}>{verdictText}</p>}
        <p className="pf-message">{step.message}</p>
        {reach.current && <p>Current cell: ({reach.current[0]}, {reach.current[1]}), height {heights[reach.current[0]][reach.current[1]]}</p>}
        {reach.neighbour && <p>Checking neighbour: ({reach.neighbour[0]}, {reach.neighbour[1]}), height {heights[reach.neighbour[0]][reach.neighbour[1]]}</p>}
        {reach.frontier.length > 0 && <p>Frontier: {reach.frontier.length} cell{reach.frontier.length === 1 ? "" : "s"} waiting in the queue</p>}
      </div>

      <ul className="pf-legend" aria-label="Legend">
        <li><span className="pf-swatch pf-swatch--pacific" aria-hidden="true" />P: Pacific only</li>
        <li><span className="pf-swatch pf-swatch--atlantic" aria-hidden="true" />A: Atlantic only</li>
        <li><span className="pf-swatch pf-swatch--both" aria-hidden="true" />P+A: both oceans (answer)</li>
        <li><span className="pf-swatch pf-swatch--dry" aria-hidden="true" />Not reached yet</li>
        <li><span className="pf-swatch pf-swatch--frontier" aria-hidden="true" />F: frontier queue</li>
        <li><span className="pf-swatch pf-swatch--neighbour" aria-hidden="true" />Neighbour being checked</li>
        <li><span className="pf-swatch pf-swatch--answer" aria-hidden="true" />*: answer outline</li>
        <li><span className="pf-arrow-key" aria-hidden="true">→</span>Downhill flow to an equal or lower neighbour</li>
      </ul>
    </section>
  );
}
