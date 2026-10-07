// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Taggers and people alternate with uneven gaps",
    "input": "{\"team\":[1,1,0,0,0,1,0,1,1,0,0,1],\"dist\":2}"
  },
  {
    "label": "Earlier unreachable people must be skipped",
    "input": "{\"team\":[0,0,0,0,1,1],\"dist\":1}"
  },
  {
    "label": "No tagger is present",
    "input": "{\"team\":[0,0,0,0],\"dist\":2}"
  },
  {
    "label": "One tagger can catch only one person",
    "input": "{\"team\":[0,0,1,0,0],\"dist\":4}"
  }
];
