/* Chat tooltips for elements with a data-tip attribute.
   The tooltip lives on document.body with fixed positioning, so no ancestor
   with overflow:hidden can clip it. Shows immediately on hover and focus. */
export function installChatTooltips() {
  if (typeof document === 'undefined') return () => {};
  const tip = document.createElement('div');
  tip.className = 'chat-tip-layer';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  let current = null;

  const show = (el) => {
    const text = el.getAttribute('data-tip');
    if (!text) return;
    current = el;
    tip.textContent = text;
    const rect = el.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 8));
    let top = rect.top - height - 10;
    if (top < 8) top = rect.bottom + 10;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.classList.add('is-visible');
  };
  const hide = () => {
    current = null;
    tip.classList.remove('is-visible');
  };
  const target = (event) => (event.target && event.target.closest ? event.target.closest('[data-tip]') : null);

  const onOver = (event) => {
    const el = target(event);
    if (el && el !== current) show(el);
  };
  const onOut = (event) => {
    const el = target(event);
    if (el && !el.contains(event.relatedTarget)) hide();
  };
  const onFocus = (event) => {
    const el = target(event);
    if (el) show(el);
  };
  const onBlur = (event) => {
    if (target(event)) hide();
  };

  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);
  document.addEventListener('focusin', onFocus);
  document.addEventListener('focusout', onBlur);
  window.addEventListener('scroll', hide, true);
  return () => {
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onOut);
    document.removeEventListener('focusin', onFocus);
    document.removeEventListener('focusout', onBlur);
    window.removeEventListener('scroll', hide, true);
    tip.remove();
  };
}
