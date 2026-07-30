const balanceEle = document.getElementById("balance");
const incomeAmountEle = document.getElementById("income-amount");
const expenseAmountEle = document.getElementById("expense-amount");
const transactionListEle = document.getElementById("transaction-list");
const transactionFormEle = document.getElementById("transaction-form");
const descriptionEle = document.getElementById("description");
const amountEle = document.getElementById("amount");


let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

transactionFormEle.addEventListener("submit", addTransaction);

function addTransaction(e){
    // to prevent refreshing the page when the form is submitted
    e.preventDefault();

    // get form values 
    const description = descriptionEle.value.trim();
    const amount = parseFloat(amountEle.value);
    // console.log(typeof amount);

    transactions.push(
        {
            id: Date.now(),
            description,
            amount
        }
    );

    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateTransactionList();
    updateSummary();

    transactionFormEle.reset();
}

function updateTransactionList(){
    transactionListEle.innerHTML = "";

    // WHAT DOES THIS MEAN [...transactions] ? it means we are creating a new array with the same elements as the transactions array. This is done to avoid mutating the original transactions array when we reverse it.
    const sortedTransactions = [...transactions].reverse();

    sortedTransactions.forEach((transaction) => {
        const transactionEle = createTransactionElement(transaction);

        // WHAT DOES APPENDCHILD DO?
        transactionListEle.appendChild(transactionEle);
    })
}

function createTransactionElement(transaction){
    const listItem = document.createElement("li");
    listItem.classList.add("transaction");

    listItem.classList.add(transaction.amount > 0 ? "income" : "expense");

    
    listItem.innerHTML = `
    <span>${transaction.description}</span>
    <span>
        ${formatCurrency(transaction.amount)}
        <button class = "delete-btn" onclick = "removeTransaction(${transaction.id})">x</button> 
    </span>
    `

    return listItem;
}

function updateSummary(){
    // WHAT DOES REDUCE DO? IT IS A METHOD THAT TAKES AN ARRAY AND REDUCES IT TO A SINGLE VALUE. IN THIS CASE, WE ARE USING IT TO CALCULATE THE BALANCE BY SUMMING UP ALL THE TRANSACTION AMOUNTS.
    // 100, -50, 200, -200 => 0+ 100 -50 + 200 - 200 = 50 <-- output 
    const balance = transactions.reduce((acc, transaction)=> acc+transaction.amount, 0);

    const income = transactions
    .filter(transaction => transaction.amount >0)
    .reduce((acc, transaction) => acc+transaction.amount ,0);

    const expense = transactions
    .filter(transaction => transaction.amount <0)
    .reduce((acc, transaction) => acc+transaction.amount ,0);

    balanceEle.textContent = formatCurrency(balance);
    incomeAmountEle.textContent = formatCurrency(income);
    expenseAmountEle.textContent = formatCurrency(expense);
}

function formatCurrency(number){
    return new Intl.NumberFormat("hi-IN", {
        style:"currency",
        currency: "INR",
    }).format(number);
}

function removeTransaction(id){
    // filter out the once we want to delete 
    transactions = transactions.filter(transaction => transaction.id!== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateTransactionList();
    updateSummary();
}
// initial render 
updateTransactionList();
updateSummary();

