// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated leads and partners belong to separate date/make groups",
    "input": "{\"rows\":[{\"date_id\":\"2021-04-08\",\"make_name\":\"cedar\",\"lead_id\":7,\"partner_id\":40},{\"date_id\":\"2021-04-08\",\"make_name\":\"cedar\",\"lead_id\":7,\"partner_id\":41},{\"date_id\":\"2021-04-08\",\"make_name\":\"cedar\",\"lead_id\":8,\"partner_id\":40},{\"date_id\":\"2021-04-08\",\"make_name\":\"birch\",\"lead_id\":7,\"partner_id\":40},{\"date_id\":\"2021-04-09\",\"make_name\":\"cedar\",\"lead_id\":7,\"partner_id\":40},{\"date_id\":\"2021-04-09\",\"make_name\":\"cedar\",\"lead_id\":9,\"partner_id\":42}]}"
  },
  {
    "label": "Duplicate rows do not inflate distinct counts",
    "input": "{\"rows\":[{\"date_id\":\"2020-02-29\",\"make_name\":\"elm\",\"lead_id\":3,\"partner_id\":5},{\"date_id\":\"2020-02-29\",\"make_name\":\"elm\",\"lead_id\":3,\"partner_id\":5}]}"
  },
  {
    "label": "One partner with several leads",
    "input": "{\"rows\":[{\"date_id\":\"2022-06-01\",\"make_name\":\"fir\",\"lead_id\":1,\"partner_id\":8},{\"date_id\":\"2022-06-01\",\"make_name\":\"fir\",\"lead_id\":2,\"partner_id\":8}]}"
  },
  {
    "label": "Empty sales table",
    "input": "{\"rows\":[]}"
  }
];
