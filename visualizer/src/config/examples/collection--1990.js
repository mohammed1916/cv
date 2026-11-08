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
  },
  {
    "label": "Single experiment",
    "input": "[[1,\"Web\",\"Reading\"]]"
  },
  {
    "label": "Same platform and name",
    "input": "[[5,\"IOS\",\"Sports\"],[6,\"IOS\",\"Sports\"],[7,\"IOS\",\"Sports\"]]"
  },
  {
    "label": "No experiments",
    "input": "[]"
  },
  {
    "label": "Long run: 60 experiments",
    "input": "[[100,\"Android\",\"Reading\"],[103,\"Web\",\"Reading\"],[106,\"Web\",\"Reading\"],[109,\"Web\",\"Sports\"],[112,\"Web\",\"Sports\"],[115,\"Web\",\"Reading\"],[118,\"IOS\",\"Sports\"],[121,\"Android\",\"Programming\"],[124,\"IOS\",\"Reading\"],[127,\"Web\",\"Programming\"],[130,\"IOS\",\"Programming\"],[133,\"Android\",\"Reading\"],[136,\"Web\",\"Reading\"],[139,\"Web\",\"Sports\"],[142,\"IOS\",\"Sports\"],[145,\"Android\",\"Programming\"],[148,\"Web\",\"Sports\"],[151,\"Web\",\"Programming\"],[154,\"Web\",\"Reading\"],[157,\"Android\",\"Programming\"],[160,\"Android\",\"Sports\"],[163,\"Android\",\"Sports\"],[166,\"IOS\",\"Sports\"],[169,\"Web\",\"Sports\"],[172,\"Web\",\"Reading\"],[175,\"Web\",\"Programming\"],[178,\"IOS\",\"Programming\"],[181,\"IOS\",\"Programming\"],[184,\"IOS\",\"Sports\"],[187,\"Android\",\"Sports\"],[190,\"Android\",\"Programming\"],[193,\"IOS\",\"Sports\"],[196,\"IOS\",\"Programming\"],[199,\"IOS\",\"Programming\"],[202,\"IOS\",\"Sports\"],[205,\"IOS\",\"Reading\"],[208,\"Web\",\"Reading\"],[211,\"IOS\",\"Reading\"],[214,\"Android\",\"Programming\"],[217,\"IOS\",\"Programming\"],[220,\"Web\",\"Sports\"],[223,\"IOS\",\"Programming\"],[226,\"Android\",\"Programming\"],[229,\"IOS\",\"Sports\"],[232,\"Web\",\"Sports\"],[235,\"IOS\",\"Reading\"],[238,\"Android\",\"Reading\"],[241,\"IOS\",\"Reading\"],[244,\"Web\",\"Reading\"],[247,\"Android\",\"Reading\"],[250,\"IOS\",\"Reading\"],[253,\"Web\",\"Sports\"],[256,\"Web\",\"Sports\"],[259,\"Web\",\"Reading\"],[262,\"IOS\",\"Programming\"],[265,\"Web\",\"Programming\"],[268,\"IOS\",\"Sports\"],[271,\"IOS\",\"Programming\"],[274,\"Android\",\"Sports\"],[277,\"IOS\",\"Sports\"]]"
  }
];
