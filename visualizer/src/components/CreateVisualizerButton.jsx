import './CreateVisualizerButton.css';

export default function CreateVisualizerButton({ onClick }) {
  return <button type="button" className="playground-launch-btn create-visualizer-launch-btn" onClick={onClick}>
    <span aria-hidden="true">{'{ }'}</span> Create Visualizer
  </button>;
}
