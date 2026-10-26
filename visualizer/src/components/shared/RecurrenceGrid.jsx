import './RecurrenceGrid.css';
import { useEffect, useRef } from 'react';

export default function RecurrenceGrid({ rowLabels, columnLabels, row, column, valueAt, roleAt, label }) {
  const viewport = useRef(null);
  useEffect(() => {
    const host = viewport.current, cell = host?.querySelector('[data-role="current"]');
    if (!cell) return;
    const a = host.getBoundingClientRect(), b = cell.getBoundingClientRect();
    if (b.bottom > a.bottom) host.scrollTop += b.bottom-a.bottom;
    else if (b.top < a.top) host.scrollTop -= a.top-b.top;
    if (b.right > a.right) host.scrollLeft += b.right-a.right;
    else if (b.left < a.left) host.scrollLeft -= a.left-b.left;
  }, [row, column]);
  // Follow the current dependency window; avoid hiding later rows by truncating the table.
  const rowStart = Math.max(0, row - 5), columnStart = Math.max(0, column - 5);
  const rows = rowLabels.slice(rowStart, rowStart + 8), columns = columnLabels.slice(columnStart, columnStart + 8);
  return <div ref={viewport} className="recurrence-grid" role="region" tabIndex={0} aria-label={label}>
    <table>
      <caption>{label}. Rows {rowStart}–{rowStart+rows.length-1}; columns {columnStart}–{columnStart+columns.length-1}. The window follows playback.</caption>
      <thead><tr><th scope="col">Source / target</th>{columns.map((text,j)=><th scope="col" key={j}>{text}</th>)}</tr></thead>
      <tbody>{rows.map((text,i)=><tr key={i}><th scope="row">{text}</th>{columns.map((_,j)=>{const r=rowStart+i,c=columnStart+j,role=roleAt(r,c);return <td key={j} data-role={role}><strong>{valueAt(r,c)}</strong><small>{role || `[${r}, ${c}]`}</small></td>;})}</tr>)}</tbody>
    </table>
  </div>;
}
