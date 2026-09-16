import './StaircaseScene.css';

export default function StaircaseScene({ n, current, ways = [] }) {
  const width = Math.max(320, (n + 1) * 48 + 16);
  return <div className="staircase-scene" tabIndex={0} aria-label="Staircase; scroll to see all stairs">
    <svg width={width} height="250" viewBox={`0 0 ${width} 250`} role="img" aria-label={`Climbing ${n} stairs. Current stair ${current}.`}>
      {Array.from({ length: n + 1 }, (_, stair) => {
        const x = 12 + stair * 48, y = 194 - stair * (140 / n);
        return <g key={stair} data-stair={stair}>
          <rect x={x} y={y} width="44" height={230 - y} rx="3" className={stair === current ? 'is-current' : ways[stair] !== undefined ? 'is-known' : ''} />
          <text x={x + 22} y={y - 9} textAnchor="middle">{ways[stair] ?? '?'}</text>
          <text x={x + 22} y="246" textAnchor="middle">{stair}</text>
          {stair === current && <circle cx={x + 22} cy={y - 30} r="5" />}
        </g>;
      })}
    </svg>
  </div>;
}
