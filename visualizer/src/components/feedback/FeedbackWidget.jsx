import { useState } from "react";
import { accessCall } from "../../access/firebase";
import "./FeedbackWidget.css";

const RATINGS = [
  { id: "terrible", label: "Terrible" },
  { id: "bad", label: "Bad" },
  { id: "okay", label: "Okay" },
  { id: "good", label: "Good" },
  { id: "amazing", label: "Amazing" },
];

const CATEGORIES = [
  { id: "bug", label: "Bug" },
  { id: "ui", label: "UI" },
  { id: "ux", label: "UX" },
  { id: "pricing", label: "Pricing" },
  { id: "loading", label: "Loading" },
  { id: "animation", label: "Animation" },
  { id: "support", label: "Support" },
  { id: "payment", label: "Payment" },
];

/* Floating feedback trigger, stacked above the chat launcher. Feedback needs a
   signed-in account, so signed-out visitors are sent to the sign-in dialog. */
export default function FeedbackWidget({ user, context = "Home page", onSignIn }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const toggleCategory = id =>
    setCategories(current => (current.includes(id) ? current.filter(c => c !== id) : [...current, id]));

  const close = () => {
    setOpen(false);
    setStatus("idle");
    setError("");
  };

  const submit = async event => {
    event.preventDefault();
    if (!rating) {
      setError("Choose a rating first.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await accessCall("submitFeedback", {
        rating,
        categories,
        message,
        page: context,
      });
      setStatus("sent");
      setRating("");
      setCategories([]);
      setMessage("");
    } catch (err) {
      setStatus("idle");
      setError(err?.message || "Feedback could not be sent. Please try again.");
    }
  };

  const handleOpen = () => {
    if (!user) {
      onSignIn?.();
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button type="button" className="feedback-fab" onClick={handleOpen} aria-haspopup="dialog" aria-label="Feedback">
        <svg className="feedback-fab-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
          <path d="M3 10v4h3l8 5V5L6 10H3Z" fill="#ffffff" />
          <path d="M17 8.5a5 5 0 0 1 0 7" />
          <path d="M19.5 6a8.5 8.5 0 0 1 0 12" />
          <path d="M6 14l1.5 5h2.5l-1.2-4.2" />
        </svg>
        <span className="feedback-fab-word" aria-hidden="true">Feedback</span>
      </button>
      {open && (
        <div className="feedback-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}>
          <section className="feedback-card" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <div className="feedback-head">
              <h2 id="feedback-title">Give feedback</h2>
              <button type="button" className="feedback-close" onClick={close} aria-label="Close feedback">×</button>
            </div>
            {status === "sent" ? (
              <div className="feedback-thanks">
                <p>Thanks — your feedback was received.</p>
                <button type="button" onClick={close}>Close</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <p className="feedback-context" aria-label="Feedback about">
                  About: <strong>{context}</strong>
                </p>
                <p className="feedback-question">How do you feel about the visualizer?</p>
                <div className="feedback-ratings" role="radiogroup" aria-label="Rating">
                  {RATINGS.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={rating === item.id}
                      className={`feedback-rating${rating === item.id ? " is-selected" : ""}`}
                      onClick={() => setRating(item.id)}
                    >
                      <span className="feedback-rating-dot" aria-hidden="true" data-rating={item.id} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <p className="feedback-question">What is it about? <span className="feedback-optional">(optional)</span></p>
                <div className="feedback-chips">
                  {CATEGORIES.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={categories.includes(item.id)}
                      className={`feedback-chip${categories.includes(item.id) ? " is-selected" : ""}`}
                      onClick={() => toggleCategory(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <label className="feedback-label" htmlFor="feedback-message">
                  Tell us more <span className="feedback-optional">(optional)</span>
                  <span className="feedback-hint">Every message is read. We use it to decide what to improve next.</span>
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  maxLength={2000}
                  rows={4}
                  onChange={event => setMessage(event.target.value)}
                />
                {error && <p className="feedback-error" role="alert">{error}</p>}
                <div className="feedback-actions">
                  <button type="button" className="feedback-cancel" onClick={close}>Cancel</button>
                  <button type="submit" className="feedback-submit" disabled={status === "sending"}>
                    {status === "sending" ? "Sending…" : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
