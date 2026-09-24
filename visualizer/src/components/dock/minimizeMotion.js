// Animate a non-interactive copy; the real portal host stays mounted throughout.
export function minimizeMotion(container, source, targetId, complete) {
  const bounds = container.getBoundingClientRect(), from = source.getBoundingClientRect();
  const scaleX = bounds.width / container.clientWidth || 1;
  const scaleY = bounds.height / container.clientHeight || 1;
  const ghost = source.cloneNode(true);
  ghost.classList.add('local-dock-minimize-flight');
  ghost.inert = true;
  ghost.setAttribute('aria-hidden', 'true');
  for (const node of [ghost, ...ghost.querySelectorAll('*')]) {
    node.removeAttribute('id'); node.removeAttribute('data-panel-id'); node.removeAttribute('data-dock-tab');
  }
  Object.assign(ghost.style, { left: `${(from.left - bounds.left) / scaleX}px`, top: `${(from.top - bounds.top) / scaleY}px`, width: `${from.width / scaleX}px`, height: `${from.height / scaleY}px` });
  container.appendChild(ghost);
  const previousVisibility = source.style.visibility;
  source.style.visibility = 'hidden';
  let animation, cancelled = false;
  const frame = requestAnimationFrame(() => {
    const target = container.querySelector(`[data-restore-panel="${CSS.escape(targetId)}"]`);
    if (!target) { finish(); return; }
    const to = target.getBoundingClientRect();
    const dx = (to.left - from.left) / scaleX, dy = (to.top - from.top) / scaleY;
    animation = ghost.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * .25}px, ${dy * .35}px) scale(.8)`, opacity: .98, offset: .35 },
      { transform: `translate(${dx}px, ${dy}px) scale(${to.width / from.width}, ${to.height / from.height})`, opacity: .6, offset: 1 },
    ], { duration: 780, easing: 'cubic-bezier(.22,.65,.3,1)', fill: 'forwards' });
    animation.onfinish = finish;
  });
  function finish() {
    if (cancelled) return;
    ghost.remove(); source.style.visibility = previousVisibility;
    complete();
  }
  return () => { cancelled = true; cancelAnimationFrame(frame); animation?.cancel(); ghost.remove(); source.style.visibility = previousVisibility; };
}
