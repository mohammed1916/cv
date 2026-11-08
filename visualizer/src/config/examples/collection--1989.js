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
  },
  {
    "label": "Single person, distance one",
    "input": "{\"team\":[1],\"dist\":1}"
  },
  {
    "label": "All members are it",
    "input": "{\"team\":[1,1,1,1],\"dist\":1}"
  },
  {
    "label": "Distance longer than the line",
    "input": "{\"team\":[0,1,0],\"dist\":30}"
  },
  {
    "label": "Long run: 30 people",
    "input": "{\"team\":[1,1,1,1,0,0,1,1,1,1,1,0,0,0,1,0,1,0,0,1,1,1,1,0,0,1,1,1,0,0],\"dist\":5}"
  }
];
