// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shared buckets and adjacent hamsters require different choices",
    "input": "{\"hamsters\":\"H.H..HH...H.H.\"}"
  },
  {
    "label": "An interior hamster trapped by neighbors is impossible",
    "input": "{\"hamsters\":\".HHH.\"}"
  },
  {
    "label": "A final hamster must use its left neighbor",
    "input": "{\"hamsters\":\".H\"}"
  },
  {
    "label": "No hamster needs a bucket",
    "input": "{\"hamsters\":\".......\"}"
  }
];
