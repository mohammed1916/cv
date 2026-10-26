// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several near matches precede the first palindrome",
    "input": "{\"words\":[\"garden\",\"harbor\",\"abccbaq\",\"rotator\",\"refer\",\"level\"]}"
  },
  {
    "label": "A one-letter first word qualifies immediately",
    "input": "{\"words\":[\"z\",\"civic\",\"boat\"]}"
  },
  {
    "label": "No word is palindromic",
    "input": "{\"words\":[\"planet\",\"forest\",\"stream\",\"cloud\"]}"
  },
  {
    "label": "Even-length symmetry is checked pair by pair",
    "input": "{\"words\":[\"ripple\",\"noon\",\"deed\"]}"
  }
];
