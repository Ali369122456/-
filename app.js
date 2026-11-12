// 简记：个人记账网页
const CATEGORIES = {
  expense: ["餐饮", "交通", "购物", "居住", "娱乐", "医疗", "学习", "其他"],
  income: ["工资", "奖金", "兼职", "理财", "礼金", "其他"]
};
const ICONS = {"餐饮":"🍜","交通":"🚇","购物":"🛍️","居住":"🏠","娱乐":"🎬","医疗":"💊","学习":"📚","工资":"💼","奖金":"🎁","兼职":"🧑‍💻","理财":"📈","礼金":"🧧","其他":"🧾"};

function calculateSummary(entries) {
  const income = entries.filter(x => x.type === "income").reduce((s,x) => s + Number(x.amount), 0);
  const expense = entries.filter(x => x.type === "expense").reduce((s,x) => s + Number(x.amount), 0);
  return { income, expense, balance: income - expense };
}
function filterEntries(entries, {search="", type="all", month=""}={}) {
  const q = search.trim().toLowerCase();
  return entries.filter(x =>
    (type === "all" || x.type === type) &&
    (!month || x.date.startsWith(month)) &&
    (!q || x.note.toLowerCase().includes(q) || x.category.toLowerCase().includes(q))
  ).sort((a,b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}
function formatMoney(value) {
  return new Intl.NumberFormat("zh-CN", {style:"currency", currency:"CNY"}).format(value);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {CATEGORIES, calculateSummary, filterEntries, formatMoney};
} else {
  (() => {
    const KEY = "jianji-transactions-v1";
    const $ = id => document.getElementById(id);
    let entries = loadEntries();
    let currentType = "expense";

    function loadEntries() {
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
      } catch { return []; }
    }
    function saveEntries() { localStorage.setItem(KEY, JSON.stringify(entries)); }
    function setType(type) {
      currentType = type;
      $("type").value = type;
      document.querySelectorAll(".type-btn").forEach(btn => {
        const active = btn.dataset.type === type;
        btn.classList.toggle("active", active);
        btn.classList.toggle("income-active", active && type === "income");
        btn.classList.toggle("expense-active", active && type === "expense");
      });
      $("category").innerHTML = CATEGORIES[type].map(c => `<option value="${c}">${c}</option>`).join("");
    }
    function render() {
      const totals = calculateSummary(entries);
      $("balance").textContent = formatMoney(totals.balance);
      $("totalIncome").textContent = formatMoney(totals.income);
      $("totalExpense").textContent = formatMoney(totals.expense);
      const shown = filterEntries(entries, {search:$("search").value, type:$("typeFilter").value, month:$("monthFilter").value});
      $("recordCount").textContent = `${entries.length} 笔记录`;
      $("visibleCount").textContent = `显示 ${shown.length} 笔`;
      $("emptyState").style.display = shown.length ? "none" : "block";
      $("historyList").innerHTML = shown.map(item => `
        <div class="history-item">
          <div class="category-icon">${ICONS[item.category] || "🧾"}</div>
          <div class="entry-info"><div class="entry-name">${escapeHTML(item.note || item.category)}</div>
          <div class="entry-meta">${item.date} · ${item.category}</div></div>
          <div class="entry-amount ${item.type}">${item.type === "income" ? "+" : "−"}${formatMoney(item.amount)}</div>
          <button class="delete-btn" data-id="${item.id}" aria-label="删除记录" title="删除">×</button>
        </div>`).join("");
    }
    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    }

    document.querySelectorAll(".type-btn").forEach(btn => btn.addEventListener("click", () => setType(btn.dataset.type)));
    $("entryForm").addEventListener("submit", event => {
      event.preventDefault();
      const amount = Number($("amount").value);
      const date = $("date").value;
      if (!Number.isFinite(amount) || amount <= 0 || !date) {
        $("formMessage").textContent = "请填写有效金额和日期。"; return;
      }
      entries.push({id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random())), type:currentType, amount, category:$("category").value, date, note:$("note").value.trim(), createdAt:Date.now()});
      saveEntries(); $("entryForm").reset(); $("date").value = new Date().toLocaleDateString("en-CA"); $("formMessage").textContent = "保存成功！"; render();
    });
    $("historyList").addEventListener("click", event => {
      const btn = event.target.closest("[data-id]");
      if (!btn) return;
      entries = entries.filter(x => x.id !== btn.dataset.id); saveEntries(); render();
    });
    ["search","typeFilter","monthFilter"].forEach(id => $(id).addEventListener("input", render));
    $("clearFilters").addEventListener("click", () => { $("search").value=""; $("typeFilter").value="all"; $("monthFilter").value=""; render(); });
    $("todayLabel").textContent = new Intl.DateTimeFormat("zh-CN", {year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(new Date());
    $("date").value = new Date().toLocaleDateString("en-CA");
    setType("expense"); render();
  })();
}
