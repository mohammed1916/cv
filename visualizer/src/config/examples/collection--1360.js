// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Cross several month boundaries including leap February",
    "input": "{\"date1\":\"2028-01-17\",\"date2\":\"2028-04-09\"}"
  },
  {
    "label": "Identical dates",
    "input": "{\"date1\":\"2031-08-12\",\"date2\":\"2031-08-12\"}"
  },
  {
    "label": "Reverse date order",
    "input": "{\"date1\":\"2027-09-03\",\"date2\":\"2027-07-19\"}"
  },
  {
    "label": "Non-leap century boundary",
    "input": "{\"date1\":\"2100-02-28\",\"date2\":\"2100-03-01\"}"
  }
];
