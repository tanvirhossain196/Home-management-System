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

  // Update bills stats
  const totalBills = filteredBills.length;
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = filteredBills
    .filter((bill) => bill.paidStatus)
    .reduce((sum, bill) => sum + bill.amount, 0);
  const outstandingAmount = totalAmount - paidAmount;

  document.getElementById("billsTotalCount").textContent = totalBills;
  document.getElementById(
    "billsTotalAmount"
  ).textContent = `$${totalAmount.toFixed(2)}`;
  document.getElementById(
    "billsPaidAmount"
  ).textContent = `$${paidAmount.toFixed(2)}`;
  document.getElementById(
    "billsOutstandingAmount"
  ).textContent = `$${outstandingAmount.toFixed(2)}`;

  filteredBills.forEach((bill) => {
    const billItem = document.createElement("div");
    billItem.className = "transaction-item";
    const affectedMembers = bill.memberIds
      .map((id) => getMemberById(id)?.name || "Unknown")
      .join(", ");
    const monthName = getMonthByValue(bill.month)?.name || bill.month;

    // Categorize icons based on bill category
    let categoryIcon = "fas fa-file-invoice-dollar";
    switch (bill.category) {
      case "rent":
        categoryIcon = "fas fa-home";
        break;
      case "utility":
        categoryIcon = "fas fa-plug";
        break;
      case "meal":
        categoryIcon = "fas fa-utensils";
        break;
      case "service":
        categoryIcon = "fas fa-hands-helping";
        break;
    }

    billItem.innerHTML = `
      <div>
        <div class="transaction-member">
          <i class="${categoryIcon} category-icon"></i> ${bill.name}
        </div>
        <div class="transaction-date">${formatDate(
          bill.date
        )} | ${monthName}</div>
        <div><small>Members: ${affectedMembers}</small></div>
        ${bill.note ? `<div><small>Note: ${bill.note}</small></div>` : ""}
        <div><small>Due Date: ${
          bill.dueDate ? formatDate(bill.dueDate) : "N/A"
        }</small></div>
        <div><small>Paid By: ${
          bill.paidBy.length
            ? bill.paidBy
                .map(
                  (p) =>
                    `${getMemberById(p.memberId)?.name}: ${p.amount.toFixed(
                      1
                    )} USD on ${formatDate(p.date)}`
                )
                .join(", ")
            : "Not paid"
        }</small></div>
      </div>
      <div>
        <div class="transaction-amount">${bill.amount.toFixed(1)} USD</div>
        <div class="status-badge ${bill.paidStatus ? "paid" : "pending"}">
          ${bill.paidStatus ? "Paid" : "Pending"}
        </div>
      </div>
    `;
    billItem.addEventListener("click", () => editBill(bill.id));
    billsContainer.appendChild(billItem);
  });
}

function editBill(billId) {
  // Get the bill to edit
  const bill = bills.find((b) => b.id === billId);
  if (!bill) return;

  // Create a professional, feature-rich modal for bill editing
  const editModal = document.createElement("div");
  editModal.className = "modal bill-edit-modal";
  editModal.innerHTML = `
    <div class="modal-content bill-edit-content">
      <div class="modal-header">
        <div class="modal-title">
          <h2>
            <i class="fas fa-file-invoice-dollar"></i> Edit Bill Details
            <span class="bill-category-badge">${
              bill.category.charAt(0).toUpperCase() + bill.category.slice(1)
            }</span>
          </h2>
          <span class="close">&times;</span>
        </div>
      </div>
      
      <form id="editBillForm" class="bill-edit-form">
        <div class="form-row">
          <div class="form-group bill-name-group">
            <label for="editBillName">
              <i class="fas fa-tag"></i> Bill Name
            </label>
            <input 
              type="text" 
              id="editBillName" 
              value="${bill.name}" 
              required 
              placeholder="Enter bill name"
            >
          </div>
          
          <div class="form-group bill-category-group">
            <label for="editBillCategory">
              <i class="fas fa-layer-group"></i> Category
            </label>
            <select id="editBillCategory" required>
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
                  (cat) => `
                <option value="${cat.id}" ${
                    bill.category === cat.id ? "selected" : ""
                  }>${cat.name}</option>
              `
                )
                .join("")}
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group bill-amount-group">
            <label for="editBillAmount">
              <i class="fas fa-dollar-sign"></i> Amount
            </label>
            <input 
              type="number" 
              id="editBillAmount" 
              value="${bill.amount}" 
              step="0.01" 
              required 
              placeholder="Enter bill amount"
            >
          </div>
          
          <div class="form-group bill-date-group">
            <label for="editBillDate">
              <i class="fas fa-calendar-alt"></i> Date
            </label>
            <input 
              type="date" 
              id="editBillDate" 
              value="${bill.date}" 
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group bill-due-date-group">
            <label for="editBillDueDate">
              <i class="fas fa-calendar-check"></i> Due Date
            </label>
            <input 
              type="date" 
              id="editBillDueDate" 
              value="${bill.dueDate || ""}"
            >
          </div>
          
          <div class="form-group bill-status-group">
            <label for="editBillPaidStatus">
              <i class="fas fa-money-check-alt"></i> Payment Status
            </label>
            <select id="editBillPaidStatus">
              <option value="false" ${
                !bill.paidStatus ? "selected" : ""
              }>Pending</option>
              <option value="true" ${
                bill.paidStatus ? "selected" : ""
              }>Paid</option>
            </select>
          </div>
        </div>
        
        <div class="form-group bill-note-group">
          <label for="editBillNote">
            <i class="fas fa-sticky-note"></i> Notes
          </label>
          <textarea 
            id="editBillNote" 
            placeholder="Add additional notes about the bill"
          >${bill.note || ""}</textarea>
        </div>
        
        <div class="form-group bill-members-group">
          <label>
            <i class="fas fa-users"></i> Applicable Members
          </label>
          <div id="editBillMembers" class="checkbox-grid">
            ${members
              .map(
                (member) => `
              <label class="checkbox-item">
                <input 
                  type="checkbox" 
                  name="editBillMembers" 
                  value="${member.id}"
                  ${bill.memberIds.includes(member.id) ? "checked" : ""}
                >
                <span class="checkbox-label">
                  <img 
                    src="${
                      member.image ||
                      `/api/placeholder/40/40?text=${member.name.charAt(0)}`
                    }" 
                    alt="${member.name}" 
                    class="member-checkbox-avatar"
                  >
                  ${member.name}
                </span>
              </label>
            `
              )
              .join("")}
          </div>
        </div>
        
        <div class="form-group bill-distribution-group">
          <label for="editBillDistribution">
            <i class="fas fa-balance-scale"></i> Bill Distribution
          </label>
          <select id="editBillDistribution">
            <option value="equal" ${
              bill.distribution === "equal" ? "selected" : ""
            }>Equal Split</option>
            <option value="custom" ${
              bill.distribution === "custom" ? "selected" : ""
            }>Custom Split</option>
          </select>
          
          <div 
            id="editCustomDistributionContainer" 
            class="custom-distribution-container" 
            style="display: ${
              bill.distribution === "custom" ? "block" : "none"
            };"
          >
            ${
              bill.distribution === "custom"
                ? bill.memberIds
                    .map(
                      (memberId) => `
                  <div class="distribution-item">
                    <label>
                      ${getMemberById(memberId)?.name}
                      <input 
                        type="number" 
                        id="customAmount_${memberId}" 
                        value="${
                          bill.customDistribution?.find(
                            (d) => d.memberId === memberId
                          )?.amount || 0
                        }" 
                        step="0.01"
                        placeholder="Amount"
                      >
                    </label>
                  </div>
                `
                    )
                    .join("")
                : ""
            }
          </div>
        </div>
        
        <div class="bill-paid-details" ${
          bill.paidBy.length ? "" : 'style="display:none;"'
        }>
          <h3>
            <i class="fas fa-money-bill-wave"></i> Payment Details
          </h3>
          <div class="paid-by-list">
            ${
              bill.paidBy
                .map(
                  (payment) => `
              <div class="paid-by-item">
                <img 
                  src="${
                    getMemberById(payment.memberId)?.image ||
                    `/api/placeholder/40/40?text=${getMemberById(
                      payment.memberId
                    )?.name.charAt(0)}`
                  }" 
                  alt="${getMemberById(payment.memberId)?.name}" 
                  class="paid-member-avatar"
                >
                <div class="paid-details">
                  <strong>${getMemberById(payment.memberId)?.name}</strong>
                  <span>${payment.amount.toFixed(1)} USD on ${formatDate(
                    payment.date
                  )}</span>
                </div>
              </div>
            `
                )
                .join("") || "No payments recorded"
            }
          </div>
        </div>
        
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary update-bill-btn">
            <i class="fas fa-save"></i> Update Bill
          </button>
          <button type="button" class="btn btn-danger delete-bill-btn">
            <i class="fas fa-trash-alt"></i> Delete Bill
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(editModal);
  editModal.style.display = "block";

  // Distribution toggle handler
  const distributionSelect = document.getElementById("editBillDistribution");
  const customDistributionContainer = document.getElementById(
    "editCustomDistributionContainer"
  );

  distributionSelect.addEventListener("change", function () {
    customDistributionContainer.style.display =
      this.value === "custom" ? "block" : "none";

    if (this.value === "custom") {
      customDistributionContainer.innerHTML = bill.memberIds
        .map(
          (memberId) => `
        <div class="distribution-item">
          <label>
            ${getMemberById(memberId)?.name}
            <input 
              type="number" 
              id="customAmount_${memberId}" 
              value="0" 
              step="0.01"
              placeholder="Amount"
            >
          </label>
        </div>
      `
        )
        .join("");
    }
  });

  // Delete bill button handler
  editModal
    .querySelector(".delete-bill-btn")
    .addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to delete this bill? This action cannot be undone."
        )
      ) {
        const billIndex = bills.findIndex((b) => b.id === billId);
        if (billIndex !== -1) {
          bills.splice(billIndex, 1);
          saveData();
          updateMemberMonthDetails();
          updateBillsList();
          updateDashboard();
          document.body.removeChild(editModal);
          alert("Bill deleted successfully.");
        }
      }
    });

  // Form submission handler
  document
    .getElementById("editBillForm")
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

      const billIndex = bills.findIndex((b) => b.id === billId);
      if (billIndex !== -1) {
        // Prepare paid by information if bill is marked as paid
        const paidStatus =
          document.getElementById("editBillPaidStatus").value === "true";
        let paidBy = bill.paidBy;

        if (paidStatus && !bill.paidStatus) {
          // If bill is newly marked as paid, add a default payment
          paidBy = [
            {
              memberId: selectedMembers[0], // Default to first selected member
              date: new Date().toISOString().split("T")[0],
              amount: parseFloat(
                document.getElementById("editBillAmount").value
              ),
            },
          ];
        }

        bills[billIndex] = {
          ...bills[billIndex],
          name: document.getElementById("editBillName").value,
          category: document.getElementById("editBillCategory").value,
          amount: parseFloat(document.getElementById("editBillAmount").value),
          date: document.getElementById("editBillDate").value,
          dueDate: document.getElementById("editBillDueDate").value,
          note: document.getElementById("editBillNote").value,
          memberIds: selectedMembers,
          distribution,
          customDistribution,
          paidStatus,
          paidBy,
        };

        saveData();
        updateMemberMonthDetails();
        updateBillsList();
        updateDashboard();
        document.body.removeChild(editModal);
        alert("Bill updated successfully.");
      }
    });

  // Close button
  editModal.querySelector(".close").addEventListener("click", function () {
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
          <p>${settings.defaultBills[cat.id]?.toFixed(2) || "0.00"}</p>
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

// Recurring bill functionality
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
            <input 
              type="number" 
              id="customAmount_${memberId}" 
              value="0" 
              step="0.01"
              placeholder="Amount"
            >
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
            <input 
              type="number" 
              id="customAmount_${memberId}" 
              value="0" 
              step="0.01"placeholder="Amount"
            >
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

      const distribution = document.getElementById(
        "recurringBillDistribution"
      ).value;

      let customDistribution = null;
      if (distribution === "custom") {
        customDistribution = selectedMembers.map((memberId) => ({
          memberId,
          amount:
            parseFloat(
              document.getElementById(`recurringCustomAmount_${memberId}`)
                ?.value
            ) || 0,
        }));
      }

      const newRecurringBill = {
        id: Date.now(),
        name: billName,
        category,
        amount,
        dueDay,
        memberIds: selectedMembers,
        distribution,
        customDistribution,
      };

      settings.recurringBills = settings.recurringBills || [];
      settings.recurringBills.push(newRecurringBill);
      saveData();

      // Reset and close modal
      this.reset();
      document.getElementById("addRecurringBillModal").style.display = "none";

      // Update recurring bills section if exists
      updateRecurringBillsList();

      alert("Recurring bill set up successfully.");
    });

  // Recurring bill distribution toggle
  document
    .getElementById("recurringBillDistribution")
    ?.addEventListener("change", function () {
      const customDistributionContainer = document.getElementById(
        "recurringCustomDistributionContainer"
      );

      if (!customDistributionContainer) return;

      customDistributionContainer.style.display =
        this.value === "custom" ? "block" : "none";

      if (this.value === "custom") {
        customDistributionContainer.innerHTML = "";
        const selectedMembers = Array.from(
          document.querySelectorAll(
            'input[name="recurringBillMembers"]:checked'
          )
        ).map((cb) => parseInt(cb.value));

        selectedMembers.forEach((memberId) => {
          const div = document.createElement("div");
          div.className = "form-group";
          div.innerHTML = `
            <label>${getMemberById(memberId)?.name}</label>
            <input 
              type="number" 
              id="recurringCustomAmount_${memberId}" 
              value="0" 
              step="0.01"
              placeholder="Amount"
            >
          `;
          customDistributionContainer.appendChild(div);
        });
      }
    });

  // Update recurring bills list
  function updateRecurringBillsList() {
    const recurringBillsContainer =
      document.getElementById("recurringBillsList");
    if (!recurringBillsContainer) return;

    recurringBillsContainer.innerHTML = "";
    const recurringBills = settings.recurringBills || [];

    if (recurringBills.length === 0) {
      recurringBillsContainer.innerHTML = "<p>No recurring bills set up.</p>";
      return;
    }

    recurringBills.forEach((bill) => {
      const billItem = document.createElement("div");
      billItem.className = "recurring-bill-item";

      const affectedMembers = bill.memberIds
        .map((id) => getMemberById(id)?.name || "Unknown")
        .join(", ");

      billItem.innerHTML = `
        <div class="recurring-bill-details">
          <div class="recurring-bill-header">
            <h3>${bill.name}</h3>
            <span class="recurring-bill-category">
              ${bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}
            </span>
          </div>
          <div class="recurring-bill-info">
            <div>
              <strong>Amount:</strong> ${bill.amount.toFixed(2)} USD
            </div>
            <div>
              <strong>Due Day:</strong> ${bill.dueDay}
            </div>
            <div>
              <strong>Members:</strong> ${affectedMembers}
            </div>
            <div>
              <strong>Distribution:</strong> 
              ${bill.distribution === "equal" ? "Equal Split" : "Custom Split"}
            </div>
          </div>
          <div class="recurring-bill-actions">
            <button 
              class="btn btn-sm btn-secondary edit-recurring-bill"
              data-id="${bill.id}"
            >
              <i class="fas fa-edit"></i> Edit
            </button>
            <button 
              class="btn btn-sm btn-danger delete-recurring-bill"
              data-id="${bill.id}"
            >
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>
      `;

      // Edit recurring bill
      billItem
        .querySelector(".edit-recurring-bill")
        .addEventListener("click", function () {
          const billId = this.getAttribute("data-id");
          editRecurringBill(billId);
        });

      // Delete recurring bill
      billItem
        .querySelector(".delete-recurring-bill")
        .addEventListener("click", function () {
          const billId = this.getAttribute("data-id");
          deleteRecurringBill(billId);
          updateRecurringBillsList();
        });

      recurringBillsContainer.appendChild(billItem);
    });
  }

  // Edit recurring bill function
  function editRecurringBill(billId) {
    const bill = settings.recurringBills.find((b) => b.id === parseInt(billId));
    if (!bill) return;

    // Create edit modal
    const editModal = document.createElement("div");
    editModal.className = "modal";
    editModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Recurring Bill</h2>
          <span class="close">&times;</span>
        </div>
        <form id="editRecurringBillForm">
          <div class="form-group">
            <label for="editRecurringBillName">Bill Name</label>
            <input 
              type="text" 
              id="editRecurringBillName" 
              value="${bill.name}" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="editRecurringBillCategory">Category</label>
            <select id="editRecurringBillCategory" required>
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
                  (cat) => `
                <option value="${cat.id}" ${
                    bill.category === cat.id ? "selected" : ""
                  }>${cat.name}</option>
              `
                )
                .join("")}
            </select>
          </div>
          
          <div class="form-group">
            <label for="editRecurringBillAmount">Amount</label>
            <input 
              type="number" 
              id="editRecurringBillAmount" 
              value="${bill.amount}" 
              step="0.01" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="editRecurringBillDay">Due Day</label>
            <input 
              type="number" 
              id="editRecurringBillDay" 
              value="${bill.dueDay}" 
              min="1" 
              max="31" 
              required
            >
          </div>
          
          <div class="form-group">
            <label>Applicable Members</label>
            <div id="editRecurringBillMembers" class="checkbox-group">
              ${members
                .map(
                  (member) => `
                <label>
                  <input 
                    type="checkbox" 
                    name="editRecurringBillMembers" 
                    value="${member.id}"
                    ${bill.memberIds.includes(member.id) ? "checked" : ""}
                  > ${member.name}
                </label>
              `
                )
                .join("")}
            </div>
          </div>
          
          <div class="form-group">
            <label for="editRecurringBillDistribution">Distribution</label>
            <select id="editRecurringBillDistribution">
              <option value="equal" ${
                bill.distribution === "equal" ? "selected" : ""
              }>Equal Split</option>
              <option value="custom" ${
                bill.distribution === "custom" ? "selected" : ""
              }>Custom Split</option>
            </select>
            
            <div 
              id="editRecurringCustomDistributionContainer" 
              style="display: ${
                bill.distribution === "custom" ? "block" : "none"
              };"
            >
              ${
                bill.distribution === "custom"
                  ? bill.memberIds
                      .map(
                        (memberId) => `
                    <div class="form-group">
                      <label>${getMemberById(memberId)?.name}</label>
                      <input 
                        type="number" 
                        id="editRecurringCustomAmount_${memberId}" 
                        value="${
                          bill.customDistribution?.find(
                            (d) => d.memberId === memberId
                          )?.amount || 0
                        }" 
                        step="0.01"
                        placeholder="Amount"
                      >
                    </div>
                  `
                      )
                      .join("")
                  : ""
              }
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Update Recurring Bill
            </button>
            <button type="button" class="btn btn-secondary close-modal">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(editModal);
    editModal.style.display = "block";

    // Distribution toggle handler
    const distributionSelect = document.getElementById(
      "editRecurringBillDistribution"
    );
    const customDistributionContainer = document.getElementById(
      "editRecurringCustomDistributionContainer"
    );

    distributionSelect.addEventListener("change", function () {
      customDistributionContainer.style.display =
        this.value === "custom" ? "block" : "none";

      if (this.value === "custom") {
        customDistributionContainer.innerHTML = bill.memberIds
          .map(
            (memberId) => `
          <div class="form-group">
            <label>${getMemberById(memberId)?.name}</label>
            <input 
              type="number" 
              id="editRecurringCustomAmount_${memberId}" 
              value="0" 
              step="0.01"
              placeholder="Amount"
            >
          </div>
        `
          )
          .join("");
      }
    });

    // Close modal buttons
    editModal.querySelector(".close").addEventListener("click", closeEditModal);
    editModal
      .querySelector(".close-modal")
      .addEventListener("click", closeEditModal);

    function closeEditModal() {
      document.body.removeChild(editModal);
    }

    // Form submission handler
    document
      .getElementById("editRecurringBillForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();

        const selectedMembers = Array.from(
          document.querySelectorAll(
            'input[name="editRecurringBillMembers"]:checked'
          )
        ).map((checkbox) => parseInt(checkbox.value));

        if (!selectedMembers.length) {
          alert("Please select at least one member.");
          return;
        }

        const distribution = document.getElementById(
          "editRecurringBillDistribution"
        ).value;

        let customDistribution = null;
        if (distribution === "custom") {
          customDistribution = selectedMembers.map((memberId) => ({
            memberId,
            amount:
              parseFloat(
                document.getElementById(`editRecurringCustomAmount_${memberId}`)
                  ?.value
              ) || 0,
          }));
        }

        const billIndex = settings.recurringBills.findIndex(
          (b) => b.id === parseInt(billId)
        );

        if (billIndex !== -1) {
          settings.recurringBills[billIndex] = {
            ...settings.recurringBills[billIndex],
            name: document.getElementById("editRecurringBillName").value,
            category: document.getElementById("editRecurringBillCategory")
              .value,
            amount: parseFloat(
              document.getElementById("editRecurringBillAmount").value
            ),
            dueDay: parseInt(
              document.getElementById("editRecurringBillDay").value
            ),
            memberIds: selectedMembers,
            distribution,
            customDistribution,
          };

          saveData();
          updateRecurringBillsList();
          closeEditModal();
          alert("Recurring bill updated successfully.");
        }
      });
  }

  // Initial update of recurring bills list
  updateRecurringBillsList();
});
