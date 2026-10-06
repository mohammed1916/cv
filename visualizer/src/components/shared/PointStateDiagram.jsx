import { useId } from 'react';

// A bounded Cartesian scene for point multiplicities and candidate rectangles.
export default function PointStateDiagram({ points, query, square = [] }) {
  const titleId = useId();
  const visible = [...points, ...(query ? [query] : []), ...square];
  if (!visible.length) return <p>No points have been added.</p>;
  let minX = Math.min(...visible.map(p => p.x)), maxX = Math.max(...visible.map(p => p.x));
  let minY = Math.min(...visible.map(p => p.y)), maxY = Math.max(...visible.map(p => p.y));
  if (minX === maxX) { minX -= 1; maxX += 1; }
  if (minY === maxY) { minY -= 1; maxY += 1; }
  // Use one scale for both axes so a mathematical square is drawn as a square.
  const scale = Math.min(500 / (maxX - minX), 250 / (maxY - minY));
  const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
  const x = value => 320 + (value - centerX) * scale;
  const y = value => 160 - (value - centerY) * scale;
  return <figure style={{ margin: '12px 0', maxWidth: 720 }}>
    <figcaption>Point state — numbers show stored occurrences; the outlined square is the current candidate.</figcaption>
    <svg viewBox="0 0 640 350" width="100%" role="img" aria-labelledby={titleId} style={{ display: 'block', color: 'inherit' }}>
      <title id={titleId}>Stored points and candidate square in Cartesian coordinates</title>
      <rect x="20" y="15" width="600" height="310" rx="8" fill="none" stroke="currentColor" opacity="0.2" />
      {square.length > 0 && <polygon points={square.map(p => `${x(p.x)},${y(p.y)}`).join(' ')} fill="#06b6d4" fillOpacity="0.1" stroke="#0891b2" strokeWidth="2" strokeDasharray="6 4" />}
      {points.map(point => <g key={`${point.x},${point.y}`} transform={`translate(${x(point.x)},${y(point.y)})`}>
        <title>{`(${point.x}, ${point.y}): ${point.count} stored occurrences`}</title>
        <circle r="13" fill="#155e75" stroke="#67e8f9" strokeWidth="1.5" />
        <text textAnchor="middle" dy="4" fill="white" fontSize="12">{point.count}</text>
        <text textAnchor="middle" dy="-20" fill="currentColor" fontSize="11">{point.x},{point.y}</text>
      </g>)}
      {query && <g transform={`translate(${x(query.x)},${y(query.y)})`}>
        <title>{`Query corner (${query.x}, ${query.y})`}</title>
        <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="3" />
        <text textAnchor="middle" dy="32" fill="currentColor" fontSize="12">query ({query.x},{query.y})</text>
      </g>}
      <text x="24" y="344" fill="currentColor" fontSize="11">x increases right; y increases up. Both axes use the same scale.</text>
    </svg>
  </figure>;
}
