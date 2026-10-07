// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different section costs compete for a shared arrow budget",
    "input": "{\"numArrows\":15,\"aliceArrows\":[0,1,2,0,3,1,0,2,1,0,2,3]}"
  },
  {
    "label": "One arrow can win the highest unguarded section",
    "input": "{\"numArrows\":1,\"aliceArrows\":[0,0,0,0,0,0,0,0,0,0,0,1]}"
  },
  {
    "label": "Equal defense costs favor the highest scoring sections",
    "input": "{\"numArrows\":12,\"aliceArrows\":[1,1,1,1,1,1,1,1,1,1,1,1]}"
  },
  {
    "label": "Alice places every arrow in the zero-point section",
    "input": "{\"numArrows\":8,\"aliceArrows\":[8,0,0,0,0,0,0,0,0,0,0,0]}"
  }
];
