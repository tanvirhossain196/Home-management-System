// Dashboard functionality

// Update dashboard elements
function updateDashboard() {
  updateMemberStatusList();
  updateRecentTransactions();
  updateUpcomingBills();
  updateDashboardStats();
}

function updateDashboardStats() {
  // Calculate totals across all members and their bills
  let totalBillsAmount = 0;
  let totalPaidAmount = 0;
  let totalOutstandingAmount = 0;

  members.forEach((member) => {
    const memberBills = bills.filter((b) => b.memberIds.includes(member.id));
    const memberTransactions = transactions.filter(
      (t) => t.memberId === member.id && t.type === "payment"
    );

    // Total bills for this member
    const memberTotalBills = memberBills.reduce((sum, b) => {
      // Calculate member's share (assuming equal split for simplicity)
      const memberShare = b.amount / b.memberIds.length;
      return sum + memberShare;
    }, 0);

    // Total paid by this member
    const memberPaid = memberTransactions.reduce((sum, t) => sum + t.amount, 0);

    totalBillsAmount += memberTotalBills;
    totalPaidAmount += memberPaid;
    totalOutstandingAmount += memberTotalBills - memberPaid;
  });

  const activeMembers = members.length;

  // Update DOM elements
  document.getElementById("totalBillsAmount").textContent =
    totalBillsAmount.toFixed(2) + " USD";
  document.getElementById("totalPaidAmount").textContent =
    totalPaidAmount.toFixed(2) + " USD";
  document.getElementById("outstandingAmount").textContent =
    totalOutstandingAmount.toFixed(2) + " USD";
  document.getElementById("activeMembers").textContent = activeMembers;

  // Update charts
  updateExpenseChart();
  updateContributionChart();
}

function updateExpenseChart() {
  const ctx = document.getElementById("expensesChart")?.getContext("2d");
  if (!ctx) return;

  const categories = [...new Set(bills.map((b) => b.category))];
  const data = categories.map((cat) =>
    bills
      .filter((b) => b.category === cat)
      .reduce((sum, b) => sum + b.amount, 0)
  );

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories.map(
        (cat) =>
          settings.customCategories.find((c) => c.id === cat)?.name ||
          cat.charAt(0).toUpperCase() + cat.slice(1)
      ),
      datasets: [
        {
          data,
          backgroundColor: [
            "#3498db",
            "#2ecc71",
            "#e67e22",
            "#9b59b6",
            "#e74c3c",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function updateContributionChart() {
  const ctx = document
    .getElementById("memberContributionChart")
    ?.getContext("2d");
  if (!ctx) return;

  const data = members.map((member) =>
    transactions
      .filter((t) => t.memberId === member.id && t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: members.map((m) => m.name),
      datasets: [
        {
          label: "Contributions (USD)",
          data,
          backgroundColor: "#3498db",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function updateMemberStatusList() {
  const statusListContainer = document.getElementById("memberStatusList");
  if (!statusListContainer) return;

  statusListContainer.innerHTML = `
        <h3>Member Balances</h3>
        <div class="balance-summary">
            ${members
              .map((member) => {
                const balance = calculateMemberBalance(member.id);
                const dues = calculateMemberDues(member.id);
                return `
                    <div class="member-card" style="cursor: pointer; margin-bottom: 10px; padding: 10px; border-radius: 8px; background: #f9f9f9;">
                        <div class="flex-between">
                            <div>
                                <strong>${member.name}</strong>
                                <span class="badge badge-info">${
                                  member.room || "N/A"
                                }</span>
                            </div>
                            <div>
                                <div class="${
                                  balance >= 0 ? "positive" : "negative"
                                }">
                                    Balance: ${balance.toFixed(2)} USD
                                </div>
                                <div class="${
                                  dues <= 0 ? "positive" : "negative"
                                }">
                                    Due: ${dues.toFixed(2)} USD
                                </div>
                            </div>
                        </div>
                    </div>
                `;
              })
              .join("")}
        </div>
    `;

  statusListContainer
    .querySelectorAll(".member-card")
    .forEach((card, index) => {
      card.addEventListener("click", () =>
        showMemberDetails(members[index].id)
      );
    });
}

function calculateMemberBalance(memberId) {
  const memberBills = bills.filter((b) => b.memberIds.includes(memberId));
  const memberPayments = transactions.filter(
    (t) => t.memberId === memberId && t.type === "payment"
  );

  const totalOwed = memberBills.reduce((sum, b) => {
    return sum + b.amount / b.memberIds.length;
  }, 0);

  const totalPaid = memberPayments.reduce((sum, t) => sum + t.amount, 0);
  return totalPaid - totalOwed;
}

function calculateMemberDues(memberId) {
  const memberBills = bills.filter(
    (b) => b.memberIds.includes(memberId) && !b.paidStatus
  );
  return memberBills.reduce((sum, b) => {
    return sum + b.amount / b.memberIds.length;
  }, 0);
}

function updateRecentTransactions() {
  const transactionsContainer = document.getElementById("recentTransactions");
  if (!transactionsContainer) return;

  transactionsContainer.innerHTML = "";
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (!recentTransactions.length) {
    transactionsContainer.innerHTML = "<p>No transactions available.</p>";
    return;
  }

  recentTransactions.forEach((transaction) => {
    const member = getMemberById(transaction.memberId);
    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";
    const { typeText, typeClass } = {
      payment: { typeText: "Payment", typeClass: "positive" },
      expense: { typeText: "Expense", typeClass: "negative" },
      deposit: { typeText: "Deposit", typeClass: "positive" },
    }[transaction.type] || { typeText: transaction.type, typeClass: "neutral" };

    transactionItem.innerHTML = `
            <div>
                <div class="transaction-member">${
                  member?.name || "Unknown"
                }</div>
                <div class="transaction-date">${formatDate(
                  transaction.date
                )}</div>
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
                <span class="${typeClass}">${typeText}</span>: 
                <span class="transaction-amount">${transaction.amount.toFixed(
                  2
                )} USD</span>
            </div>
        `;
    transactionsContainer.appendChild(transactionItem);
  });
}

function updateUpcomingBills() {
  const upcomingBillsContainer = document.getElementById("upcomingBills");
  if (!upcomingBillsContainer) return;

  upcomingBillsContainer.innerHTML = "";
  const upcomingBills = bills
    .filter((bill) => !bill.paidStatus)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (!upcomingBills.length) {
    upcomingBillsContainer.innerHTML = "<p>No upcoming bills.</p>";
    return;
  }

  upcomingBills.forEach((bill) => {
    const billItem = document.createElement("div");
    billItem.className = "transaction-item";
    const affectedMembers = bill.memberIds
      .map((id) => getMemberById(id)?.name || "Unknown")
      .join(", ");
    billItem.innerHTML = `
            <div>
                <div class="transaction-member">${bill.name}</div>
                <div class="transaction-date">${formatDate(bill.date)}</div>
                <div><small>Members: ${affectedMembers}</small></div>
                <div><small>Due: ${
                  bill.dueDate ? formatDate(bill.dueDate) : "N/A"
                }</small></div>
            </div>
            <div>
                <div class="transaction-amount">${bill.amount.toFixed(
                  2
                )} USD</div>
                <div class="status-badge pending">Pending</div>
            </div>
        `;
    billItem.addEventListener("click", () => editBill(bill.id));
    upcomingBillsContainer.appendChild(billItem);
  });
}

// Initialize dashboard buttons
document.addEventListener("DOMContentLoaded", function () {
  // Quick add buttons for dashboard
  document
    .getElementById("quickAddBillBtn")
    ?.addEventListener("click", function () {
      document.getElementById("quickAddBillModal").style.display = "block";
    });

  document
    .getElementById("quickAddMemberBtn")
    ?.addEventListener("click", function () {
      document.querySelector('.tab-button[data-tab="members"]').click();
      document.getElementById("memberName")?.focus();
    });

  document
    .getElementById("quickAddTransactionBtn")
    ?.addEventListener("click", function () {
      document.querySelector('.tab-button[data-tab="transactions"]').click();
      document.getElementById("transactionAmount")?.focus();
    });

  // View all buttons
  document
    .getElementById("viewAllTransactions")
    ?.addEventListener("click", function () {
      document.querySelector('.tab-button[data-tab="transactions"]').click();
    });

  document
    .getElementById("viewAllBills")
    ?.addEventListener("click", function () {
      document.querySelector('.tab-button[data-tab="bills"]').click();
    });

  // Dashboard tab click handler
  document
    .querySelector('.tab-button[data-tab="dashboard"]')
    .addEventListener("click", function () {
      // Hide other tabs
      document.querySelectorAll(".main-content").forEach((tab) => {
        tab.style.display = "none";
      });

      // Show dashboard
      const dashboardTab = document.getElementById("dashboardTab");
      dashboardTab.style.display = "flex";

      // Remove and re-add active class
      document.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.remove("active");
      });
      this.classList.add("active");

      // Update all dashboard elements
      updateDashboard();
    });
});

// Initialize dashboard on load
document.addEventListener("DOMContentLoaded", function () {
  updateDashboard();
  document.getElementById("dashboardTab").style.display = "flex";
});
