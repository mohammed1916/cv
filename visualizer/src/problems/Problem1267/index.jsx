
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python } from './algorithm';
import './CountServers.css';

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Inspect the input servers.' },
    { id: 'dimensions', label: 'Dimensions', description: 'Measure the grid.' },
    { id: 'row-begin', label: 'Start row', description: 'Reset the row accumulator.' },
    { id: 'row-scan', label: 'Scan row', description: 'Add the current cell.' },
    { id: 'row-commit', label: 'Store row', description: 'Save the row count.' },
    { id: 'col-begin', label: 'Start column', description: 'Reset the column accumulator.' },
    { id: 'col-scan', label: 'Scan column', description: 'Add the current cell.' },
    { id: 'col-commit', label: 'Store column', description: 'Save the column count.' },
    { id: 'initialize', label: 'Initialize', description: 'Set total to zero.' },
    { id: 'inspect', label: 'Inspect', description: 'Visit the next cell.' },
    { id: 'compare', label: 'Compare', description: 'Reuse both counts.' },
    { id: 'count', label: 'Count', description: 'Increment the result.' },
    { id: 'skip', label: 'Skip', description: 'Leave total unchanged.' },
    { id: 'done', label: 'Complete', description: 'Return the answer.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with a 0/1 grid (1 is a server)',
  url: 'https://leetcode.com/problems/count-servers-that-communicate/',
  complexity: 'O(mn) time and O(m + n) auxiliary space.',
  examples: [
    { label: 'Isolated', input: '{"grid":[[1,0],[0,1]]}' },
    { label: 'Shared column', input: '{"grid":[[1,0],[1,1]]}' },
    { label: 'Single cell', input: '{"grid":[[1]]}' },
    { label: 'All zeros', input: '{"grid":[[0,0],[0,0]]}' },
    {
      label: 'Full ones, 6 by 6',
      input: JSON.stringify({
        grid: Array.from({ length: 6 }, () => Array(6).fill(1)),
      }),
    },
    {
      label: 'Long run: 6 by 6 pattern',
      input: JSON.stringify({
        grid: [
          [1, 0, 1, 1, 0, 1],
          [0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 0, 1],
          [0, 0, 1, 0, 0, 1],
          [1, 0, 1, 0, 1, 1],
          [0, 0, 0, 1, 1, 1],
        ],
      }),
    },
    {
      label: 'Long run, with few communications',
      input: '{"grid":[[1,0,0,0,0,0],[0,0,1,0,0,0],[0,0,0,0,1,0],[0,0,0,0,0,0],[0,0,1,0,0,0],[0,0,0,0,0,1]]}'
    },
  ],
};

const CELL = 58;
const GAP = 10;
const PITCH = CELL + GAP;
const LEFT = 48;
const TOP = 52;
const RAIL_GAP = 52;
const RAIL = 54;
const BOTTOM = 60;

function CountServersVisual({ grid, step }) {
  const rows = grid.length;
  const cols = grid[0].length;

  const gridWidth = cols * PITCH - GAP;
  const gridHeight = rows * PITCH - GAP;

  const rowRailX = LEFT + gridWidth + RAIL_GAP;
  const colRailY = TOP + gridHeight + BOTTOM;

  const width = rowRailX + RAIL + 22;
  const height = colRailY + RAIL + 32;

  const active = step.cell;
  const activeR = active ? active[0] : -1;
  const activeC = active ? active[1] : -1;

  const rowMode = step.scanAxis === 'row';
  const colMode = step.scanAxis === 'column';
  const checking = step.stage === 'check';
  const comparing = ['compare', 'count', 'skip'].includes(step.phase);

  const counted = new Set(
    (step.counted || []).map(({ row, col }) => `${row}:${col}`)
  );

  const x = (c) => LEFT + c * PITCH;
  const y = (r) => TOP + r * PITCH;
  const cx = (c) => x(c) + CELL / 2;
  const cy = (r) => y(r) + CELL / 2;

  const rowRailCenter = rowRailX + RAIL / 2;
  const colRailCenter = colRailY + RAIL / 2;

  const rowValue = checking && active ? step.rowCount[activeR] : null;
  const colValue = checking && active ? step.colCount[activeC] : null;

  const isServer = checking && active && grid[activeR][activeC] === 1;
  const rowPass = comparing && isServer && rowValue > 1;
  const colPass = comparing && isServer && colValue > 1;
  const communicates = rowPass || colPass;

  // Paths are generated in the same coordinate system as the cells.
  const paths = [];

  if (rowMode) {
    const r = step.scanIndex;
    const startX = active ? cx(activeC) : LEFT - 16;

    paths.push({
      id: 'row-flow',
      d: `M ${startX} ${cy(r)} H ${rowRailX - 9}`,
      color: 'var(--cs-row)',
    });
  }

  if (colMode) {
    const c = step.scanIndex;
    const startY = active ? cy(activeR) : TOP - 16;

    paths.push({
      id: 'column-flow',
      d: `M ${cx(c)} ${startY} V ${colRailY - 9}`,
      color: 'var(--cs-column)',
    });
  }

  if (comparing && isServer) {
    paths.push({
      id: 'row-lookup',
      d: `M ${cx(activeC)} ${cy(activeR)}
          H ${rowRailX - 9}`,
      color: 'var(--cs-row)',
    });

    paths.push({
      id: 'column-lookup',
      d: `M ${cx(activeC)} ${cy(activeR)}
          V ${colRailY - 9}`,
      color: 'var(--cs-column)',
    });
  }

  const scanStage = step.stage === 'rows' || step.stage === 'columns';

  return (
    <section className="cs-visual" aria-label="Connected server visualization">
      <div className="cs-heading">
        <div>
          <strong>Server network</strong>
          <span>Grid → row and column summaries</span>
        </div>
        <span className="cs-dimension-tag">
          {rows} × {cols}
        </span>
      </div>

      <div className="cs-stage-legend">
        <span><i className="cs-dot cs-dot--row" /> Row information</span>
        <span><i className="cs-dot cs-dot--column" /> Column information</span>
        <span><i className="cs-dot cs-dot--counted" /> Counted server</span>
      </div>

      <div className="cs-svg-scroll">
        <svg
          className="cs-network"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={`Grid with ${rows} rows, ${cols} columns, and connected counts`}
        >
          <defs>
            <marker
              id="cs-arrow-row"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path
                d="M0 0 L6 3 L0 6"
                fill="none"
                stroke="var(--cs-row)"
                strokeWidth="1.5"
              />
            </marker>
            <marker
              id="cs-arrow-column"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path
                d="M0 0 L6 3 L0 6"
                fill="none"
                stroke="var(--cs-column)"
                strokeWidth="1.5"
              />
            </marker>
          </defs>

          <text x={LEFT} y="20" className="cs-svg-title">
            Input servers
          </text>
          <text x={rowRailCenter} y="20" textAnchor="middle" className="cs-svg-label">
            row_count
          </text>

          {Array.from({ length: cols }, (_, c) => (
            <text
              key={`col-index-${c}`}
              x={cx(c)}
              y={TOP - 14}
              textAnchor="middle"
              className="cs-svg-index"
            >
              c{c}
            </text>
          ))}

          {Array.from({ length: rows }, (_, r) => (
            <text
              key={`row-index-${r}`}
              x={LEFT - 17}
              y={cy(r) + 4}
              textAnchor="middle"
              className="cs-svg-index"
            >
              r{r}
            </text>
          ))}

          {/* Highlight the whole line currently being constructed. */}
          {rowMode && (
            <rect
              x={LEFT - 5}
              y={y(step.scanIndex) - 5}
              width={gridWidth + 10}
              height={CELL + 10}
              rx="12"
              className="cs-row-band"
            />
          )}

          {colMode && (
            <rect
              x={x(step.scanIndex) - 5}
              y={TOP - 5}
              width={CELL + 10}
              height={gridHeight + 10}
              rx="12"
              className="cs-column-band"
            />
          )}

          {/* Input grid */}
          {grid.map((row, r) =>
            row.map((value, c) => {
              const isActive = activeR === r && activeC === c;
              const wasCounted = counted.has(`${r}:${c}`);

              return (
                <g key={`cell-${r}-${c}`}>
                  <rect
                    x={x(c)}
                    y={y(r)}
                    width={CELL}
                    height={CELL}
                    rx="10"
                    className={[
                      'cs-svg-cell',
                      value === 1 ? 'is-server' : '',
                      wasCounted ? 'is-counted' : '',
                      isActive ? 'is-active' : '',
                    ].filter(Boolean).join(' ')}
                  />

                  {value === 1 ? (
                    <g transform={`translate(${cx(c) - 15}, ${cy(r) - 17})`}>
                      <rect
                        width="30"
                        height="34"
                        rx="6"
                        className={
                          wasCounted
                            ? 'cs-server-body is-counted'
                            : isActive
                              ? 'cs-server-body is-active'
                              : 'cs-server-body'
                        }
                      />
                      <circle cx="9" cy="11" r="2.5" fill="white" />
                      <circle cx="19" cy="11" r="2.5" fill="white" />
                      <rect x="7" y="23" width="16" height="3" rx="1.5" fill="white" opacity=".7" />
                    </g>
                  ) : (
                    <text
                      x={cx(c)}
                      y={cy(r) + 5}
                      textAnchor="middle"
                      className="cs-svg-zero"
                    >
                      0
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* Row count slots */}
          {Array.from({ length: rows }, (_, r) => {
            const ready = step.rowCount[r] !== null;
            const selected =
              (rowMode && step.scanIndex === r) ||
              (comparing && activeR === r);

            return (
              <g key={`row-count-${r}`}>
                <rect
                  x={rowRailX}
                  y={y(r) + (CELL - RAIL) / 2}
                  width={RAIL}
                  height={RAIL}
                  rx="10"
                  className={[
                    'cs-rail-slot',
                    'cs-rail-slot--row',
                    ready ? 'is-ready' : '',
                    selected ? 'is-selected' : '',
                  ].filter(Boolean).join(' ')}
                />
                <text
                  x={rowRailCenter}
                  y={cy(r) + 6}
                  textAnchor="middle"
                  className="cs-rail-value"
                >
                  {ready ? step.rowCount[r] : '–'}
                </text>
              </g>
            );
          })}

          {/* Column count slots */}
          {Array.from({ length: cols }, (_, c) => {
            const ready = step.colCount[c] !== null;
            const selected =
              (colMode && step.scanIndex === c) ||
              (comparing && activeC === c);

            return (
              <g key={`col-count-${c}`}>
                <rect
                  x={x(c) + (CELL - RAIL) / 2}
                  y={colRailY}
                  width={RAIL}
                  height={RAIL}
                  rx="10"
                  className={[
                    'cs-rail-slot',
                    'cs-rail-slot--column',
                    ready ? 'is-ready' : '',
                    selected ? 'is-selected' : '',
                  ].filter(Boolean).join(' ')}
                />
                <text
                  x={cx(c)}
                  y={colRailCenter + 6}
                  textAnchor="middle"
                  className="cs-rail-value"
                >
                  {ready ? step.colCount[c] : '–'}
                </text>
              </g>
            );
          })}

          <text
            x={LEFT}
            y={colRailY + RAIL + 20}
            className="cs-svg-label"
          >
            col_count
          </text>

          {/* Connections sit above the grid and below the active marker. */}
          {paths.map((path) => (
            <path
              key={`${step.phase}-${path.id}-${activeR}-${activeC}-${step.scanIndex}`}
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="7 5"
              markerEnd={
                path.id.includes('column')
                  ? 'url(#cs-arrow-column)'
                  : 'url(#cs-arrow-row)'
              }
              className="cs-flow-path"
            />
          ))}

          {active && (
            <circle
              cx={cx(activeC)}
              cy={cy(activeR)}
              r="5"
              className="cs-active-marker"
            />
          )}
        </svg>
      </div>

      <div className="cs-calculation">
        <div className="cs-calculation-title">
          {step.stage === 'rows'
            ? `Constructing row_count[${step.scanIndex}]`
            : step.stage === 'columns'
              ? `Constructing col_count[${step.scanIndex}]`
              : step.stage === 'check'
                ? 'Communication decision'
                : step.stage === 'dimensions'
                  ? 'Read dimensions'
                  : step.stage === 'done'
                    ? 'Final answer'
                    : 'Algorithm state'}
        </div>

        {scanStage && (
          <div className="cs-equation">
            <div className="cs-equation-box">
              <small>Previous sum</small>
              <strong>{step.previousSum ?? 0}</strong>
            </div>
            <span className="cs-equation-op">+</span>
            <div className="cs-equation-box">
              <small>Current cell</small>
              <strong>{step.scanValue ?? '–'}</strong>
            </div>
            <span className="cs-equation-op">=</span>
            <div className="cs-equation-box cs-equation-box--result">
              <small>Running sum</small>
              <strong>{step.runningSum ?? 0}</strong>
            </div>
          </div>
        )}

        {step.stage === 'dimensions' && (
          <div className="cs-equation">
            <div className="cs-equation-box">
              <small>rows</small>
              <strong>{rows}</strong>
            </div>
            <div className="cs-equation-box">
              <small>cols</small>
              <strong>{cols}</strong>
            </div>
          </div>
        )}

        {comparing && isServer && (
          <div className="cs-equation cs-equation--comparison">
            <div className={`cs-equation-box ${rowPass ? 'is-true' : ''}`}>
              <small>row_count[{activeR}] &gt; 1</small>
              <strong>{rowValue} &gt; 1</strong>
              <span>{rowPass ? 'TRUE' : 'FALSE'}</span>
            </div>
            <span className="cs-equation-op">OR</span>
            <div className={`cs-equation-box ${colPass ? 'is-true' : ''}`}>
              <small>col_count[{activeC}] &gt; 1</small>
              <strong>{colValue} &gt; 1</strong>
              <span>{colPass ? 'TRUE' : 'FALSE'}</span>
            </div>
            <span className="cs-equation-op">→</span>
            <div className={`cs-decision ${communicates ? 'is-true' : ''}`}>
              {communicates ? 'Count server' : 'Skip server'}
            </div>
          </div>
        )}

        <div className="cs-total">
          <span>Communicating servers</span>
          <output aria-label="Server total">{step.total}</output>
        </div>
      </div>
    </section>
  );
}

export default function CountServers() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <CountServersVisual
          grid={run.input.grid}
          step={step}
        />
      )}
      renderReasoning={() => (
        <>
          <p>
            First construct row_count and col_count.
            Each entry summarizes an entire row or column.
          </p>
          <p>
            During the second pass, select a server and
            follow both connections to its stored counts.
            If either count exceeds one, that server
            communicates.
          </p>
          <p>
            Precomputation avoids rescanning every row
            and column for every server.
          </p>
        </>
      )}
    />
  );
}
