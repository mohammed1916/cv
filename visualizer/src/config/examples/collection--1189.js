// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated target letters mixed with unrelated text",
    "input": "{\"text\":\"ballooncedarballoonmossballoon\"}"
  },
  {
    "label": "Missing a required letter",
    "input": "{\"text\":\"ballllllooooo\"}"
  },
  {
    "label": "Only one pair of l letters limits production",
    "input": "{\"text\":\"bbaallooooonn\"}"
  },
  {
    "label": "Unrelated characters",
    "input": "{\"text\":\"cedar\"}"
  }
];
