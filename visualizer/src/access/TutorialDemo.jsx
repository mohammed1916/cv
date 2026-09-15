import { useEffect, useState } from 'react';
import './TutorialDemo.css';

const demos = [
  [
    ['Choose Two Sum from the problem list.', 140, 87],
    ['Click Two Sum to open its workspace.', 140, 87],
    ['Read the input: target 9, array [2, 7, 11, 15].', 81, 148],
    ['Indices 0 and 1 give 2 + 7 = 9.', 154, 148],
  ],
  [
    ['Click Play to follow execution.', 113, 245],
    ['The array and highlighted code advance together.', 113, 245],
    ['Click Pause to inspect the current state.', 113, 245],
    ['Click Next to advance one step.', 217, 245],
  ],
  [
    ['Grab the Code trace panel tab.', 459, 87],
    ['Hold and drag the tab toward the left panel’s edge.', 325, 110],
    ['The highlighted edge previews the new panel position.', 74, 140],
    ['Release to dock Code trace on the left.', 74, 140],
  ],
  [
    ['At index 0, remember value 2 and its index.', 81, 149],
    ['Predict: what does 7 need to reach target 9?', 154, 149],
    ['Click Next to check your prediction.', 217, 245],
    ['9 − 7 = 2. The stored index gives answer [0, 1].', 154, 149],
  ],
  [
    ['Start with a Python sample in Code Playground.', 155, 110],
    ['Click Run to create a trace.', 510, 87],
    ['Inspect the highlighted line and its output.', 425, 152],
    ['Change the input, then run again to compare.', 179, 152],
  ],
];

function Box({ x, y, width, height, children, active = false }) {
  return <g><rect x={x} y={y} width={width} height={height} rx="8" fill={active ? '#312e81' : '#172033'} stroke={active ? '#a5b4fc' : '#475569'} />{children}</g>;
}

export default function TutorialDemo({ lesson }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame(value => (value + 1) % 4), 1900);
    return () => window.clearInterval(timer);
  }, [playing]);
  const [caption, x, y] = demos[lesson][frame];
  const found = (lesson === 0 || lesson === 3) && frame === 3;
  const progressed = lesson === 1 && frame > 0 || lesson === 3 && frame > 0;
  const docked = lesson === 2 && frame === 3;
  const click = lesson !== 2 && (frame === 1 || frame === 3);
  return <figure className="tutorial-demo">
    <div className="tutorial-demo-toolbar"><span>CURSOR WALKTHROUGH · {frame + 1} / 4</span><div>
      <button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause tutorial animation' : 'Play tutorial animation'}>{playing ? 'Pause demo' : 'Play demo'}</button>
      <button type="button" onClick={() => setFrame(value => (value + 1) % 4)}>Next frame</button>
      <button type="button" onClick={() => setFrame(0)}>Replay</button>
    </div></div>
    <svg viewBox="0 0 640 290" fontSize="14" role="img" aria-label={caption}>
      <rect width="640" height="290" rx="12" fill="#0b1220" />
      <text x="24" y="30" fill="#cbd5e1" fontSize="14">{lesson === 4 ? 'Code Playground · Python' : 'Two Sum · example workspace'}</text>
      {lesson === 0 && frame < 2 ? <>
        <text x="36" y="62">Choose a problem</text>
        <Box x={30} y={70} width={580} height={42} active={frame === 1}><text x="48" y="96">1. Two Sum →</text></Box>
        <Box x={30} y={124} width={580} height={42}><text x="48" y="150">2. Add Two Numbers</text></Box>
      </> : lesson === 4 ? <>
        <Box x={24} y={64} width={340} height={198}><text x="40" y="89">Source · Python</text>
          <rect x="35" y={frame === 2 ? 164 : 100} width="316" height="25" rx="4" fill="#312e81" />
          <text x="42" y="119">{frame === 3 ? 'nums = [3, 6, 11, 15]' : 'nums = [2, 7, 11, 15]'}</text>
          <text x="42" y="151">target = 9</text><text x="42" y="182">print(nums[0] + nums[1])</text>
        </Box>
        <Box x={390} y={64} width={226} height={198}><text x="407" y="119">Trace / output</text><text x="407" y="158">{frame >= 2 ? '9' : 'Run to inspect →'}</text></Box>
        <Box x={476} y={70} width={112} height={28} active={frame === 1}><text x="502" y="89">▶ Run</text></Box>
      </> : <>
        <g transform={docked ? 'translate(248 0)' : undefined}>
          <Box x={24} y={64} width={344} height={146}><text x="40" y="88">Array &amp; Target · 9</text>
            {[2, 7, 11, 15].map((value, index) => <g key={value}>
              <rect x={53 + index * 73} y="116" width="57" height="48" rx="8" fill={found && index < 2 ? '#166534' : index === (progressed ? 1 : 0) ? '#4338ca' : '#263449'} stroke="#94a3b8" />
              <text x={81 + index * 73} y="146" textAnchor="middle" fontSize="20">{value}</text><text x={81 + index * 73} y="181" textAnchor="middle" fontSize="11">index {index}</text>
            </g>)}
            <text x="40" y="201" fontSize="12">{found ? 'Found: indices [0, 1]' : progressed ? 'Seen: 2 → index 0 · need 2' : 'Scan the array from left to right'}</text>
          </Box>
        </g>
        <g transform={docked ? 'translate(-368 0)' : undefined}>
          <Box x={392} y={64} width={224} height={146}><text x="406" y="88">⠿ Code trace</text>
            <rect x="400" y={progressed ? 144 : 113} width="208" height="25" rx="4" fill="#312e81" />
            <text x="409" y="131" fontSize="12">need = target − value</text><text x="409" y="161" fontSize="12">if need in seen:</text><text x="421" y="190" fontSize="12">return [seen[need], i]</text>
          </Box>
        </g>
        {lesson === 2 && frame > 0 && frame < 3 && <>
          <rect x="27" y="101" width="60" height="103" rx="6" fill="#818cf855" stroke="#a5b4fc" strokeDasharray="5 4" />
          <g transform={`translate(${x - 45} ${y - 18})`}><rect width="120" height="28" rx="6" fill="#4338ca" /><text x="8" y="19" fontSize="12">⠿ Code trace</text></g>
        </>}
        <Box x={24} y={224} width={592} height={42}>
          <text x="40" y="250" fontSize="13">↺</text><text x="81" y="250" fontSize="13">{lesson === 1 && frame === 1 ? 'Ⅱ Pause' : '▶ Play'}</text><text x="186" y="250" fontSize="13">Next →</text><text x="294" y="250" fontSize="13">Speed ━━━●━━</text><text x="513" y="250" fontSize="13">Float ↗</text>
        </Box>
      </>}
      <g className="tutorial-demo-cursor" style={{ transform: `translate(${x}px, ${y}px)` }}>
        {click && <circle key={`${lesson}-${frame}`} className="tutorial-demo-click" r="17" fill="#c7d2fe33" stroke="#c7d2fe" strokeWidth="2" />}
        <path d="M0 0 L0 24 L6 18 L12 30 L17 27 L11 16 L21 16 Z" fill="white" stroke="#0f172a" strokeWidth="2" />
      </g>
    </svg>
    <figcaption>{caption}</figcaption>
  </figure>;
}
