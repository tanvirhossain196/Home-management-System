// Settings management functionality

// Default bill settings form submission
function updateDefaultBillForm() {
  const defaultBillContainer = document.getElementById("defaultBillInputs");
  if (!defaultBillContainer) return;

  defaultBillContainer.innerHTML = `
        <div class="form-group">
            <label for="defaultWifiBill">WiFi Bill (USD)</label>
            <input type="number" id="defaultWifiBill" value="${
              settings.defaultBills.wifiBill
            }" step="0.01">
        </div>
        <div class="form-group">
            <label for="defaultGasBill">Gas Bill (USD)</label>
            <input type="number" id="defaultGasBill" value="${
              settings.defaultBills.gasBill
            }" step="0.01">
        </div>
        <div class="form-group">
            <label for="defaultWasteBill">Waste Bill (USD)</label>
            <input type="number" id="defaultWasteBill" value="${
              settings.defaultBills.wasteBill
            }" step="0.01">
        </div>
        <div class="form-group">
            <label for="defaultElectricityBill">Electricity Bill (USD)</label>
            <input type="number" id="defaultElectricityBill" value="${
              settings.defaultBills.electricityBill
            }" step="0.01">
        </div>
        <div class="form-group">
            <label for="defaultCamera">Camera Bill (USD)</label>
            <input type="number" id="defaultCamera" value="${
              settings.defaultBills.camera
            }" step="0.01">
        </div>
        <div class="form-group">
            <label for="defaultCleaningBill">Maid Bill (USD)</label>
            <input type="number" id="defaultCleaningBill" value="${
              settings.defaultBills.maidBill
            }" step="0.01">
        </div>
        ${settings.customCategories
          .map(
            (cat) => `
            <div class="form-group">
                <label for="default${cat.id}">${cat.name} (USD)</label>
                <input type="number" id="default${cat.id}" value="${
              settings.defaultBills[cat.id] || 0
            }" step="0.01">
            </div>
        `
          )
          .join("")}
    `;
}

function updateBillCategoryOptions() {
  const billCategorySelect = document.getElementById("billCategory");
  if (!billCategorySelect) return;

  billCategorySelect.innerHTML = `
        <option value="">Select a category</option>
        <option value="rent">Rent</option>
        <option value="utility">Utility</option>
        <option value="meal">Meal</option>
        <option value="service">Service</option>
        <option value="other">Other</option>
        ${settings.customCategories
          .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
          .join("")}
    `;

  const recurringBillCategorySelect = document.getElementById(
    "recurringBillCategory"
  );
  if (recurringBillCategorySelect) {
    recurringBillCategorySelect.innerHTML = billCategorySelect.innerHTML;
  }
}

function addCustomBillCategory(name) {
  const categoryId = `custom-${Date.now()}`;
  settings.customCategories.push({ id: categoryId, name });
  settings.defaultBills[categoryId] = 0;
  saveData();
  updateBillCategoryOptions();
  updateQuickAddBillModal();
}

// Initialize settings
document.addEventListener("DOMContentLoaded", function () {
  // Default bill settings form
  document
    .getElementById("defaultBillSettingsForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();
      settings.defaultBills = {
        wifiBill:
          parseFloat(document.getElementById("defaultWifiBill")?.value) || 180,
        gasBill:
          parseFloat(document.getElementById("defaultGasBill")?.value) || 135,
        wasteBill:
          parseFloat(document.getElementById("defaultWasteBill")?.value) ||
          12.5,
        electricityBill:
          parseFloat(
            document.getElementById("defaultElectricityBill")?.value
          ) || 155,
        camera:
          parseFloat(document.getElementById("defaultCamera")?.value) || 145,
        maidBill:
          parseFloat(document.getElementById("defaultCleaningBill")?.value) ||
          100,
        ...Object.fromEntries(
          settings.customCategories.map((category) => [
            category.id,
            parseFloat(
              document.getElementById(`default${category.id}`)?.value
            ) || 0,
          ])
        ),
      };
      saveData();
      updateQuickAddBillModal();
      alert("Default bill settings saved successfully.");
    });

  // Add custom category form
  document
    .getElementById("addCustomCategoryForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();
      const categoryName = document.getElementById("customCategoryName")?.value;
      if (categoryName) {
        addCustomBillCategory(categoryName);
        this.reset();
        document.getElementById("addCustomCategoryForm").style.display = "none";
        alert("Custom category added successfully.");
      }
    });

  // Show add custom category form
  document
    .getElementById("addCustomCategoryBtn")
    ?.addEventListener("click", function () {
      document.getElementById("addCustomCategoryForm").style.display = "block";
    });

  // Data export
  document.getElementById("exportData")?.addEventListener("click", function () {
    const exportData = {
      members: members,
      months: months,
      bills: bills,
      transactions: transactions,
      settings: settings,
      memberMonthDetails: memberMonthDetails,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "home_manager_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    alert("Data exported successfully.");
  });

  // Data import
  document.getElementById("importData")?.addEventListener("click", function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = function (event) {
      const file = event.target.files[0];
      if (!file) return;

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
            members = importedData.members;
            months = importedData.months;
            bills = importedData.bills;
            transactions = importedData.transactions;
            settings = importedData.settings;
            memberMonthDetails = importedData.memberMonthDetails || {};
            currentMonth = months[0]?.value || "";
            saveData();
            updateMemberMonthDetails();
            updateMonthTabs();
            updateMonthSelector();
            updateMembersList();
            updateDashboard();
            updateBillsList();
            updateTransactionsList();
            updateTransactionMemberFilter();
            updateMemberCheckboxes();
            alert("Data imported successfully.");
          } else {
            alert("Invalid data format.");
          }
        } catch (error) {
          console.error("Error importing data:", error);
          alert("Error importing data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // Clear all data
  document.getElementById("clearData")?.addEventListener("click", function () {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone!"
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

  // Generate report
  document
    .getElementById("generateReport")
    ?.addEventListener("click", function () {
      document.getElementById("reportModal").style.display = "block";
    });

  document
    .getElementById("generateReportBtn")
    ?.addEventListener("click", function () {
      // Here you would implement the report generation logic
      const reportType = document.getElementById("reportType").value;
      const reportMonth = document.getElementById("reportMonth").value;
      const reportMember = document.getElementById("reportMember").value;
      const reportFormat = document.getElementById("reportFormat").value;

      alert(
        `Report of type ${reportType} is being generated. This feature is not fully implemented.`
      );
      document.getElementById("reportModal").style.display = "none";
    });

  // Appearance settings
  document.querySelectorAll(".color-option").forEach((option) => {
    option.addEventListener("click", function () {
      const theme = this.getAttribute("data-theme");
      document
        .querySelectorAll(".color-option")
        .forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");

      // Remove previous theme classes
      document.body.classList.remove(
        "theme-green",
        "theme-purple",
        "theme-orange",
        "theme-red"
      );

      // Add selected theme class if not default
      if (theme !== "default") {
        document.body.classList.add(`theme-${theme}`);
      }

      // Save theme preference
      localStorage.setItem("theme", theme);
    });
  });

  document.querySelectorAll(".font-size-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const size = this.getAttribute("data-size");
      document
        .querySelectorAll(".font-size-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Remove previous size classes
      document.body.classList.remove("font-small", "font-medium", "font-large");

      // Add selected size class
      document.body.classList.add(`font-${size}`);

      // Save size preference
      localStorage.setItem("fontSize", size);
    });
  });

  // Dark mode toggle
  document
    .getElementById("darkModeToggle")
    ?.addEventListener("change", function () {
      document.body.classList.toggle("dark-mode", this.checked);
      localStorage.setItem("darkMode", this.checked);
    });

  // Load appearance preferences
  if (localStorage.getItem("darkMode") === "true") {
    document.getElementById("darkModeToggle").checked = true;
    document.body.classList.add("dark-mode");
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document
      .querySelector(`.color-option[data-theme="${savedTheme}"]`)
      ?.click();
  }

  const savedFontSize = localStorage.getItem("fontSize");
  if (savedFontSize) {
    document
      .querySelector(`.font-size-btn[data-size="${savedFontSize}"]`)
      ?.click();
  }
});
