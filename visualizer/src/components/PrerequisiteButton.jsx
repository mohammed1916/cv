import './PrerequisiteButton.css';

// A closed, deliberately uneven contour. Normalized path length keeps the
// travelling arcs continuous as the button stretches with its label.
const outline = 'M24 4 L47 4 52 1 57 7 62 4 96 4 100 2 104 5 108 4 152 4 157 7 162 2 167 4 216 4 Q226 4 231 12 L235 15 233 20 237 24 234 28 Q232 40 220 43 L216 44 185 44 181 47 176 41 170 44 137 44 133 42 129 46 124 44 88 44 82 41 77 47 72 44 24 44 Q13 44 8 35 L4 32 7 27 3 22 6 18 Q9 4 24 4 Z';

export default function PrerequisiteButton({ onClick }) {
  return <button type="button" className="playground-launch-btn prerequisite-launch-btn" onClick={onClick}>
    <svg className="prerequisite-electric" viewBox="0 0 240 48" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="prerequisite-electric-trail" d={outline} pathLength="100" vectorEffect="non-scaling-stroke" />
      <path className="prerequisite-electric-spark" d={outline} pathLength="100" vectorEffect="non-scaling-stroke" />
    </svg>
    <span aria-hidden="true">◎</span> Prerequisite map
  </button>;
}
