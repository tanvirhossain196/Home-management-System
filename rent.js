// Default bill settings form submission
document
  .getElementById("defaultBillSettingsForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    settings.defaultBills = {
      wifiBill: parseFloat(document.getElementById("defaultWifiBill").value),
      gasBill: parseFloat(document.getElementById("defaultGasBill").value),
      moylarBill: parseFloat(
        document.getElementById("defaultMoylarBill").value
      ),
      currentBill: parseFloat(
        document.getElementById("defaultCurrentBill").value
      ),
      camera: parseFloat(document.getElementById("defaultCamera").value),
      buwaBill: parseFloat(document.getElementById("defaultBuwaBill").value),
    };

    saveData();

    // Show success message
    alert("ডিফল্ট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।");
  });

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
  .addEventListener("change", function () {
    updateBillsList();
  });

// Transaction filters
document
  .getElementById("transactionMonthFilter")
  .addEventListener("change", updateTransactionsList);
document
  .getElementById("transactionTypeFilter")
  .addEventListener("change", updateTransactionsList);
document
  .getElementById("transactionMemberFilter")
  .addEventListener("change", updateTransactionsList);

// Member search
document.getElementById("memberSearch").addEventListener("input", function () {
  updateMembersList();
});

// Global search
document
  .getElementById("globalSearch")
  .addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      performGlobalSearch(this.value);
    }
  });

// Quick add buttons
document
  .getElementById("quickAddBillBtn")
  .addEventListener("click", function () {
    document.getElementById("quickAddBillModal").style.display = "block";
  });

document
  .getElementById("quickAddMemberBtn")
  .addEventListener("click", function () {
    document.querySelector('.tab-button[data-tab="members"]').click();
    document.getElementById("memberName").focus();
  });

document
  .getElementById("quickAddTransactionBtn")
  .addEventListener("click", function () {
    document.querySelector('.tab-button[data-tab="transactions"]').click();
    document.getElementById("transactionAmount").focus();
  });

// Quick add bill items
document.querySelectorAll(".bill-item[data-bill]").forEach((item) => {
  item.addEventListener("click", function () {
    const billType = this.getAttribute("data-bill");

    if (billType === "custom") {
      // Go to bills tab for custom bill
      document.querySelector('.tab-button[data-tab="bills"]').click();
      document.getElementById("billName").focus();
      document.getElementById("quickAddBillModal").style.display = "none";
      return;
    }

    // Add standard bill based on type
    let billName, billAmount, billCategory;

    switch (billType) {
      case "wifi":
        billName = "ওয়াইফাই বিল";
        billAmount = settings.defaultBills.wifiBill;
        billCategory = "utility";
        break;
      case "gas":
        billName = "গ্যাস বিল";
        billAmount = settings.defaultBills.gasBill;
        billCategory = "utility";
        break;
      case "moylar":
        billName = "ময়লার বিল";
        billAmount = settings.defaultBills.moylarBill;
        billCategory = "utility";
        break;
      case "current":
        billName = "কারেন্ট বিল";
        billAmount = settings.defaultBills.currentBill;
        billCategory = "utility";
        break;
      case "buwa":
        billName = "বুয়া বিল";
        billAmount = settings.defaultBills.buwaBill;
        billCategory = "buwa";
        break;
      case "camera":
        billName = "ক্যামেরা";
        billAmount = settings.defaultBills.camera;
        billCategory = "utility";
        break;
    }

    // Add bill for all members
    const memberIds = members.map((member) => member.id);

    const newBill = {
      id: Date.now(),
      name: billName,
      category: billCategory,
      month: currentMonth,
      amount: billAmount,
      date: new Date().toISOString().split("T")[0],
      note: "",
      memberIds: memberIds,
      distribution: "equal",
      customDistribution: null,
      paidStatus: false,
    };

    bills.push(newBill);
    saveData();

    updateBillsList();
    updateDashboard();

    document.getElementById("quickAddBillModal").style.display = "none";

    // Show success message
    alert("বিল সফলভাবে যোগ করা হয়েছে।");
  });
});

// Data export
document.getElementById("exportData").addEventListener("click", function () {
  const exportData = {
    members: members,
    months: months,
    bills: bills,
    transactions: transactions,
    settings: settings,
  };

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportData));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "basharHishab_export.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();

  alert("ডাটা সফলভাবে এক্সপোর্ট করা হয়েছে।");
});

// Data import
document.getElementById("importData").addEventListener("click", function () {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target.result);

        if (
          importedData.members &&
          importedData.months &&
          importedData.bills &&
          importedData.transactions &&
          importedData.settings
        ) {
          // Import all data
          members = importedData.members;
          months = importedData.months;
          bills = importedData.bills;
          transactions = importedData.transactions;
          settings = importedData.settings;

          if (months.length > 0) {
            currentMonth = months[0].value;
          }

          saveData();

          // Update UI
          updateMonthTabs();
          updateMonthSelector();
          updateMembersList();
          updateDashboard();
          updateBillsList();
          updateTransactionsList();
          updateTransactionMemberFilter();
          updateMemberCheckboxes();

          alert("ডাটা সফলভাবে ইম্পোর্ট করা হয়েছে।");
        } else {
          alert("অবৈধ ডাটা ফাইল! সঠিক ফরম্যাটে সংরক্ষিত ফাইল আপলোড করুন।");
        }
      } catch (error) {
        alert("ফাইল পার্স করতে সমস্যা হয়েছে: " + error.message);
      }
    };

    reader.readAsText(file);
  });

  input.click();
});

// Clear all data
document.getElementById("clearData").addEventListener("click", function () {
  if (
    confirm(
      "আপনি কি নিশ্চিত যে আপনি সব ডাটা মুছে ফেলতে চান? এই পদক্ষেপ ফিরিয়ে আনা যাবে না!"
    )
  ) {
    localStorage.removeItem("basharHishabMembers");
    localStorage.removeItem("basharHishabMonths");
    localStorage.removeItem("basharHishabBills");
    localStorage.removeItem("basharHishabTransactions");
    localStorage.removeItem("basharHishabSettings");

    // Reload page
    window.location.reload();
  }
});

// Close modals when clicking on X or outside
document.querySelectorAll(".close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", function () {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.style.display = "none";
    });
  });
});

window.addEventListener("click", function (event) {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Initialize month selector
document.getElementById("monthSelect").addEventListener("change", function () {
  currentMonth = this.value;
  updateMonthTabs();
  updateDashboard();
  document.getElementById("currentMonthDisplay").textContent =
    getMonthByValue(currentMonth).name;
});

// Edit bill
function editBill(billId) {
  // TODO: Implement bill editing functionality
  alert("বিল আপডেট করার ফাংশন এখনও বাস্তবায়ন করা হয়নি।");
}

// Edit transaction
function editTransaction(transactionId) {
  // TODO: Implement transaction editing functionality
  alert("লেনদেন আপডেট করার ফাংশন এখনও বাস্তবায়ন করা হয়নি।");
}

// Global search function
function performGlobalSearch(searchTerm) {
  if (!searchTerm) return;

  // Search for members
  const matchedMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (matchedMembers.length === 1) {
    // If exactly one member matched, show their details
    document.querySelector('.tab-button[data-tab="members"]').click();
    showMemberDetails(matchedMembers[0].id);
    return;
  } else if (matchedMembers.length > 1) {
    // If multiple members matched, show the list with filter applied
    document.querySelector('.tab-button[data-tab="members"]').click();
  }

  // Search for bills by name
  const matchedBills = bills.filter((bill) =>
    bill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (matchedBills.length > 0) {
    // Show bills tab with relevant bills
    document.querySelector('.tab-button[data-tab="bills"]').click();
    // TODO: Apply filter to show only matched bills
    return;
  }

  // If nothing found
  alert("কোন সদস্য বা বিল পাওয়া যায়নি। অনুগ্রহ করে অনুসন্ধান পরিবর্তন করুন।");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Load data
  loadData();

  // Initialize UI
  updateMonthTabs();
  updateMonthSelector();
  updateMembersList();
  updateDashboard();
  updateBillsList();
  updateTransactionsList();
  updateTransactionMemberFilter();
  updateMemberCheckboxes();

  // Tab switching
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      const tab = this.getAttribute("data-tab");

      // Hide all tabs
      document.querySelectorAll(".main-content").forEach((content) => {
        content.style.display = "none";
      });

      // Show selected tab
      document.getElementById(tab + "Tab").style.display = "flex";

      // Update active class
      document.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.remove("active");
      });
      this.classList.add("active");

      // Update specific tab content if needed
      if (tab === "dashboard") {
        updateDashboard();
      } else if (tab === "members") {
        updateMembersList();
      } else if (tab === "bills") {
        updateBillsList();
      } else if (tab === "transactions") {
        updateTransactionsList();
      }
    });
  });

  // Back to members list button
  document
    .getElementById("backToMembersList")
    .addEventListener("click", function () {
      document.getElementById("membersListSection").style.display = "block";
      document.getElementById("memberDetailSection").style.display = "none";
    });

  // Add member form submission
  document
    .getElementById("addMemberForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const newMember = {
        id: Date.now(),
        name: document.getElementById("memberName").value,
        phone: document.getElementById("memberPhone").value,
        room: document.getElementById("memberRoom").value,
        joinDate: document.getElementById("memberJoinDate").value,
        note: document.getElementById("memberNote").value,
      };

      members.push(newMember);
      saveData();

      updateMembersList();
      updateMemberCheckboxes();
      updateTransactionMemberFilter();

      // Reset form
      this.reset();

      // Show success message
      alert("সদস্য সফলভাবে যোগ করা হয়েছে।");
    });

  // Add bill form submission
  document
    .getElementById("addBillForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Get selected members
      const selectedMembers = Array.from(
        document.querySelectorAll('input[name="billMembers"]:checked')
      ).map((checkbox) => parseInt(checkbox.value));

      if (selectedMembers.length === 0) {
        alert("অনুগ্রহ করে কমপক্ষে একজন সদস্য নির্বাচন করুন।");
        return;
      }

      const distribution = document.getElementById("billDistribution").value;
      let customDistribution = null;

      if (distribution === "custom") {
        customDistribution = [];
        // TODO: Get custom distribution values
      }

      const newBill = {
        id: Date.now(),
        name: document.getElementById("billName").value,
        category: document.getElementById("billCategory").value,
        month: currentMonth,
        amount: parseFloat(document.getElementById("billAmount").value),
        date: document.getElementById("billDate").value,
        note: document.getElementById("billNote").value,
        memberIds: selectedMembers,
        distribution: distribution,
        customDistribution: customDistribution,
        paidStatus: false,
      };

      bills.push(newBill);
      saveData();

      updateBillsList();
      updateDashboard();

      // Reset form
      this.reset();

      // Restore default values
      document.getElementById("billCategory").value = "";
      updateMemberCheckboxes();

      // Show success message
      alert("বিল সফলভাবে যোগ করা হয়েছে।");
    });
});

// Add transaction form submission
document
  .getElementById("addTransactionForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const newTransaction = {
      id: Date.now(),
      type: document.getElementById("transactionType").value,
      memberId: parseInt(document.getElementById("transactionMember").value),
      amount: parseFloat(document.getElementById("transactionAmount").value),
      date: document.getElementById("transactionDate").value,
      note: document.getElementById("transactionNote").value,
      month: currentMonth,
    };

    transactions.push(newTransaction);
    saveData();

    updateTransactionsList();
    updateDashboard();

    // Reset form
    this.reset();

    // Restore default values
    document.getElementById("transactionType").value = "payment";
    document.getElementById("transactionMember").value = "";

    // Show success message
    alert("লেনদেন সফলভাবে যোগ করা হয়েছে।");
  });

// Add new month button
document
  .getElementById("addNewMonthBtn")
  .addEventListener("click", function () {
    document.getElementById("addMonthModal").style.display = "block";
  });

// Add month form submission
document
  .getElementById("addMonthForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const newMonth = {
      id: Date.now(),
      name: document.getElementById("newMonthName").value,
      value: "month-" + Date.now(),
      startDate: document.getElementById("newMonthStartDate").value,
      endDate: document.getElementById("newMonthEndDate").value,
    };

    months.push(newMonth);
    currentMonth = newMonth.value;

    // Copy settings from previous month if selected
    const copyFromMonthValue = document.getElementById("copyFromMonth").value;
    if (copyFromMonthValue) {
      // TODO: Implement copy functionality for recurring bills
    }

    saveData();

    updateMonthTabs();
    updateMonthSelector();
    updateDashboard();

    // Close modal
    document.getElementById("addMonthModal").style.display = "none";

    // Reset form
    this.reset();

    // Show success message
    alert("নতুন মাস সফলভাবে যোগ করা হয়েছে।");
  });
// Update bills list
function updateBillsList() {
  const billsContainer = document.getElementById("billsList");
  billsContainer.innerHTML = "";

  // Get selected filters
  const monthFilter = document.getElementById("billMonthFilter").value;
  const categoryFilter = document
    .querySelector(".category-item.active")
    .getAttribute("data-category");

  // Filter bills based on selected filters
  let filteredBills = bills;

  if (monthFilter !== "all") {
    filteredBills = filteredBills.filter((bill) => bill.month === monthFilter);
  }

  if (categoryFilter !== "all") {
    filteredBills = filteredBills.filter(
      (bill) => bill.category === categoryFilter
    );
  }

  // Sort bills by date (newest first)
  filteredBills.sort((a, b) => new Date(b.date) - new Date(a.date));

  // If no bills found
  if (filteredBills.length === 0) {
    billsContainer.innerHTML =
      "<p>কোন বিল পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।</p>";
    return;
  }

  // Create bill items
  filteredBills.forEach((bill) => {
    const billItem = document.createElement("div");
    billItem.className = "transaction-item";

    // Get affected members
    const affectedMembers = bill.memberIds
      .map((id) => getMemberById(id)?.name || "Unknown")
      .join(", ");

    // Get month name
    const monthName = getMonthByValue(bill.month)?.name || bill.month;

    billItem.innerHTML = `
            <div>
                <div class="transaction-member">${bill.name}</div>
                <div class="transaction-date">
                    ${formatDate(bill.date)} | ${monthName}
                </div>
                <div><small>সদস্য: ${affectedMembers}</small></div>
            </div>
            <div>
                <div class="transaction-amount">${bill.amount.toFixed(
                  1
                )} টাকা</div>
                <div class="status-badge ${
                  bill.paidStatus ? "paid" : "pending"
                }">
                    ${bill.paidStatus ? "পরিশোধিত" : "বাকি"}
                </div>
            </div>
        `;

    // Add click event to view/edit bill
    billItem.addEventListener("click", function () {
      editBill(bill.id);
    });

    billsContainer.appendChild(billItem);
  });
}

// Update transactions list
function updateTransactionsList() {
  const transactionsContainer = document.getElementById("transactionsList");
  transactionsContainer.innerHTML = "";

  // Get selected filters
  const monthFilter = document.getElementById("transactionMonthFilter").value;
  const typeFilter = document.getElementById("transactionTypeFilter").value;
  const memberFilter = document.getElementById("transactionMemberFilter").value;

  // Filter transactions based on selected filters
  let filteredTransactions = transactions;

  if (monthFilter !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.month === monthFilter
    );
  }

  if (typeFilter !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.type === typeFilter
    );
  }

  if (memberFilter !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.memberId === parseInt(memberFilter)
    );
  }

  // Sort transactions by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // If no transactions found
  if (filteredTransactions.length === 0) {
    transactionsContainer.innerHTML =
      "<p>কোন লেনদেন পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।</p>";
    return;
  }

  // Create transaction items
  filteredTransactions.forEach((transaction) => {
    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";

    // Get member name
    const memberName = getMemberById(transaction.memberId)?.name || "Unknown";

    // Get month name
    const monthName =
      getMonthByValue(transaction.month)?.name || transaction.month;

    let typeText, typeClass;
    if (transaction.type === "payment") {
      typeText = "পেমেন্ট";
      typeClass = "positive";
    } else if (transaction.type === "expense") {
      typeText = "খরচ";
      typeClass = "negative";
    } else {
      typeText = "জমা";
      typeClass = "positive";
    }

    transactionItem.innerHTML = `
            <div>
                <div class="transaction-member">${memberName}</div>
                <div class="transaction-date">
                    ${formatDate(transaction.date)} | ${monthName}
                </div>
                ${
                  transaction.note
                    ? `<div><small>${transaction.note}</small></div>`
                    : ""
                }
            </div>
            <div>
                <div class="${typeClass}">${typeText}</div>
                <div class="transaction-amount">${transaction.amount.toFixed(
                  1
                )} টাকা</div>
            </div>
        `;

    // Add click event to view/edit transaction
    transactionItem.addEventListener("click", function () {
      editTransaction(transaction.id);
    });

    transactionsContainer.appendChild(transactionItem);
  });
}

// Update transaction member filter
function updateTransactionMemberFilter() {
  const memberFilter = document.getElementById("transactionMemberFilter");
  memberFilter.innerHTML = '<option value="all">সব সদস্য</option>';

  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    memberFilter.appendChild(option);
  });
}

// Update member checkboxes for bills
function updateMemberCheckboxes() {
  const checkboxContainer = document.getElementById("memberCheckboxes");
  const recurringCheckboxContainer = document.getElementById(
    "recurringBillMemberCheckboxes"
  );

  if (!checkboxContainer || !recurringCheckboxContainer) return;

  checkboxContainer.innerHTML = "";
  recurringCheckboxContainer.innerHTML = "";

  members.forEach((member) => {
    // Regular bill form
    const checkboxDiv = document.createElement("div");
    checkboxDiv.innerHTML = `
            <label>
                <input type="checkbox" name="billMembers" value="${member.id}" checked> ${member.name}
            </label>
        `;
    checkboxContainer.appendChild(checkboxDiv);

    // Recurring bill form
    const recurringCheckboxDiv = document.createElement("div");
    recurringCheckboxDiv.innerHTML = `
            <label>
                <input type="checkbox" name="recurringBillMembers" value="${member.id}" checked> ${member.name}
            </label>
        `;
    recurringCheckboxContainer.appendChild(recurringCheckboxDiv);
  });
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Edit member
function editMember(memberId) {
  // TODO: Implement member editing functionality
  alert("সদস্য আপডেট করার ফাংশন এখনও বাস্তবায়ন করা হয়নি।");
}

// Delete member
function deleteMember(memberId) {
  if (
    confirm(
      "আপনি কি নিশ্চিত যে আপনি এই সদস্যকে মুছতে চান? এর সাথে সম্পর্কিত সব বিল এবং লেনদেন মুছে যাবে।"
    )
  ) {
    // Remove member
    members = members.filter((member) => member.id !== memberId);

    // Remove related bills
    bills = bills.filter((bill) => !bill.memberIds.includes(memberId));

    // Remove related transactions
    transactions = transactions.filter(
      (transaction) => transaction.memberId !== memberId
    );

    saveData();

    // If we're in the member details view, go back to list
    if (
      document.getElementById("memberDetailSection").style.display !== "none"
    ) {
      document.getElementById("backToMembersList").click();
    }

    // Update all views
    updateMembersList();
    updateDashboard();
    updateBillsList();
    updateTransactionsList();
    updateTransactionMemberFilter();
    updateMemberCheckboxes();

    alert("সদস্য সফলভাবে মুছে ফেলা হয়েছে।");
  }
}

// Required for PDF export
// Make sure to include jsPDF in your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

// Core functionality for the Home Manager application

// Data structures
let members = [];
let months = [];
let bills = [];
let transactions = [];
let settings = {
  defaultBills: {
    wifiBill: 180,
    gasBill: 135,
    wasteBill: 12.5,
    electricityBill: 155,
    camera: 145,
    maidBill: 100,
  },
  customCategories: [],
  recurringBills: [],
};
let currentMonth = "";
let memberMonthDetails = {}; // Stores detailed month-wise data per member

// Initialize sample data
function initializeSampleData() {
  const now = new Date();
  months = [
    {
      id: Date.now(),
      name: `${now.toLocaleString("en-US", {
        month: "long",
      })} ${now.getFullYear()}`,
      value: `month-${now.getFullYear()}-${now.getMonth() + 1}`,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0],
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
    },
  ];

  currentMonth = months[0].value;

  members = [
    {
      id: 1,
      name: "Tanvir",
      phone: "01711111111",
      room: "101",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
    {
      id: 2,
      name: "Shawon",
      phone: "01722222222",
      room: "102",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
    {
      id: 3,
      name: "Shakib",
      phone: "01733333333",
      room: "103",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
    {
      id: 4,
      name: "Imam",
      phone: "01744444444",
      room: "104",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
    {
      id: 5,
      name: "Farhan",
      phone: "01755555555",
      room: "105",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
    {
      id: 6,
      name: "Jawad",
      phone: "01766666666",
      room: "106",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
    {
      id: 7,
      name: "Rafi",
      phone: "01777777777",
      room: "107",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
    {
      id: 8,
      name: "Redwan",
      phone: "01777777787",
      room: "108",
      joinDate: "2023-01-01",
      note: "",
      image: "",
    },
  ];

  members.forEach((member) => {
    memberMonthDetails[member.id] = {};
    months.forEach((month) => {
      memberMonthDetails[member.id][month.value] = {
        bills: [],
        transactions: [],
        balance: 0,
        dues: 0,
      };
    });
  });
}

// Data management
function loadData() {
  const savedData = {
    members: localStorage.getItem("basharHishabMembers"),
    months: localStorage.getItem("basharHishabMonths"),
    bills: localStorage.getItem("basharHishabBills"),
    transactions: localStorage.getItem("basharHishabTransactions"),
    settings: localStorage.getItem("basharHishabSettings"),
    memberMonthDetails: localStorage.getItem("basharHishabMemberMonthDetails"),
  };

  try {
    if (Object.values(savedData).every((data) => data)) {
      members = JSON.parse(savedData.members);
      months = JSON.parse(savedData.months);
      bills = JSON.parse(savedData.bills);
      transactions = JSON.parse(savedData.transactions);
      settings = JSON.parse(savedData.settings);
      memberMonthDetails = JSON.parse(savedData.memberMonthDetails);

      // Ensure settings object has all necessary properties
      settings.customCategories = settings.customCategories || [];
      settings.recurringBills = settings.recurringBills || [];
      settings.defaultBills = settings.defaultBills || {
        wifiBill: 180,
        gasBill: 135,
        wasteBill: 12.5,
        electricityBill: 155,
        camera: 145,
        maidBill: 100,
      };

      currentMonth = months.length > 0 ? months[0].value : "";
    } else {
      initializeSampleData();
    }
  } catch (error) {
    console.error("Error loading data:", error);
    initializeSampleData();
  }
  updateMemberMonthDetails();
  saveData();
}

function saveData() {
  try {
    localStorage.setItem("basharHishabMembers", JSON.stringify(members));
    localStorage.setItem("basharHishabMonths", JSON.stringify(months));
    localStorage.setItem("basharHishabBills", JSON.stringify(bills));
    localStorage.setItem(
      "basharHishabTransactions",
      JSON.stringify(transactions)
    );
    localStorage.setItem("basharHishabSettings", JSON.stringify(settings));
    localStorage.setItem(
      "basharHishabMemberMonthDetails",
      JSON.stringify(memberMonthDetails)
    );
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Error saving data. Please try again.");
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getMemberById(id) {
  return members.find((member) => member.id === id);
}

function getMonthByValue(value) {
  return months.find((month) => month.value === value);
}

// Calculate and store month-wise details
function updateMemberMonthDetails() {
  members.forEach((member) => {
    if (!memberMonthDetails[member.id]) {
      memberMonthDetails[member.id] = {};
    }
    months.forEach((month) => {
      if (!memberMonthDetails[member.id][month.value]) {
        memberMonthDetails[member.id][month.value] = {
          bills: [],
          transactions: [],
          balance: 0,
          dues: 0,
        };
      }
      const memberBills = bills.filter(
        (bill) =>
          bill.month === month.value && bill.memberIds.includes(member.id)
      );
      memberMonthDetails[member.id][month.value].bills = memberBills;

      const memberTransactions = transactions.filter(
        (t) => t.month === month.value && t.memberId === member.id
      );
      memberMonthDetails[member.id][month.value].transactions =
        memberTransactions;

      const expenses = calculateMemberExpenses(member.id, month.value);
      const payments = calculateMemberPayments(member.id, month.value);
      memberMonthDetails[member.id][month.value].balance = payments - expenses;
      memberMonthDetails[member.id][month.value].dues = expenses - payments;
    });
  });
  saveData();
}

// Calculations
function calculateMemberExpenses(memberId, monthValue) {
  return bills
    .filter(
      (bill) => bill.month === monthValue && bill.memberIds.includes(memberId)
    )
    .reduce((total, bill) => {
      if (bill.distribution === "equal") {
        return total + bill.amount / bill.memberIds.length;
      } else if (bill.distribution === "custom" && bill.customDistribution) {
        const dist = bill.customDistribution.find(
          (d) => d.memberId === memberId
        );
        return total + (dist?.amount || 0);
      }
      return total;
    }, 0);
}

function calculateMemberPayments(memberId, monthValue) {
  return transactions
    .filter(
      (t) =>
        t.month === monthValue &&
        t.memberId === memberId &&
        t.type === "payment"
    )
    .reduce((total, t) => total + t.amount, 0);
}

function calculateMemberBalance(memberId, monthValue) {
  return (
    calculateMemberPayments(memberId, monthValue) -
    calculateMemberExpenses(memberId, monthValue)
  );
}

// Initialize UI functions
function initializeUI() {
  updateMonthTabs();
  updateMonthSelector();
  updateMembersList();
  updateDashboard();
  updateBillsList();
  updateTransactionsList();
  updateTransactionMemberFilter();
  updateMemberCheckboxes();
  updateBillCategoryOptions();
  updateDefaultBillForm();
  updateQuickAddBillModal();
}

function updateMonthTabs() {
  const monthTabsContainer = document.getElementById("monthTabs");
  if (!monthTabsContainer) return;

  monthTabsContainer.innerHTML = "";
  months.forEach((month) => {
    const tab = document.createElement("div");
    tab.className = `month-tab ${month.value === currentMonth ? "active" : ""}`;
    tab.textContent = month.name;
    tab.setAttribute("data-month", month.value);
    tab.addEventListener("click", function () {
      currentMonth = this.getAttribute("data-month");
      updateMonthTabs();
      updateDashboard();
      updateBillsList();
      updateTransactionsList();
      document.getElementById("currentMonthDisplay").textContent =
        getMonthByValue(currentMonth)?.name || "";
    });
    monthTabsContainer.appendChild(tab);
  });
}

function updateMonthSelector() {
  const selectors = [
    document.getElementById("monthSelect"),
    document.getElementById("billMonthFilter"),
    document.getElementById("transactionMonthFilter"),
    document.getElementById("copyFromMonth"),
    document.getElementById("reportMonth"),
  ].filter((sel) => sel);

  selectors.forEach((selector) => {
    if (!selector) return;
    const isFilter = selector.id.includes("Filter");
    selector.innerHTML = isFilter
      ? '<option value="all">All Months</option>'
      : "";

    months
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .forEach((month) => {
        const option = document.createElement("option");
        option.value = month.value;
        option.textContent = month.name;
        selector.appendChild(option);
      });

    if (selector.id === "monthSelect") selector.value = currentMonth;
  });

  // Update member selector in reports
  const reportMember = document.getElementById("reportMember");
  if (reportMember) {
    reportMember.innerHTML = "";
    members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.name;
      reportMember.appendChild(option);
    });
  }
}

function updateMemberCheckboxes() {
  const containers = [
    document.getElementById("memberCheckboxes"),
    document.getElementById("recurringBillMemberCheckboxes"),
  ].filter((c) => c);

  containers.forEach((container) => {
    container.innerHTML = "";
    members.forEach((member) => {
      const checkboxDiv = document.createElement("div");
      checkboxDiv.innerHTML = `
                <label>
                    <input type="checkbox" name="${
                      container.id.includes("recurring")
                        ? "recurringBillMembers"
                        : "billMembers"
                    }" 
                        value="${member.id}" checked> ${member.name}
                </label>
            `;
      container.appendChild(checkboxDiv);
    });
  });
}

// Global search functionality
function performGlobalSearch(searchTerm) {
  if (!searchTerm) return;

  const matchedMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (matchedMembers.length === 1) {
    document.querySelector('.tab-button[data-tab="members"]')?.click();
    showMemberDetails(matchedMembers[0].id);
    return;
  } else if (matchedMembers.length > 1) {
    document.querySelector('.tab-button[data-tab="members"]')?.click();
    updateMembersList(searchTerm);
    return;
  }

  const matchedBills = bills.filter(
    (bill) =>
      bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (matchedBills.length > 0) {
    document.querySelector('.tab-button[data-tab="bills"]')?.click();
    updateBillsList(searchTerm);
    return;
  }

  const matchedTransactions = transactions.filter(
    (transaction) =>
      transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMemberById(transaction.memberId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (matchedTransactions.length > 0) {
    document.querySelector('.tab-button[data-tab="transactions"]')?.click();
    updateTransactionsList(searchTerm);
    return;
  }

  alert("No results found for your search.");
}

// Modal handling
function setupModalHandlers() {
  // Close modals when clicking on X or outside
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none";
      });
    });
  });

  window.addEventListener("click", function (event) {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });
}

// Month handling
function setupMonthHandling() {
  // Initialize month selector
  document
    .getElementById("monthSelect")
    ?.addEventListener("change", function () {
      currentMonth = this.value;
      updateMonthTabs();
      updateDashboard();
      const displayElement = document.getElementById("currentMonthDisplay");
      if (displayElement) {
        displayElement.textContent = getMonthByValue(currentMonth)?.name || "";
      }
    });

  // Add new month button
  document
    .getElementById("addNewMonthBtn")
    ?.addEventListener("click", function () {
      document.getElementById("addMonthModal").style.display = "block";
    });

  // Add month form submission
  document
    .getElementById("addMonthForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      const newMonth = {
        id: Date.now(),
        name: document.getElementById("newMonthName").value,
        value: "month-" + Date.now(),
        startDate: document.getElementById("newMonthStartDate").value,
        endDate: document.getElementById("newMonthEndDate").value,
      };

      months.unshift(newMonth); // Add to beginning of array
      currentMonth = newMonth.value;

      // Create member month details
      members.forEach((member) => {
        if (!memberMonthDetails[member.id]) {
          memberMonthDetails[member.id] = {};
        }
        memberMonthDetails[member.id][newMonth.value] = {
          bills: [],
          transactions: [],
          balance: 0,
          dues: 0,
        };
      });

      saveData();

      updateMonthTabs();
      updateMonthSelector();
      updateDashboard();

      // Close modal
      document.getElementById("addMonthModal").style.display = "none";

      // Reset form
      this.reset();

      // Show success message
      alert("New month added successfully.");
    });
}

// Tab navigation setup
function setupTabNavigation() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      const tab = this.getAttribute("data-tab");

      // Hide all tabs
      document.querySelectorAll(".main-content").forEach((content) => {
        content.style.display = "none";
      });

      // Show selected tab
      const targetTab = document.getElementById(tab + "Tab");
      if (targetTab) {
        targetTab.style.display = "flex";
      }

      // Update active class
      document.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.remove("active");
      });
      this.classList.add("active");

      // Update specific tab content if needed
      if (tab === "dashboard") {
        updateDashboard();
      } else if (tab === "members") {
        updateMembersList();
      } else if (tab === "bills") {
        updateBillsList();
      } else if (tab === "transactions") {
        updateTransactionsList();
      }
    });
  });
}

// Global search setup
function setupGlobalSearch() {
  document
    .getElementById("globalSearch")
    ?.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        performGlobalSearch(this.value);
      }
    });
}

// Notification functionality (mock implementation)
function sendNotification(type, memberId, billId) {
  if (!settings.notifications?.[type]) return;

  const member = getMemberById(memberId);
  const bill = bills.find((b) => b.id === billId);
  if (!member || !bill) return;

  console.log(
    `Notification: ${type} sent to ${member.name} for bill ${bill.name}`
  );
  // In a real app, this would integrate with email, SMS, or push notifications

  // Show toast notification
  showToast(`Notification sent to ${member.name} for ${bill.name}`, "info");
}

// Check due reminders
function checkDueReminders() {
  const today = new Date().toISOString().split("T")[0];
  bills
    .filter((bill) => !bill.paidStatus && bill.dueDate === today)
    .forEach((bill) => {
      bill.memberIds.forEach((memberId) => {
        sendNotification("dueReminder", memberId, bill.id);
      });
    });
}

// Currency conversion (mock implementation)
function convertCurrency(amount, fromCurrency, toCurrency) {
  // Mock conversion rates
  const rates = {
    USD: 1,
    EUR: 0.85,
    BDT: 110,
  };
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    console.warn("Unsupported currency");
    return amount;
  }
  return (amount * rates[toCurrency]) / rates[fromCurrency];
}

// Periodic data backup
function autoBackupData() {
  const data = {
    members,
    months,
    bills,
    transactions,
    settings,
    memberMonthDetails,
  };

  try {
    localStorage.setItem(
      `backup_${new Date().toISOString().split("T")[0]}`,
      JSON.stringify(data)
    );
    console.log("Auto backup completed successfully");
  } catch (error) {
    console.error("Error during auto backup:", error);
  }
}

// Toast notification system
function showToast(message, type = "info") {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");
  const toastIcon = document.querySelector(".toast-icon");

  if (!toast || !toastMessage) return;

  // Set message
  toastMessage.textContent = message;

  // Set icon based on type
  toastIcon.className = "toast-icon";
  if (type === "success") {
    toastIcon.classList.add("success");
    toastIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
  } else if (type === "error") {
    toastIcon.classList.add("error");
    toastIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
  } else if (type === "warning") {
    toastIcon.classList.add("warning");
    toastIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
  } else {
    toastIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
  }

  // Show toast
  toast.classList.add("show");

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);

  // Close on click
  document
    .querySelector(".toast-close")
    ?.addEventListener("click", function () {
      toast.classList.remove("show");
    });
}

// Main initialization
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Load data
    loadData();

    // Initialize UI
    initializeUI();

    // Setup event handlers
    setupModalHandlers();
    setupMonthHandling();
    setupTabNavigation();
    setupGlobalSearch();

    // Run due reminders check
    checkDueReminders();

    // Schedule auto-backup every 24 hours (86400000 ms)
    setInterval(autoBackupData, 86400000);

    // Initial backup on load
    autoBackupData();

    // Handle offline/online events
    window.addEventListener("offline", function () {
      showToast("You are offline. Some features may be limited.", "warning");
    });

    window.addEventListener("online", function () {
      showToast("You are back online!", "success");
    });

    // Handle page visibility for background sync
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        updateDashboard();
        checkDueReminders();
      }
    });

    // Generate recurring bills for current month if available
    if (currentMonth) {
      generateRecurringBillsForMonth(currentMonth);
    }

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error during initialization:", error);
    alert(
      "There was an error initializing the application. Please refresh the page and try again."
    );
  }
});
