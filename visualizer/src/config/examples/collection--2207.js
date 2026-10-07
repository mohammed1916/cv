// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both insertion choices compete in a longer text",
    "input": "{\"text\":\"abxbacbbaacbbac\",\"pattern\":\"ab\"}"
  },
  {
    "label": "Equal pattern letters require distinct source positions",
    "input": "{\"text\":\"aaaaa\",\"pattern\":\"aa\"}"
  },
  {
    "label": "No pattern characters means one insertion still cannot form a pair",
    "input": "{\"text\":\"xyzxyz\",\"pattern\":\"ab\"}"
  },
  {
    "label": "Only first-pattern letters favor insertion at the end",
    "input": "{\"text\":\"aaaaaa\",\"pattern\":\"ab\"}"
  }
];
