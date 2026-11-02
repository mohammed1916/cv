import "./ChunkBandView.css";

const BANDS = ["c-a", "c-b", "c-c", "c-d", "c-e", "c-f"];

// The array as cells; each chunk gets a colour band and the piece being taken is outlined.
export default function ChunkBandView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="cb-view" aria-label="Chunk array">
        <p className="cb-empty">Press Play to cut the array into chunks.</p>
      </section>
    );
  }
  const { arr, size } = run.input;
  const chunkOf = (i) => Math.floor(i / size);
  const taking = step.start !== null && step.start !== undefined ? new Set(arr.slice(step.start, step.start + size).map((_, k) => step.start + k)) : new Set();
  return (
    <section className="cb-view" aria-label="Chunk array">
      <p className="cb-size">size {size}</p>
      {arr.length === 0 ? (
        <p className="cb-empty">The input is empty, so there is nothing to cut.</p>
      ) : (
        <ol className="cb-cells" aria-label="Array values by index">
          {arr.map((v, i) => (
            <li key={i} className={`cb-cell ${BANDS[chunkOf(i) % BANDS.length]}${taking.has(i) ? " cb-cell--taking" : ""}`}>
              <span className="cb-value">{v}</span>
              <span className="cb-index">{i}</span>
            </li>
          ))}
        </ol>
      )}
      <ol className="cb-chunks" aria-label="Chunks so far">
        {step.chunks.map((piece, k) => (
          <li key={k} className={`cb-chunk ${BANDS[k % BANDS.length]}`}>
            <span className="cb-chunk-label">chunk {k + 1}</span>
            <code>[{piece.join(", ")}]</code>
          </li>
        ))}
        {step.chunks.length === 0 && arr.length > 0 && <li className="cb-empty">no chunks yet</li>}
      </ol>
    </section>
  );
}
