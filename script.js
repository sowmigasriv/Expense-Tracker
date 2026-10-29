const balanceEl = document.querySelector(".balance-amount");
const incomeAmountEl = document.querySelector(".income-amount");
const expenseAmountEl = document.querySelector(".expense-amount");

const transactionListEl = document.querySelector("#transaction-list");
const transactionFormEl = document.querySelector("#transaction-form");
const descriptionEl = document.querySelector("#description");
const amountEl = document.querySelector("#amount");
const resetBtn = document.querySelector("#reset-btn");

let transactions = [];

try {
    const savedTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
    );

    if (Array.isArray(savedTransactions)) {
        transactions = savedTransactions.filter(
            (transaction) =>
                transaction &&
                typeof transaction.description === "string" &&
                Number.isFinite(transaction.amount) &&
                Number.isFinite(transaction.id)
        );
    }
} catch (error) {
    transactions = [];
}

function formatCurrency(number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

// Save Transactions
function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

// Add Transaction
transactionFormEl.addEventListener("submit", addTransactions);

function addTransactions(event) {
    event.preventDefault();

    const description = descriptionEl.value.trim();
    const amountText = amountEl.value.trim();
    const amount = Number(amountText);

    if (
        description === "" ||
        amountText === "" ||
        !Number.isFinite(amount) ||
        amount === 0
    ) {
        alert("Please enter a description and a valid non-zero amount.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount
    };

    transactions.push(transaction);

    saveTransactions();
    updateTransactionList();
    updateSummary();

    transactionFormEl.reset();
}

// Display Transactions
function updateTransactionList() {
    transactionListEl.replaceChildren();

    const sortedTransactions = [...transactions].reverse();

    sortedTransactions.forEach((transaction) => {
        const transactionEl = createTransactionElement(transaction);
        transactionListEl.appendChild(transactionEl);
    });
}

// Create One Transaction Item
function createTransactionElement(transaction) {
    const li = document.createElement("li");

    li.classList.add("transaction");
    li.classList.add(
        transaction.amount > 0 ? "income" : "expense"
    );

    const details = document.createElement("div");
    details.classList.add("transaction-details");

    const description = document.createElement("span");
    description.classList.add("transaction-description");
    description.textContent = transaction.description;

    const amount = document.createElement("span");
    amount.classList.add("transaction-amount");
    amount.textContent = formatCurrency(transaction.amount);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "X";
    deleteBtn.setAttribute(
        "aria-label",
        "Delete " + transaction.description
    );

    deleteBtn.addEventListener("click", function () {
        removeTransaction(transaction.id);
    });

    details.appendChild(description);
    details.appendChild(amount);

    li.appendChild(details);
    li.appendChild(deleteBtn);

    return li;
}

// Update Balance, Income and Expense
function updateSummary() {
    const balance = transactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
    );

    const income = transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce(
            (total, transaction) => total + transaction.amount,
            0
        );

    const expenses = transactions
        .filter((transaction) => transaction.amount < 0)
        .reduce(
            (total, transaction) => total + Math.abs(transaction.amount),
            0
        );

    balanceEl.textContent = formatCurrency(balance);
    incomeAmountEl.textContent = formatCurrency(income);
    expenseAmountEl.textContent = formatCurrency(expenses);
}

// Delete Individual Transaction
function removeTransaction(id) {
    transactions = transactions.filter(
        (transaction) => transaction.id !== id
    );

    saveTransactions();
    updateTransactionList();
    updateSummary();
}

// Reset All Transactions
resetBtn.addEventListener("click", resetTransactions);

function resetTransactions() {
    if (transactions.length === 0) {
        alert("There are no transactions to reset!");
        return;
    }

    const confirmReset = confirm(
        "Are you sure you want to delete ALL transactions?"
    );

    if (confirmReset) {
        transactions = [];

        localStorage.removeItem("transactions");

        updateTransactionList();
        updateSummary();

        alert("All transactions have been reset!");
    }
}

// Initial Display
updateTransactionList();
updateSummary();