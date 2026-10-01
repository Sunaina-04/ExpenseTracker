/*
This file is shared between index.html (for transactions) and budget.html (fixed expenses and budget) as both pages need the same data and same safe-to-spend formula.

Keeping it in one place maintains the consistency.
*/

const TRANSACTIONS_KEY = "transactions";
const BUDGET_CONFIG_KEY = "budgetConfig";
const QUICK_ADD_PRESETS_KEY = "quickAddPresets";

// transactions

function getTransactions() {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
}

function saveTransactions(transactions) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// budget

function getBudgetConfig() {
    const defaultConfig = {
        monthlyIncome : 0,
        savingsGoal : 0,
        fixedObligations : []
    };

    return JSON.parse(localStorage.getItem(BUDGET_CONFIG_KEY)) || defaultConfig;
}

function saveBudgetConfig(config) {
    localStorage.setItem(BUDGET_CONFIG_KEY, JSON.stringify(config));
}

// presets 
function getQuickAddPresets() {
    return JSON.parse(localStorage.getItem(QUICK_ADD_PRESETS_KEY)) || [];
}

function saveQuickAddPresets(presets) {
    localStorage.setItem(QUICK_ADD_PRESETS_KEY, JSON.stringify(presets));
}

// helpers :-

function formatCurrency(number) {
    return new Intl.NumberFormat("hi-IN", {
        style: "currency",
        currency : "INR"
    }).format(number);
}

// prevents number inputs change their value on mouse-wheel scroll by default trigger preventing number change by accident while just scrolling the page.
function preventNumberInputScroll(inputEle) {
    inputEle.addEventListener("wheel", () => inputEle.blur());
} 

// year-month date style used to count only this month's variable expense
//  safe to spend balance will natually reset each month  
// take budget to next month functionality -----to be added later 
function getCurrentMonthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isObligationActive(item, monthKey = getCurrentMonthKey()) {
    if (item.category !== "Loan/EMI") return true;
    if (!item.startMonth || !item.durationMonths) return true;

    const monthIndex = (key) => {
        const[y, m] = key.split("-").map(Number);
        return y * 12 + (m - 1);
    };

    const start = monthIndex(item.startMonth);
    const end = start + item.durationMonths - 1;
    const current = monthIndex(monthKey);

    return current >= start && current <= end;
}

function getFixedTotal(budget, monthKey = getCurrentMonthKey()) {
    return budget.fixedObligations.filter(item => isObligationActive(item, monthKey)).reduce((sum, item) => sum + item.amount, 0);
}

/*
    The core formula (shared by both pages):
    Fixed Commitments Total   = sum of all fixed obligations
    Initial Safe-To-Spend     = Monthly Income - Fixed Commitments Total - Savings Goal
    Remaining Safe-To-Spend   = Initial Safe-To-Spend - Variable Expenses logged THIS month
*/

function computeSafeToSpend() {
    const budget = getBudgetConfig();
    const transactions = getTransactions();
    const currentMonth = getCurrentMonthKey();

    const fixedTotal = getFixedTotal(budget);
    const initialSafeToSpend = budget.monthlyIncome - fixedTotal - budget.savingsGoal;

    const variableExpenseTotal = transactions.filter (t => t.type === "expense" && t.date && t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0);

    const remainingSafeToSpend = initialSafeToSpend - variableExpenseTotal;

    const now = new Date();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = totalDaysInMonth - now.getDate() + 1;
    const dailyAllowance = daysLeft > 0 ? remainingSafeToSpend / daysLeft : remainingSafeToSpend;

    // % of the safe to spend that is already used (logic that drives the colour coding)
    const percentUsed = initialSafeToSpend > 0 ? Math.min(100, Math.max(0, (variableExpenseTotal / initialSafeToSpend) * 100)) : 0;

    return {
        monthlyIncome : budget.monthlyIncome,
        savingsGoal : budget.savingsGoal,
        fixedTotal,
        initialSafeToSpend,
        variableExpenseTotal,
        remainingSafeToSpend,
        daysLeft,
        dailyAllowance,
        percentUsed
    };
}

function getCategoryOptions(type) {
    return type === "income" ? ["Salary", "Freelance", "Gift", "Other Income"] : ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Misc"];
}