// Transactions management functionality

function updateTransactionsList(searchTerm = "") {
  const transactionsContainer = document.getElementById("transactionsList");
  if (!transactionsContainer) return;

  transactionsContainer.innerHTML = "";
  const monthFilter =
    document.getElementById("transactionMonthFilter")?.value || "all";
  const typeFilter =
    document.getElementById("transactionTypeFilter")?.value || "all";
  const memberFilter =
    document.getElementById("transactionMemberFilter")?.value || "all";

  let filteredTransactions = transactions.filter((transaction) => {
    const matchesMonth =
      monthFilter === "all" || transaction.month === monthFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesMember =
      memberFilter === "all" || transaction.memberId === parseInt(memberFilter);
    const matchesSearch =
      !searchTerm ||
      transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMemberById(transaction.memberId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesMonth && matchesType && matchesMember && matchesSearch;
  });

  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!filteredTransactions.length) {
    transactionsContainer.innerHTML = "<p>No transactions found.</p>";
    return;
  }

  filteredTransactions.forEach((transaction) => {
    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";
    const memberName = getMemberById(transaction.memberId)?.name || "Unknown";
    const monthName =
      getMonthByValue(transaction.month)?.name || transaction.month;

    const { typeText, typeClass } = {
      payment: { typeText: "Payment", typeClass: "positive" },
      expense: { typeText: "Expense", typeClass: "negative" },
      deposit: { typeText: "Deposit", typeClass: "positive" },
    }[transaction.type] || { typeText: transaction.type, typeClass: "neutral" };

    transactionItem.innerHTML = `
            <div>
                <div class="transaction-member">${memberName}</div>
                <div class="transaction-date">${formatDate(
                  transaction.date
                )} | ${monthName}</div>
                ${
                  transaction.note
                    ? `<div><small>Note: ${transaction.note}</small></div>`
                    : ""
                }
                ${
                  transaction.billIds?.length
                    ? `<div><small>Bills: ${transaction.billIds
                        .map(
                          (id) =>
                            bills.find((b) => b.id === id)?.name || "Unknown"
                        )
                        .join(", ")}</small></div>`
                    : ""
                }
            </div>
            <div>
                <div class="${typeClass}">${typeText}</div>
                <div class="transaction-amount">${transaction.amount.toFixed(
                  1
                )} USD</div>
            </div>
        `;
    transactionItem.addEventListener("click", () =>
      editTransaction(transaction.id)
    );
    transactionsContainer.appendChild(transactionItem);
  });
}

function editTransaction(transactionId) {
  const transaction = transactions.find((t) => t.id === transactionId);
  if (!transaction) return;

  const editModal = document.createElement("div");
  editModal.className = "modal";
  editModal.innerHTML = `
        <div class="modal-content">
            <span class="close">×</span>
            <h2>Edit Transaction</h2>
            <form id="editTransactionForm">
                <div class="form-group">
                    <label for="editTransactionType">Type</label>
                    <select id="editTransactionType">
                        <option value="payment" ${
                          transaction.type === "payment" ? "selected" : ""
                        }>Payment</option>
                        <option value="expense" ${
                          transaction.type === "expense" ? "selected" : ""
                        }>Expense</option>
                        <option value="deposit" ${
                          transaction.type === "deposit" ? "selected" : ""
                        }>Deposit</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editTransactionMember">Member</label>
                    <select id="editTransactionMember">
                        ${members
                          .map(
                            (member) => `
                            <option value="${member.id}" ${
                              transaction.memberId === member.id
                                ? "selected"
                                : ""
                            }>
                                ${member.name}
                            </option>
                        `
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="editTransactionAmount">Amount (USD)</label>
                    <input type="number" id="editTransactionAmount" value="${
                      transaction.amount
                    }" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="editTransactionDate">Date</label>
                    <input type="date" id="editTransactionDate" value="${
                      transaction.date
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editTransactionNote">Note</label>
                    <textarea id="editTransactionNote">${
                      transaction.note || ""
                    }</textarea>
                </div>
                <div class="form-group">
                    <label>Related Bills</label>
                    <div id="editTransactionBills"></div>
                </div>
                <button type="submit" class="btn btn-primary">Update Transaction</button>
            </form>
        </div>
    `;

  document.body.appendChild(editModal);
  editModal.style.display = "block";

  const billCheckboxes = document.getElementById("editTransactionBills");
  bills
    .filter((b) => b.month === transaction.month)
    .forEach((bill) => {
      const div = document.createElement("div");
      div.innerHTML = `
            <label>
                <input type="checkbox" name="editTransactionBills" value="${
                  bill.id
                }" 
                    ${
                      transaction.billIds?.includes(bill.id) ? "checked" : ""
                    }> ${bill.name}
            </label>
        `;
      billCheckboxes.appendChild(div);
    });

  editModal
    .querySelector("#editTransactionForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const selectedBills = Array.from(
        document.querySelectorAll('input[name="editTransactionBills"]:checked')
      ).map((checkbox) => parseInt(checkbox.value));

      const index = transactions.findIndex((t) => t.id === transactionId);
      if (index !== -1) {
        transactions[index] = {
          ...transactions[index],
          type: document.getElementById("editTransactionType").value,
          memberId: parseInt(
            document.getElementById("editTransactionMember").value
          ),
          amount: parseFloat(
            document.getElementById("editTransactionAmount").value
          ),
          date: document.getElementById("editTransactionDate").value,
          note: document.getElementById("editTransactionNote").value,
          billIds: selectedBills,
        };

        if (
          transactions[index].type === "payment" &&
          selectedBills.length &&
          !transactions[index].billIds.length
        ) {
          selectedBills.forEach((billId) => {
            const bill = bills.find((b) => b.id === billId);
            if (bill) {
              bill.paidBy.push({
                memberId: transactions[index].memberId,
                date: transactions[index].date,
                amount: transactions[index].amount / selectedBills.length,
              });
              if (
                bill.paidBy.reduce((sum, p) => sum + p.amount, 0) >= bill.amount
              ) {
                bill.paidStatus = true;
              }
            }
          });
        }

        saveData();
        updateMemberMonthDetails();
        updateTransactionsList();
        updateBillsList();
        updateDashboard();
        document.body.removeChild(editModal);
        alert("Transaction updated successfully.");
      }
    });

  editModal.querySelector(".close").addEventListener("click", () => {
    document.body.removeChild(editModal);
  });
}

function updateTransactionMemberFilter() {
  const memberFilter = document.getElementById("transactionMemberFilter");
  if (!memberFilter) return;

  memberFilter.innerHTML = '<option value="all">All Members</option>';
  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    memberFilter.appendChild(option);
  });

  const transactionMember = document.getElementById("transactionMember");
  if (transactionMember) {
    transactionMember.innerHTML = '<option value="">Select a member</option>';
    members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.name;
      transactionMember.appendChild(option);
    });
  }
}

// Initialize transaction filters and forms
document.addEventListener("DOMContentLoaded", function () {
  // Transaction filters
  document
    .getElementById("transactionMonthFilter")
    ?.addEventListener("change", updateTransactionsList);
  document
    .getElementById("transactionTypeFilter")
    ?.addEventListener("change", updateTransactionsList);
  document
    .getElementById("transactionMemberFilter")
    ?.addEventListener("change", updateTransactionsList);

  // Transaction type change handler
  document
    .getElementById("transactionType")
    ?.addEventListener("change", function () {
      const relatedBillsContainer = document.getElementById(
        "relatedBillsContainer"
      );
      if (relatedBillsContainer) {
        relatedBillsContainer.style.display =
          this.value === "payment" ? "block" : "none";
      }
    });

  // Add transaction form submission
  document
    .getElementById("addTransactionForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();
      const selectedBills = Array.from(
        document.querySelectorAll('input[name="transactionBills"]:checked')
      ).map((checkbox) => parseInt(checkbox.value));

      const newTransaction = {
        id: Date.now(),
        type: document.getElementById("transactionType")?.value,
        memberId: parseInt(document.getElementById("transactionMember")?.value),
        amount: parseFloat(document.getElementById("transactionAmount")?.value),
        date: document.getElementById("transactionDate")?.value,
        note: document.getElementById("transactionNote")?.value,
        month: currentMonth,
        billIds: selectedBills,
      };

      transactions.push(newTransaction);
      // Update bill paid status if payment
      if (newTransaction.type === "payment" && selectedBills.length) {
        selectedBills.forEach((billId) => {
          const bill = bills.find((b) => b.id === billId);
          if (bill) {
            bill.paidBy.push({
              memberId: newTransaction.memberId,
              date: newTransaction.date,
              amount: newTransaction.amount / selectedBills.length,
            });
            if (
              bill.paidBy.reduce((sum, p) => sum + p.amount, 0) >= bill.amount
            ) {
              bill.paidStatus = true;
            }
          }
        });
      }
      saveData();
      updateMemberMonthDetails();
      updateTransactionsList();
      updateBillsList();
      updateDashboard();
      this.reset();
      document.getElementById("transactionType").value = "payment";
      document.getElementById("transactionMember").value = "";
      alert("Transaction added successfully.");
    });
});
