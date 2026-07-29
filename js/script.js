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
    // updateSummary();

    transactionFormEle.reset();
}

function updateTransactionList(){
    transactionListEle.innerHTML = "";

    // WHAT DOES THIS MEAN [...transactions] ?
    const sortedTransactions = [...transactions].reverse();

    // will give us the WHAT
    sortedTransactions.forEach((transaction) => {
        const transactionEle = createTransactionElement(transaction);

        // WHAT DOES APPENDCHILD DO?
        transactionListEle.appendChild(transactionEle);
    })
}

function createTransactionElement(transaction){
    const listItem = document.createElement("li");
    listItem.classList.add("transaction");
    // how does the code know to colour it in green or red based on what we are sending here in income and expenses ?
    listItem.classList.add(transaction.amount > 0 ? "income" : "expense");

    // TODO:update the amount formating 
    listItem.innerHTML = `
    <span>${transaction.description}</span>
    <span>
        ${transaction.amount}
        <button class = "delete-btn" onclick = "removeTransaction(${transaction.id})">x</button> 
    </span>
    `

    return listItem;
}