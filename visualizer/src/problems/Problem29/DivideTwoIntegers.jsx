import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import { AccumulationLane } from '../../components/shared/LookupAccumulator';
import { buildDivision, code, linePatterns } from './algorithm';
import './DivideTwoIntegers.css';

const examples = [
  { label: '10 / 3', values: { dividend: '10', divisor: '3' } },
  { label: '43 / 5', values: { dividend: '43', divisor: '5' } },
  { label: '7 / -3', values: { dividend: '7', divisor: '-3' } },
  { label: 'Smaller dividend', values: { dividend: '2', divisor: '5' } },
  { label: 'Zero', values: { dividend: '0', divisor: '3' } },
  { label: 'Overflow', values: { dividend: '-2147483648', divisor: '-1' } },
];
const definition = {
  title: 'Divide by doubling and subtracting', code, linePatterns,
  patterns: ['init', 'check', 'build', 'subtract', 'add', 'done'],
  fields: [{ key: 'dividend', label: 'Dividend', type: 'string' }, { key: 'divisor', label: 'Divisor (nonzero)', type: 'string' }],
  initialValues: examples[0].values, examples, build: buildDivision,
  renderStory({ story, step }) {
    const bits = step.quotient.toString(2).padStart(32, '0');
    return <div className="division-story">
      <section className="division-card"><h3>{story.input.dividend} ÷ {story.input.divisor}</h3>
        <div className="division-stats"><div><span>Remaining magnitude</span><strong>{step.remaining}</strong></div><div><span>Quotient magnitude</span><strong>{step.quotient}</strong></div><div><span>Signed result</span><strong>{step.result ?? 'Pending'}</strong></div></div>
        <p>{step.message}</p>
      </section>
      <section className="division-card"><h3>Carve chunks out of |dividend| = {story.total}</h3>
        <div className="division-tape" aria-label="Subtracted chunks and remaining magnitude">
          {step.taken.map((item, index) => <div key={index} className="division-taken" style={{ flexGrow: item.chunk }} title={`${item.count} copies: ${item.chunk}`}><span>{item.chunk}</span></div>)}
          {step.remaining > 0 && <div className="division-remaining" style={{ flexGrow: step.remaining }}><span>{step.remaining}</span></div>}
          {story.total === 0 && <span>Empty: nothing to divide</span>}
        </div>
        <p>Filled segments have been subtracted. The outlined segment remains.</p>
      </section>
      {step.chunk > 0 && <section className="division-card"><h3>Find the largest fitting power-of-two chunk</h3>
        <div className="division-stats"><div><span>chunk</span><strong>{step.chunk}</strong></div><div><span>count</span><strong>{step.count}</strong></div></div>
        <code>chunk &lt;&lt; 1 = {step.chunk + step.chunk}</code>
        <div className="division-fit"><i style={{ width: `${Math.min(100, step.chunk / Math.max(1, step.remaining) * 100)}%` }} /></div>
        <p>{[8, 9, 10, 11].includes(step.activeLine) ? `${step.chunk + step.chunk} <= ${step.remaining}: ${step.chunk + step.chunk <= step.remaining ? 'double again' : 'stop doubling and subtract this chunk'}` : 'Chunk committed; continue with the remaining magnitude.'}</p>
      </section>}
      <section className="division-card"><h3>Quotient bits: each accepted count adds a power of two</h3>
        <div className="division-bits">{[...bits].map((bit, index) => <div key={index} data-set={bit === '1'}><small>{31 - index}</small><strong>{bit}</strong></div>)}</div>
      </section>
      <AccumulationLane title="Counts added to the quotient" terms={step.taken.slice(0, step.activeLine === 12 ? -1 : undefined).map(item => ({ label: `chunk ${item.chunk}`, value: item.count }))} result={step.quotient} />
    </div>;
  },
};

export default function DivideTwoIntegers() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
