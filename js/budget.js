const monthlyIncomeEle = document.getElementById("monthly-income");
const savingsGoalEle = document.getElementById("savings-goal");
const budgetFormEle = document.getElementById("budget-form");

const fixedFormEle = document.getElementById("fixed-form");
const fixedNameEle = document.getElementById("fixed-name");
const fixedAmountEle = document.getElementById("fixed-amount");
const fixedDueDateEle = document.getElementById("fixed-due-date");
const fixedCategoryEle = document.getElementById("fixed-category");
const fixedStartMonthEle = document.getElementById("fixed-start-month");
const fixedDurationEle = document.getElementById("fixed-duration");
const dueDateGroupEle = document.getElementById("due-date-group");
const durationGroupEle = document.getElementById("duration-group");
const durationMonthsGroupEle = document.getElementById("duration-months-group");
const fixedFormTitleEle = document.getElementById("fixed-form-title");
const fixedSubmitBtnEle = document.getElementById("fixed-submit-btn");
const fixedCancelBtnEle = document.getElementById("fixed-cancel-btn");
const fixedListEle = document.getElementById("fixed-list");
const fixedTotalEle = document.getElementById("fixed-total");

const overviewIncomeEle = document.getElementById("overview-income");
const overviewDebtRatioEle = document.getElementById("overview-debt-ratio");
const overviewSpentEle = document.getElementById("overview-spent");

const donutChartEle = document.getElementById("donut-chart");
const donutLegendEle = document.getElementById("donut-legend");
const barChartEle = document.getElementById("bar-chart");

let budget = getBudgetConfig();
let editingFixedId = null;

fixedCategoryEle.addEventListener("change", toggleFixedFields);
toggleFixedFields();

function toggleFixedFields() {
    const isLoan = fixedCategoryEle.value === "Loan/EMI";

    dueDateGroupEle.hidden = isLoan;
    durationGroupEle.hidden = !isLoan;
    durationMonthsGroupEle.hidden = !isLoan;

    fixedDueDateEle.required = !isLoan;
    fixedStartMonthEle.required = isLoan;
    fixedDurationEle.required = isLoan;
}
//budget setup form :-

// prefiling with saved information
monthlyIncomeEle.value = budget.monthlyIncome || "";
savingsGoalEle.value = budget.savingsGoal || "";

budgetFormEle.addEventListener("submit", (e) => {
    e.preventDefault();
    budget.monthlyIncome = parseFloat(monthlyIncomeEle.value) || 0;
    budget.savingsGoal = parseFloat(savingsGoalEle.value) || 0;
    saveBudgetConfig(budget);
    renderAll();
});

//fixed expenditure CRUD :-

fixedFormEle.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = fixedNameEle.value.trim();
    const amount = parseFloat(fixedAmountEle.value);
    const category = fixedCategoryEle.value;

    const details = category === "Loan/EMI"
        ? { startMonth: fixedStartMonthEle.value, durationMonths: parseInt(fixedDurationEle.value, 10) }
        : { dueDate: parseInt(fixedDueDateEle.value, 10) };

    if (editingFixedId === null) {
        budget.fixedObligations.push({ id: Date.now(), name, amount, category, ...details });
    } else {
        budget.fixedObligations = budget.fixedObligations.map(item =>
            item.id === editingFixedId ? { id: item.id, name, amount, category, ...details } : item
        );
    }

    saveBudgetConfig(budget);
    exitFixedEditMode();
    renderAll();
});

fixedCancelBtnEle.addEventListener("click", exitFixedEditMode);

// listener for every fixed expenditure's edit/ delete button :
fixedListEle.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);
    if (e.target.classList.contains("delete-btn")) {
        budget.fixedObligations = budget.fixedObligations.filter(item => item.id !== id);
        if (editingFixedId === id) {
            exitFixedEditMode();
        }
        saveBudgetConfig(budget);
        renderAll();
    }else if (e.target.classList.contains("edit-btn")) {
        enterFixedEditMode(id);
    }
});

function enterFixedEditMode(id) {
    const item = budget.fixedObligations.find(o => o.id === id);
    if (!item) {
        return;
    }

    editingFixedId = id;
    fixedNameEle.value = item.name;
    fixedAmountEle.value = item.amount;
    fixedCategoryEle.value = item.category;
    toggleFixedFields();

    if (item.category === "Loan/EMI") {
        fixedStartMonthEle.value = item.startMonth;
        fixedDurationEle.value = item.durationMonths;
    } else {
        fixedDueDateEle.value = item.dueDate;
    }
 
    fixedFormTitleEle.textContent = "Edit Fixed Obligation";
    fixedSubmitBtnEle.textContent = "Update";
    fixedCancelBtnEle.hidden = false;
}

function exitFixedEditMode() {
    editingFixedId = null;
    fixedFormEle.reset();
    toggleFixedFields();
    fixedFormTitleEle.textContent = "Add Fixed Obligation";
    fixedSubmitBtnEle.textContent = "Add";
    fixedCancelBtnEle.hidden = true;
}

// rendering

function addMonthsToKey(monthKey, monthsToAdd) {
    const [year, month] = monthKey.split("-").map(Number);
    const totalIndex = year * 12 + (month - 1) + monthsToAdd;
    const newYear = Math.floor(totalIndex / 12);
    const newMonth = (totalIndex % 12) + 1;
    return `${newYear}-${String(newMonth).padStart(2, "0")}`;
}

function renderFixedList() {
    fixedListEle.innerHTML = "";

    budget.fixedObligations.forEach((item) => {
        const meta = item.category === "Loan/EMI"
            ? `ends ${addMonthsToKey(item.startMonth, item.durationMonths - 1)}`
            : `due day ${item.dueDate}`;

        const row = document.createElement("li");
        row.classList.add("fixed-item");
        row.innerHTML = `
        <span class="fixed-item-info">
            <span class="fixed-item-name">${item.name}</span>
            <span class="fixed-item-meta">${item.category} · ${meta}</span>
        </span>
        <span class="fixed-item-actions">
            <span class="fixed-item-amount">${formatCurrency(item.amount)}</span>
            <button class="edit-btn" data-id="${item.id}" aria-label="Edit">Edit</button>
            <button class="delete-btn" data-id="${item.id}" aria-label="Delete">x</button>
            </span>
        `;
        fixedListEle.appendChild(row);
    });

    fixedTotalEle.textContent = formatCurrency(getFixedTotal(budget));
    
}

function renderOverview() {
    const s = computeSafeToSpend();

    const debtTotal = budget.fixedObligations.filter(item =>item.category === "Loan/EMI").reduce((sum,item) => sum + item.amount, 0);
    const debtRatio = budget.monthlyIncome > 0 ? (debtTotal / budget.monthlyIncome) * 100 : 0;

    overviewIncomeEle.textContent = formatCurrency(budget.monthlyIncome);
    overviewDebtRatioEle.textContent = `${debtRatio.toFixed(1)}%`;
    overviewSpentEle.textContent = `${formatCurrency(s.variableExpenseTotal)} / ${formatCurrency(s.initialSafeToSpend)}`;
}

// donut chart 
function renderDonutChart() {
    const s = computeSafeToSpend();
    const income = budget.monthlyIncome;

    const segments = income > 0 ? [
        { label : "Fixed Expenses", value: s.fixedTotal, color : "#dc2626"},
        { label : "Savings Goal", value: s.savingsGoal, color : "#2e8b57"},
        { label : "Miscellaneous expenses", value: Math.max(0, s.initialSafeToSpend), color : "#a8d5ba"}
    ] :
    [
        { label : "No income set yet", value: 1, color : "#e2e8f0"}
    ];

    const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

    let cumulativePercent = 0;
    const gradientParts = segments.map(seg => {
        const start = cumulativePercent;
        cumulativePercent += (seg.value / total) * 100;
        return `${seg.color} ${start}% ${cumulativePercent}%`;
    });

    donutChartEle.style.background = `conic-gradient(${gradientParts.join(", ")})`;

    donutLegendEle.innerHTML = segments.map(seg => `
        <div class = "legend-row">
            <span class = "legend-dot" style = "background : ${seg.color}"></span>
            <span>${seg.label}</span>
            <span class ="legend-value">${income > 0 ? formatCurrency(seg.value) : ""}</span>
            </div> 
        `).join("");
}

// bar chart 

function renderBarChart() {
    const transactions = getTransactions();
    const currentMonth = getCurrentMonthKey();

    const totalsByCategory = {};
    
    transactions.filter(t => t.type === "expense" && t.date && t.date.startsWith(currentMonth)).forEach(t => {totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + t.amount;
    });

    const entries = Object.entries(totalsByCategory);
    const maxValue = Math.max(1, ...entries.map(([, value]) => value));

    if (entries.length === 0){
        barChartEle.innerHTML = '<p class="empty-state">No variable expenses logged this month yet.</p>';
        return;
    }

    barChartEle.innerHTML = entries.map(([category, value]) => `
        <div class = "bar-column">
            <div class="bar" style="height:${(value / maxValue) * 100}%;" title="${category}: ${formatCurrency(value)}"></div>
            <span class ="bar-label">${category}</span>
        </div>
    `).join("");
}

function renderAll(){
    renderFixedList();
    renderOverview();
    renderDonutChart();
    renderBarChart();
}

renderAll();