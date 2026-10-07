// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Year and revenue filters both affect the result",
    "input": "{\"rows\":[{\"customer_id\":8,\"year\":2021,\"revenue\":340},{\"customer_id\":3,\"year\":2020,\"revenue\":900},{\"customer_id\":8,\"year\":2020,\"revenue\":-40},{\"customer_id\":17,\"year\":2021,\"revenue\":0},{\"customer_id\":21,\"year\":2021,\"revenue\":-120},{\"customer_id\":4,\"year\":2021,\"revenue\":75},{\"customer_id\":4,\"year\":2022,\"revenue\":800}]}"
  },
  {
    "label": "Zero is not positive",
    "input": "{\"rows\":[{\"customer_id\":1,\"year\":2021,\"revenue\":0},{\"customer_id\":2,\"year\":2021,\"revenue\":1}]}"
  },
  {
    "label": "Other years are excluded",
    "input": "{\"rows\":[{\"customer_id\":5,\"year\":2019,\"revenue\":500},{\"customer_id\":5,\"year\":2022,\"revenue\":700}]}"
  },
  {
    "label": "No customer records",
    "input": "{\"rows\":[]}"
  }
];
