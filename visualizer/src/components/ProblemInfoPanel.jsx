import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProblemDescription } from "../hooks/useProblemDescription";
import { isPremiumProblem } from "../data/premiumProblems";
import "./ProblemInfoPanel.css";

/**
 * Sanitizes LeetCode HTML to only allow safe tags before rendering.
 * Removes script/style/iframe/on* attributes.
 */
function sanitizeHtml(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<iframe[\s\S]*?>/gi, "")
        .replace(/\son\w+="[^"]*"/gi, "")
        .replace(/\son\w+='[^']*'/gi, "")
        .replace(/javascript:/gi, "");
}

export default function ProblemInfoPanel({ slug, number }) {
    const [open, setOpen] = useState(false);

    const premium = isPremiumProblem(number);
    const { description: info, status, retry } = useProblemDescription(premium ? null : slug);
    const hasContent = info?.content;

    // Nothing to reveal and nothing to explain: not premium, just absent from
    // the dataset. Hide the toggle rather than open onto an apology.
    if (status === 'missing' && !premium) return null;

    return (
        <>
            {/* Toggle bar */}
            <div className="problem-info-bar">
                <button
                    className={`problem-info-toggle${open ? " open" : ""}`}
                    onClick={() => setOpen((v) => !v)}
                    title={open ? "Hide problem description" : "Show problem description"}
                >
                    {/* book icon */}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    Problem
                    {/* chevron */}
                    <svg className="chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
            </div>

            {/* Expandable panel */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        className="problem-info-panel"
                        key="info-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                    >
                        <div className="problem-info-inner">
                            {status === "loading" ? (
                                <p className="problem-info-loading">Loading problem description…</p>
                            ) : status === "error" ? (
                                <div role="alert">
                                    <p>Could not load this problem description.</p>
                                    <button type="button" onClick={retry}>Retry</button>
                                </div>
                            ) : !hasContent ? (
                                <p className="problem-info-premium">
                                    <strong>LeetCode Premium problem.</strong> The description is
                                    subscriber-only, so it isn’t available here — but the
                                    visualization below is fully functional.
                                </p>
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(info.content) }}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
