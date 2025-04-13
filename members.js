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

function showMemberDetails(memberId) {
  const member = getMemberById(memberId);
  if (!member) return;

  const detailSection = document.getElementById("memberDetailSection");
  const listSection = document.getElementById("membersListSection");
  const detailContainer = document.querySelector(".member-detail-container");

  if (!detailSection || !listSection || !detailContainer) return;

  listSection.style.display = "none";
  detailSection.style.display = "block";

  detailContainer.innerHTML = `
        <div class="member-profile">
            <div class="profile-pic">
                ${
                  member.image
                    ? `<img src="${member.image}" alt="${member.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">`
                    : `<div class="avatar">${member.name.charAt(0)}</div>`
                }
            </div>
            <div class="profile-info">
                <h2>${member.name}</h2>
                <p>Phone: ${member.phone || "N/A"}</p>
                <p>Room: ${member.room || "N/A"}</p>
                <p>Join Date: ${formatDate(member.joinDate)}</p>
                ${
                  member.note
                    ? `<p>Note: ${member.note}</p>`
                    : "<p>Note: None</p>"
                }
            </div>
        </div>
        <div class="bills-history">
            <h3>Monthly Financial Summary</h3>
            ${generateMemberFinancialHistory(memberId)}
        </div>
        <div class="actions">
            <button onclick="editMember(${memberId})" class="btn btn-primary">Edit Member</button>
            <button onclick="deleteMember(${memberId})" class="btn btn-danger">Delete Member</button>
        </div>
    `;
}

function generateMemberFinancialHistory(memberId) {
  const details = memberMonthDetails[memberId] || {};
  return months
    .map((month) => {
      const monthDetails = details[month.value] || {
        bills: [],
        transactions: [],
        balance: 0,
        dues: 0,
      };
      if (!monthDetails.bills.length && !monthDetails.transactions.length)
        return "";

      const totalOwed = monthDetails.bills.reduce((sum, bill) => {
        const share =
          bill.distribution === "equal"
            ? bill.amount / bill.memberIds.length
            : bill.customDistribution?.find((d) => d.memberId === memberId)
                ?.amount || 0;
        return sum + share;
      }, 0);

      return `
            <div class="month-card">
                <div class="month-card-header">${month.name}</div>
                <div class="month-card-body">
                    <h4>Bills Assigned</h4>
                    ${
                      monthDetails.bills.length
                        ? monthDetails.bills
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
                                    <div class="expense-item">
                                        <span class="expense-name">${
                                          bill.name
                                        }</span>
                                        <span>Owed: ${share.toFixed(
                                          1
                                        )} USD</span>
                                        <span>Paid: ${paid.toFixed(
                                          1
                                        )} USD</span>
                                        <span class="${
                                          due <= 0 ? "positive" : "negative"
                                        }">Due: ${due.toFixed(1)} USD</span>
                                        <span class="${
                                          bill.paidStatus
                                            ? "positive"
                                            : "negative"
                                        }">
                                            ${
                                              bill.paidStatus
                                                ? "Paid"
                                                : "Pending"
                                            }
                                        </span>
                                        <small>Date: ${formatDate(
                                          bill.date
                                        )}</small>
                                        ${
                                          bill.dueDate
                                            ? `<small>Due: ${formatDate(
                                                bill.dueDate
                                              )}</small>`
                                            : ""
                                        }
                                    </div>
                                `;
                            })
                            .join("")
                        : "<p>No bills assigned.</p>"
                    }
                    <h4>Transactions</h4>
                    ${
                      monthDetails.transactions.length
                        ? monthDetails.transactions
                            .map(
                              (t) => `
                                    <div class="expense-item">
                                        <span class="expense-name">${
                                          {
                                            payment: "Payment",
                                            expense: "Expense",
                                            deposit: "Deposit",
                                          }[t.type] || t.type
                                        }</span>
                                        <span>${t.amount.toFixed(1)} USD</span>
                                        <small>Date: ${formatDate(
                                          t.date
                                        )}</small>
                                        ${
                                          t.note
                                            ? `<small>Note: ${t.note}</small>`
                                            : ""
                                        }
                                        ${
                                          t.billIds?.length
                                            ? `<small>Bills: ${t.billIds
                                                .map(
                                                  (id) =>
                                                    bills.find(
                                                      (b) => b.id === id
                                                    )?.name || "Unknown"
                                                )
                                                .join(", ")}</small>`
                                            : ""
                                        }
                                    </div>
                                `
                            )
                            .join("")
                        : "<p>No transactions.</p>"
                    }
                    <h4>Summary</h4>
                    <p>Total Owed: ${totalOwed.toFixed(1)} USD</p>
                    <p>Total Paid: ${monthDetails.transactions
                      .filter((t) => t.type === "payment")
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(1)} USD</p>
                    <p class="${
                      monthDetails.dues <= 0 ? "positive" : "negative"
                    }">Total Due: ${monthDetails.dues.toFixed(1)} USD</p>
                    <p class="${
                      monthDetails.balance >= 0 ? "positive" : "negative"
                    }">Balance: ${monthDetails.balance.toFixed(1)} USD</p>
                </div>
            </div>
        `;
    })
    .join("");
}

function editMember(memberId) {
  const member = getMemberById(memberId);
  if (!member) return;

  const editModal = document.createElement("div");
  editModal.className = "modal";
  editModal.innerHTML = `
        <div class="modal-content">
            <span class="close">×</span>
            <h2>Edit Member</h2>
            <form id="editMemberForm">
                <div class="form-group">
                    <label for="editMemberName">Name</label>
                    <input type="text" id="editMemberName" value="${
                      member.name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editMemberPhone">Phone</label>
                    <input type="text" id="editMemberPhone" value="${
                      member.phone || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="editMemberRoom">Room</label>
                    <input type="text" id="editMemberRoom" value="${
                      member.room || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="editMemberJoinDate">Join Date</label>
                    <input type="date" id="editMemberJoinDate" value="${
                      member.joinDate
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editMemberNote">Note</label>
                    <textarea id="editMemberNote">${
                      member.note || ""
                    }</textarea>
                </div>
                <div class="form-group">
                    <label for="editMemberImage">Profile Picture</label>
                    <input type="file" id="editMemberImage" accept="image/*">
                    ${
                      member.image
                        ? `<img src="${member.image}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">`
                        : ""
                    }
                </div>
                <button type="submit" class="btn btn-primary">Update Member</button>
            </form>
        </div>
    `;

  document.body.appendChild(editModal);
  editModal.style.display = "block";

  editModal
    .querySelector("#editMemberForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const imageInput = document.getElementById("editMemberImage");
      let imageData = member.image;
      if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imageData = e.target.result;
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
        image: imageData,
      };
      saveData();
      updateMembersList();
      updateTransactionMemberFilter();
      updateMemberCheckboxes();
      showMemberDetails(memberId);
      document.body.removeChild(editModal);
      alert("Member updated successfully.");
    }
  }

  editModal.querySelector(".close").addEventListener("click", () => {
    document.body.removeChild(editModal);
  });
}

function deleteMember(memberId) {
  if (
    !confirm(
      "Are you sure you want to delete this member and all related data?"
    )
  )
    return;

  members = members.filter((member) => member.id !== memberId);
  bills = bills.map((bill) => ({
    ...bill,
    memberIds: bill.memberIds.filter((id) => id !== memberId),
    paidBy: bill.paidBy.filter((p) => p.memberId !== memberId),
  }));
  bills = bills.filter((bill) => bill.memberIds.length > 0);
  transactions = transactions.filter(
    (transaction) => transaction.memberId !== memberId
  );
  delete memberMonthDetails[memberId];

  saveData();
  updateMembersList();
  updateDashboard();
  updateBillsList();
  updateTransactionsList();
  updateTransactionMemberFilter();
  updateMemberCheckboxes();

  document.getElementById("backToMembersList")?.click();
  alert("Member deleted successfully.");
}

// Initialize member form and search
document.addEventListener("DOMContentLoaded", function () {
  // Member search
  document
    .getElementById("memberSearch")
    ?.addEventListener("input", function () {
      updateMembersList(this.value);
    });

  // Add member form submission
  const addMemberForm = document.getElementById("addMemberForm");
  if (addMemberForm) {
    addMemberForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const imageInput = document.getElementById("memberImage");
      let imageData = "";
      if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imageData = e.target.result;
          addNewMember(imageData);
        };
        reader.readAsDataURL(imageInput.files[0]);
      } else {
        addNewMember(imageData);
      }
    });
  }

  // Back to members list button
  document
    .getElementById("backToMembersList")
    ?.addEventListener("click", function () {
      document.getElementById("membersListSection").style.display = "block";
      document.getElementById("memberDetailSection").style.display = "none";
    });

  // View toggle in members list
  const viewToggleBtns = document.querySelectorAll(".view-toggle .toggle-btn");
  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      viewToggleBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const view = this.getAttribute("data-view");
      const membersList = document.getElementById("membersList");
      membersList.className = "member-list " + view + "-view";
    });
  });
});

function addNewMember(imageData) {
  const newMember = {
    id: Date.now(),
    name: document.getElementById("memberName")?.value,
    phone: document.getElementById("memberPhone")?.value,
    room: document.getElementById("memberRoom")?.value,
    joinDate: document.getElementById("memberJoinDate")?.value,
    note: document.getElementById("memberNote")?.value,
    image: imageData,
  };
  members.push(newMember);
  memberMonthDetails[newMember.id] = {};
  months.forEach((month) => {
    memberMonthDetails[newMember.id][month.value] = {
      bills: [],
      transactions: [],
      balance: 0,
      dues: 0,
    };
  });
  saveData();
  updateMembersList();
  updateMemberCheckboxes();
  updateTransactionMemberFilter();
  updateDashboard();
  document.getElementById("addMemberForm").reset();
  alert("Member added successfully.");
}
