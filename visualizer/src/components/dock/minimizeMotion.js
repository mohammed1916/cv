// Animate a non-interactive copy of the panel into its restore button.
// The real portal host remains mounted throughout the animation.

export function minimizeMotion(container, source, targetId, complete) {
  const bounds = container.getBoundingClientRect();
  const from = source.getBoundingClientRect();

  const scaleX = bounds.width / container.clientWidth || 1;
  const scaleY = bounds.height / container.clientHeight || 1;

  const ghost = source.cloneNode(true);

  ghost.classList.add("local-dock-minimize-flight");
  ghost.inert = true;
  ghost.setAttribute("aria-hidden", "true");

  // Remove identifiers from the clone so it cannot interfere with
  // selectors/events belonging to the real panel.
  for (const node of [ghost, ...ghost.querySelectorAll("*")]) {
    node.removeAttribute("id");
    node.removeAttribute("data-panel-id");
    node.removeAttribute("data-dock-tab");
    node.removeAttribute("data-restore-panel");
  }

  Object.assign(ghost.style, {
    position: "absolute",
    left: `${(from.left - bounds.left) / scaleX}px`,
    top: `${(from.top - bounds.top) / scaleY}px`,
    width: `${from.width / scaleX}px`,
    height: `${from.height / scaleY}px`,
    margin: "0",
    transform: "translate3d(0, 0, 0) scale(1, 1)",
    transformOrigin: "top left",
    pointerEvents: "none",
  });

  container.appendChild(ghost);

  const previousVisibility = source.style.visibility;

  // Hide the real panel only after the ghost is in place.
  source.style.visibility = "hidden";

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animation = null;
  let cancelled = false;
  let frame1 = 0;
  let frame2 = 0;

  /*
   * We deliberately wait two animation frames.
   *
   * React needs to render the "Minimizing" restore button after
   * setMinimizing() before we measure its final position.
   */
  frame1 = requestAnimationFrame(() => {
    frame2 = requestAnimationFrame(() => {
      if (cancelled) return;

      const target = container.querySelector(
        `[data-restore-panel="${CSS.escape(targetId)}"]`,
      );

      if (!target) {
        finish();
        return;
      }

      const to = target.getBoundingClientRect();
      if (reducedMotion) {
        finish();
        return;
      }

      /*
       * Coordinates are relative to the original panel position.
       *
       * Center the panel over the restore button at the end instead
       * of aligning only their top-left corners.
       */
      const finalScaleX = to.width / from.width;
      const finalScaleY = to.height / from.height;

      const dx = (to.left - from.left) / scaleX;

      const dy = (to.top - from.top) / scaleY;

      animation = ghost.animate([
        { transform: 'translate3d(0, 0, 0) scale(1, 1)', opacity: 1, borderRadius: '12px' },
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${finalScaleX}, ${finalScaleY})`, opacity: 0, borderRadius: '28px' },
      ], {
        duration: 380,
        easing: 'cubic-bezier(0.32, 0, 0.2, 1)',
        fill: 'forwards',
      });

      animation.onfinish = finish;

      animation.oncancel = () => {
        // Cleanup is handled by the returned cancellation function.
      };
    });
  });

  function finish() {
    if (cancelled) return;

    ghost.remove();

    source.style.visibility = previousVisibility;

    complete();
  }

  return () => {
    cancelled = true;

    cancelAnimationFrame(frame1);
    cancelAnimationFrame(frame2);

    animation?.cancel();

    ghost.remove();

    source.style.visibility = previousVisibility;
  };
}
