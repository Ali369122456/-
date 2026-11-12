const test = require("node:test");
const assert = require("node:assert/strict");
const {calculateSummary, filterEntries, formatMoney} = require("../app.js");

const sample = [
  {id:"1",type:"income",amount:5000,category:"工资",date:"2026-11-01",note:"十一月工资",createdAt:1},
  {id:"2",type:"expense",amount:35,category:"餐饮",date:"2026-11-02",note:"午餐",createdAt:2},
  {id:"3",type:"expense",amount:100,category:"交通",date:"2026-10-20",note:"地铁",createdAt:3},
  {id:"4",type:"income",amount:200,category:"兼职",date:"2026-11-03",note:"设计兼职",createdAt:4}
];

test("自动汇总收入、支出和余额", () => {
  assert.deepEqual(calculateSummary(sample), {income:5200,expense:135,balance:5065});
});
test("按类型筛选支出", () => {
  assert.equal(filterEntries(sample,{type:"expense"}).length,2);
});
test("按月份筛选", () => {
  assert.equal(filterEntries(sample,{month:"2026-11"}).length,3);
});
test("按备注或分类搜索", () => {
  assert.equal(filterEntries(sample,{search:"午餐"}).length,1);
  assert.equal(filterEntries(sample,{search:"交通"}).length,1);
});
test("记录按日期从新到旧排列", () => {
  assert.deepEqual(filterEntries(sample).map(x=>x.id),["4","2","1","3"]);
});
test("金额格式化", () => {
  assert.match(formatMoney(12.5), /12\.50/);
});
