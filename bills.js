// Bills management functionality

function updateBillsList(searchTerm = "") {
  const billsContainer = document.getElementById("billsList");
  if (!billsContainer) return;

  billsContainer.innerHTML = "";
  const monthFilter =
    document.getElementById("billMonthFilter")?.value || "all";
  const categoryFilter =
    document
      .querySelector(".category-item.active")
      ?.getAttribute("data-category") || "all";

  let filteredBills = bills.filter((bill) => {
    const matchesMonth = monthFilter === "all" || bill.month === monthFilter;
    const matchesCategory =
      categoryFilter === "all" || bill.category === categoryFilter;
    const matchesSearch =
      !searchTerm ||
      bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.note?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesCategory && matchesSearch;
  });

  filteredBills.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!filteredBills.length) {
    billsContainer.innerHTML = "<p>No bills found.</p>";
    return;
  }

  filteredBills.forEach((bill) => {
    const billItem = document.createElement("div");
    billItem.className = "transaction-item";
    const affectedMembers = bill.memberIds
      .map((id) => getMemberById(id)?.name || "Unknown")
      .join(", ");
    const monthName = getMonthByValue(bill.month)?.name || bill.month;

    billItem.innerHTML = `
            <div>
                <div class="transaction-member">${bill.name}</div>
                <div class="transaction-date">${formatDate(
                  bill.date
                )} | ${monthName}</div>
                <div><small>Members: ${affectedMembers}</small></div>
                ${
                  bill.note
                    ? `<div><small>Note: ${bill.note}</small></div>`
                    : ""
                }
                <div><small>Due Date: ${
                  bill.dueDate ? formatDate(bill.dueDate) : "N/A"
                }</small></div>
                <div><small>Paid: ${
                  bill.paidBy.length
                    ? bill.paidBy
                        .map(
                          (p) =>
                            `${
                              getMemberById(p.memberId)?.name
                            }: ${p.amount.toFixed(1)} USD on ${formatDate(
                              p.date
                            )}`
                        )
                        .join(", ")
                    : "Not paid"
                }</small></div>
            </div>
            <div>
                <div class="transaction-amount">${bill.amount.toFixed(
                  1
                )} USD</div>
                <div class="status-badge ${
                  bill.paidStatus ? "paid" : "pending"
                }">
                    ${bill.paidStatus ? "Paid" : "Pending"}
                </div>
            </div>
        `;
    billItem.addEventListener("click", () => editBill(bill.id));
    billsContainer.appendChild(billItem);
  });
}

function editBill(billId) {
  const bill = bills.find((b) => b.id === billId);
  if (!bill) return;

  const editModal = document.createElement("div");
  editModal.className = "modal";
  editModal.innerHTML = `
        <div class="modal-content">
            <span class="close">×</span>
            <h2>Edit Bill</h2>
            <form id="editBillForm">
                <div class="form-group">
                    <label for="editBillName">Bill Name</label>
                    <input type="text" id="editBillName" value="${
                      bill.name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editBillCategory">Category</label>
                    <select id="editBillCategory">
                        <option value="rent" ${
                          bill.category === "rent" ? "selected" : ""
                        }>Rent</option>
                        <option value="utility" ${
                          bill.category === "utility" ? "selected" : ""
                        }>Utility</option>
                        <option value="meal" ${
                          bill.category === "meal" ? "selected" : ""
                        }>Meal</option>
                        <option value="service" ${
                          bill.category === "service" ? "selected" : ""
                        }>Service</option>
                        <option value="other" ${
                          bill.category === "other" ? "selected" : ""
                        }>Other</option>
                        ${settings.customCategories
                          .map(
                            (cat) =>
                              `<option value="${cat.id}" ${
                                bill.category === cat.id ? "selected" : ""
                              }>${cat.name}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="editBillAmount">Amount (USD)</label>
                    <input type="number" id="editBillAmount" value="${
                      bill.amount
                    }" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="editBillDate">Date</label>
                    <input type="date" id="editBillDate" value="${
                      bill.date
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editBillDueDate">Due Date</label>
                    <input type="date" id="editBillDueDate" value="${
                      bill.dueDate || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="editBillNote">Note</label>
                    <textarea id="editBillNote">${bill.note || ""}</textarea>
                </div>
                <div class="form-group">
                    <label>Members</label>
                    <div id="editBillMembers"></div>
                </div>
                <div class="form-group">
                    <label for="editBillDistribution">Distribution</label>
                    <select id="editBillDistribution">
                        <option value="equal" ${
                          bill.distribution === "equal" ? "selected" : ""
                        }>Equal Split</option>
                        <option value="custom" ${
                          bill.distribution === "custom" ? "selected" : ""
                        }>Custom Split</option>
                    </select>
                </div>
                <div id="editCustomDistributionContainer" ${
                  bill.distribution !== "custom" ? 'style="display: none;"' : ""
                }>
                </div>
                <div class="form-group">
                    <label for="editBillPaidStatus">Payment Status</label>
                    <select id="editBillPaidStatus">
                        <option value="false" ${
                          !bill.paidStatus ? "selected" : ""
                        }>Pending</option>
                        <option value="true" ${
                          bill.paidStatus ? "selected" : ""
                        }>Paid</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Update Bill</button>
            </form>
        </div>
    `;

  document.body.appendChild(editModal);
  editModal.style.display = "block";

  const memberCheckboxes = document.getElementById("editBillMembers");
  members.forEach((member) => {
    const div = document.createElement("div");
    div.innerHTML = `
            <label>
                <input type="checkbox" name="editBillMembers" value="${
                  member.id
                }" 
                    ${bill.memberIds.includes(member.id) ? "checked" : ""}> ${
      member.name
    }
            </label>
        `;
    memberCheckboxes.appendChild(div);
  });

  const customDistributionContainer = document.getElementById(
    "editCustomDistributionContainer"
  );
  if (bill.distribution === "custom") {
    bill.memberIds.forEach((memberId) => {
      const amount =
        bill.customDistribution?.find((d) => d.memberId === memberId)?.amount ||
        0;
      const div = document.createElement("div");
      div.className = "form-group";
      div.innerHTML = `
                <label>${getMemberById(memberId)?.name}</label>
                <input type="number" id="customAmount_${memberId}" value="${amount}" step="0.01">
            `;
      customDistributionContainer.appendChild(div);
    });
  }

  document
    .getElementById("editBillDistribution")
    ?.addEventListener("change", function () {
      customDistributionContainer.style.display =
        this.value === "custom" ? "block" : "none";
      if (this.value === "custom") {
        customDistributionContainer.innerHTML = "";
        const checkedMembers = Array.from(
          document.querySelectorAll('input[name="editBillMembers"]:checked')
        ).map((cb) => parseInt(cb.value));
        checkedMembers.forEach((memberId) => {
          const div = document.createElement("div");
          div.className = "form-group";
          div.innerHTML = `
                    <label>${getMemberById(memberId)?.name}</label>
                    <input type="number" id="customAmount_${memberId}" value="0" step="0.01">
                `;
          customDistributionContainer.appendChild(div);
        });
      }
    });

  editModal
    .querySelector("#editBillForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const selectedMembers = Array.from(
        document.querySelectorAll('input[name="editBillMembers"]:checked')
      ).map((checkbox) => parseInt(checkbox.value));

      if (!selectedMembers.length) {
        alert("Please select at least one member.");
        return;
      }

      const distribution = document.getElementById(
        "editBillDistribution"
      ).value;
      let customDistribution = null;
      if (distribution === "custom") {
        customDistribution = selectedMembers.map((memberId) => ({
          memberId,
          amount:
            parseFloat(
              document.getElementById(`customAmount_${memberId}`)?.value
            ) || 0,
        }));
      }

      const index = bills.findIndex((b) => b.id === billId);
      if (index !== -1) {
        bills[index] = {
          ...bills[index],
          name: document.getElementById("editBillName").value,
          category: document.getElementById("editBillCategory").value,
          amount: parseFloat(document.getElementById("editBillAmount").value),
          date: document.getElementById("editBillDate").value,
          dueDate: document.getElementById("editBillDueDate").value,
          note: document.getElementById("editBillNote").value,
          memberIds: selectedMembers,
          distribution,
          customDistribution,
          paidStatus:
            document.getElementById("editBillPaidStatus").value === "true",
          paidBy:
            document.getElementById("editBillPaidStatus").value === "true" &&
            !bills[index].paidBy.length
              ? [
                  {
                    memberId: selectedMembers[0],
                    date: new Date().toISOString().split("T")[0],
                    amount: parseFloat(
                      document.getElementById("editBillAmount").value
                    ),
                  },
                ]
              : bills[index].paidBy,
        };
        saveData();
        updateMemberMonthDetails();
        updateBillsList();
        updateDashboard();
        document.body.removeChild(editModal);
        alert("Bill updated successfully.");
      }
    });

  editModal.querySelector(".close").addEventListener("click", () => {
    document.body.removeChild(editModal);
  });
}

// Quick add bill functionality
function quickAddBill() {
  const billType = this.getAttribute("data-bill");
  let billName, billAmount, billCategory;

  if (billType === "custom") {
    document.querySelector('.tab-button[data-tab="bills"]')?.click();
    document.getElementById("billName")?.focus();
    document.getElementById("quickAddBillModal").style.display = "none";
    return;
  }

  switch (billType) {
    case "wifi":
      billName = "WiFi Bill";
      billAmount = settings.defaultBills.wifiBill;
      billCategory = "utility";
      break;
    case "gas":
      billName = "Gas Bill";
      billAmount = settings.defaultBills.gasBill;
      billCategory = "utility";
      break;
    case "waste":
      billName = "Waste Bill";
      billAmount = settings.defaultBills.wasteBill;
      billCategory = "utility";
      break;
    case "electricity":
      billName = "Electricity Bill";
      billAmount = settings.defaultBills.electricityBill;
      billCategory = "utility";
      break;
    case "maid":
      billName = "Maid Bill";
      billAmount = settings.defaultBills.maidBill;
      billCategory = "service";
      break;
    case "camera":
      billName = "Camera Bill";
      billAmount = settings.defaultBills.camera;
      billCategory = "utility";
      break;
    default:
      const customCat = settings.customCategories.find(
        (cat) => cat.id === billType
      );
      if (customCat) {
        billName = customCat.name;
        billAmount = settings.defaultBills[billType] || 0;
        billCategory = billType;
      }
  }

  const newBill = {
    id: Date.now(),
    name: billName,
    category: billCategory,
    month: currentMonth,
    amount: billAmount,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    note: "",
    memberIds: members.map((m) => m.id),
    distribution: "equal",
    customDistribution: null,
    paidStatus: false,
    paidBy: [],
  };

  bills.push(newBill);
  saveData();
  updateMemberMonthDetails();
  updateBillsList();
  updateDashboard();
  document.getElementById("quickAddBillModal").style.display = "none";
  alert("Bill added successfully.");
}

function updateQuickAddBillModal() {
  const quickAddBillModal = document.getElementById("quickAddBillModal");
  if (!quickAddBillModal) return;

  const billItemsContainer = quickAddBillModal.querySelector(
    ".quick-bill-container"
  );
  if (!billItemsContainer) return;

  billItemsContainer.innerHTML = `
        <div class="quick-bill-item" data-bill="wifi">
            <div class="quick-bill-icon"><i class="fas fa-wifi"></i></div>
            <div class="quick-bill-info">
                <h3>WiFi Bill</h3>
                <p>${settings.defaultBills.wifiBill.toFixed(2)}</p>
            </div>
        </div>
        <div class="quick-bill-item" data-bill="gas">
            <div class="quick-bill-icon"><i class="fas fa-fire"></i></div>
            <div class="quick-bill-info">
                <h3>Gas Bill</h3>
                <p>${settings.defaultBills.gasBill.toFixed(2)}</p>
            </div>
        </div>
        <div class="quick-bill-item" data-bill="waste">
            <div class="quick-bill-icon"><i class="fas fa-trash"></i></div>
            <div class="quick-bill-info">
                <h3>Waste Bill</h3>
                <p>${settings.defaultBills.wasteBill.toFixed(2)}</p>
            </div>
        </div>
        <div class="quick-bill-item" data-bill="electricity">
            <div class="quick-bill-icon"><i class="fas fa-bolt"></i></div>
            <div class="quick-bill-info">
                <h3>Electricity Bill</h3>
                <p>${settings.defaultBills.electricityBill.toFixed(2)}</p>
            </div>
        </div>
        <div class="quick-bill-item" data-bill="maid">
            <div class="quick-bill-icon"><i class="fas fa-broom"></i></div>
            <div class="quick-bill-info">
                <h3>Maid Bill</h3>
                <p>${settings.defaultBills.maidBill.toFixed(2)}</p>
            </div>
        </div>
        <div class="quick-bill-item" data-bill="camera">
            <div class="quick-bill-icon"><i class="fas fa-camera"></i></div>
            <div class="quick-bill-info">
                <h3>Camera Bill</h3>
                <p>${settings.defaultBills.camera.toFixed(2)}</p>
            </div>
        </div>
        ${settings.customCategories
          .map(
            (cat) => `
            <div class="quick-bill-item" data-bill="${cat.id}">
                <div class="quick-bill-icon"><i class="fas fa-tag"></i></div>
                <div class="quick-bill-info">
                    <h3>${cat.name}</h3>
                    <p>${
                      settings.defaultBills[cat.id]?.toFixed(2) || "0.00"
                    }</p>
                </div>
            </div>
        `
          )
          .join("")}
        <div class="quick-bill-item" data-bill="custom">
            <div class="quick-bill-icon"><i class="fas fa-plus"></i></div>
            <div class="quick-bill-info">
                <h3>Custom Bill</h3>
                <p>Create New</p>
            </div>
        </div>
    `;

  billItemsContainer
    .querySelectorAll(".quick-bill-item")
    .forEach((item) => item.addEventListener("click", quickAddBill));
}

// Initialize bills functionality
document.addEventListener("DOMContentLoaded", function () {
  // Bill category selection
  document.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      document.querySelectorAll(".category-item").forEach((i) => {
        i.classList.remove("active");
      });

      // Add active class to clicked item
      this.classList.add("active");

      // Update bills list
      updateBillsList();
    });
  });

  // Bill month filter
  document
    .getElementById("billMonthFilter")
    ?.addEventListener("change", function () {
      updateBillsList();
    });

  // Add bill form submission
  document
    .getElementById("addBillForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      // Get selected members
      const selectedMembers = Array.from(
        document.querySelectorAll('input[name="billMembers"]:checked')
      ).map((checkbox) => parseInt(checkbox.value));

      if (selectedMembers.length === 0) {
        alert("Please select at least one member.");
        return;
      }

      const distribution = document.getElementById("billDistribution").value;
      let customDistribution = null;

      if (distribution === "custom") {
        customDistribution = selectedMembers.map((memberId) => ({
          memberId,
          amount:
            parseFloat(
              document.getElementById(`customAmount_${memberId}`)?.value
            ) || 0,
        }));
      }

      const newBill = {
        id: Date.now(),
        name: document.getElementById("billName").value,
        category: document.getElementById("billCategory").value,
        month: currentMonth,
        amount: parseFloat(document.getElementById("billAmount").value),
        date: document.getElementById("billDate").value,
        dueDate: document.getElementById("billDueDate").value,
        note: document.getElementById("billNote").value,
        memberIds: selectedMembers,
        distribution: distribution,
        customDistribution: customDistribution,
        paidStatus: false,
        paidBy: [],
      };

      bills.push(newBill);
      saveData();
      updateMemberMonthDetails();
      updateBillsList();
      updateDashboard();

      // Reset form
      this.reset();

      // Restore default values
      document.getElementById("billCategory").value = "";
      updateMemberCheckboxes();

      // Show success message
      alert("Bill added successfully.");
    });

  // Bill distribution selection
  document
    .getElementById("billDistribution")
    ?.addEventListener("change", function () {
      const customDistributionContainer = document.getElementById(
        "customDistributionContainer"
      );
      if (!customDistributionContainer) return;

      customDistributionContainer.style.display =
        this.value === "custom" ? "block" : "none";
      if (this.value === "custom") {
        customDistributionContainer.innerHTML = "";
        const selectedMembers = Array.from(
          document.querySelectorAll('input[name="billMembers"]:checked')
        ).map((cb) => parseInt(cb.value));
        selectedMembers.forEach((memberId) => {
          const div = document.createElement("div");
          div.className = "form-group";
          div.innerHTML = `
                <label>${getMemberById(memberId)?.name}</label>
                <input type="number" id="customAmount_${memberId}" value="0" step="0.01">
            `;
          customDistributionContainer.appendChild(div);
        });
      }
    });

  // Update member checkboxes dynamically on change
  document
    .getElementById("memberCheckboxes")
    ?.addEventListener("change", function () {
      if (document.getElementById("billDistribution")?.value === "custom") {
        const customDistributionContainer = document.getElementById(
          "customDistributionContainer"
        );
        if (!customDistributionContainer) return;

        customDistributionContainer.innerHTML = "";
        const selectedMembers = Array.from(
          document.querySelectorAll('input[name="billMembers"]:checked')
        ).map((cb) => parseInt(cb.value));
        selectedMembers.forEach((memberId) => {
          const div = document.createElement("div");
          div.className = "form-group";
          div.innerHTML = `
                <label>${getMemberById(memberId)?.name}</label>
                <input type="number" id="customAmount_${memberId}" value="0" step="0.01">
            `;
          customDistributionContainer.appendChild(div);
        });
      }
    });

  // Add recurring bill
  document
    .getElementById("addRecurringBillBtn")
    ?.addEventListener("click", function () {
      document.getElementById("addRecurringBillModal").style.display = "block";
    });

  document
    .getElementById("addRecurringBillForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();
      const billName = document.getElementById("recurringBillName")?.value;
      const category = document.getElementById("recurringBillCategory")?.value;
      const amount = parseFloat(
        document.getElementById("recurringBillAmount")?.value
      );
      const dueDay = parseInt(
        document.getElementById("recurringBillDay")?.value
      );
      const selectedMembers = Array.from(
        document.querySelectorAll('input[name="recurringBillMembers"]:checked')
      ).map((checkbox) => parseInt(checkbox.value));

      if (!selectedMembers.length) {
        alert("Please select at least one member.");
        return;
      }

      const newRecurringBill = {
        id: Date.now(),
        name: billName,
        category,
        amount,
        dueDay,
        memberIds: selectedMembers,
        distribution: "equal", // Recurring bills default to equal split for simplicity
      };

      settings.recurringBills = settings.recurringBills || [];
      settings.recurringBills.push(newRecurringBill);
      saveData();
      this.reset();
      alert("Recurring bill set up successfully.");
      document.getElementById("addRecurringBillModal").style.display = "none";
    });
});

// Auto-generate recurring bills
function generateRecurringBillsForMonth(monthValue) {
  const month = getMonthByValue(monthValue);
  if (!month) return;

  const recurringBills = settings.recurringBills || [];
  const today = new Date();
  const monthStart = new Date(month.startDate);
  if (
    today.getMonth() === monthStart.getMonth() &&
    today.getFullYear() === monthStart.getFullYear()
  ) {
    recurringBills.forEach((recurringBill) => {
      const existingBill = bills.find(
        (bill) =>
          bill.month === monthValue &&
          bill.name === recurringBill.name &&
          bill.category === recurringBill.category &&
          bill.amount === recurringBill.amount &&
          bill.memberIds.length === recurringBill.memberIds.length &&
          bill.memberIds.every((id) => recurringBill.memberIds.includes(id))
      );

      if (!existingBill) {
        const dueDate = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth(),
          Math.min(
            recurringBill.dueDay,
            new Date(
              monthStart.getFullYear(),
              monthStart.getMonth() + 1,
              0
            ).getDate()
          )
        );
        const newBill = {
          id: Date.now(),
          name: recurringBill.name,
          category: recurringBill.category,
          month: monthValue,
          amount: recurringBill.amount,
          date: month.startDate,
          dueDate: dueDate.toISOString().split("T")[0],
          note: "Auto-generated recurring bill",
          memberIds: recurringBill.memberIds,
          distribution: recurringBill.distribution,
          customDistribution: null,
          paidStatus: false,
          paidBy: [],
        };
        bills.push(newBill);
      }
    });
    saveData();
    updateMemberMonthDetails();
    updateBillsList();
    updateDashboard();
  }
}

function deleteRecurringBill(billId) {
  if (!confirm("Are you sure you want to delete this recurring bill?")) return;
  settings.recurringBills = settings.recurringBills.filter(
    (bill) => bill.id !== billId
  );
  saveData();
  alert("Recurring bill deleted successfully.");
}
