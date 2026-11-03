import "./TradeTimelineView.css";

// The price line is drawn day by day. The sale under test is an arc from the buy day to the sell day,
// and the cooldown after each completed sale is shaded so the next buy must wait past it.
export default function TradeTimelineView({ run, step }) {
  if (!run || !step) return <p className="tt-empty">Press Play to test every buy and sell pair.</p>;
  const { prices, costs, cooldown } = run.input;
  const n = prices.length;
  const max = Math.max(1, ...prices);
  const W = 36;
  const x = d => 24 + d * W;
  const y = p => 120 - (p / max) * 90;
  const { j, i } = step;
  return (
    <section className="tt-view" aria-label="Buy and sell timeline">
      <svg viewBox={`0 0 ${x(n) + 16} 150`} role="img" aria-label={`Prices over ${n} days, current sale day ${j}`}>
        {j >= 0 && step.f && Array.from({ length: n }, (_, d) => d).filter(d => d <= j - cooldown - 1 && j - cooldown - 1 >= 0).length > 0 && (
          <rect x={x(0) - 10} y="8" width={x(Math.max(0, j - cooldown - 1)) + 10} height="124" className="tt-ready" />
        )}
        {prices.map((p, d) => (
          <g key={d}>
            <rect x={x(d) - 10} y={y(p)} width="20" height={120 - y(p)} className={d === j ? "tt-bar tt-bar--sell" : d === i ? "tt-bar tt-bar--buy" : "tt-bar"} />
            <text x={x(d)} y="138" textAnchor="middle" className="tt-day">{d}</text>
            <text x={x(d)} y={y(p) - 4} textAnchor="middle" className="tt-price">{p}</text>
          </g>
        ))}
        {i >= 0 && j > i && (
          <path d={`M ${x(i)} ${y(prices[i]) - 12} Q ${(x(i) + x(j)) / 2} ${y(prices[i]) - 60} ${x(j)} ${y(prices[j]) - 12}`} className="tt-arc" />
        )}
      </svg>
      <dl className="tt-readout">
        <div><dt>Buy day</dt><dd>{i >= 0 ? i : "none"}</dd></div>
        <div><dt>Sell day</dt><dd>{j >= 0 ? j : "none"}</dd></div>
        <div><dt>Holding cost</dt><dd>{i >= 0 && j > i ? costs[j - i] : "-"}</dd></div>
        <div><dt>Best so far</dt><dd>{step.f ? Math.max(0, ...step.f.filter(v => v !== null)) : 0}</dd></div>
      </dl>
      <p className="tt-note">Shaded days are too close to the last sale to buy on; the cooldown is {cooldown} day{cooldown === 1 ? "" : "s"} after a sale.</p>
    </section>
  );
}
