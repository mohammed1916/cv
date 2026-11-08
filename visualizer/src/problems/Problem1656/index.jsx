import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1656',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and inserts (JSON)',
  url: 'https://leetcode.com/problems/design-an-ordered-stream/',
  complexity: 'O(n) total time across all insertions: the pointer only moves forward, and each slot is released once.',
  examples: [
    { label: 'Scrambled arrivals', input: '{"n":4,"inserts":[[2,"m"],[4,"p"],[1,"k"],[3,"x"]]}' },
    { label: 'Exact order', input: '{"n":3,"inserts":[[3,"q"],[1,"o"],[2,"r"]]}' },
    { label: 'First slot late', input: '{"n":4,"inserts":[[4,"d"],[3,"c"],[1,"a"],[2,"b"]]}' },
    { label: 'One slot', input: '{"n":1,"inserts":[[1,"a"]]}' },
    { label: 'Equal values', input: '{"n":3,"inserts":[[2,"ab"],[1,"ab"],[3,"ab"]]}' },
    { label: 'No inserts', input: '{"n":2,"inserts":[]}' },
    { label: 'Largest n: 50 inserts', input: '{"n":50,"inserts":[[23,"ub"],[18,"lgqaq"],[9,"mfi"],[24,"u"],[3,"efk"],[36,"se"],[48,"sb"],[31,"sk"],[11,"eai"],[37,"ok"],[4,"ixvc"],[39,"bj"],[50,"yce"],[19,"pezr"],[35,"jb"],[13,"wsuy"],[1,"vxqil"],[30,"kqank"],[20,"cgrfv"],[33,"yjpu"],[43,"cmeo"],[29,"rxo"],[32,"grqc"],[2,"rsmkq"],[5,"xmwb"],[15,"mompq"],[41,"jtjg"],[12,"rit"],[10,"hh"],[44,"at"],[34,"ak"],[40,"vbl"],[46,"lx"],[21,"bte"],[22,"gshx"],[42,"qjh"],[17,"louup"],[25,"klw"],[6,"yf"],[47,"lhwyf"],[38,"so"],[27,"gunid"],[45,"lwx"],[49,"sfdqg"],[26,"cz"],[14,"z"],[16,"e"],[8,"enghm"],[7,"w"],[28,"b"]]}' },
    { label: 'Long run: 30 of 50 slots', input: '{"n":50,"inserts":[[23,"v"],[18,"sqw"],[9,"mdgmj"],[24,"u"],[3,"ujsk"],[36,"xi"],[48,"ufvy"],[31,"m"],[11,"wcfp"],[37,"zoi"],[4,"ndcl"],[39,"pbwi"],[50,"wjy"],[19,"o"],[35,"l"],[13,"ztf"],[1,"px"],[30,"fzyfy"],[20,"b"],[33,"rgmv"],[43,"nz"],[29,"z"],[32,"tr"],[2,"z"],[5,"ojqg"],[15,"q"],[41,"bvr"],[12,"fqmdc"],[10,"rv"],[44,"nzlg"]]}' },
  ],
}

export default function DesignOrderedStream() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, slots, pointer, key, value, chunk, output } = step.snapshot
    return <>
      <div role="img" aria-label="Stream slots" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: n }, (_, i) => {
          const id = i + 1
          const filled = slots[i] !== null
          return <div key={id} data-slot={id} style={{
            minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${id === pointer ? 2 : 1}px solid ${id === key ? 'var(--text)' : 'var(--border)'}`,
            background: chunk?.includes(slots[i]) && filled ? 'color-mix(in srgb, var(--success) 30%, transparent)' : filled ? 'var(--surface2)' : 'transparent',
            color: 'var(--text)',
          }}><div style={{ minHeight: 16, fontSize: 11, fontWeight: 700 }}>{id === pointer ? 'ptr' : ''}</div><div>{filled ? slots[i] : '·'}</div><small>id {id}</small></div>
        })}
      </div>
      <p>{key === null ? 'Waiting for the first insertion.' : `Inserted ${value} at id ${key}. Pointer waits at id ${pointer}.`}</p>
      <p style={{ color: 'var(--text)' }}>Released chunks: {output.length ? output.map(c => `[${c.join(', ')}]`).join(' ') : 'none yet'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Store by id:</strong> a value waits in its own slot until every earlier id has been released.</p>
    <p><strong>Release a run:</strong> after each insertion, the pointer moves forward only while the next slot is filled.</p>
  </>} />
}
