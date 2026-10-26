// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Middle users can follow several accounts and have their own audiences",
    "input": "{\"follow\":[{\"followee\":\"Ada\",\"follower\":\"Bex\"},{\"followee\":\"Ada\",\"follower\":\"Cy\"},{\"followee\":\"Bex\",\"follower\":\"Dee\"},{\"followee\":\"Bex\",\"follower\":\"Eli\"},{\"followee\":\"Cy\",\"follower\":\"Fay\"},{\"followee\":\"Dee\",\"follower\":\"Gia\"},{\"followee\":\"Ada\",\"follower\":\"Dee\"}]}"
  },
  {
    "label": "A simple chain has one second-degree user",
    "input": "{\"follow\":[{\"followee\":\"Oak\",\"follower\":\"Pine\"},{\"followee\":\"Pine\",\"follower\":\"Reed\"}]}"
  },
  {
    "label": "A star has no user in both roles",
    "input": "{\"follow\":[{\"followee\":\"Sun\",\"follower\":\"Moon\"},{\"followee\":\"Sun\",\"follower\":\"Star\"},{\"followee\":\"Sun\",\"follower\":\"Cloud\"}]}"
  },
  {
    "label": "Mutual followers both satisfy the role condition",
    "input": "{\"follow\":[{\"followee\":\"Lia\",\"follower\":\"Moe\"},{\"followee\":\"Moe\",\"follower\":\"Lia\"}]}"
  }
];
