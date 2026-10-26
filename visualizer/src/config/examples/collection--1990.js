// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Some platform categories repeat while others stay empty",
    "input": "{\"experiments\":[{\"experiment_id\":101,\"platform\":\"Web\",\"experiment_name\":\"Sports\"},{\"experiment_id\":102,\"platform\":\"Android\",\"experiment_name\":\"Programming\"},{\"experiment_id\":103,\"platform\":\"IOS\",\"experiment_name\":\"Reading\"},{\"experiment_id\":104,\"platform\":\"Web\",\"experiment_name\":\"Sports\"},{\"experiment_id\":105,\"platform\":\"IOS\",\"experiment_name\":\"Sports\"},{\"experiment_id\":106,\"platform\":\"Android\",\"experiment_name\":\"Programming\"},{\"experiment_id\":107,\"platform\":\"Web\",\"experiment_name\":\"Reading\"},{\"experiment_id\":108,\"platform\":\"Web\",\"experiment_name\":\"Sports\"}]}"
  },
  {
    "label": "Empty input still returns nine zero counts",
    "input": "{\"experiments\":[]}"
  },
  {
    "label": "All experiments belong to one category",
    "input": "{\"experiments\":[{\"experiment_id\":21,\"platform\":\"IOS\",\"experiment_name\":\"Programming\"},{\"experiment_id\":22,\"platform\":\"IOS\",\"experiment_name\":\"Programming\"},{\"experiment_id\":23,\"platform\":\"IOS\",\"experiment_name\":\"Programming\"}]}"
  },
  {
    "label": "Every category occurs exactly once",
    "input": "{\"experiments\":[{\"experiment_id\":300,\"platform\":\"Android\",\"experiment_name\":\"Reading\"},{\"experiment_id\":301,\"platform\":\"Android\",\"experiment_name\":\"Sports\"},{\"experiment_id\":302,\"platform\":\"Android\",\"experiment_name\":\"Programming\"},{\"experiment_id\":303,\"platform\":\"IOS\",\"experiment_name\":\"Reading\"},{\"experiment_id\":304,\"platform\":\"IOS\",\"experiment_name\":\"Sports\"},{\"experiment_id\":305,\"platform\":\"IOS\",\"experiment_name\":\"Programming\"},{\"experiment_id\":306,\"platform\":\"Web\",\"experiment_name\":\"Reading\"},{\"experiment_id\":307,\"platform\":\"Web\",\"experiment_name\":\"Sports\"},{\"experiment_id\":308,\"platform\":\"Web\",\"experiment_name\":\"Programming\"}]}"
  }
];
