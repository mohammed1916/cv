# Tutorial mode

Read [Directed tutorials and Claude handoff](DIRECTED-TUTORIAL-HANDOFF.md) for the current contract and implementation.

Tutorials now present one scene at a time:

- Step-by-step: Code → Effect.
- Reason-first: Why → Code → Effect.
- Off: full movable-panel workspace.

Implemented in Problem 1606 (both approaches) and Problem 100. Input and Story are dock panels with footer visibility controls. Each presentation scene points to an immutable solver frame; the tutorial is not a second algorithm and does not fabricate state transitions.
