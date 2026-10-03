# Input and playback repairs

The Employee Free Time input existed in JSX, but the absolute inset dock could
cover it. Shared CSS now reserves a scrollable input region above the dock for
the 179 components found with direct inline inputs and a dock sibling.

Highest Answer Rate used unsupported Play/Pause props and passed a DOM event
to its speed state setter. Its accepted-answer preset field also did not match
the aggregation schema. These are repaired.

The wider scan found two more split-handler consumers, two other unsupported
Play contracts, four nonexistent playback setters, 38 older components with
unconnected speed controls, and five missing Reset handlers. The affected
consumers now use the hook's actual actions and speed state. Shared controls
also accept separate Play and Pause callbacks.

Run `npm run test:interactions` to scan JSX control contracts and playback-hook
destructuring. It also invokes the actual shared component's rendered Play,
Pause, and Replay button callbacks. The complete path inventory is in
`interaction-contract-audit.json` (1,447 JSX files, 615 control instances).

This is a source-contract audit and component callback test, not an end-to-end
browser test. It cannot prove layout visibility, timer progression, or the
correctness of every algorithm and every input. No browser was available for
this repair session. The production build and authored-example tests pass.
