// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Consonants split multiple vowel-only regions",
    "input": "{\"word\":\"aaeiouueixouaieaao\"}"
  },
  {
    "label": "A missing vowel prevents every match",
    "input": "{\"word\":\"aaeeiioo\"}"
  },
  {
    "label": "Exactly one complete vowel window",
    "input": "{\"word\":\"uoiea\"}"
  },
  {
    "label": "Repeated vowels create many start choices",
    "input": "{\"word\":\"aaeeiioouu\"}"
  }
];
