// Members management functionality

function updateMembersList(searchTerm = "") {
  const membersListContainer = document.getElementById("membersList");
  if (!membersListContainer) return;

  membersListContainer.innerHTML = "";
  const filteredMembers = searchTerm
    ? members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.room?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : members;

  if (!filteredMembers.length) {
    membersListContainer.innerHTML = "<p>No members found.</p>";
    return;
  }

  filteredMembers.forEach((member) => {
    const memberCard = document.createElement("div");
    memberCard.className = "member-grid-item";

    // Avatar container
    const avatarContainer = document.createElement("div");
    avatarContainer.className = "member-avatar-container";

    if (member.image) {
      // Image avatar
      const img = document.createElement("img");
      img.src = member.image;
      img.alt = member.name;
      avatarContainer.appendChild(img);
    } else {
      // Default text avatar
      const defaultAvatar = document.createElement("div");
      defaultAvatar.className = "default-avatar";
      defaultAvatar.textContent = member.name.charAt(0);
      avatarContainer.appendChild(defaultAvatar);
    }

    memberCard.appendChild(avatarContainer);

    // Member details container
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "member-details";

    // Name
    const nameElem = document.createElement("h3");
    nameElem.textContent = member.name;
    detailsContainer.appendChild(nameElem);

    // Room
    const roomElem = document.createElement("p");
    roomElem.textContent = `Room: ${member.room || "N/A"}`;
    detailsContainer.appendChild(roomElem);

    // Phone
    const phoneElem = document.createElement("p");
    phoneElem.textContent = `Phone: ${member.phone || "N/A"}`;
    detailsContainer.appendChild(phoneElem);

    // Balance
    const balanceElem = document.createElement("p");
    const balance = calculateMemberBalance(member.id, currentMonth);
    balanceElem.innerHTML = `Balance: <span class="balance-info ${
      balance >= 0 ? "positive" : "negative"
    }">${balance.toFixed(1)} USD</span>`;
    detailsContainer.appendChild(balanceElem);

    memberCard.appendChild(detailsContainer);

    memberCard.addEventListener("click", () => showMemberDetails(member.id));
    membersListContainer.appendChild(memberCard);
  });
}

// Function to show member details with improved layout
function showMemberDetails(memberId) {
  const member = getMemberById(memberId);
  if (!member) return;

  const detailSection = document.getElementById("memberDetailSection");
  const listSection = document.getElementById("membersListSection");
  const detailContainer = document.querySelector(".member-detail-container");

  if (!detailSection || !listSection || !detailContainer) return;

  listSection.style.display = "none";
  detailSection.style.display = "block";

  // Professional member profile with comprehensive history
  detailContainer.innerHTML = `
    <div class="member-profile-card" style="background: linear-gradient(135deg, #ffffff, #f8f9fa); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px; position: relative;">
      <div class="profile-header" style="display: flex; align-items: flex-start; background: linear-gradient(135deg, #3498db, #2980b9); padding: 30px 20px; color: white; position: relative;">
        <div class="profile-pic" style="position: relative; width: 180px; height: 180px; margin-right: 30px; border-radius: 10px; border: 5px solid white; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          ${
            member.image
              ? `<img src="${member.image}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover;">`
              : `<div class="avatar" style="width: 100%; height: 100%; background: linear-gradient(135deg, #3498db, #8e44ad); display: flex; align-items: center; justify-content: center; font-size: 80px; font-weight: bold; color: white;">${member.name.charAt(
                  0
                )}</div>`
          }
        </div>
        <div class="profile-info" style="flex: 1;">
          <h2 style="margin-top: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${
            member.name
          }</h2>
          <div class="member-tags" style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 14px;">
              <i class="fas fa-home" style="margin-right: 5px;"></i> রুম ${
                member.room || "N/A"
              }
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 14px;">
              <i class="fas fa-phone" style="margin-right: 5px;"></i> ${
                member.phone || "N/A"
              }
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 14px;">
              <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> ${formatDate(
                member.joinDate
              )} থেকে সদস্য
            </span>
          </div>
          
          <div class="financial-summary" style="margin-top: 20px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <h3 style="margin-top: 0; font-size: 18px; margin-bottom: 15px;">আর্থিক সারাংশ</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                <div style="font-size: 14px; margin-bottom: 5px;">মোট বিল</div>
                <div style="font-size: 20px; font-weight: bold;">${calculateTotalBills(
                  memberId
                ).toFixed(1)} ৳</div>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                <div style="font-size: 14px; margin-bottom: 5px;">মোট পেমেন্ট</div>
                <div style="font-size: 20px; font-weight: bold;">${calculateTotalPayments(
                  memberId
                ).toFixed(1)} ৳</div>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                <div style="font-size: 14px; margin-bottom: 5px;">বর্তমান ব্যালেন্স</div>
                <div style="font-size: 20px; font-weight: bold; color: ${
                  calculateTotalBalance(memberId) >= 0 ? "#2ecc71" : "#e74c3c"
                };">${calculateTotalBalance(memberId).toFixed(1)} ৳</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-stats" style="display: flex; justify-content: space-around; padding: 20px; border-bottom: 1px solid #eee;">
        <div class="stat-item" style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #3498db;">${calculateTotalBills(
            memberId
          ).toFixed(1)} ৳</div>
          <div style="color: #7f8c8d; font-size: 14px;">মোট বিল</div>
        </div>
        <div class="stat-item" style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">${calculateTotalPayments(
            memberId
          ).toFixed(1)} ৳</div>
          <div style="color: #7f8c8d; font-size: 14px;">মোট পরিশোধিত</div>
        </div>
        <div class="stat-item" style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: ${
            calculateTotalBalance(memberId) >= 0 ? "#2ecc71" : "#e74c3c"
          };">${calculateTotalBalance(memberId).toFixed(1)} ৳</div>
          <div style="color: #7f8c8d; font-size: 14px;">ব্যালেন্স</div>
        </div>
      </div>
      
      <div class="profile-info" style="padding: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <div style="flex: 1; min-width: 180px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="fas fa-money-bill-wave" style="color: #2ecc71; margin-right: 8px; font-size: 18px;"></i>
              <div style="font-weight: bold; font-size: 16px;">বাকি বিল</div>
            </div>
            <div style="font-size: 24px; font-weight: bold; color: ${
              calculateMemberDues(memberId) > 0 ? "#e74c3c" : "#2ecc71"
            };">${calculateMemberDues(memberId).toFixed(1)} ৳</div>
          </div>
          
          <div style="flex: 1; min-width: 180px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="fas fa-exclamation-circle" style="color: #e74c3c; margin-right: 8px; font-size: 18px;"></i>
              <div style="font-weight: bold; font-size: 16px;">অবশিষ্ট পেমেন্ট</div>
            </div>
            <div style="font-size: 24px; font-weight: bold; color: ${
              calculateMemberDues(memberId) > 0 ? "#e74c3c" : "#2ecc71"
            };">${Math.max(0, calculateMemberDues(memberId)).toFixed(1)} ৳</div>
          </div>
          
          <div style="flex: 1; min-width: 180px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="fas fa-file-invoice-dollar" style="color: #3498db; margin-right: 8px; font-size: 18px;"></i>
              <div style="font-weight: bold; font-size: 16px;">মোট বিল সংখ্যা</div>
            </div>
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">
              ${
                bills.filter((bill) => bill.memberIds.includes(memberId)).length
              }
            </div>
          </div>
        </div>
        
        ${
          member.note
            ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <i class="fas fa-sticky-note" style="color: #f39c12; margin-right: 8px; font-size: 18px;"></i>
                <div style="font-weight: bold; font-size: 16px;">নোট</div>
              </div>
              <div>${member.note}</div>
            </div>
            `
            : ""
        }
      </div>
    </div>

    <div class="monthly-details-tabs">
      <h3 style="position: relative; font-size: 18px; margin-bottom: 20px; padding-bottom: 10px; color: #2c3e50;">
        <i class="fas fa-calendar-alt" style="color: #3498db; margin-right: 8px;"></i>
        মাসিক হিসাব
        <span style="position: absolute; bottom: 0; left: 0; width: 50px; height: 3px; background: linear-gradient(90deg, #3498db, #9b59b6);"></span>
      </h3>
      
      <div class="monthly-tab-container">
        ${generateMonthlyTabs(memberId)}
      </div>
    </div>
    
    <div class="actions" style="display: flex; gap: 12px; margin-top: 30px;">
      <button onclick="editMember(${memberId})" class="btn btn-primary" style="background: linear-gradient(to right, #3498db, #2980b9); border: none; padding: 10px 20px; border-radius: 50px; color: white; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <i class="fas fa-user-edit"></i> সদস্য সম্পাদনা
      </button>
      <button onclick="deleteMember(${memberId})" class="btn btn-danger" style="background: linear-gradient(to right, #e74c3c, #c0392b); border: none; padding: 10px 20px; border-radius: 50px; color: white; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <i class="fas fa-user-minus"></i> সদস্য মুছুন
      </button>
    </div>
  `;

  // Initialize tabs interactivity after adding to DOM
  initializeMonthlyTabs();
}

// Generate monthly tab structure
function generateMonthlyTabs(memberId) {
  // Create tabs
  const tabsHtml = `
    <div class="tabs" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; overflow-x: auto;">
      ${months
        .map(
          (month, index) => `
        <div class="month-tab ${index === 0 ? "active" : ""}" data-month="${
            month.value
          }" style="padding: 8px 16px; border-radius: 50px; background: ${
            index === 0
              ? "linear-gradient(to right, #3498db, #2980b9)"
              : "#f1f2f6"
          }; color: ${
            index === 0 ? "white" : "#7f8c8d"
          }; font-size: 14px; cursor: pointer; transition: all 0.3s ease; box-shadow: ${
            index === 0 ? "0 4px 10px rgba(0,0,0,0.1)" : "none"
          };">
          ${month.name}
        </div>
      `
        )
        .join("")}
    </div>
    
    <div class="tab-content">
      ${months
        .map(
          (month, index) => `
        <div class="month-content" data-month="${
          month.value
        }" style="display: ${index === 0 ? "block" : "none"};">
          ${generateMonthContent(memberId, month.value)}
        </div>
      `
        )
        .join("")}
    </div>
  `;

  return tabsHtml;
}

// Initialize tab switching functionality
function initializeMonthlyTabs() {
  const tabs = document.querySelectorAll(".month-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.style.background = "#f1f2f6";
        t.style.color = "#7f8c8d";
        t.style.boxShadow = "none";
      });

      // Add active class to clicked tab
      this.classList.add("active");
      this.style.background = "linear-gradient(to right, #3498db, #2980b9)";
      this.style.color = "white";
      this.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";

      // Hide all content
      const contents = document.querySelectorAll(".month-content");
      contents.forEach((content) => {
        content.style.display = "none";
      });

      // Show selected content
      const monthValue = this.getAttribute("data-month");
      document.querySelector(
        `.month-content[data-month="${monthValue}"]`
      ).style.display = "block";
    });
  });
}

// Generate detailed month content
function generateMonthContent(memberId, monthValue) {
  const monthDetails = memberMonthDetails[memberId]?.[monthValue] || {
    bills: [],
    transactions: [],
    balance: 0,
    dues: 0,
  };

  // Calculate totals
  const totalOwed = monthDetails.bills.reduce((sum, bill) => {
    const share =
      bill.distribution === "equal"
        ? bill.amount / bill.memberIds.length
        : bill.customDistribution?.find((d) => d.memberId === memberId)
            ?.amount || 0;
    return sum + share;
  }, 0);

  const totalPaid = monthDetails.transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalPaid - totalOwed;

  return `
    <div class="month-summary" style="margin-bottom: 24px; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow: hidden; position: relative;">
      <div style="position: absolute; top: 0; left: 0; height: 4px; width: 100%; background: linear-gradient(to right, #3498db, #2ecc71);"></div>
      <h4 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">মাসিক সারাংশ</h4>
      
      <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <div class="summary-card" style="flex: 1; min-width: 200px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">মোট দেনা</div>
          <div style="font-size: 20px; font-weight: bold; color: #34495e;">${totalOwed.toFixed(
            1
          )} ৳</div>
        </div>
        
        <div class="summary-card" style="flex: 1; min-width: 200px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">মোট পরিশোধিত</div>
          <div style="font-size: 20px; font-weight: bold; color: #34495e;">${totalPaid.toFixed(
            1
          )} ৳</div>
        </div>
        
        <div class="summary-card" style="flex: 1; min-width: 200px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">ব্যালেন্স</div>
          <div style="font-size: 20px; font-weight: bold; color: ${
            balance >= 0 ? "#2ecc71" : "#e74c3c"
          };">
            ${balance.toFixed(1)} ৳
            <small style="font-size: 12px; opacity: 0.7;">${
              balance >= 0 ? "(জমা)" : "(বাকি)"
            }</small>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bills-section" style="margin-bottom: 24px; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow: hidden; position: relative;">
      <div style="position: absolute; top: 0; left: 0; height: 4px; width: 100%; background: linear-gradient(to right, #e74c3c, #f39c12);"></div>
      <h4 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">
        <i class="fas fa-file-invoice-dollar" style="color: #e74c3c; margin-right: 8px;"></i>
        বিলসমূহ
      </h4>
      
      ${
        monthDetails.bills.length > 0
          ? `<div class="bills-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${monthDetails.bills
              .map((bill) => {
                const share =
                  bill.distribution === "equal"
                    ? bill.amount / bill.memberIds.length
                    : bill.customDistribution?.find(
                        (d) => d.memberId === memberId
                      )?.amount || 0;

                const paid = bill.paidBy
                  .filter((p) => p.memberId === memberId)
                  .reduce((sum, p) => sum + p.amount, 0);

                const due = share - paid;

                return `
                <div class="bill-item" style="background: #f8f9fa; border-radius: 8px; padding: 15px; position: relative; transition: all 0.3s ease; border-left: 4px solid ${
                  bill.paidStatus ? "#2ecc71" : "#f39c12"
                };">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>
                      <h5 style="margin: 0; font-size: 16px; color: #2c3e50;">${
                        bill.name
                      }</h5>
                      <span style="display: block; font-size: 13px; color: #7f8c8d; margin-top: 4px;">
                        <i class="fas fa-calendar-day" style="margin-right: 4px;"></i>
                        ${formatDate(bill.date)}
                        ${
                          bill.dueDate
                            ? ` | শেষ তারিখ: ${formatDate(bill.dueDate)}`
                            : ""
                        }
                      </span>
                    </div>
                    <div>
                      <span class="status-badge ${
                        bill.paidStatus ? "paid" : "pending"
                      }" style="padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${
                  bill.paidStatus ? "#e8f5e9" : "#fff3e0"
                }; color: ${bill.paidStatus ? "#2e7d32" : "#e65100"};">
                        ${bill.paidStatus ? "পরিশোধিত" : "বাকি"}
                      </span>
                    </div>
                  </div>
                  
                  <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px;">
                    <div style="min-width: 100px;">
                      <div style="font-size: 12px; color: #7f8c8d;">আপনার অংশ</div>
                      <div style="font-weight: bold;">${share.toFixed(
                        1
                      )} ৳</div>
                    </div>
                    <div style="min-width: 100px;">
                      <div style="font-size: 12px; color: #7f8c8d;">পরিশোধিত</div>
                      <div style="font-weight: bold;">${paid.toFixed(1)} ৳</div>
                    </div>
                    <div style="min-width: 100px;">
                      <div style="font-size: 12px; color: #7f8c8d;">বাকি</div>
                      <div style="font-weight: bold; color: ${
                        due <= 0 ? "#2ecc71" : "#e74c3c"
                      };">${due.toFixed(1)} ৳</div>
                    </div>
                  </div>
                  
                  ${
                    bill.note
                      ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e0e0e0; font-size: 13px; color: #7f8c8d;">
                        <i class="fas fa-sticky-note" style="margin-right: 5px;"></i> ${bill.note}
                      </div>`
                      : ""
                  }
                </div>
              `;
              })
              .join("")}
          </div>`
          : `<div style="text-align: center; padding: 30px 0; color: #95a5a6;">
            <i class="fas fa-file-invoice" style="font-size: 40px; margin-bottom: 10px; opacity: 0.3;"></i>
            <p>এই মাসে কোন বিল নেই।</p>
          </div>`
      }
    </div>
    
    <div class="transactions-section" style="margin-bottom: 24px; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow: hidden; position: relative;">
      <div style="position: absolute; top: 0; left: 0; height: 4px; width: 100%; background: linear-gradient(to right, #2ecc71, #3498db);"></div>
      <h4 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">
        <i class="fas fa-exchange-alt" style="color: #2ecc71; margin-right: 8px;"></i>
        লেনদেন
      </h4>
      
      ${
        monthDetails.transactions.length > 0
          ? `<div class="transactions-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${monthDetails.transactions
              .map((transaction) => {
                let typeIcon, typeColor, bgColor, typeText;

                switch (transaction.type) {
                  case "payment":
                    typeIcon = "fa-money-bill-wave";
                    typeColor = "#27ae60";
                    bgColor = "#e8f5e9";
                    typeText = "পেমেন্ট";
                    break;
                  case "expense":
                    typeIcon = "fa-shopping-cart";
                    typeColor = "#e74c3c";
                    bgColor = "#ffebee";
                    typeText = "খরচ";
                    break;
                  case "deposit":
                    typeIcon = "fa-piggy-bank";
                    typeColor = "#3498db";
                    bgColor = "#e3f2fd";
                    typeText = "জমা";
                    break;
                  default:
                    typeIcon = "fa-exchange-alt";
                    typeColor = "#7f8c8d";
                    bgColor = "#f5f5f5";
                    typeText = transaction.type;
                }

                return `
                <div class="transaction-item" style="background: #f8f9fa; border-radius: 8px; padding: 15px; position: relative; transition: all 0.3s ease; display: flex; align-items: center; gap: 15px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; color: ${typeColor};">
                    <i class="fas ${typeIcon}"></i>
                  </div>
                  
                  <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <div style="font-weight: bold; color: #2c3e50;">${typeText}</div>
                      <div style="font-weight: bold; color: ${typeColor};">${transaction.amount.toFixed(
                  1
                )} ৳</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between;">
                      <div style="font-size: 13px; color: #7f8c8d;">
                        <i class="fas fa-calendar-day" style="margin-right: 4px;"></i>
                        ${formatDate(transaction.date)}
                      </div>
                      
                      ${
                        transaction.billIds && transaction.billIds.length > 0
                          ? `<div style="font-size: 13px; color: #7f8c8d;">
                            <i class="fas fa-file-invoice" style="margin-right: 4px;"></i>
                            বিল: ${transaction.billIds
                              .map((id) => {
                                const bill = bills.find((b) => b.id === id);
                                return bill ? bill.name : "অজানা";
                              })
                              .join(", ")}
                          </div>`
                          : ""
                      }
                    </div>
                    
                    ${
                      transaction.note
                        ? `<div style="margin-top: 5px; font-size: 13px; color: #7f8c8d;">
                          <i class="fas fa-sticky-note" style="margin-right: 4px;"></i>
                          ${transaction.note}
                        </div>`
                        : ""
                    }
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>`
          : `<div style="text-align: center; padding: 30px 0; color: #95a5a6;">
            <i class="fas fa-exchange-alt" style="font-size: 40px; margin-bottom: 10px; opacity: 0.3;"></i>
            <p>এই মাসে কোন লেনদেন নেই।</p>
          </div>`
      }
    </div>
  `;
}

// Helper function to calculate total bills for a member across all months
function calculateTotalBills(memberId) {
  let total = 0;
  Object.values(memberMonthDetails[memberId] || {}).forEach((month) => {
    total += month.bills.reduce((sum, bill) => {
      const share =
        bill.distribution === "equal"
          ? bill.amount / bill.memberIds.length
          : bill.customDistribution?.find((d) => d.memberId === memberId)
              ?.amount || 0;
      return sum + share;
    }, 0);
  });
  return total;
}

// Helper function to calculate total payments for a member across all months
function calculateTotalPayments(memberId) {
  let total = 0;
  Object.values(memberMonthDetails[memberId] || {}).forEach((month) => {
    total += month.transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0);
  });
  return total;
}

// Helper function to calculate total balance for a member across all months
function calculateTotalBalance(memberId) {
  return calculateTotalPayments(memberId) - calculateTotalBills(memberId);
}

// Helper function to calculate dues
function calculateMemberDues(memberId) {
  let unpaidBills = 0;
  Object.values(memberMonthDetails[memberId] || {}).forEach((month) => {
    month.bills.forEach((bill) => {
      if (!bill.paidStatus) {
        const share =
          bill.distribution === "equal"
            ? bill.amount / bill.memberIds.length
            : bill.customDistribution?.find((d) => d.memberId === memberId)
                ?.amount || 0;
        unpaidBills += share;
      }
    });
  });
  return unpaidBills;
}

// Format date for display in Bangla
function formatDateBangla(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  // Convert to Bangla numerals and month names
  const banglaMonths = [
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

  const day = date.getDate();
  const month = banglaMonths[date.getMonth()];
  const year = date.getFullYear();

  // Convert to Bangla digits
  const toBanglaDigits = (num) => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
      .toString()
      .split("")
      .map((digit) =>
        isNaN(parseInt(digit)) ? digit : banglaDigits[parseInt(digit)]
      )
      .join("");
  };

  return `${toBanglaDigits(day)} ${month}, ${toBanglaDigits(year)}`;
}

// Convert any currency amount to Bangla digits
function formatAmountBangla(amount) {
  if (amount === null || amount === undefined) return "N/A";

  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const numStr = amount.toFixed(2).toString();

  return numStr
    .split("")
    .map((char) => {
      if (char === ".") return ".";
      if (isNaN(parseInt(char))) return char;
      return banglaDigits[parseInt(char)];
    })
    .join("");
}

// Update the bill and transaction lists to use Bangla everywhere
function updateAllDisplaysWithBangla() {
  // This function can be called whenever you need to update all the displays
  // to ensure everything is shown in Bangla currency and digits

  // Update dashboard totals
  const currencyElements = document.querySelectorAll(
    ".transaction-amount, .stat-value, .balance-info"
  );
  currencyElements.forEach((element) => {
    const currentText = element.textContent;
    if (currentText.includes("$") || currentText.includes("USD")) {
      // Replace USD currency with BDT
      const numericValue = parseFloat(currentText.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(numericValue)) {
        element.textContent = `${formatAmountBangla(numericValue)} ৳`;
      }
    }
  });

  // Update all dates
  const dateElements = document.querySelectorAll(".transaction-date");
  dateElements.forEach((element) => {
    // This is a simplified approach - in a real implementation you'd need to
    // parse out the date and convert just that part
    const currentText = element.textContent;
    const datePattern = /\d{1,2} [A-Za-z]{3,}, \d{4}/;
    const match = currentText.match(datePattern);
    if (match) {
      const datePart = match[0];
      const dateObj = new Date(datePart);
      if (!isNaN(dateObj.getTime())) {
        element.textContent = currentText.replace(
          datePart,
          formatDateBangla(dateObj)
        );
      }
    }
  });
}

// This function should be called after initializing the member details
function enhanceWithBanglaDisplay() {
  // This ensures all currency amounts are displayed in Bangla format with ৳ symbol
  updateAllDisplaysWithBangla();

  // Also ensure new tabs initialize with Bangla display when clicked
  document.querySelectorAll(".month-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      // Short timeout to allow content to render before updating display
      setTimeout(updateAllDisplaysWithBangla, 100);
    });
  });
}

// Update the initialize function to use Bangla everywhere
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all your default components

  // Then apply the Bangla enhancements
  enhanceWithBanglaDisplay();
});

function editMember(memberId) {
  const member = getMemberById(memberId);
  if (!member) return;

  const editModal = document.createElement("div");
  editModal.className = "modal";
  editModal.style.zIndex = "1050";

  // Compact, professional modal design
  editModal.innerHTML = `
    <div class="modal-content" style="border-radius: 12px; border: none; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; padding: 0;">
      <!-- Header -->
      <div style="background: #3498db; padding: 15px 20px; color: white; position: relative; display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-user-edit" style="font-size: 18px;"></i>
        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Edit Member</h2>
        <span class="close" style="position: absolute; top: 12px; right: 15px; font-size: 20px; color: white; cursor: pointer;">&times;</span>
      </div>
      
      <form id="editMemberForm" style="padding: 15px;">
        <!-- Name field -->
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #2c3e50; font-size: 14px;">Name</label>
          <div style="position: relative;">
            <i class="fas fa-user" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #3498db;"></i>
            <input type="text" id="editMemberName" value="${
              member.name
            }" required style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
          </div>
        </div>
        
        <!-- Phone field -->
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #2c3e50; font-size: 14px;">Phone</label>
          <div style="position: relative;">
            <i class="fas fa-phone" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #27ae60;"></i>
            <input type="text" id="editMemberPhone" value="${
              member.phone || ""
            }" style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
          </div>
        </div>
        
        <!-- Room field -->
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #2c3e50; font-size: 14px;">Room</label>
          <div style="position: relative;">
            <i class="fas fa-home" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9b59b6;"></i>
            <input type="text" id="editMemberRoom" value="${
              member.room || ""
            }" style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
          </div>
        </div>
        
        <!-- Join Date field -->
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #2c3e50; font-size: 14px;">Join Date</label>
          <div style="position: relative;">
            <i class="fas fa-calendar-alt" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #e74c3c;"></i>
            <input type="date" id="editMemberJoinDate" value="${
              member.joinDate
            }" required style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
          </div>
        </div>
        
        <!-- Note field -->
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #2c3e50; font-size: 14px;">Note</label>
          <div style="position: relative;">
            <i class="fas fa-sticky-note" style="position: absolute; left: 10px; top: 12px; color: #f39c12;"></i>
            <textarea id="editMemberNote" style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; min-height: 60px; resize: vertical;">${
              member.note || ""
            }</textarea>
          </div>
        </div>
        
        <!-- Profile Picture field with preview -->
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #2c3e50; font-size: 14px;">Profile Picture</label>
          <div style="display: flex; gap: 15px; align-items: center;">
            <div style="flex: 3;">
              <div style="position: relative; overflow: hidden; border-radius: 6px; border: 1px dashed #3498db; padding: 8px; text-align: center; cursor: pointer; background: #f8f9fa;">
                <input type="file" id="editMemberImage" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 16px; color: #3498db; margin-bottom: 4px;"></i>
                <div style="font-size: 12px; color: #7f8c8d;">Click to choose</div>
                <div id="fileNameDisplay" style="font-size: 11px; color: #3498db; margin-top: 3px;">No file chosen</div>
              </div>
            </div>
            
            <div style="flex: 1; display: flex; justify-content: center;">
              <div id="imagePreviewContainer" style="width: 70px; height: 70px; border-radius: 50%; overflow: hidden; background-color: #3498db; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">
                ${
                  member.image
                    ? `<img src="${member.image}" alt="${member.name}" id="imagePreview" style="width: 100%; height: 100%; object-fit: cover;">`
                    : member.name.charAt(0).toUpperCase()
                }
              </div>
            </div>
          </div>
        </div>
        
        <!-- Submit button -->
        <button type="submit" style="width: 100%; padding: 12px; border: none; border-radius: 6px; background: #3498db; color: white; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 5px;">
          <i class="fas fa-save"></i> Update Member
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(editModal);
  editModal.style.display = "block";

  // Handle file selection display
  const fileInput = document.getElementById("editMemberImage");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  const imagePreview = document.getElementById("imagePreviewContainer");

  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      fileNameDisplay.textContent = this.files[0].name;

      // Create image preview
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" id="imagePreview" style="width: 100%; height: 100%; object-fit: cover;">`;
      };
      reader.readAsDataURL(this.files[0]);
    } else {
      fileNameDisplay.textContent = "No file chosen";
    }
  });

  // Close button
  editModal.querySelector(".close").addEventListener("click", () => {
    document.body.removeChild(editModal);
  });

  // Form submission
  document
    .getElementById("editMemberForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const imageInput = document.getElementById("editMemberImage");
      let imageData = member.image; // Keep existing image by default

      if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imageData = e.target.result; // Update with new image data
          updateMemberData(memberId, imageData);
        };
        reader.readAsDataURL(imageInput.files[0]);
      } else {
        updateMemberData(memberId, imageData);
      }
    });

  function updateMemberData(memberId, imageData) {
    const index = members.findIndex((m) => m.id === memberId);
    if (index !== -1) {
      members[index] = {
        ...members[index],
        name: document.getElementById("editMemberName").value,
        phone: document.getElementById("editMemberPhone").value,
        room: document.getElementById("editMemberRoom").value,
        joinDate: document.getElementById("editMemberJoinDate").value,
        note: document.getElementById("editMemberNote").value,
        image: imageData, // Save the image data permanently
      };

      saveData(); // Save to localStorage
      updateMembersList();
      updateTransactionMemberFilter();
      updateMemberCheckboxes();
      showMemberDetails(memberId);

      // Remove modal
      document.body.removeChild(editModal);
      alert("Member updated successfully.");
    }
  }
}

// Helper function to calculate total bills for a member across all months
function calculateTotalBills(memberId) {
  let total = 0;
  Object.values(memberMonthDetails[memberId] || {}).forEach((month) => {
    total += month.bills.reduce((sum, bill) => {
      const share =
        bill.distribution === "equal"
          ? bill.amount / bill.memberIds.length
          : bill.customDistribution?.find((d) => d.memberId === memberId)
              ?.amount || 0;
      return sum + share;
    }, 0);
  });
  return total;
}

// Helper function to calculate total payments for a member across all months
function calculateTotalPayments(memberId) {
  let total = 0;
  Object.values(memberMonthDetails[memberId] || {}).forEach((month) => {
    total += month.transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0);
  });
  return total;
}

// Helper function to calculate total balance for a member across all months
function calculateTotalBalance(memberId) {
  return calculateTotalPayments(memberId) - calculateTotalBills(memberId);
}

// Generate financial summary cards
function generateMemberFinancialSummary(memberId) {
  // Get the most recent 3 months
  const recentMonths = months
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 3);

  return recentMonths
    .map((month) => {
      const monthDetails = memberMonthDetails[memberId]?.[month.value] || {
        bills: [],
        transactions: [],
        balance: 0,
        dues: 0,
      };

      const owed = monthDetails.bills.reduce((sum, bill) => {
        const share =
          bill.distribution === "equal"
            ? bill.amount / bill.memberIds.length
            : bill.customDistribution?.find((d) => d.memberId === memberId)
                ?.amount || 0;
        return sum + share;
      }, 0);

      const paid = monthDetails.transactions
        .filter((t) => t.type === "payment")
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = paid - owed;

      return `
      <div class="financial-card" style="background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 16px; margin-bottom: 16px; transition: transform 0.3s ease; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${
          balance >= 0 ? "#2ecc71" : "#e74c3c"
        };"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 16px; margin: 0; color: #2c3e50;">${
            month.name
          }</h4>
          <span class="${
            balance >= 0 ? "positive" : "negative"
          }" style="font-weight: bold; color: ${
        balance >= 0 ? "#2ecc71" : "#e74c3c"
      };">
            ${balance.toFixed(1)} USD
          </span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 14px;">
          <div style="flex: 1; min-width: 120px;">
            <div style="color: #7f8c8d; margin-bottom: 2px;">Total Bills</div>
            <div style="font-weight: bold;">${owed.toFixed(1)} USD</div>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <div style="color: #7f8c8d; margin-bottom: 2px;">Total Paid</div>
            <div style="font-weight: bold;">${paid.toFixed(1)} USD</div>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <div style="color: #7f8c8d; margin-bottom: 2px;">Open Bills</div>
            <div style="font-weight: bold;">${
              monthDetails.bills.filter((b) => !b.paidStatus).length
            }</div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Generate monthly tab structure
function generateMonthlyTabs(memberId) {
  // Create tabs
  const tabsHtml = `
    <div class="tabs" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
      ${months
        .map(
          (month, index) => `
        <div class="month-tab ${index === 0 ? "active" : ""}" data-month="${
            month.value
          }" style="padding: 8px 16px; border-radius: 50px; background: ${
            index === 0
              ? "linear-gradient(to right, #3498db, #2980b9)"
              : "#f1f2f6"
          }; color: ${
            index === 0 ? "white" : "#7f8c8d"
          }; font-size: 14px; cursor: pointer; transition: all 0.3s ease; box-shadow: ${
            index === 0 ? "0 4px 10px rgba(0,0,0,0.1)" : "none"
          };">
          ${month.name}
        </div>
      `
        )
        .join("")}
    </div>
    
    <div class="tab-content">
      ${months
        .map(
          (month, index) => `
        <div class="month-content" data-month="${
          month.value
        }" style="display: ${index === 0 ? "block" : "none"};">
          ${generateMonthContent(memberId, month.value)}
        </div>
      `
        )
        .join("")}
    </div>
  `;

  return tabsHtml;
}

// Initialize tab switching functionality
function initializeMonthlyTabs() {
  const tabs = document.querySelectorAll(".month-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.style.background = "#f1f2f6";
        t.style.color = "#7f8c8d";
        t.style.boxShadow = "none";
      });

      // Add active class to clicked tab
      this.classList.add("active");
      this.style.background = "linear-gradient(to right, #3498db, #2980b9)";
      this.style.color = "white";
      this.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";

      // Hide all content
      const contents = document.querySelectorAll(".month-content");
      contents.forEach((content) => {
        content.style.display = "none";
      });

      // Show selected content
      const monthValue = this.getAttribute("data-month");
      document.querySelector(
        `.month-content[data-month="${monthValue}"]`
      ).style.display = "block";
    });
  });
}

// Generate detailed month content
function generateMonthContent(memberId, monthValue) {
  const monthDetails = memberMonthDetails[memberId]?.[monthValue] || {
    bills: [],
    transactions: [],
    balance: 0,
    dues: 0,
  };

  // Calculate totals
  const totalOwed = monthDetails.bills.reduce((sum, bill) => {
    const share =
      bill.distribution === "equal"
        ? bill.amount / bill.memberIds.length
        : bill.customDistribution?.find((d) => d.memberId === memberId)
            ?.amount || 0;
    return sum + share;
  }, 0);

  const totalPaid = monthDetails.transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalPaid - totalOwed;

  return `
    <div class="month-summary" style="margin-bottom: 24px; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow: hidden; position: relative;">
      <div style="position: absolute; top: 0; left: 0; height: 4px; width: 100%; background: linear-gradient(to right, #3498db, #2ecc71);"></div>
      <h4 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">Monthly Summary</h4>
      
      <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <div class="summary-card" style="flex: 1; min-width: 200px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">Total Owed</div>
          <div style="font-size: 20px; font-weight: bold; color: #34495e;">${totalOwed.toFixed(
            1
          )} USD</div>
        </div>
        
        <div class="summary-card" style="flex: 1; min-width: 200px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">Total Paid</div>
          <div style="font-size: 20px; font-weight: bold; color: #34495e;">${totalPaid.toFixed(
            1
          )} USD</div>
        </div>
        
        <div class="summary-card" style="flex: 1; min-width: 200px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">Balance</div>
          <div style="font-size: 20px; font-weight: bold; color: ${
            balance >= 0 ? "#2ecc71" : "#e74c3c"
          };">
            ${balance.toFixed(1)} USD
            <small style="font-size: 12px; opacity: 0.7;">${
              balance >= 0 ? "(Credit)" : "(Due)"
            }</small>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bills-section" style="margin-bottom: 24px; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow: hidden; position: relative;">
      <div style="position: absolute; top: 0; left: 0; height: 4px; width: 100%; background: linear-gradient(to right, #e74c3c, #f39c12);"></div>
      <h4 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">
        <i class="fas fa-file-invoice-dollar" style="color: #e74c3c; margin-right: 8px;"></i>
        Bills
      </h4>
      
      ${
        monthDetails.bills.length > 0
          ? `<div class="bills-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${monthDetails.bills
              .map((bill) => {
                const share =
                  bill.distribution === "equal"
                    ? bill.amount / bill.memberIds.length
                    : bill.customDistribution?.find(
                        (d) => d.memberId === memberId
                      )?.amount || 0;

                const paid = bill.paidBy
                  .filter((p) => p.memberId === memberId)
                  .reduce((sum, p) => sum + p.amount, 0);

                const due = share - paid;

                return `
                <div class="bill-item" style="background: #f8f9fa; border-radius: 8px; padding: 15px; position: relative; transition: all 0.3s ease; border-left: 4px solid ${
                  bill.paidStatus ? "#2ecc71" : "#f39c12"
                };">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>
                      <h5 style="margin: 0; font-size: 16px; color: #2c3e50;">${
                        bill.name
                      }</h5>
                      <span style="display: block; font-size: 13px; color: #7f8c8d; margin-top: 4px;">
                        <i class="fas fa-calendar-day" style="margin-right: 4px;"></i>
                        ${formatDate(bill.date)}
                        ${
                          bill.dueDate
                            ? ` | Due: ${formatDate(bill.dueDate)}`
                            : ""
                        }
                      </span>
                    </div>
                    <div>
                      <span class="status-badge ${
                        bill.paidStatus ? "paid" : "pending"
                      }" style="padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${
                  bill.paidStatus ? "#e8f5e9" : "#fff3e0"
                }; color: ${bill.paidStatus ? "#2e7d32" : "#e65100"};">
                        ${bill.paidStatus ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                  
                  <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px;">
                    <div style="min-width: 100px;">
                      <div style="font-size: 12px; color: #7f8c8d;">Your Share</div>
                      <div style="font-weight: bold;">${share.toFixed(
                        1
                      )} USD</div>
                    </div>
                    <div style="min-width: 100px;">
                      <div style="font-size: 12px; color: #7f8c8d;">Paid</div>
                      <div style="font-weight: bold;">${paid.toFixed(
                        1
                      )} USD</div>
                    </div>
                    <div style="min-width: 100px;">
                      <div style="font-size: 12px; color: #7f8c8d;">Remaining</div>
                      <div style="font-weight: bold; color: ${
                        due <= 0 ? "#2ecc71" : "#e74c3c"
                      };">${due.toFixed(1)} USD</div>
                    </div>
                  </div>
                  
                  ${
                    bill.note
                      ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e0e0e0; font-size: 13px; color: #7f8c8d;">
                        <i class="fas fa-sticky-note" style="margin-right: 5px;"></i> ${bill.note}
                      </div>`
                      : ""
                  }
                </div>
              `;
              })
              .join("")}
          </div>`
          : `<div style="text-align: center; padding: 30px 0; color: #95a5a6;">
            <i class="fas fa-file-invoice" style="font-size: 40px; margin-bottom: 10px; opacity: 0.3;"></i>
            <p>No bills assigned for this month.</p>
          </div>`
      }
    </div>
    
    <div class="transactions-section" style="margin-bottom: 24px; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow: hidden; position: relative;">
      <div style="position: absolute; top: 0; left: 0; height: 4px; width: 100%; background: linear-gradient(to right, #2ecc71, #3498db);"></div>
      <h4 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">
        <i class="fas fa-exchange-alt" style="color: #2ecc71; margin-right: 8px;"></i>
        Transactions
      </h4>
      
      ${
        monthDetails.transactions.length > 0
          ? `<div class="transactions-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${monthDetails.transactions
              .map((transaction) => {
                let typeIcon, typeColor, bgColor;

                switch (transaction.type) {
                  case "payment":
                    typeIcon = "fa-money-bill-wave";
                    typeColor = "#27ae60";
                    bgColor = "#e8f5e9";
                    break;
                  case "expense":
                    typeIcon = "fa-shopping-cart";
                    typeColor = "#e74c3c";
                    bgColor = "#ffebee";
                    break;
                  case "deposit":
                    typeIcon = "fa-piggy-bank";
                    typeColor = "#3498db";
                    bgColor = "#e3f2fd";
                    break;
                  default:
                    typeIcon = "fa-exchange-alt";
                    typeColor = "#7f8c8d";
                    bgColor = "#f5f5f5";
                }

                const typeText =
                  {
                    payment: "Payment",
                    expense: "Expense",
                    deposit: "Deposit",
                  }[transaction.type] || transaction.type;

                return `
                <div class="transaction-item" style="background: #f8f9fa; border-radius: 8px; padding: 15px; position: relative; transition: all 0.3s ease; display: flex; align-items: center; gap: 15px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; color: ${typeColor};">
                    <i class="fas ${typeIcon}"></i>
                  </div>
                  
                  <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <div style="font-weight: bold; color: #2c3e50;">${typeText}</div>
                      <div style="font-weight: bold; color: ${typeColor};">${transaction.amount.toFixed(
                  1
                )} USD</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between;">
                      <div style="font-size: 13px; color: #7f8c8d;">
                        <i class="fas fa-calendar-day" style="margin-right: 4px;"></i>
                        ${formatDate(transaction.date)}
                      </div>
                      
                      ${
                        transaction.billIds && transaction.billIds.length > 0
                          ? `<div style="font-size: 13px; color: #7f8c8d;">
                            <i class="fas fa-file-invoice" style="margin-right: 4px;"></i>
                            Bills: ${transaction.billIds
                              .map((id) => {
                                const bill = bills.find((b) => b.id === id);
                                return bill ? bill.name : "Unknown";
                              })
                              .join(", ")}
                          </div>`
                          : ""
                      }
                    </div>
                    
                    ${
                      transaction.note
                        ? `<div style="margin-top: 5px; font-size: 13px; color: #7f8c8d;">
                          <i class="fas fa-sticky-note" style="margin-right: 4px;"></i>
                          ${transaction.note}
                        </div>`
                        : ""
                    }
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>`
          : `<div style="text-align: center; padding: 30px 0; color: #95a5a6;">
            <i class="fas fa-exchange-alt" style="font-size: 40px; margin-bottom: 10px; opacity: 0.3;"></i>
            <p>No transactions recorded for this month.</p>
          </div>`
      }
    </div>
  `;
}
