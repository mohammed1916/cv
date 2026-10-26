// Shared by the homepage and guided demos; mirrors the real Two Sum cells.
export default function TwoSumPreviewCells({ x = 0, y = 0, spacing = 73, size = 52, activeIndex = 0, found = false }) {
  return <g fontFamily="ui-monospace, monospace">
    {[2, 7, 11, 15].map((value, index) => {
      const matched = found && index < 2;
      const active = index === (found ? 1 : activeIndex);
      const stored = !found && index < activeIndex;
      const center = x + index * spacing + size / 2;
      const pointer = found && index === 0 ? 'match' : active ? 'i' : null;
      return <g key={value} data-preview-index={index}>
        <text x={center} y={y - 12} textAnchor="middle" fontSize="11" style={{ fill: '#cbd5e1' }}>{index}</text>
        <rect x={x + index * spacing} y={y - (active ? 4 : 0)} width={size} height={size} rx="8"
          fill={matched ? '#073d2a' : active ? '#082f49' : stored ? '#2e1745' : '#18182d'} stroke={matched ? '#22c55e' : active ? '#0ea5e9' : stored ? '#a855f7' : '#37374f'} strokeWidth="1.5" />
        <text x={center} y={y + size / 2 + 5 - (active ? 4 : 0)} textAnchor="middle" fontSize="17" fontWeight="600"
          style={{ fill: matched ? '#4ade80' : active ? '#38bdf8' : stored ? '#c084fc' : '#f1f5f9' }}>{value}</text>
        {pointer && <g>
          <rect x={center - (pointer === 'match' ? 24 : 10)} y={y + size + 9} width={pointer === 'match' ? 48 : 20} height="20" rx="4"
            fill={pointer === 'match' ? '#047857' : '#082f49'} stroke={pointer === 'match' ? '#34d399' : '#38bdf8'} />
          <text x={center} y={y + size + 23} textAnchor="middle" fontSize="11" style={{ fill: '#fff' }}>{pointer}</text>
        </g>}
      </g>;
    })}
  </g>;
}
