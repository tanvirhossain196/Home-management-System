// Function to get all bill types for a member
function getMemberBillTypes(memberId, monthValue) {
  const billTypes = [
    { type: "house_rent", name: "হাউজ রেন্ট", icon: "fa-home" },
    { type: "wifi", name: "ওয়াইফাই বিল", icon: "fa-wifi" },
    { type: "electricity", name: "বিদ্যুৎ বিল", icon: "fa-bolt" },
    { type: "garbage", name: "ময়লা বিল", icon: "fa-trash" },
    { type: "gas", name: "গ্যাস বিল", icon: "fa-fire" },
    { type: "cleaning", name: "পরিষ্কার বিল", icon: "fa-broom" },
  ];

  const monthBills = memberMonthDetails[memberId]?.[monthValue]?.bills || [];

  return billTypes.map((billType) => {
    const bill = monthBills.find((b) => b.category === billType.type);
    return {
      ...billType,
      amount: bill?.amount || 0,
      paid: bill?.paidStatus || false,
      dueDate: bill?.dueDate,
      paidAmount: bill?.paidAmount || 0,
      date: bill?.date,
    };
  });
}

// Update the generateMonthContent function
function generateMonthContent(memberId, monthValue) {
  const memberBills = getMemberBillTypes(memberId, monthValue);

  return `
    <div class="month-bills-container">
      <div class="bills-overview" style="margin-bottom: 24px; background: white; border-radius: 12px; padding: 20px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">
          <i class="fas fa-file-invoice-dollar" style="color: #3498db; margin-right: 8px;"></i>
          মাসিক বিলসমূহ
        </h3>

        <div class="bills-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
          ${memberBills
            .map(
              (bill) => `
            <div class="bill-card" style="background: ${
              bill.paid ? "#f8fff9" : "#fff9f9"
            }; border-radius: 8px; padding: 15px; position: relative; border: 1px solid ${
                bill.paid ? "#2ecc71" : "#e74c3c"
              };">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 40px; height: 40px; background: ${
                    bill.paid ? "#e8f5e9" : "#ffebee"
                  }; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${bill.icon}" style="color: ${
                bill.paid ? "#2ecc71" : "#e74c3c"
              };"></i>
                  </div>
                  <div>
                    <h4 style="margin: 0; font-size: 16px; color: #2c3e50;">${
                      bill.name
                    }</h4>
                    <span style="font-size: 12px; color: #7f8c8d;">
                      ${bill.date ? formatDate(bill.date) : "তারিখ নেই"}
                    </span>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: bold; color: #2c3e50;">
                    ${bill.amount.toFixed(1)} ৳
                  </div>
                  <span class="status-badge" style="font-size: 12px; padding: 2px 8px; border-radius: 12px; background: ${
                    bill.paid ? "#e8f5e9" : "#ffebee"
                  }; color: ${bill.paid ? "#2ecc71" : "#e74c3c"};">
                    ${bill.paid ? "পরিশোধিত" : "বাকি"}
                  </span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 14px; color: #7f8c8d;">
                <div>
                  <div>পরিশোধিত: ${bill.paidAmount.toFixed(1)} ৳</div>
                  <div>বাকি: ${(bill.amount - bill.paidAmount).toFixed(
                    1
                  )} ৳</div>
                </div>
                ${
                  bill.dueDate
                    ? `
                  <div style="text-align: right;">
                    <div style="color: ${
                      new Date(bill.dueDate) < new Date()
                        ? "#e74c3c"
                        : "#7f8c8d"
                    };">
                      শেষ তারিখ: ${formatDate(bill.dueDate)}
                    </div>
                  </div>
                `
                    : ""
                }
              </div>

              ${
                !bill.paid
                  ? `
                <button onclick="payBill('${memberId}', '${monthValue}', '${bill.type}')" 
                  style="width: 100%; margin-top: 10px; padding: 8px; border: none; border-radius: 6px; background: #3498db; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                  <i class="fas fa-money-bill-wave"></i> পরিশোধ করুন
                </button>
              `
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="month-summary" style="background: white; border-radius: 12px; padding: 20px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">
          <i class="fas fa-chart-pie" style="color: #3498db; margin-right: 8px;"></i>
          মাসিক সারসংক্ষেপ
        </h3>
        
        <div class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <div class="summary-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
            <div style="font-size: 14px; color: #7f8c8d;">মোট বিল</div>
            <div style="font-size: 24px; font-weight: bold; color: #2c3e50;">
              ${memberBills
                .reduce((sum, bill) => sum + bill.amount, 0)
                .toFixed(1)} ৳
            </div>
          </div>

          <div class="summary-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
            <div style="font-size: 14px; color: #7f8c8d;">পরিশোধিত</div>
            <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">
              ${memberBills
                .reduce((sum, bill) => sum + bill.paidAmount, 0)
                .toFixed(1)} ৳
            </div>
          </div>

          <div class="summary-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
            <div style="font-size: 14px; color: #7f8c8d;">বাকি</div>
            <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">
              ${memberBills
                .reduce((sum, bill) => sum + (bill.amount - bill.paidAmount), 0)
                .toFixed(1)} ৳
            </div>
          </div>

          <div class="summary-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
            <div style="font-size: 14px; color: #7f8c8d;">পরিশোধিত বিল</div>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">
              ${memberBills.filter((bill) => bill.paid).length}/${
    memberBills.length
  }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add a function to handle bill payment
function payBill(memberId, monthValue, billType) {
  // Show payment modal or handle payment logic
  const paymentModal = document.createElement("div");
  paymentModal.className = "modal";
  paymentModal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h3>বিল পরিশোধ</h3>
        <span class="close">&times;</span>
      </div>
      <div style="padding: 20px;">
        <form id="payBillForm">
          <div class="form-group">
            <label>পরিমাণ (৳)</label>
            <input type="number" id="paymentAmount" required step="0.01">
          </div>
          <div class="form-group">
            <label>তারিখ</label>
            <input type="date" id="paymentDate" required value="${
              new Date().toISOString().split("T")[0]
            }">
          </div>
          <div class="form-group">
            <label>নোট (ঐচ্ছিক)</label>
            <textarea id="paymentNote"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-check"></i> পরিশোধ নিশ্চিত করুন
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(paymentModal);
  paymentModal.style.display = "block";

  // Handle form submission
  document
    .getElementById("payBillForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Update bill payment status
      const monthDetails = memberMonthDetails[memberId][monthValue];
      const billIndex = monthDetails.bills.findIndex(
        (b) => b.category === billType
      );

      if (billIndex !== -1) {
        const amount = parseFloat(
          document.getElementById("paymentAmount").value
        );
        const date = document.getElementById("paymentDate").value;
        const note = document.getElementById("paymentNote").value;

        // Update bill
        monthDetails.bills[billIndex].paidAmount =
          (monthDetails.bills[billIndex].paidAmount || 0) + amount;
        monthDetails.bills[billIndex].paidStatus =
          monthDetails.bills[billIndex].paidAmount >=
          monthDetails.bills[billIndex].amount;

        // Add transaction
        const transaction = {
          id: generateId(),
          type: "payment",
          amount: amount,
          date: date,
          note: note,
          billIds: [monthDetails.bills[billIndex].id],
          memberId: memberId,
        };

        if (!monthDetails.transactions) monthDetails.transactions = [];
        monthDetails.transactions.push(transaction);

        // Save changes
        saveData();
        showMemberDetails(memberId);
        document.body.removeChild(paymentModal);
        showToast("বিল পরিশোধ সফল হয়েছে", "success");
      }
    });

  // Handle modal close
  paymentModal.querySelector(".close").addEventListener("click", () => {
    document.body.removeChild(paymentModal);
  });
}

// Function to format date in Bangla
function formatDateBangla(dateString) {
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
}

// Function to show toast notifications
function showToast(message, type = "info") {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");
  const toastIcon = toast.querySelector(".toast-icon i");

  toastMessage.textContent = message;

  // Set icon and color based on type
  switch (type) {
    case "success":
      toastIcon.className = "fas fa-check-circle";
      toast.style.borderColor = "#2ecc71";
      break;
    case "error":
      toastIcon.className = "fas fa-times-circle";
      toast.style.borderColor = "#e74c3c";
      break;
    default:
      toastIcon.className = "fas fa-info-circle";
      toast.style.borderColor = "#3498db";
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
