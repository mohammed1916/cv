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
  },
  {
    "label": "Smallest segmentable",
    "s": "a",
    "dict": [
      "a"
    ],
    "input": "a | a"
  },
  {
    "label": "Repeated short word",
    "s": "aaaa",
    "dict": [
      "a",
      "aa"
    ],
    "input": "aaaa | a, aa"
  },
  {
    "label": "Boundary length 50",
    "s": "ababababababababababababababababababababababababab",
    "dict": [
      "ab",
      "a"
    ],
    "input": "ababababababababababababababababababababababababab | ab, a"
  },
  {
    "label": "Long run: 50 letters",
    "s": "abcabcababbcababcabbabcbcababccaabababcababcabcaba",
    "dict": [
      "ab",
      "abc",
      "ca",
      "b"
    ],
    "input": "abcabcababbcababcabbabcbcababccaabababcababcabcaba | ab, abc, ca, b"
  }
];
