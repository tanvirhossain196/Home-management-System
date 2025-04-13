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

// Core functionality for the Home Manager application

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

// Initialize months with all 12 months of the current year
function initializeMonths() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Clear existing months
  months = [];

  // Add all 12 months of the current year
  for (let i = 0; i < 12; i++) {
    const startDate = new Date(currentYear, i, 1);
    const endDate = new Date(currentYear, i + 1, 0);

    months.push({
      id: Date.now() + i,
      name: `${monthNames[i]} ${currentYear}`,
      value: `month-${currentYear}-${i + 1}`,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  }

  // Set current month as the current calendar month
  const currentMonthIndex = currentDate.getMonth();
  currentMonth = months[currentMonthIndex].value;
}

// Initialize sample data
function initializeSampleData() {
  // Months are already initialized in initializeMonths()

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

  ensureMemberMonthDetails();
}

// Ensure each member has month details for all months
function ensureMemberMonthDetails() {
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
    });
  });
}

// Data management
function loadData() {
  const savedData = {
    members: localStorage.getItem("basharHishabMembers"),
    transactions: localStorage.getItem("basharHishabTransactions"),
    bills: localStorage.getItem("basharHishabBills"),
    settings: localStorage.getItem("basharHishabSettings"),
    memberMonthDetails: localStorage.getItem("basharHishabMemberMonthDetails"),
  };

  try {
    // Initialize months first
    initializeMonths();

    if (
      savedData.members &&
      savedData.transactions &&
      savedData.bills &&
      savedData.settings
    ) {
      members = JSON.parse(savedData.members);
      bills = JSON.parse(savedData.bills);
      transactions = JSON.parse(savedData.transactions);
      settings = JSON.parse(savedData.settings);

      if (savedData.memberMonthDetails) {
        memberMonthDetails = JSON.parse(savedData.memberMonthDetails);
      }

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
    } else {
      initializeSampleData();
    }
  } catch (error) {
    console.error("Error loading data:", error);
    initializeSampleData();
  }

  // Make sure all members have month details for all months
  ensureMemberMonthDetails();
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

// Month tabs update (optional, can be hidden)
function updateMonthTabs() {
  const monthTabsContainer = document.getElementById("monthTabs");
  if (!monthTabsContainer) return;

  // You can hide this container as it's not needed anymore
  monthTabsContainer.style.display = "none";
  return;
}

// Update month selector with all months
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

    months.forEach((month) => {
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
      updateDashboard();
      const displayElement = document.getElementById("currentMonthDisplay");
      if (displayElement) {
        displayElement.textContent = getMonthByValue(currentMonth)?.name || "";
      }
    });

  // Hide or remove the Add New Month button as it's not needed
  const addNewMonthBtn = document.getElementById("addNewMonthBtn");
  if (addNewMonthBtn) {
    addNewMonthBtn.style.display = "none";
  }

  // Hide Add Month modal or repurpose it
  const addMonthModal = document.getElementById("addMonthModal");
  if (addMonthModal) {
    // Hide it as it's not needed
    const addMonthBtns = document.querySelectorAll(
      '[data-target="#addMonthModal"]'
    );
    addMonthBtns.forEach((btn) => {
      btn.style.display = "none";
    });
  }
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
          importedData.bills &&
          importedData.transactions &&
          importedData.settings
        ) {
          // Import all data
          members = importedData.members;
          bills = importedData.bills;
          transactions = importedData.transactions;
          settings = importedData.settings;

          // We'll keep our current months setup based on current year
          // but update the current month to match the imported data if needed
          if (importedData.months && importedData.months.length > 0) {
            // Find a matching month in our system
            const firstImportedMonth = importedData.months[0];
            const matchingMonth = months.find(
              (m) => m.name.includes(firstImportedMonth.name.split(" ")[0]) // Match month name
            );

            if (matchingMonth) {
              currentMonth = matchingMonth.value;
            }
          }

          saveData();

          // Make sure all members have month details
          ensureMemberMonthDetails();
          updateMemberMonthDetails();

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
        console.error("Error parsing file:", error);
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
    localStorage.removeItem("basharHishabMemberMonthDetails");

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
  updateDashboard();
  document.getElementById("currentMonthDisplay").textContent =
    getMonthByValue(currentMonth).name;
});

// Edit bill
function editBill(billId) {
  // Get the bill to edit
  const bill = bills.find((b) => b.id === billId);
  if (!bill) return;

  // Create modal for editing
  const editModal = document.createElement("div");
  editModal.className = "modal";
  editModal.innerHTML = `
    <div class="modal-content">
      <span class="close">×</span>
      <h2>Edit Bill</h2>
      <form id="editBillForm">
        <div class="form-group">
          <label for="editBillName">Bill Name</label>
          <input type="text" id="editBillName" value="${bill.name}" required>
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
          <input type="date" id="editBillDate" value="${bill.date}" required>
        </div>
        <div class="form-group">
          <label for="editBillDueDate">Due Date</label>
          <input type="date" id="editBillDueDate" value="${bill.dueDate || ""}">
        </div>
        <div class="form-group">
          <label for="editBillNote">Note</label>
          <textarea id="editBillNote">${bill.note || ""}</textarea>
        </div>
        <div class="form-group">
          <label>Members</label>
          <div id="editBillMembers" class="checkbox-group" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 8px; border-radius: 4px;"></div>
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

  // Fill the members checkboxes
  const membersContainer = document.getElementById("editBillMembers");
  members.forEach((member) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>
        <input type="checkbox" name="editBillMembers" value="${member.id}" 
          ${bill.memberIds.includes(member.id) ? "checked" : ""}> ${member.name}
      </label>
    `;
    membersContainer.appendChild(div);
  });

  // Form submission
  document
    .getElementById("editBillForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const selectedMembers = Array.from(
        document.querySelectorAll('input[name="editBillMembers"]:checked')
      ).map((checkbox) => parseInt(checkbox.value));

      if (selectedMembers.length === 0) {
        alert("Please select at least one member.");
        return;
      }

      // Update bill data
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
          paidStatus:
            document.getElementById("editBillPaidStatus").value === "true",
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

// Edit transaction
function editTransaction(transactionId) {
  // Get the transaction to edit
  const transaction = transactions.find((t) => t.id === transactionId);
  if (!transaction) return;

  // Create modal for editing
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
                (member) =>
                  `<option value="${member.id}" ${
                    transaction.memberId === member.id ? "selected" : ""
                  }>${member.name}</option>`
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
        <div id="editRelatedBillsContainer" class="form-group" ${
          transaction.type !== "payment" ? 'style="display:none;"' : ""
        }>
          <label>Related Bills</label>
          <div id="editTransactionBills" class="checkbox-group" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 8px; border-radius: 4px;"></div>
        </div>
        <button type="submit" class="btn btn-primary">Update Transaction</button>
      </form>
    </div>
  `;

  document.body.appendChild(editModal);
  editModal.style.display = "block";

  // Fill the related bills checkboxes if payment
  if (transaction.type === "payment") {
    const billsContainer = document.getElementById("editTransactionBills");
    bills
      .filter(
        (b) =>
          b.month === transaction.month &&
          b.memberIds.includes(transaction.memberId)
      )
      .forEach((bill) => {
        const div = document.createElement("div");
        div.innerHTML = `
        <label>
          <input type="checkbox" name="editTransactionBills" value="${bill.id}" 
            ${transaction.billIds?.includes(bill.id) ? "checked" : ""}> ${
          bill.name
        }
        </label>
      `;
        billsContainer.appendChild(div);
      });
  }

  // Change type handler
  document
    .getElementById("editTransactionType")
    .addEventListener("change", function () {
      const billsContainer = document.getElementById(
        "editRelatedBillsContainer"
      );
      billsContainer.style.display =
        this.value === "payment" ? "block" : "none";
    });

  // Form submission
  document
    .getElementById("editTransactionForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Get selected bills if payment
      const selectedBills = [];
      if (document.getElementById("editTransactionType").value === "payment") {
        document
          .querySelectorAll('input[name="editTransactionBills"]:checked')
          .forEach((checkbox) => {
            selectedBills.push(parseInt(checkbox.value));
          });
      }

      // Update transaction
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

        saveData();
        updateMemberMonthDetails();
        updateTransactionsList();
        updateBillsList();
        updateDashboard();

        document.body.removeChild(editModal);
        alert("Transaction updated successfully.");
      }
    });

  // Close button
  editModal.querySelector(".close").addEventListener("click", function () {
    document.body.removeChild(editModal);
  });
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
    updateMembersList(searchTerm);
    return;
  }

  // Search for bills by name
  const matchedBills = bills.filter((bill) =>
    bill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (matchedBills.length > 0) {
    // Show bills tab with relevant bills
    document.querySelector('.tab-button[data-tab="bills"]').click();
    updateBillsList(searchTerm);
    return;
  }

  // If nothing found
  alert("কোন সদস্য বা বিল পাওয়া যায়নি। অনুগ্রহ করে অনুসন্ধান পরিবর্তন করুন।");
}
