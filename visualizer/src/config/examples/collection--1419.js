// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved starts require several frogs at once",
    "input": "{\"croakOfFrogs\":\"ccrrooaakkcroakccrrooaakk\"}"
  },
  {
    "label": "One frog can repeat sequentially",
    "input": "{\"croakOfFrogs\":\"croakcroakcroak\"}"
  },
  {
    "label": "A sound arrives before its predecessor",
    "input": "{\"croakOfFrogs\":\"crkoak\"}"
  },
  {
    "label": "An unfinished frog remains",
    "input": "{\"croakOfFrogs\":\"croakcroa\"}"
  }
];
