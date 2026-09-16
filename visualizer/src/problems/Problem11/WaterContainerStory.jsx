import SvgViewport from '../../components/shared/SvgViewport';
import StoryPanel from '../../components/shared/StoryPanel';

export default function WaterContainerStory({ heights, step }) {
  const best = step?.phase === 'done';
  const [left, right] = best ? step.bestPair : [step?.left ?? 0, step?.right ?? heights.length - 1];
  const ceiling = Math.max(1, ...heights), water = Math.min(heights[left], heights[right]);
  const x = index => 40 + index * 44, y = value => 220 - value / ceiling * 160;
  return <StoryPanel className="water-story" label="Water bounded by the shorter wall" title={best ? 'The winning container' : 'The shorter wall sets the water level'}>
    <p>Width {right-left} × limiting height {water} = {(right-left)*water} area.</p>
    <SvgViewport width={Math.max(320, heights.length * 44 + 40)} height={280}>
      <title>Container cross-section</title>
      <rect x={x(left)} y={y(water)} width={Math.max(0,x(right)-x(left))} height={220-y(water)} fill="var(--primary)" opacity="0.18" />
      <line x1={x(left)} x2={x(right)} y1={y(water)} y2={y(water)} stroke="var(--primary)" strokeWidth="2" strokeDasharray="5 4" />
      {heights.map((h,i)=><g key={i}>
        <line x1={x(i)} x2={x(i)} y1={220} y2={y(h)} stroke={i===left || i===right ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={i===left || i===right ? 7 : 3} />
        <text x={x(i)} y={y(h)-10} textAnchor="middle" fill="var(--text)" fontSize="12">{h}</text>
        <text x={x(i)} y="244" textAnchor="middle" fill="var(--text-muted)" fontSize="11">{i}{i===left?' L':i===right?' R':''}</text>
      </g>)}
    </SvgViewport>
    <p>{best ? `Best pair: indices ${left} and ${right}.` : 'Keeping the shorter wall while moving the taller one only reduces width; the water level cannot rise. Discard the shorter wall and search inward.'}</p>
  </StoryPanel>;
}
