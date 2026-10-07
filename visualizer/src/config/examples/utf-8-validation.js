// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed valid byte lengths",
    "data": [
      65,
      194,
      162,
      226,
      130,
      172,
      240,
      159,
      146,
      169
    ]
  },
  {
    "label": "Missing continuation",
    "data": [
      226,
      130
    ]
  },
  {
    "label": "Unexpected continuation",
    "data": [
      128
    ]
  },
  {
    "label": "Bad continuation prefix",
    "data": [
      194,
      65
    ]
  },
  {
    "label": "ASCII only",
    "data": [
      72,
      101,
      108,
      112
    ]
  }
];
