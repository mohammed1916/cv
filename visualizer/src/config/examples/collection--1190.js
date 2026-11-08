// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested groups change traversal direction repeatedly",
    "input": "{\"s\":\"ab(cd(ef)gh)ij(kl)m\"}"
  },
  {
    "label": "No brackets",
    "input": "{\"s\":\"cedar\"}"
  },
  {
    "label": "Empty pair contributes nothing",
    "input": "{\"s\":\"ab()cd\"}"
  },
  {
    "label": "Deeply nested short text",
    "input": "{\"s\":\"(((moss)))\"}"
  },
  {
    "label": "One letter inside brackets",
    "input": "{\"s\":\"(a)\"}"
  },
  {
    "label": "Adjacent groups",
    "input": "{\"s\":\"(ab)(cd)\"}"
  },
  {
    "label": "Deep nesting, 40 levels",
    "input": "{\"s\":\"((((((((((((((((((((((((((((((((((((((((x))))))))))))))))))))))))))))))))))))))))\"}"
  },
  {
    "label": "Long run: about 300 characters",
    "input": "{\"s\":\"(()l)gad(()b)(()(pdx((((h(()um())l(()v)dd))sl))n((i(ntt))))gkf())()b()i(h)(kf(b))((uk)o()ww)(b())jks()(c(x()fuxzc)t(p))(()t)(()u(xl)cjb()gn)()(q(ld)h)((ja((r)mq((ydc(())(hcb)cqa)h)))())()(((()u(d(())gey(()l(zwmzk)ukc)(d()s((g())k)()s)h(y)()lh(((())q(b()()b()y())a()(()()()))f()t)eg))))ru()(())ti(u)e()\"}"
  }
];
