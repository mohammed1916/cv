import SvgViewport from './SvgViewport';
import styles from './SearchStructures.module.css';

export default function HistogramBars({ heights, step }) {
  const unit = 44, baseline = 220, scale = 175 / Math.max(1, ...heights), rect = step?.rect;
  return <figure className={styles.histogram}>
    <figcaption>Histogram · current bar {step?.i >= 0 ? step.i : 'not started'}</figcaption>
    <SvgViewport width={Math.max(320, heights.length * unit + 48)} height={280}>
      <title>Histogram heights and the rectangle currently being evaluated</title>
      {heights.map((value, i) => <g key={i} data-active={i === step?.i}>
        <rect x={24 + i * unit} y={baseline - value * scale} width={unit - 1} height={Math.max(1, value * scale)} className={styles.bar} />
        <text x={24 + i * unit + unit / 2} y={baseline - value * scale - 8} textAnchor="middle" className={styles.text}>{value}</text>
        <text x={24 + i * unit + unit / 2} y={baseline + 20} textAnchor="middle" className={styles.text}>[{i}]</text>
      </g>)}
      {rect && <rect x={24 + rect.start * unit} y={baseline - rect.height * scale} width={(rect.end - rect.start + 1) * unit} height={Math.max(1, rect.height * scale)} className={styles.rectangle} />}
      {!heights.length && <text x={24} y={60} className={styles.text}>Empty histogram · area 0</text>}
    </SvgViewport>
    {rect && <p>Rectangle [{rect.start}, {rect.end}]: height {rect.height} × width {rect.end - rect.start + 1} = {rect.height * (rect.end - rect.start + 1)}.</p>}
  </figure>;
}
