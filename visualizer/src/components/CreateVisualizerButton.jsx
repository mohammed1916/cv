
import './CreateVisualizerButton.css';

export default function CreateVisualizerButton({ onClick }) {
  return (
    <button
      type="button"
      className="playground-launch-btn create-visualizer-launch-btn"
      onClick={onClick}
    >
      <span className="cv-aurora" aria-hidden="true" />
      <span className="cv-gloss" aria-hidden="true" />

      <span className="cv-content">
        <span className="cv-icon" aria-hidden="true">
          {'{ }'}
        </span>

        <span className="cv-copy">
          <span className="cv-title">Create Visualizer</span>
          <span className="cv-subtitle">
            Turn algorithms into interactive experiences
          </span>
        </span>

        <span className="cv-arrow" aria-hidden="true">↗</span>
      </span>
    </button>
  );
}
