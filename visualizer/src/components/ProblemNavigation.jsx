import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { isFreeProblem } from "../access/policy";
import ProblemInfoPanel from "./ProblemInfoPanel";
import "./ProblemNavigation.css";

const category = (problem) =>
  problem.tags.includes("Basics")
    ? "Basics"
    : problem.tags.includes("Codeforces")
      ? "Codeforces"
      : "LeetCode";

export default function ProblemNavigation({
  problem,
  problems,
  pro,
  onSelect,
}) {
  const dialog = useRef(null);
  const current = useRef(null);

  const ordered = useMemo(
    () =>
      problems
        .filter((item) => category(item) === category(problem))
        .toSorted((a, b) =>
          String(a.number).localeCompare(String(b.number), undefined, {
            numeric: true,
          }),
        ),
    [problems, problem],
  );

  const index = ordered.findIndex((item) => item.id === problem.id);

  const locked = (item) => !pro && !isFreeProblem(item);

  const select = (item) => {
    dialog.current?.close();

    if (item.id !== problem.id) {
      onSelect(item);
    }
  };

  const open = () => {
    dialog.current?.showModal();
    current.current?.scrollIntoView({ block: "center" });
  };

  return (
    <>
      <ProblemInfoPanel
        slug={problem.slug}
        number={problem.number}
        before={
          <button
            className="problem-nav-button"
            onClick={open}
            aria-label="Open problem list"
            aria-haspopup="dialog"
            title="Problem list"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
        after={
          <nav className="problem-nav-arrows" aria-label="Adjacent problems">
            {[-1, 1].map((offset) => {
              const item = ordered[index + offset];
              const label = offset < 0 ? "Previous problem" : "Next problem";

              return (
                <button
                  key={offset}
                  className="problem-nav-button"
                  disabled={!item}
                  aria-label={label}
                  title={
                    item
                      ? `${label}: ${item.number}. ${item.title}${
                          locked(item) ? " (Pro)" : ""
                        }`
                      : label
                  }
                  onClick={() => select(item)}
                >
                  {offset < 0 ? "‹" : "›"}
                </button>
              );
            })}
          </nav>
        }
      />

      {createPortal(
        <dialog
          ref={dialog}
          className="problem-list-dialog"
          aria-labelledby="problem-list-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              dialog.current?.close();
            }
          }}
        >
          <div className="problem-list-content">
            <header>
              <h2 id="problem-list-title">{category(problem)} problems</h2>

              <button
                className="problem-nav-button"
                autoFocus
                onClick={() => dialog.current?.close()}
                aria-label="Close problem list"
              >
                ×
              </button>
            </header>

            <nav aria-label="Problem list">
              {ordered.map((item) => (
                <button
                  key={item.id}
                  ref={item.id === problem.id ? current : undefined}
                  aria-current={item.id === problem.id ? "page" : undefined}
                  onClick={() => select(item)}
                >
                  <span className="problem-list-label">
                    <span className="problem-list-number">
                      {item.number} -{" "}
                    </span>

                    <span className="problem-list-name">{item.title}</span>
                  </span>

                  {locked(item) && (
                    <small aria-label="Requires Pro">🔒 Pro</small>
                  )}

                  {!item.implemented && <small>Coming soon</small>}
                </button>
              ))}
            </nav>
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}
