import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import TutorialDemo from "../../access/TutorialDemo";
import "./TwoSumTour.css";

const preferenceKey = "visualizer.twoSum.showTutorialEveryTime";
const lessons = [
  [
    "array",
    "Start with your input",
    "Choose an example or enter an array and target. For [2, 7, 11, 15] with target 9, indices 0 and 1 form the answer.",
    0,
  ],
  [
    "playback",
    "Control the execution",
    "Try Play, Pause, or Next. Slow the speed to give yourself time to read each change.",
    1,
  ],
  [
    "hashmap",
    "Remember what you have seen",
    "This panel stores each visited value and its index. When you reach 7, look for its complement: 9 − 7 = 2.",
    3,
  ],
  [
    "code",
    "Connect code to state",
    "The highlighted line follows execution. Compare the complement check with the values in the hash map.",
    1,
  ],
  [
    "code",
    "Try dragging a panel",
    "Grab the Code tab above this panel. Hold and drag it to another panel’s edge, then release when the docking preview appears. Drop in the center to group tabs. The workspace stays interactive during this guide.",
    2,
  ],
  [
    "playback",
    "Make the workspace yours",
    "Drag the Playback Controls title to move it. Dock mounts it below the workspace; Float detaches it again. Close the guide when you are ready to explore.",
    2,
  ],
];

export default function TwoSumTour({ panels, playbackRef }) {
  const [everyTime, setEveryTime] = useState(() => {
    try {
      return localStorage.getItem(preferenceKey) === "true";
    } catch {
      return true;
    }
  });
  const [open, setOpen] = useState(everyTime);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const launchRef = useRef(null);
  const closeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [panel, title, description, demo] = lessons[step];
  useEffect(() => {
    if (!open || panel === "playback") return;
    const floating = playbackRef.current?.closest(".floating-panel");
    if (!floating) return;
    const opacity = floating.style.opacity;
    floating.style.opacity = "0.15";
    return () => {
      floating.style.opacity = opacity;
    };
  }, [open, panel, playbackRef]);
  useEffect(() => {
    if (!open) return;
    const launcher = launchRef.current;
    closeRef.current?.focus();
    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("keydown", escape);
      launcher?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let animationFrame;
    let previous = "";
    // Lumino moves nodes during docking. Track live bounds, including the tab.
    const measure = () => {
      const content =
        panel === "playback" ? playbackRef.current : panels?.[panel];
      const node =
        content?.closest(".floating-panel, .lumino-panel-widget") || content;
      if (node) {
        const bounds = node.getBoundingClientRect();
        const tabTitle = {
          array: "Array & Target",
          hashmap: "Hash Map",
          code: "Code",
        }[panel];
        const tab =
          panel !== "playback"
            ? Array.from(
                node
                  .closest(".local-dock-workspace")
                  ?.querySelectorAll('[role="tab"]') || [],
              ).find(
                (item) =>
                  item.textContent ===
                  tabTitle,
              )
            : null;
        const tabBounds = tab?.getBoundingClientRect();
        const left = Math.max(4, bounds.left - 6);
        const top = Math.max(
          4,
          Math.min(bounds.top, tabBounds?.top ?? bounds.top) - 6,
        );
        const next = {
          left,
          top,
          width: Math.max(
            0,
            Math.min(window.innerWidth - 4, bounds.right + 6) - left,
          ),
          height: Math.max(
            0,
            Math.min(window.innerHeight - 4, bounds.bottom + 6) - top,
          ),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
        const signature = JSON.stringify(next);
        if (signature !== previous) {
          previous = signature;
          setRect(next);
        }
      }
      animationFrame = requestAnimationFrame(measure);
    };
    animationFrame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animationFrame);
  }, [open, panel, panels, playbackRef]);
  function changePreference(event) {
    const value = event.target.checked;
    setEveryTime(value);
    try {
      localStorage.setItem(preferenceKey, String(value));
    } catch {
      /* Keep the session preference. */
    }
  }
  function move(next) {
    setStep(next);
    setShowDemo(false);
  }
  const cardOnLeft =
    rect && rect.left + rect.width / 2 > rect.viewportWidth / 2;
  return (
    <>
      <div className="two-sum-tour-launch">
        <button
          ref={launchRef}
          type="button"
          onClick={() => {
            move(0);
            setOpen(true);
          }}
        >
          ▶ Two Sum tutorial
        </button>
        <label>
          <input
            type="checkbox"
            checked={everyTime}
            onChange={changePreference}
          />{" "}
          Show tutorial every time I open Two Sum
        </label>
      </div>
      {open &&
        createPortal(
          <div className="two-sum-tour-layer">
            {rect && rect.width > 0 && rect.height > 0 && (
              <motion.div
                className="two-sum-tour-spotlight"
                aria-hidden="true"
                initial={{
                  left: 0,
                  top: 0,
                  width: rect.viewportWidth,
                  height: rect.viewportHeight,
                  opacity: 0,
                }}
                animate={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  opacity: 1,
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 110, damping: 24 }
                }
              />
            )}
            <motion.section
              className={`two-sum-tour-card ${cardOnLeft ? "is-left" : ""} ${panel === "playback" ? "for-playback" : ""}`}
              role="dialog"
              aria-modal="false"
              aria-labelledby="two-sum-tour-title"
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="two-sum-tour-heading">
                <span>
                  TWO SUM · {step + 1} / {lessons.length}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close Two Sum tutorial"
                >
                  ✕
                </button>
              </div>
              <h3 id="two-sum-tour-title">{title}</h3>
              <p>{description}</p>
              <button
                type="button"
                aria-expanded={showDemo}
                onClick={() => setShowDemo((value) => !value)}
              >
                {showDemo ? "Hide cursor demo" : "Watch cursor + zoom demo"}
              </button>
              {showDemo && <TutorialDemo key={step} lesson={demo} cinematic />}
              <label className="two-sum-tour-preference">
                <input
                  type="checkbox"
                  checked={everyTime}
                  onChange={changePreference}
                />{" "}
                Show tutorial every time
              </label>
              <nav aria-label="Two Sum tutorial steps">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => move(step - 1)}
                >
                  Back
                </button>
                <button type="button" onClick={() => setOpen(false)}>
                  Skip tutorial
                </button>
                <button
                  type="button"
                  className="two-sum-tour-next"
                  onClick={() =>
                    step === lessons.length - 1
                      ? setOpen(false)
                      : move(step + 1)
                  }
                >
                  {step === lessons.length - 1 ? "Finish" : "Next"}
                </button>
              </nav>
            </motion.section>
          </div>,
          document.body,
        )}
    </>
  );
}
