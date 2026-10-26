// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Allowed repetitions and one-letter violations",
    "input": "{\"allowed\":\"acerst\",\"words\":[\"cater\",\"trace\",\"trees\",\"star\",\"crate\",\"scar\",\"sear\",\"cedar\",\"rest\",\"reed\"]}"
  },
  {
    "label": "One allowed letter",
    "input": "{\"allowed\":\"q\",\"words\":[\"q\",\"qqq\",\"qa\",\"a\"]}"
  },
  {
    "label": "All words violate the set",
    "input": "{\"allowed\":\"ab\",\"words\":[\"cd\",\"ef\",\"gh\"]}"
  },
  {
    "label": "Every word qualifies",
    "input": "{\"allowed\":\"mos\",\"words\":[\"moss\"]}"
  }
];
