export function selectCodeLines(code, current, line, anchor, extend) {
  const allowed = new Set(code.map(row => row.line));
  const next = new Set(current.filter(number => allowed.has(number)));
  if (extend && allowed.has(anchor)) {
    const start = code.findIndex(row => row.line === anchor);
    const end = code.findIndex(row => row.line === line);
    if (end >= 0) for (const row of code.slice(Math.min(start, end), Math.max(start, end) + 1)) next.add(row.line);
  } else if (allowed.has(line)) {
    if (next.has(line)) next.delete(line); else next.add(line);
  }
  return code.filter(row => next.has(row.line)).map(row => row.line);
}

export function codeSelectionPayload(code, selected, title) {
  const rows = code.filter(row => selected.includes(row.line));
  return { title, lines: rows.map(row => row.line).join(', '), code: rows.map(row => `${row.line}: ${row.text}`).join('\n') };
}
