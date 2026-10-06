// Shared record-table plumbing; each problem owns its schema and relational rules.
export const requireRecord=(condition,message)=>{if(!condition)throw new Error(message);};
export function recordInputState(schema,input){const tables=schema.tables.map(([key,label,columns])=>({label,columns,rows:input[key]}));return {sourceRecords:tables[0],additionalSourceRecords:tables.slice(1)};}
export const recordResult=(schema,rows)=>({label:'Result',columns:schema.result,rows});
export function validateRecordTables(schema,input,rules={}){
 for(const[key,label,columns,primary]of schema.tables){const rows=input[key];requireRecord(Array.isArray(rows)&&rows.length<=60,`${label} must contain at most 60 rows.`);for(const row of rows){requireRecord(row&&typeof row==='object'&&!Array.isArray(row)&&columns.every(c=>c in row),`${label} requires columns ${columns.join(', ')}.`);for(const column of columns){const value=row[column],rule=rules[column];requireRecord(rule?rule(value):Number.isSafeInteger(value)&&Math.abs(value)<=1000000,`Invalid ${label}.${column} value.`);}}if(primary?.length)requireRecord(new Set(rows.map(row=>JSON.stringify(primary.map(c=>row[c])))).size===rows.length,`${label} primary keys must be unique.`);}
}
export const recordText=value=>typeof value==='string'&&value.length>=1&&value.length<=60;
export const recordDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export const rowsFrom=(columns,values)=>values.map(row=>Object.fromEntries(columns.map((key,i)=>[key,row[i]])));
