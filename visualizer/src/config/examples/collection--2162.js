// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two displays reach the same duration with different button paths",
    "input": "{\"startAt\":7,\"moveCost\":6,\"pushCost\":2,\"targetSeconds\":95}"
  },
  {
    "label": "A seconds-only display avoids leading zero presses",
    "input": "{\"startAt\":8,\"moveCost\":5,\"pushCost\":3,\"targetSeconds\":8}"
  },
  {
    "label": "Repeated digits can avoid several finger movements",
    "input": "{\"startAt\":1,\"moveCost\":9,\"pushCost\":1,\"targetSeconds\":71}"
  },
  {
    "label": "Maximum supported display uses both 99 fields",
    "input": "{\"startAt\":9,\"moveCost\":4,\"pushCost\":2,\"targetSeconds\":6039}"
  }
];
