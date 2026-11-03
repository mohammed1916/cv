# Claude requirement questions

Follow-up: [answers and continuation](CLAUDE-ANSWERS.md) address the 19 specific questions below. The original questions are retained for traceability. The 326 category-based rows remain a review queue; they are not all confirmed missing requirements.

Statement gaps that block requirement completion. Each row names the exact missing information. Checked columns: `raw` is the recovered archive in `local-reference/leetcode/raw/`; `manual` is the numbered draft in `local-reference/leetcode/manual/`; `req` is the requirement note in `docs/requirements/`. No tests, browser checks, visualization changes or cleanup are included.

## 1. Missing or incomplete problem statement

| ID | Title | Requirement file | Missing information or question | Checked raw | Checked manual | Checked requirements |
|---|---|---|---|---|---|---|
| 3269 | Constructing Two Increasing Arrays | `docs/requirements/3269.json` | Confirm the full statement: the note is not complete and the minimum-maximum assignment rule has no verified example. | no (not in archive) | yes | note (public-community-reference) |
| 3565 | Sequential Grid Path Cover | `docs/requirements/3565.json` | Confirm the grid constraints and when a cover is impossible; the draft gives neither. | no (not in archive) | yes | note (public-community-reference) |
| 3595 | Once Twice | `docs/requirements/3595.json (none)` | Confirm whether the O(1)-extra-space requirement is part of the official rules, and the exact construction rule. | no (not in archive) | yes | no note |
| 3949 | Subtree Inversion Sum II | `docs/requirements/3949.json` | Confirm the input format (tree shape) and the k rule; the draft gives no input format and leaves the k rule and value bounds unsettled. | no (not in archive) | yes | note (public-community-reference) |
| 2647 | Color the Triangle Red | `docs/requirements/2647.json (none)` | Confirm the exact minimality rule and at least one worked example; the draft says only 'any smallest initial set'. | no (not in archive) | yes | no note |
| 3973 | Distinct Gate Paths to LCA | `docs/requirements/3973.json` | Confirm the gate-colour semantics and the parallel-instance counting rule; the draft is ambiguous. | no (not in archive) | yes | note (public-community-reference) |
| 3416 | Subsequences with a Unique Middle Mode II | `docs/requirements/3416.json (none)` | Confirm the definition of a unique-middle-mode subsequence with one worked example. | no (not in archive) | yes | no note |
| 3988 | Create Grid With Exactly K Paths I | `docs/requirements/3988.json` | Confirm the construction requirement and the output form; the draft says 'return any valid grid' but gives no construction rule or impossibility rule. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 3990 | Create Grid With Exactly K Paths II | `docs/requirements/3990.json` | Confirm the construction requirement and the output form; the draft gives no construction rule. | no (not in archive) | yes | note (public-community-reference) |

## Resolved from the recovered archive (not statement gaps)

The recovered statement in `local-reference/leetcode/raw/` includes the examples and constraints. Read it before asking anything about these IDs; their requirement notes came from search snippets.

| ID | Title | Recovered statement | Requirement file |
|---|---|---|---|
| 1896 | Minimum Cost to Change the Final Value of Expression | `local-reference/leetcode/raw/minimum-cost-to-change-the-final-value-of-expression.json` | `docs/requirements/1896.json` |
| 1900 | The Earliest and Latest Rounds Where Players Compete | `local-reference/leetcode/raw/the-earliest-and-latest-rounds-where-players-compete.json` | `docs/requirements/1900.json` |
| 1932 | Merge BSTs to Create Single BST | `local-reference/leetcode/raw/merge-bsts-to-create-single-bst.json` | `docs/requirements/1932.json` |
| 3207 | Maximum Points After Enemy Battles | `local-reference/leetcode/raw/maximum-points-after-enemy-battles.json` | `docs/requirements/3207.json` |
| 3225 | Maximum Score From Grid Operations | `local-reference/leetcode/raw/maximum-score-from-grid-operations.json` | `docs/requirements/3225.json` |

## 2. Unclear rules, constraints, input/output format or tie-breaking

| ID | Title | Requirement file | Missing information or question | Checked raw | Checked manual | Checked requirements |
|---|---|---|---|---|---|---|
| 3980 | Minimum Operations to Transform Binary String | `docs/requirements/3980.json` | Whether a 0-to-1 flip may create an adjacent '11' pair that is later turned to '00'; the reachability conditions are not stated. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 3984 | Divisible Game | `docs/requirements/3984.json` | What magnitude a non-divisible value contributes to the score; the draft does not give the contribution rule. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 4009 | Minimum Possible Maximum Waiting Time | `docs/requirements/4009.json` | Tie-breaking and wait accounting when a car fits one dispenser but must queue behind another. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 4004 | Minimum Moves to Balance Circular Array II | `docs/requirements/4004.json` | The multi-deficit circular transfer rule; the draft does not settle it, so the minimal-move formula is unknown. | no (not in archive) | yes | note (public-community-reference) |
| 4005 | Minimum Operations to Make Array Equal III | `docs/requirements/4005.json` | The candidate set for the target value; the draft gives no bounded candidate set, so the minimum over targets is undetermined. | no (not in archive) | yes | note (public-community-reference) |
| 3961 | Maximize Sum of Device Ratings | `docs/requirements/3961.json` | Where a donated unit lands when every receiver would lower its rating; the unit and capacity model is underspecified. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 3431 | Minimum Unlocked Indices to Sort Nums | `docs/requirements/3431.json` | The unlock-count rule; the draft gives no worked derivation or examples. | no (not in archive) | yes | note (public-community-reference) |
| 3385 | Minimum Time to Break Locks II | `docs/requirements/3385.json (none)` | The lock-ordering cost formula; the draft does not pin the cost, so the minimum-time assignment is undetermined. | no (not in archive) | yes | no note |
| 2534 | Time Taken to Cross the Door | `docs/requirements/2534.json (none)` | The door-state rule: the draft gives [0,2,1] for arrival [0,1,1] and state [0,1,0]; confirm the official example output (the recalled output differs). | no (not in archive) | yes | no note |
| 2189 | Number of Ways to Build House of Cards | `docs/requirements/2189.json (none)` | Confirm whether the official rule requires row sizes to decrease upward; the draft describes ordered sequences of rows costing 3t-1 with no such constraint. | no (not in archive) | yes | no note |

## 3. SQL, JavaScript API, Promise, concurrency or design-class problems skipped

Only IDs with no recovered statement are listed here. IDs that do have a recovered statement are in the table after this section and should be read from raw first.

| ID | Title | Requirement file | Reason skipped | Checked raw | Checked manual | Checked requirements |
|---|---|---|---|---|---|---|
| 1045 | Customers Who Bought All Products | `docs/requirements/1045.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1050 | Actors and Directors Who Cooperated At Least Three Times | `docs/requirements/1050.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1068 | Product Sales Analysis I | `docs/requirements/1068.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1069 | Product Sales Analysis II | `docs/requirements/1069.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1070 | Product Sales Analysis III | `docs/requirements/1070.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1075 | Project Employees I | `docs/requirements/1075.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1076 | Project Employees II | `docs/requirements/1076.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1077 | Project Employees III | `docs/requirements/1077.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1082 | Sales Analysis I | `docs/requirements/1082.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1083 | Sales Analysis II | `docs/requirements/1083.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1084 | Sales Analysis III | `docs/requirements/1084.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1097 | Game Play Analysis V | `docs/requirements/1097.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1098 | Unpopular Books | `docs/requirements/1098.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1107 | New Users Daily Count | `docs/requirements/1107.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1112 | Highest Grade For Each Student | `docs/requirements/1112.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1113 | Reported Posts | `docs/requirements/1113.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1126 | Active Businesses | `docs/requirements/1126.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1127 | User Purchase Platform | `docs/requirements/1127.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1132 | Reported Posts II | `docs/requirements/1132.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1141 | User Activity for the Past 30 Days I | `docs/requirements/1141.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1142 | User Activity for the Past 30 Days II | `docs/requirements/1142.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1148 | Article Views I | `docs/requirements/1148.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1149 | Article Views II | `docs/requirements/1149.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1158 | Market Analysis I | `docs/requirements/1158.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1159 | Market Analysis II | `docs/requirements/1159.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1164 | Product Price at a Given Date | `docs/requirements/1164.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1173 | Immediate Food Delivery I | `docs/requirements/1173.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1174 | Immediate Food Delivery II | `docs/requirements/1174.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1179 | Reformat Department Table | `docs/requirements/1179.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1193 | Monthly Transactions I | `docs/requirements/1193.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1194 | Tournament Winners | `docs/requirements/1194.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1204 | Last Person to Fit in the Bus | `docs/requirements/1204.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1205 | Monthly Transactions II | `docs/requirements/1205.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1211 | Queries Quality and Percentage | `docs/requirements/1211.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1212 | Team Scores in Football Tournament | `docs/requirements/1212.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1225 | Report Contiguous Dates | `docs/requirements/1225.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1241 | Number of Comments per Post | `docs/requirements/1241.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1251 | Average Selling Price | `docs/requirements/1251.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1264 | Page Recommendations | `docs/requirements/1264.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1270 | All People Report to the Given Manager | `docs/requirements/1270.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1280 | Students and Examinations | `docs/requirements/1280.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1285 | Find the Start and End Number of Continuous Ranges | `docs/requirements/1285.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1294 | Weather Type in Each Country | `docs/requirements/1294.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1303 | Find the Team Size | `docs/requirements/1303.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1308 | Running Total for Different Genders | `docs/requirements/1308.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1321 | Restaurant Growth | `docs/requirements/1321.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1322 | Ads Performance | `docs/requirements/1322.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1327 | List the Products Ordered in a Period | `docs/requirements/1327.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1336 | Number of Transactions per Visit | `docs/requirements/1336.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1341 | Movie Rating | `docs/requirements/1341.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1350 | Students With Invalid Departments | `docs/requirements/1350.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1355 | Activity Participants | `docs/requirements/1355.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1364 | Number of Trusted Contacts of a Customer | `docs/requirements/1364.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1369 | Get the Second Most Recent Activity | `docs/requirements/1369.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1378 | Replace Employee ID With The Unique Identifier | `docs/requirements/1378.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1384 | Total Sales Amount by Year | `docs/requirements/1384.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1393 | Capital Gain/Loss | `docs/requirements/1393.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1398 | Customers Who Bought Products A and B but Not C | `docs/requirements/1398.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1407 | Top Travellers | `docs/requirements/1407.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1412 | Find the Quiet Students in All Exams | `docs/requirements/1412.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1421 | NPV Queries | `docs/requirements/1421.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1435 | Create a Session Bar Chart | `docs/requirements/1435.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1440 | Evaluate Boolean Expression | `docs/requirements/1440.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1445 | Apples & Oranges | `docs/requirements/1445.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1454 | Active Users | `docs/requirements/1454.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1459 | Rectangles Area | `docs/requirements/1459.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1468 | Calculate Salaries | `docs/requirements/1468.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1479 | Sales by Day of the Week | `docs/requirements/1479.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1484 | Group Sold Products By The Date | `docs/requirements/1484.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1495 | Friendly Movies Streamed Last Month | `docs/requirements/1495.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1501 | Countries You Can Safely Invest In | `docs/requirements/1501.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1511 | Customer Order Frequency | `docs/requirements/1511.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1517 | Find Users With Valid E-Mails | `docs/requirements/1517.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1527 | Patients With a Condition | `docs/requirements/1527.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1532 | The Most Recent Three Orders | `docs/requirements/1532.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1543 | Fix Product Name Format | `docs/requirements/1543.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1549 | The Most Recent Orders for Each Product | `docs/requirements/1549.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1555 | Bank Account Summary | `docs/requirements/1555.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1565 | Unique Orders and Customers Per Month | `docs/requirements/1565.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1571 | Warehouse Manager | `docs/requirements/1571.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1581 | Customer Who Visited but Did Not Make Any Transactions | `docs/requirements/1581.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1587 | Bank Account Summary II | `docs/requirements/1587.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1596 | The Most Frequently Ordered Products for Each Customer | `docs/requirements/1596.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1607 | Sellers With No Sales | `docs/requirements/1607.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1613 | Find the Missing IDs | `docs/requirements/1613.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1623 | All Valid Triplets That Can Represent a Country | `docs/requirements/1623.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1633 | Percentage of Users Attended a Contest | `docs/requirements/1633.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1635 | Hopper Company Queries I | `docs/requirements/1635.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1661 | Average Time of Process per Machine | `docs/requirements/1661.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1677 | Product's Worth Over Invoices | `docs/requirements/1677.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1699 | Number of Calls Between Two Persons | `docs/requirements/1699.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1709 | Biggest Window Between Visits | `docs/requirements/1709.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1715 | Count Apples and Oranges | `docs/requirements/1715.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1731 | The Number of Employees Which Report to Each Employee | `docs/requirements/1731.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1747 | Leetflex Banned Accounts | `docs/requirements/1747.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1767 | Find the Subtasks That Did Not Execute | `docs/requirements/1767.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1777 | Product's Price for Each Store | `docs/requirements/1777.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1783 | Grand Slam Titles | `docs/requirements/1783.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1789 | Primary Department for Each Employee | `docs/requirements/1789.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1795 | Rearrange Products Table | `docs/requirements/1795.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1809 | Ad-Free Sessions | `docs/requirements/1809.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1811 | Find Interview Candidates | `docs/requirements/1811.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1831 | Maximum Transaction Each Day | `docs/requirements/1831.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1841 | League Statistics | `docs/requirements/1841.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1843 | Suspicious Bank Accounts | `docs/requirements/1843.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1853 | Convert Date Format | `docs/requirements/1853.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1867 | Orders With Maximum Quantity Above Average | `docs/requirements/1867.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1875 | Group Employees of the Same Salary | `docs/requirements/1875.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1892 | Page Recommendations II | `docs/requirements/1892.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1917 | Leetcodify Friends Recommendations | `docs/requirements/1917.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1919 | Leetcodify Similar Friends | `docs/requirements/1919.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1934 | Confirmation Rate | `docs/requirements/1934.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1951 | All the Pairs With the Maximum Number of Common Followers | `docs/requirements/1951.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 1972 | First and Last Call On the Same Day | `docs/requirements/1972.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2004 | The Number of Seniors and Juniors to Join the Company | `docs/requirements/2004.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2020 | Number of Accounts That Did Not Stream | `docs/requirements/2020.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2026 | Low-Quality Problems | `docs/requirements/2026.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2041 | Accepted Candidates From the Interviews | `docs/requirements/2041.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2051 | The Category of Each Member in the Store | `docs/requirements/2051.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2066 | Account Balance | `docs/requirements/2066.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2072 | The Winner University | `docs/requirements/2072.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2082 | The Number of Rich Customers | `docs/requirements/2082.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2084 | Drop Type 1 Orders for Customers With Type 0 Orders | `docs/requirements/2084.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2112 | The Airport With the Most Traffic | `docs/requirements/2112.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2118 | Build the Equation | `docs/requirements/2118.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2142 | The Number of Passengers in Each Bus I | `docs/requirements/2142.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2153 | The Number of Passengers in Each Bus II | `docs/requirements/2153.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2159 | Order Two Columns Independently | `docs/requirements/2159.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2173 | Longest Winning Streak | `docs/requirements/2173.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2175 | The Change in Global Rankings | `docs/requirements/2175.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2199 | Finding the Topic of Each Post | `docs/requirements/2199.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2205 | The Number of Users That Are Eligible for Discount | `docs/requirements/2205.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2228 | Users With Two Purchases Within Seven Days | `docs/requirements/2228.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2230 | The Users That Are Eligible for Discount | `docs/requirements/2230.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2238 | Number of Times a Driver Was a Passenger | `docs/requirements/2238.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2252 | Dynamic Pivoting of a Table | `docs/requirements/2252.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2253 | Dynamic Unpivoting of a Table | `docs/requirements/2253.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2292 | Products With Three or More Orders in Two Consecutive Years | `docs/requirements/2292.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2298 | Tasks Count in the Weekend | `docs/requirements/2298.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2308 | Arrange Table by Gender | `docs/requirements/2308.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2314 | The First Day of the Maximum Recorded Degree in Each City | `docs/requirements/2314.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2324 | Product Sales Analysis IV | `docs/requirements/2324.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2329 | Product Sales Analysis V | `docs/requirements/2329.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2339 | All the Matches of the League | `docs/requirements/2339.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2346 | Compute the Rank as a Percentage | `docs/requirements/2346.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2362 | Generate the Invoice | `docs/requirements/2362.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2372 | Calculate the Influence of Each Salesperson | `docs/requirements/2372.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2377 | Sort the Olympic Table | `docs/requirements/2377.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2388 | Change Null Values in a Table to the Previous Value | `docs/requirements/2388.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2394 | Employees With Deductions | `docs/requirements/2394.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2474 | Customers With Strictly Increasing Purchases | `docs/requirements/2474.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2480 | Form a Chemical Bond | `docs/requirements/2480.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2494 | Merge Overlapping Events in the Same Hall | `docs/requirements/2494.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2504 | Concatenate the Name and the Profession | `docs/requirements/2504.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2668 | Find Latest Salaries | `docs/requirements/2668.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2669 | Count Artist Occurrences On Spotify Ranking List | `docs/requirements/2669.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2686 | Immediate Food Delivery III | `docs/requirements/2686.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2687 | Bikes Last Time Used | `docs/requirements/2687.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2688 | Find Active Users | `docs/requirements/2688.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2701 | Consecutive Transactions with Increasing Amounts | `docs/requirements/2701.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2720 | Popularity Percentage | `docs/requirements/2720.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2738 | Count Occurrences in Text | `docs/requirements/2738.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2752 | Customers with Maximum Number of Transactions on Consecutive Days | `docs/requirements/2752.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2783 | Flight Occupancy and Waitlist Analysis | `docs/requirements/2783.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2793 | Status of Flight Tickets | `docs/requirements/2793.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2820 | Election Results | `docs/requirements/2820.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2837 | Total Traveled Distance | `docs/requirements/2837.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2853 | Highest Salaries Difference | `docs/requirements/2853.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2854 | Rolling Average Steps | `docs/requirements/2854.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2893 | Calculate Orders Within Each Interval | `docs/requirements/2893.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2922 | Market Analysis III | `docs/requirements/2922.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2978 | Symmetric Coordinates | `docs/requirements/2978.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2985 | Calculate Compressed Mean | `docs/requirements/2985.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2986 | Find Third Transaction | `docs/requirements/2986.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2987 | Find Expensive Cities | `docs/requirements/2987.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2988 | Manager of the Largest Department | `docs/requirements/2988.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2989 | Class Performance | `docs/requirements/2989.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2990 | Loan Types | `docs/requirements/2990.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2993 | Friday Purchases I | `docs/requirements/2993.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2994 | Friday Purchases II | `docs/requirements/2994.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 2995 | Viewers Turned Streamers | `docs/requirements/2995.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3050 | Pizza Toppings Cost Analysis | `docs/requirements/3050.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3051 | Find Candidates for Data Scientist Position | `docs/requirements/3051.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3052 | Maximize Items | `docs/requirements/3052.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3053 | Classifying Triangles by Lengths | `docs/requirements/3053.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3054 | Binary Tree Nodes | `docs/requirements/3054.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3055 | Top Percentile Fraud | `docs/requirements/3055.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3056 | Snaps Analysis | `docs/requirements/3056.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3057 | Employees Project Allocation | `docs/requirements/3057.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3058 | Friends With No Mutual Friends | `docs/requirements/3058.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3059 | Find All Unique Email Domains | `docs/requirements/3059.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3060 | User Activities within Time Bounds | `docs/requirements/3060.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3087 | Find Trending Hashtags | `docs/requirements/3087.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3103 | Find Trending Hashtags II | `docs/requirements/3103.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3118 | Friday Purchase III | `docs/requirements/3118.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3124 | Find Longest Calls | `docs/requirements/3124.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3126 | Server Utilization Time | `docs/requirements/3126.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3140 | Consecutive Available Seats II | `docs/requirements/3140.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3150 | Invalid Tweets II | `docs/requirements/3150.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3156 | Employee Task Duration and Concurrent Tasks | `docs/requirements/3156.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3166 | Calculate Parking Fees and Duration | `docs/requirements/3166.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3172 | Second Day Verification | `docs/requirements/3172.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3182 | Find Top Scoring Students | `docs/requirements/3182.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3198 | Find Cities in Each State | `docs/requirements/3198.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3204 | Bitwise User Permissions Analysis | `docs/requirements/3204.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3214 | Year on Year Growth Rate | `docs/requirements/3214.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3220 | Odd and Even Transactions | `docs/requirements/3220.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3230 | Customer Purchasing Behavior Analysis | `docs/requirements/3230.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3236 | CEO Subordinate Hierarchy | `docs/requirements/3236.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3246 | Premier League Table Ranking | `docs/requirements/3246.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3262 | Find Overlapping Shifts | `docs/requirements/3262.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3268 | Find Overlapping Shifts II | `docs/requirements/3268.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3278 | Find Candidates for Data Scientist Position II | `docs/requirements/3278.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3293 | Calculate Product Final Price | `docs/requirements/3293.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3308 | Find Top Performing Driver | `docs/requirements/3308.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3328 | Find Cities in Each State II | `docs/requirements/3328.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3338 | Second Highest Salary II | `docs/requirements/3338.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3358 | Books with NULL Ratings | `docs/requirements/3358.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3368 | First Letter Capitalization | `docs/requirements/3368.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3374 | First Letter Capitalization II | `docs/requirements/3374.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (unknown) |
| 3415 | Find Products with Three Consecutive Digits | `docs/requirements/3415.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3421 | Find Students Who Improved | `docs/requirements/3421.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3436 | Find Valid Emails | `docs/requirements/3436.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3450 | Maximum Students on a Single Bench | `docs/requirements/3450.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3451 | Find Invalid IP Addresses | `docs/requirements/3451.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3465 | Find Products with Valid Serial Numbers | `docs/requirements/3465.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3475 | DNA Pattern Recognition | `docs/requirements/3475.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (access-attempt-failed) |
| 3482 | Analyze Organization Hierarchy | `docs/requirements/3482.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (access-attempt-failed) |
| 3497 | Analyze Subscription Conversion | `docs/requirements/3497.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (access-attempt-failed) |
| 3521 | Find Product Recommendation Pairs | `docs/requirements/3521.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (access-attempt-failed) |
| 3554 | Find Category Recommendation Pairs | `docs/requirements/3554.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3564 | Seasonal Sales Analysis | `docs/requirements/3564.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3570 | Find Books with No Available Copies | `docs/requirements/3570.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3580 | Find Consistently Improving Employees | `docs/requirements/3580.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3586 | Find COVID Recovery Patients | `docs/requirements/3586.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3601 | Find Drivers with Improved Fuel Efficiency | `docs/requirements/3601.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3611 | Find Overbooked Employees | `docs/requirements/3611.json (none)` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | no note |
| 3617 | Find Students with Study Spiral Pattern | `docs/requirements/3617.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-blocked) |
| 3626 | Find Stores with Inventory Imbalance | `docs/requirements/3626.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-blocked) |
| 3642 | Find Books with Polarized Opinions | `docs/requirements/3642.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-blocked) |
| 3657 | Find Loyal Customers | `docs/requirements/3657.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-blocked) |
| 3673 | Find Zombie Sessions | `docs/requirements/3673.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (access-attempt-failed) |
| 3705 | Find Golden Hour Customers | `docs/requirements/3705.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (access-attempt-failed) |
| 3716 | Find Churn Risk Customers | `docs/requirements/3716.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (access-attempt-failed) |
| 3764 | Most Common Course Pairs | `docs/requirements/3764.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 3793 | Find Users with High Token Usage | `docs/requirements/3793.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 3808 | Find Emotionally Consistent Users | `docs/requirements/3808.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 3832 | Find Users with Persistent Behavior Patterns | `docs/requirements/3832.json` | SQL draft: confirm the official output columns, row order and the table schema. | no (not in archive) | yes | note (official-page-via-web-tool) |
| 2619 | Array Prototype Last | `docs/requirements/2619.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2620 | Counter | `docs/requirements/2620.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2621 | Sleep | `docs/requirements/2621.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2622 | Cache With Time Limit | `docs/requirements/2622.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2623 | Memoize | `docs/requirements/2623.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2626 | Array Reduce Transformation | `docs/requirements/2626.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2627 | Debounce | `docs/requirements/2627.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2629 | Function Composition | `docs/requirements/2629.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2630 | Memoize II | `docs/requirements/2630.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2631 | Group By | `docs/requirements/2631.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2632 | Curry | `docs/requirements/2632.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2633 | Convert Object to JSON String | `docs/requirements/2633.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2634 | Filter Elements from Array | `docs/requirements/2634.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2635 | Apply Transform Over Each Element in Array | `docs/requirements/2635.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2636 | Promise Pool | `docs/requirements/2636.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2637 | Promise Time Limit | `docs/requirements/2637.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2648 | Generate Fibonacci Sequence | `docs/requirements/2648.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2650 | Design Cancellable Function | `docs/requirements/2650.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2665 | Counter II | `docs/requirements/2665.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2675 | Array of Objects to Matrix | `docs/requirements/2675.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2676 | Throttle | `docs/requirements/2676.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2690 | Infinite Method Object | `docs/requirements/2690.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2691 | Immutability Helper | `docs/requirements/2691.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2692 | Make Object Immutable | `docs/requirements/2692.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2693 | Call Function with Custom Context | `docs/requirements/2693.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2694 | Event Emitter | `docs/requirements/2694.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2695 | Array Wrapper | `docs/requirements/2695.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2700 | Differences Between Two Objects | `docs/requirements/2700.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2704 | To Be Or Not To Be | `docs/requirements/2704.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2715 | Timeout Cancellation | `docs/requirements/2715.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2721 | Execute Asynchronous Functions in Parallel | `docs/requirements/2721.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2723 | Add Two Promises | `docs/requirements/2723.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2724 | Sort By | `docs/requirements/2724.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2725 | Interval Cancellation | `docs/requirements/2725.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2726 | Calculator with Method Chaining | `docs/requirements/2726.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2728 | Count Houses in a Circular Street | `docs/requirements/2728.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2753 | Count Houses in a Circular Street II | `docs/requirements/2753.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2754 | Bind Function to Context | `docs/requirements/2754.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2755 | Deep Merge of Two Objects | `docs/requirements/2755.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2756 | Query Batching | `docs/requirements/2756.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2757 | Generate Circular Array Values | `docs/requirements/2757.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2758 | Next Day | `docs/requirements/2758.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2759 | Convert JSON String to Object | `docs/requirements/2759.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2774 | Array Upper Bound | `docs/requirements/2774.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2775 | Undefined to Null | `docs/requirements/2775.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2776 | Convert Callback Based Function to Promise Based Function | `docs/requirements/2776.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2777 | Date Range Generator | `docs/requirements/2777.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2794 | Create Object from Two Arrays | `docs/requirements/2794.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2795 | Parallel Execution of Promises for Individual Results Retrieval | `docs/requirements/2795.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2796 | Repeat String | `docs/requirements/2796.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2797 | Partial Function with Placeholders | `docs/requirements/2797.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2803 | Factorial Generator | `docs/requirements/2803.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2804 | Array Prototype ForEach | `docs/requirements/2804.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2805 | Custom Interval | `docs/requirements/2805.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2821 | Delay the Resolution of Each Promise | `docs/requirements/2821.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2822 | Inversion of Object | `docs/requirements/2822.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 2823 | Deep Object Filter | `docs/requirements/2823.json (none)` | JavaScript API: confirm the callable interface, arguments and return shape. | no (not in archive) | yes | no note |
| 635 | Design Log Storage System | `docs/requirements/635.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1166 | Design File System | `docs/requirements/1166.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1429 | First Unique Number | `docs/requirements/1429.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1500 | Design a File Sharing System | `docs/requirements/1500.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1586 | Binary Search Tree Iterator II | `docs/requirements/1586.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1628 | Design an Expression Tree With Evaluate Function | `docs/requirements/1628.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1724 | Checking Existence of Edge Length Limited Paths II | `docs/requirements/1724.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 2254 | Design Video Sharing Platform | `docs/requirements/2254.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 2408 | Design SQL | `docs/requirements/2408.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 2590 | Design a Todo List | `docs/requirements/2590.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 3369 | Design an Array Statistics Tracker  | `docs/requirements/3369.json` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | note (public-community-reference) |
| 3391 | Design a 3D Binary Matrix with Efficient Layer Tracking | `docs/requirements/3391.json` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | note (public-community-reference) |
| 3822 | Design Order Management System | `docs/requirements/3822.json` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | note (public-community-reference) |
| 1778 | Shortest Path in a Hidden Grid | `docs/requirements/1778.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1810 | Minimum Path Cost in a Hidden Grid | `docs/requirements/1810.json (none)` | Design-class (methods on an object): confirm the method list, argument forms and return values. | no (not in archive) | yes | no note |
| 1188 | Design Bounded Blocking Queue | `docs/requirements/1188.json (none)` | Concurrency: confirm the thread or timer model and the expected output order. | no (not in archive) | yes | no note |
| 1195 | Fizz Buzz Multithreaded | `docs/requirements/1195.json (none)` | Concurrency: confirm the thread or timer model and the expected output order. | no (not in archive) | yes | no note |
| 1226 | The Dining Philosophers | `docs/requirements/1226.json (none)` | Concurrency: confirm the thread or timer model and the expected output order. | no (not in archive) | yes | no note |
| 1242 | Web Crawler Multithreaded | `docs/requirements/1242.json (none)` | Concurrency: confirm the thread or timer model and the expected output order. | no (not in archive) | yes | no note |
| 1244 | Design A Leaderboard | `docs/requirements/1244.json (none)` | Concurrency: confirm the thread or timer model and the expected output order. | no (not in archive) | yes | no note |
| 1279 | Traffic Light Controlled Intersection | `docs/requirements/1279.json (none)` | Concurrency: confirm the thread or timer model and the expected output order. | no (not in archive) | yes | no note |

## Recovered statement present (read raw first, not a gap)

The recovered statement in `local-reference/leetcode/raw/` exists for these IDs. Their skip reason may be resolved by reading it; only ask again if the raw text is also insufficient.

| ID | Recovered statement |
|---|---|
| 1912 | `local-reference/leetcode/raw/design-movie-rental-system.json` |
| 2424 | `local-reference/leetcode/raw/longest-uploaded-prefix.json` |
| 2502 | `local-reference/leetcode/raw/design-memory-allocator.json` |
| 2526 | `local-reference/leetcode/raw/find-consecutive-integers-from-a-data-stream.json` |
| 3242 | `local-reference/leetcode/raw/design-neighbor-sum-service.json` |
