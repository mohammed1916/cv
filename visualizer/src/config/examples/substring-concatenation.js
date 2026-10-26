// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping token windows",
    "s": "redbluredredbluredblu",
    "words": [
      "red",
      "blu",
      "red"
    ]
  },
  {
    "label": "Adjacent valid windows",
    "s": "sunmoosunmoo",
    "words": [
      "sun",
      "moo"
    ]
  },
  {
    "label": "Repeated token needed",
    "s": "catdogcatcatdog",
    "words": [
      "cat",
      "cat",
      "dog"
    ]
  },
  {
    "label": "Missing token",
    "s": "redredred",
    "words": [
      "red",
      "sun"
    ]
  }
];
