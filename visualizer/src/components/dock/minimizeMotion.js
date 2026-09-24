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

      /*
       * The intermediate points intentionally keep the panel large
       * for the first part of the animation.
       *
       * This makes the movement visually readable instead of looking
       * like the panel instantly vanished.
       */
      animation = ghost.animate(
        [
          // ---------------------------------------------------------
          // 0% - original panel
          // ---------------------------------------------------------
          {
            transform: "translate3d(0px, 0px, 0) scale(1, 1)",
            opacity: 1,
            offset: 0,
          },

          // ---------------------------------------------------------
          // 12% - almost stationary
          // Gives the eye time to register what is being minimized.
          // ---------------------------------------------------------
          {
            transform:
              `translate3d(${dx * 0.03}px, ${dy * 0.02}px, 0) ` +
              "scale(0.99, 0.99)",
            opacity: 1,
            offset: 0.12,
          },

          // ---------------------------------------------------------
          // 28% - start travelling downward
          // ---------------------------------------------------------
          {
            transform:
              `translate3d(${dx * 0.16}px, ${dy * 0.18}px, 0) ` +
              "scale(0.94, 0.92)",
            opacity: 1,
            offset: 0.28,
          },

          // ---------------------------------------------------------
          // 48% - clearly visible middle stage
          // ---------------------------------------------------------
          {
            transform:
              `translate3d(${dx * 0.4}px, ${dy * 0.45}px, 0) ` +
              "scale(0.80, 0.76)",
            opacity: 0.98,
            offset: 0.48,
          },

          // ---------------------------------------------------------
          // 68% - now shrink more aggressively
          // ---------------------------------------------------------
          {
            transform:
              `translate3d(${dx * 0.66}px, ${dy * 0.7}px, 0) ` +
              "scale(0.60, 0.52)",
            opacity: 0.94,
            offset: 0.68,
          },

          // ---------------------------------------------------------
          // 84% - approaching restore strip
          // ---------------------------------------------------------
          {
            transform:
              `translate3d(${dx * 0.86}px, ${dy * 0.88}px, 0) ` +
              `scale(${Math.max(finalScaleX, 0.3)}, ` +
              `${Math.max(finalScaleY, 0.24)})`,
            opacity: 0.85,
            offset: 0.84,
          },

          // ---------------------------------------------------------
          // 94% - nearly inside the restore button
          // ---------------------------------------------------------
          {
            transform:
              `translate3d(${dx * 0.97}px, ${dy * 0.98}px, 0) ` +
              `scale(${Math.max(finalScaleX, 0.16)}, ` +
              `${Math.max(finalScaleY, 0.1)})`,
            opacity: 0.65,
            offset: 0.94,
          },

          // ---------------------------------------------------------
          // 100% - exactly matches restore button dimensions
          // ---------------------------------------------------------
          {
            transform:
              `translate3d(${dx}px, ${dy}px, 0) ` +
              `scale(${finalScaleX}, ${finalScaleY})`,
            opacity: 0.15,
            offset: 1,
          },
        ],
        {
          /*
           * 2.2 seconds intentionally.
           *
           * Once you're happy with the motion, I would reduce this
           * to around 1200-1500ms.
           */
          duration: 2200,

          /*
           * Much easier to visually follow than the previous
           * aggressive easing.
           */
          easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",

          fill: "forwards",
        },
      );

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
