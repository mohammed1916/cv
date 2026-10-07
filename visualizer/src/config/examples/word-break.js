// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping dictionary prefixes",
    "s": "rainbowraincloud",
    "dict": [
      "rain",
      "rainbow",
      "bow",
      "cloud",
      "raincloud"
    ],
    "input": "rainbowraincloud | rain, rainbow, bow, cloud, raincloud"
  },
  {
    "label": "Unsegmentable suffix",
    "s": "pineconex",
    "dict": [
      "pine",
      "cone",
      "pinecone"
    ],
    "input": "pineconex | pine, cone, pinecone"
  },
  {
    "label": "Reuse a word",
    "s": "mossmossmoss",
    "dict": [
      "moss",
      "mo",
      "ss"
    ],
    "input": "mossmossmoss | moss, mo, ss"
  },
  {
    "label": "Whole word",
    "s": "meadow",
    "dict": [
      "meadow"
    ],
    "input": "meadow | meadow"
  },
  {
    "label": "No initial match",
    "s": "river",
    "dict": [
      "lake",
      "stream"
    ],
    "input": "river | lake, stream"
  }
];
