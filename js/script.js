const balanceEle = document.getElementById("balance");
const incomeAmountEle = document.getElementById("income-amount");
const expenseAmountEle = document.getElementById("expense-amount");
const transactionListEle = document.getElementById("transaction-list");
const transactionFormEle = document.getElementById("transaction-form");
const descriptionEle = document.getElementById("description");
const amountEle = document.getElementById("amount");
const categoryEle = document.getElementById("category");
const dateEle = document.getElementById("date");
const typeIncomeEle = document.getElementById("type-income");
const typeExpenseEle = document.getElementById("type-expense");
const formTitleEle = document.getElementById("form-title");
const submitBtnEle = document.getElementById("submit-btn");
const cancelEditBtnEle = document.getElementById("cancel-edit-btn");

// presets
const quickAddPillsEle = document.getElementById("quick-add-pills");
const quickAddNewBtnEle = document.getElementById("quick-add-new-btn");
const quickAddCreateFormEle = document.getElementById("quick-add-create-form");
const quickAddNameEle = document.getElementById("quick-add-name");
const quickAddAmountEle = document.getElementById("quick-add-amount");
const quickAddCategoryEle = document.getElementById("quick-add-category");
const quickAddSaveBtnEle = document.getElementById("quick-add-save-btn");
const quickAddCancelBtnEle = document.getElementById("quick-add-cancel-btn");

// safe to spend 
const safeToSpendAmountEle = document.getElementById("safe-to-spend-amount");
const dailyAllowanceEle = document.getElementById("daily-allowance");
const safeToSpendBarEle = document.getElementById("safe-to-spend-bar");
const safeToSpendCardEle = document.getElementById("safe-to-spend-card");

let transactions = getTransactions();
let quickAddPresets = getQuickAddPresets();

let editingId = null;

// Initial setup 
dateEle.valueAsDate = new Date();
populateCategoryOptions("expense");
preventNumberInputScroll(amountEle);

// presets:

quickAddCategoryEle.innerHTML = getCategoryOptions("expense").map(opt => `<option value = "${opt}">${opt}</option>`).join("");
preventNumberInputScroll(quickAddAmountEle);

quickAddNewBtnEle.addEventListener("click", () => {
    quickAddCreateFormEle.hidden = !quickAddCreateFormEle.hidden;
});

quickAddCancelBtnEle.addEventListener("click", resetQuickAddCreateForm);

quickAddSaveBtnEle.addEventListener("click", () => {
    const name = quickAddNameEle.value.trim();
    const amount = parseFloat(quickAddAmountEle.value);
    const category = quickAddCategoryEle.value;

    if(!name || isNaN(amount)) return;

    quickAddPresets.push({id : Date.now(), name, amount, category});
    saveQuickAddPresets(quickAddPresets);
    renderQuickAddPills();
    resetQuickAddCreateForm();
});

quickAddPillsEle.addEventListener("click",(e) => {
    const id = Number(e.target.dataset.id);
    if (e.target.classList.contains("quick-add-delete")) {
        quickAddPresets = quickAddPresets.filter(p => p.id !== id);
        saveQuickAddPresets(quickAddPresets);
        renderQuickAddPills();
    }else if (e.target.classList.contains("quick-add-trigger")) {
        applyQuickAddPreset(id);
    }
});

function resetQuickAddCreateForm() {
    quickAddNameEle.value = "";
    quickAddAmountEle.value = "";
    quickAddCreateFormEle.hidden = true;
}

function renderQuickAddPills() {
    quickAddPillsEle.innerHTML = quickAddPresets.length ? quickAddPresets.map(p =>` 
        <span class="quick-add-pill">
                <button type="button" class="quick-add-trigger" data-id="${p.id}">${p.name} . ${formatCurrency(p.amount)}</button>
                <button type="button" class="quick-add-delete" data-id="${p.id}" aria-label="Remove preset">x</button>
            </span>
        `).join("")
        : `<p class="empty-state">No quick-add presets yet - click "+ New" to create one (e.g. Coffee, Bus fare).</p>`;
};

// presets dont log anything by itself. user will have to click add transaction

function applyQuickAddPreset(id) {
    const preset = quickAddPresets.find (p => p.id === id);
    if(!preset) return;

    exitEditMode();
    descriptionEle.value = preset.name;
    amountEle.value = preset.amount;
    typeExpenseEle.checked = true;
    populateCategoryOptions("expense");
    categoryEle.value = preset.category;
    dateEle.valueAsDate = new Date();

    transactionFormEle.scrollIntoView({behavior:"smooth", block:"nearest"});
    amountEle.focus();
    amountEle.select();
}

renderQuickAddPills();

transactionFormEle.addEventListener("submit", handleFormSubmit);
cancelEditBtnEle.addEventListener("click", exitEditMode);

typeIncomeEle.addEventListener("change", () => populateCategoryOptions("income"));
typeExpenseEle.addEventListener("change", () => populateCategoryOptions("expense"));

transactionListEle.addEventListener("click", (e) => {
    if(e.target.classList.contains("delete-btn")) {
        const id = Number(e.target.dataset.id);
        removeTransaction(id);
    }else if (e.target.closest(".transaction")) {
        const id = Number(e.target.closest(".transaction").dataset.id);
        enterEditMode(id);
    }
});

// form handling
function handleFormSubmit(e) {
    e.preventDefault();

    // get form values 
    const description = descriptionEle.value.trim();
    const amount = parseFloat(amountEle.value);
    const category = categoryEle.value;
    const date = dateEle.value;
    const type = document.querySelector('input[name = "type"]:checked').value;

    if (editingId === null) {
        transactions.push({id : Date.now(), description, amount, type, category, date});
    }else {
        transactions = transactions.map(t => t.id === editingId ? {...t, description, amount, type, category, date} : t);
    }

    saveAndRender();
    exitEditMode(); 
    // console.log(typeof amount);
}

function enterEditMode(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    editingId = id;
    descriptionEle.value = transaction.description;
    amountEle.value = transaction.amount;
    dateEle.value = transaction.date;
    (transaction.type === "income" ? typeIncomeEle : typeExpenseEle).checked = true;
    populateCategoryOptions(transaction.type);
    categoryEle.value = transaction.category;

    formTitleEle.textContent = "Edit Transaction";
    submitBtnEle.textContent = "Update Transaction";
    cancelEditBtnEle.hidden = false;

    transactionFormEle.scrollIntoView({behavior: "smooth", block:"nearest"})
}

function exitEditMode() {
    editingId = null;
    transactionFormEle.reset();
    dateEle.valueAsDate = new Date();
    typeExpenseEle.checked = true;
    populateCategoryOptions("expense");

    formTitleEle.textContent = "Add Transaction";
    submitBtnEle.textContent = "Add Transaction";
    cancelEditBtnEle.hidden = true;
}

function populateCategoryOptions(type) {
    const options = getCategoryOptions(type);
    categoryEle.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join("");
}

function saveAndRender() {
    saveTransactions(transactions);
    updateTransactionList();
    updateSummary();
    updateSafeToSpendBanner();
}

function updateTransactionList() {
    transactionListEle.innerHTML = "";

    const sortedTransactions = [...transactions].reverse();

    sortedTransactions.forEach((transaction) => {
        transactionListEle.appendChild(createTransactionElement(transaction));    
    });
}

function createTransactionElement(transaction) {
    const listItem = document.createElement("li");
    listItem.classList.add("transaction", transaction.type);
    listItem.dataset.id = transaction.id;
    
    const sign = transaction.type === "income" ? "+" : "-";

    listItem.innerHTML = `
    <span class = "transaction-info">
        <span class = "transaction-desc">${transaction.description}</span>
        <span class = "transaction-meta">${transaction.category} ${transaction.date} </span>
    </span>
    <span class = "transaction-amount-group">
        <span class = "transaction-amount">${sign} ${formatCurrency(transaction.amount)}</span>
        <button class = "delete-btn" data-id="${transaction.id}" aria-label="Delete transaction">x</button>
    </span>
    `;

    return listItem;
}

function updateSummary() {
    const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
    .filter(transaction => transaction.type === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

    const balance = income - expense;

    balanceEle.textContent = formatCurrency(balance);
    incomeAmountEle.textContent = formatCurrency(income);
    expenseAmountEle.textContent = formatCurrency(expense);
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    
    if (editingId === id) exitEditMode();
    saveAndRender();
}

// safe to spend banner 

function updateSafeToSpendBanner() {
    const s = computeSafeToSpend();

    safeToSpendAmountEle.textContent = formatCurrency(s.remainingSafeToSpend);
    dailyAllowanceEle.textContent = `${formatCurrency(s.dailyAllowance)}/ day * ${s.daysLeft} days left`;

    safeToSpendBarEle.style.width = `${s.percentUsed}%`;

    safeToSpendCardEle.classList.remove("status-ok", "status-warning", "status-danger");
    if (s.remainingSafeToSpend < 0) {
        safeToSpendCardEle.classList.add("status-danger");
    } else if (s.percentUsed >= 85) {
        safeToSpendCardEle.classList.add("status-warning");
    } else {
        safeToSpendCardEle.classList.add("status-ok");
    }
}

// initial render 
updateTransactionList();
updateSummary();
updateSafeToSpendBanner();