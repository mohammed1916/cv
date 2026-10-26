export const databasePython={
1667:`def solve(rows):
    answer = []
    for row in rows:
        name = row['name'][0].upper() + row['name'][1:].lower()
        answer.append({'user_id': row['user_id'], 'name': name})  # step: update
    return sorted(answer, key=lambda row: row['user_id'])  # step: return`,
1683:`def solve(rows):
    answer = []
    for row in rows:
        if len(row['content']) > 15:  # step: update
            answer.append({'tweet_id': row['tweet_id']})
    return answer  # step: return`,
1693:`def solve(rows):
    groups = {}
    for row in rows:
        key = (row['date_id'], row['make_name'])
        leads, partners = groups.setdefault(key, (set(), set()))
        leads.add(row['lead_id'])
        partners.add(row['partner_id'])  # step: update
    return [{'date_id': day, 'make_name': make, 'unique_leads': len(leads),
             'unique_partners': len(partners)}
            for (day, make), (leads, partners) in sorted(groups.items())]  # step: return`,
1729:`def solve(rows):
    counts = {}
    for row in rows:
        user = row['user_id']
        counts[user] = counts.get(user, 0) + 1  # step: update
    return [{'user_id': user, 'followers_count': count}
            for user, count in sorted(counts.items())]  # step: return`,
1741:`def solve(rows):
    totals = {}
    for row in rows:
        key = (row['event_day'], row['emp_id'])
        totals[key] = totals.get(key, 0) + row['out_time'] - row['in_time']  # step: update
    return [{'day': day, 'emp_id': employee, 'total_time': duration}
            for (day, employee), duration in sorted(totals.items())]  # step: return`,
1757:`def solve(rows):
    answer = []
    for row in rows:
        if row['low_fats'] == 'Y' and row['recyclable'] == 'Y':  # step: update
            answer.append({'product_id': row['product_id']})
    return answer  # step: return`,
1821:`def solve(rows):
    answer = []
    for row in rows:
        if row['year'] == 2021 and row['revenue'] > 0:  # step: update
            answer.append({'customer_id': row['customer_id']})
    return answer  # step: return`,
1873:`def solve(rows):
    answer = []
    for row in rows:
        eligible = row['employee_id'] % 2 == 1 and not row['name'].startswith('M')
        answer.append({'employee_id': row['employee_id'],
                       'bonus': row['salary'] if eligible else 0})  # step: update
    return sorted(answer, key=lambda row: row['employee_id'])  # step: return`,
1890:`def solve(rows):
    latest = {}
    for row in rows:
        stamp, user = row['time_stamp'], row['user_id']
        if '2020-01-01 00:00:00' <= stamp < '2021-01-01 00:00:00':  # step: update
            latest[user] = max(latest.get(user, stamp), stamp)
    return [{'user_id': user, 'last_stamp': stamp}
            for user, stamp in sorted(latest.items())]  # step: return`,
1907:`def solve(rows):
    counts = {'Low Salary': 0, 'Average Salary': 0, 'High Salary': 0}
    for row in rows:
        income = row['income']
        category = 'Low Salary' if income < 20000 else 'Average Salary' if income <= 50000 else 'High Salary'
        counts[category] += 1  # step: update
    return [{'category': category, 'accounts_count': count}
            for category, count in counts.items()]  # step: return`,
};
export const databaseSql={
1667:`SELECT user_id,
       CONCAT(UPPER(LEFT(name, 1)), LOWER(SUBSTRING(name, 2))) AS name
FROM Users
ORDER BY user_id;`,
1683:`SELECT tweet_id
FROM Tweets
WHERE CHAR_LENGTH(content) > 15;`,
1693:`SELECT date_id, make_name,
       COUNT(DISTINCT lead_id) AS unique_leads,
       COUNT(DISTINCT partner_id) AS unique_partners
FROM DailySales
GROUP BY date_id, make_name;`,
1729:`SELECT user_id, COUNT(*) AS followers_count
FROM Followers
GROUP BY user_id
ORDER BY user_id;`,
1741:`SELECT event_day AS day, emp_id,
       SUM(out_time - in_time) AS total_time
FROM Employees
GROUP BY event_day, emp_id;`,
1757:`SELECT product_id
FROM Products
WHERE low_fats = 'Y' AND recyclable = 'Y';`,
1821:`SELECT customer_id
FROM Customers
WHERE year = 2021 AND revenue > 0;`,
1873:`SELECT employee_id,
       CASE WHEN MOD(employee_id, 2) = 1
                 AND ASCII(LEFT(name, 1)) <> ASCII('M')
            THEN salary ELSE 0 END AS bonus
FROM Employees
ORDER BY employee_id;`,
1890:`SELECT user_id, MAX(time_stamp) AS last_stamp
FROM Logins
WHERE time_stamp >= '2020-01-01 00:00:00'
  AND time_stamp < '2021-01-01 00:00:00'
GROUP BY user_id;`,
1907:`SELECT 'Low Salary' AS category, COUNT(*) AS accounts_count
FROM Accounts WHERE income < 20000
UNION ALL
SELECT 'Average Salary', COUNT(*)
FROM Accounts WHERE income BETWEEN 20000 AND 50000
UNION ALL
SELECT 'High Salary', COUNT(*)
FROM Accounts WHERE income > 50000;`,
};
export const databasePythonStages=Object.fromEntries(Object.entries(databasePython).map(([id,source])=>[id,
 Object.fromEntries(source.split('\n').flatMap((line,index)=>{const match=line.match(/# step: (\w+)/);return match?[[match[1],index+1]]:[];})),
]));
