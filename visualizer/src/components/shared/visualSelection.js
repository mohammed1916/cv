// Controls retain their normal actions; only explicitly marked data buttons
// opt into selection. Code and Selectable own their richer selection handlers.
export function resolveVisualSelection(target) {
  if (!target?.closest || target.closest('[data-chat-ignore], [data-code-selection], .selectable, .chat-drawer, .chat-launcher')) return null;
  const marked = target.closest('[data-chat-selectable]');
  if (!marked && target.closest('button, input, textarea, select, a')) return null;
  const element = marked || target.closest('td, .algorithm-sequence__cell, .matrix-grid__cell, svg g') || target;
  const label = element.getAttribute('data-chat-label') || element.getAttribute('aria-label') || element.querySelector('title')?.textContent || element.tagName;
  const text = (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 1200);
  if (!text && !element.getAttribute('data-chat-label') && !element.getAttribute('aria-label')) return null;
  return { label: `Selected: ${String(label).slice(0, 160)}`, data: {
    tag: element.tagName.toLowerCase(), text,
    row: element.getAttribute('data-row') ?? undefined,
    column: element.getAttribute('data-column') ?? undefined,
    index: element.getAttribute('data-index') ?? undefined,
  } };
}
