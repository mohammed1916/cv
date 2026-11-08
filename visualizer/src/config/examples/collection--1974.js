// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated wraparound and long jumps",
    "input": "{\"word\":\"zebrazigzagmoon\"}"
  },
  {
    "label": "Repeated letters need only keypresses",
    "input": "{\"word\":\"aaaaaa\"}"
  },
  {
    "label": "A wraparound step is shorter",
    "input": "{\"word\":\"za\"}"
  },
  {
    "label": "Opposite alphabet positions tie",
    "input": "{\"word\":\"nan\"}"
  },
  {
    "label": "Single letter",
    "input": "a"
  },
  {
    "label": "Two equal letters",
    "input": "bb"
  },
  {
    "label": "Thirty copies of z",
    "input": "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"
  },
  {
    "label": "Long run: 30 letters",
    "input": "eepdzosojjqmjytsvrldfwfcttweod"
  }
];
