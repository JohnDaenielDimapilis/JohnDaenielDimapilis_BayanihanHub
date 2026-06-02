const state = {
  role: "Admin",
  currentUser: null,
  accounts: [
    { name: "Maria Santos", email: "admin@bayanihanhub.test", password: "Password123", role: "Admin" },
    { name: "Leo Dela Cruz", email: "staff@bayanihanhub.test", password: "Password123", role: "Staff" },
    { name: "Ana Reyes", email: "user@bayanihanhub.test", password: "Password123", role: "User" }
  ],
  users: {
    Admin: "Maria Santos",
    Staff: "Leo Dela Cruz",
    User: "Ana Reyes"
  },
  events: [
    { id: 1, title: "Community Feeding Program", type: "Feeding", date: "2026-06-12", location: "Barangay Maligaya Hall", limit: 120, joined: 86, status: "Approved", owner: "Leo Dela Cruz" },
    { id: 2, title: "Medical Mission", type: "Health", date: "2026-06-22", location: "San Isidro Covered Court", limit: 200, joined: 143, status: "Pending", owner: "Leo Dela Cruz" },
    { id: 3, title: "Youth Volunteer Seminar", type: "Seminar", date: "2026-07-05", location: "Foundation Center", limit: 80, joined: 51, status: "Approved", owner: "Mika Torres" }
  ],
  fundraisers: [
    { id: 1, title: "School Supplies Drive", purpose: "Kits for 300 learners", target: 90000, raised: 56300, deadline: "2026-06-30", status: "Approved" },
    { id: 2, title: "Mobile Clinic Support", purpose: "Medicines and basic screening tools", target: 150000, raised: 27500, deadline: "2026-07-18", status: "Pending" },
    { id: 3, title: "Disaster Relief Fund", purpose: "Food packs and hygiene kits", target: 120000, raised: 94000, deadline: "2026-07-02", status: "Approved" }
  ],
  donations: [
    { donor: "Ana Reyes", amount: 2500, type: "Cash", purpose: "School Supplies Drive", reference: "GC-88421", status: "Verified" },
    { donor: "Ramon Cruz", amount: 5000, type: "Bank Transfer", purpose: "Disaster Relief Fund", reference: "BT-33109", status: "Pending" },
    { donor: "Lina Mateo", amount: 1800, type: "In-kind", purpose: "Community Feeding Program", reference: "IK-10277", status: "Verified" }
  ],
  feedback: [
    { event: "Community Feeding Program", user: "Ana Reyes", rating: 5, comment: "Organized registration and clear volunteer roles." },
    { event: "Youth Volunteer Seminar", user: "Ramon Cruz", rating: 4, comment: "Helpful discussion, more time for questions next session." }
  ],
  achievements: [
    { user: "Ana Reyes", badge: "Active Volunteer", basis: "Joined 5 approved events", points: 240 },
    { user: "Ramon Cruz", badge: "Community Donor", basis: "Donated to 3 campaigns", points: 180 },
    { user: "Lina Mateo", badge: "Feedback Contributor", basis: "Submitted post-event feedback", points: 90 }
  ],
  logs: [
    { time: "2026-05-30 09:14", user: "Maria Santos", role: "Admin", action: "Approved fundraiser", module: "Approval", outcome: "Success" },
    { time: "2026-05-30 09:22", user: "Leo Dela Cruz", role: "Staff", action: "Created event", module: "Events", outcome: "Success" },
    { time: "2026-05-30 09:40", user: "Unknown", role: "Guest", action: "Failed login attempt", module: "Security", outcome: "Failed" },
    { time: "2026-05-30 10:05", user: "Ana Reyes", role: "User", action: "Submitted donation", module: "Donations", outcome: "Success" }
  ]
};

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");
const roleButtons = document.querySelectorAll(".role-btn");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const authTabs = document.querySelectorAll(".auth-tab");
const demoButtons = document.querySelectorAll("[data-demo]");
const logoutBtn = document.querySelector("#logoutBtn");
const pageTitle = document.querySelector("#pageTitle");
const activeRole = document.querySelector("#activeRole");
const activeName = document.querySelector("#activeName");
const sidebarName = document.querySelector("#sidebarName");
const sidebarRole = document.querySelector("#sidebarRole");
const toast = document.querySelector("#toast");

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    try {
      localStorage.removeItem(key);
    } catch (storageError) {
      // Storage can be blocked in some browser modes; the prototype still works without it.
    }
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    showToast("Browser storage is unavailable, so this session will not be saved.");
  }
}

const savedAccounts = readStorage("bayanihan_accounts", []);
state.accounts.push(...savedAccounts);

if (window.location.search) {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function peso(value) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function statusClass(status) {
  const value = String(status).toLowerCase();
  if (value.includes("approved") || value.includes("verified")) return "approved";
  if (value.includes("completed")) return "completed";
  if (value.includes("reject")) return "rejected";
  if (value.includes("fail")) return "failed";
  if (value.includes("security")) return "security";
  if (value.includes("active")) return "active-status";
  return "pending";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function addLog(action, module, outcome = "Success") {
  state.logs.unshift({
    time: new Date().toLocaleString("en-PH", { hour12: false }),
    user: state.currentUser?.name || state.users[state.role] || "Guest",
    role: state.role,
    action,
    module,
    outcome
  });
}

function setRole(role) {
  state.role = role;
  if (state.currentUser) state.currentUser.role = role;
  syncSessionUI();
  roleButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.role === role));
  renderAll();
  showToast(`Switched to ${role} access.`);
}

function syncSessionUI() {
  const user = state.currentUser || { name: state.users[state.role], role: state.role };
  state.role = user.role;
  state.users[user.role] = user.name;
  activeRole.textContent = user.role;
  activeName.textContent = user.name;
  sidebarName.textContent = user.name;
  sidebarRole.textContent = user.role;
  updateNavigation();
}

function canAccessView(viewId) {
  if (state.role === "Admin") return true;
  if (state.role === "Staff") return viewId !== "logs";
  return !["reports", "logs"].includes(viewId);
}

function updateNavigation() {
  navItems.forEach(item => {
    item.classList.toggle("hidden", !canAccessView(item.dataset.view));
  });
}

function saveRegisteredAccounts() {
  const demoEmails = ["admin@bayanihanhub.test", "staff@bayanihanhub.test", "user@bayanihanhub.test"];
  const registered = state.accounts.filter(account => !demoEmails.includes(account.email));
  writeStorage("bayanihan_accounts", registered);
}

function findAccount(email, password) {
  return state.accounts.find(account => account.email.toLowerCase() === email.toLowerCase() && account.password === password);
}

function showAppFor(account) {
  state.currentUser = { name: account.name, email: account.email, role: account.role };
  state.role = account.role;
  writeStorage("bayanihan_session", state.currentUser);
  authScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  syncSessionUI();
  setView("dashboard");
  addLog("Logged in", "Authentication");
  renderAll();
}

function logout() {
  addLog("Logged out", "Authentication");
  try {
    localStorage.removeItem("bayanihan_session");
  } catch (error) {
    // Ignore storage cleanup errors and return to the login screen.
  }
  state.currentUser = null;
  appShell.classList.add("hidden");
  authScreen.classList.remove("hidden");
  showToast("Logged out.");
}

function restoreSession() {
  const savedSession = readStorage("bayanihan_session", null);
  if (!savedSession) {
    authScreen.classList.remove("hidden");
    appShell.classList.add("hidden");
    return;
  }

  state.currentUser = savedSession;
  state.role = savedSession.role;
  authScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  syncSessionUI();
  renderAll();
}

function switchAuthTab(tabName) {
  authTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.authTab === tabName));
  loginForm.classList.toggle("active", tabName === "login");
  registerForm.classList.toggle("active", tabName === "register");
}

function setView(viewId) {
  if (!canAccessView(viewId)) {
    showToast("Your account role cannot open that page.");
    viewId = "dashboard";
  }
  views.forEach(view => view.classList.toggle("active", view.id === viewId));
  navItems.forEach(item => item.classList.toggle("active", item.dataset.view === viewId));
  pageTitle.textContent = document.querySelector(`[data-view="${viewId}"]`).textContent;
}

function renderStats() {
  const approvedEvents = state.events.filter(event => event.status === "Approved").length;
  const pendingApprovals = [...state.events, ...state.fundraisers].filter(item => item.status === "Pending").length;
  const totalRaised = state.fundraisers.reduce((sum, item) => sum + item.raised, 0);
  const participants = state.events.reduce((sum, item) => sum + item.joined, 0);

  return `
    <div class="stats-grid">
      <article class="stat"><span>Approved events</span><strong>${approvedEvents}</strong></article>
      <article class="stat"><span>Pending approvals</span><strong>${pendingApprovals}</strong></article>
      <article class="stat"><span>Total donations</span><strong>${peso(totalRaised)}</strong></article>
      <article class="stat"><span>Participants</span><strong>${participants}</strong></article>
    </div>
  `;
}

function dashboardPermissions() {
  const copy = {
    Admin: [
      "Approve or reject submitted events and fundraisers",
      "Manage user roles, reports, system logs, and security monitoring",
      "Review donation summaries and activity reports"
    ],
    Staff: [
      "Create events and submit them for approval",
      "Monitor participants, attendance, feedback, and progress",
      "Create fundraising campaigns and prepare reports"
    ],
    User: [
      "View approved events and join activities",
      "Submit donation records and post-event feedback",
      "Track participation history and achievements"
    ]
  };

  return copy[state.role].map(item => `<li>${item}</li>`).join("");
}

function renderDashboard() {
  document.querySelector("#dashboard").innerHTML = `
    ${renderStats()}
    <section class="panel">
      <div class="panel-header">
        <div>
          <span class="section-label">Role-based access</span>
          <h3>${state.role} workspace</h3>
          <p>The interface changes based on the selected account role.</p>
        </div>
      </div>
      <div class="module-grid">
        <article class="card">
          <h3>Authorized functions</h3>
          <ul>${dashboardPermissions()}</ul>
        </article>
        <article class="card">
          <h3>Security controls</h3>
          <p>Password hashing, input validation, session control, role restrictions, and audit trails are represented in the system workflow.</p>
          <strong>RBAC enabled</strong>
        </article>
        <article class="card">
          <h3>Approval queue</h3>
          <p>Events and fundraising campaigns stay hidden from users until admin approval.</p>
          <strong>${[...state.events, ...state.fundraisers].filter(item => item.status === "Pending").length} pending</strong>
        </article>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header">
        <div>
          <span class="section-label">Recent activity</span>
          <h3>Audit trail preview</h3>
        </div>
      </div>
      ${renderLogsTable(state.logs.slice(0, 4))}
    </section>
  `;
}

function renderEvents() {
  const canEdit = state.role !== "User";
  const visibleEvents = state.role === "User"
    ? state.events.filter(event => event.status === "Approved" || event.status === "Completed")
    : state.events;
  document.querySelector("#events").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <span class="section-label">Event management</span>
          <h3>Foundation events</h3>
          <p>Staff can submit events. Admin can approve them. Users can join approved events.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Participants</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${visibleEvents.map(event => `
              <tr>
                <td><strong>${event.title}</strong><br><span>${event.type}</span></td>
                <td>${event.date}</td>
                <td>${event.location}</td>
                <td>${event.joined}/${event.limit}</td>
                <td><span class="badge ${statusClass(event.status)}">${event.status}</span></td>
                <td><div class="action-row">${eventActions(event, canEdit)}</div></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
    ${canEdit ? eventForm() : ""}
  `;
}

function eventActions(event, canEdit) {
  if (state.role === "Admin" && event.status === "Pending") {
    return `<button class="action-btn" onclick="approveEvent(${event.id})">Approve</button><button class="action-btn warn" onclick="rejectEvent(${event.id})">Reject</button>`;
  }
  if (state.role === "User" && event.status === "Approved") {
    return `<button class="action-btn" onclick="joinEvent(${event.id})">Join</button>`;
  }
  if (canEdit) {
    return `<button class="ghost-btn" onclick="markComplete(${event.id})">Mark complete</button>`;
  }
  return `<span class="badge pending">Unavailable</span>`;
}

function eventForm() {
  return `
    <section class="panel form-panel">
      <div class="panel-header">
        <div><span class="section-label">Create event</span><h3>Submit new event</h3></div>
      </div>
      <form class="form-grid" onsubmit="createEvent(event)">
        <div class="field"><label>Title</label><input name="title" required placeholder="Outreach program"></div>
        <div class="field"><label>Type</label><input name="type" required placeholder="Medical, seminar, feeding"></div>
        <div class="field"><label>Date</label><input name="date" type="date" required></div>
        <div class="field"><label>Location</label><input name="location" required placeholder="Venue"></div>
        <div class="field"><label>Participant limit</label><input name="limit" type="number" min="1" required></div>
        <div class="field full"><button class="action-btn" type="submit">Submit for approval</button></div>
      </form>
    </section>
  `;
}

function renderFundraisers() {
  const visibleFundraisers = state.role === "User"
    ? state.fundraisers.filter(item => item.status === "Approved" || item.status === "Completed")
    : state.fundraisers;
  document.querySelector("#fundraisers").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div><span class="section-label">Fundraising management</span><h3>Campaigns</h3><p>Track targets, raised amounts, approval status, and deadlines.</p></div>
      </div>
      <div class="module-grid">
        ${visibleFundraisers.map(item => {
          const percent = Math.min(100, Math.round((item.raised / item.target) * 100));
          return `
            <article class="card">
              <h3>${item.title}</h3>
              <p>${item.purpose}</p>
              <strong>${peso(item.raised)} / ${peso(item.target)}</strong>
              <div class="progress"><span style="width:${percent}%"></span></div>
              <p>Deadline: ${item.deadline}</p>
              <span class="badge ${statusClass(item.status)}">${item.status}</span>
              <div class="action-row" style="margin-top:12px">${fundraiserActions(item)}</div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
    ${state.role !== "User" ? fundraiserForm() : ""}
  `;
}

function fundraiserActions(item) {
  if (state.role === "Admin" && item.status === "Pending") {
    return `<button class="action-btn" onclick="approveFundraiser(${item.id})">Approve</button><button class="action-btn warn" onclick="rejectFundraiser(${item.id})">Reject</button>`;
  }
  if (state.role === "User" && item.status === "Approved") {
    return `<button class="action-btn" onclick="quickDonate('${item.title}')">Donate</button>`;
  }
  return `<button class="ghost-btn" onclick="logReview('Fundraisers')">Review</button>`;
}

function fundraiserForm() {
  return `
    <section class="panel form-panel">
      <div class="panel-header"><div><span class="section-label">Create fundraiser</span><h3>Submit campaign</h3></div></div>
      <form class="form-grid" onsubmit="createFundraiser(event)">
        <div class="field"><label>Campaign title</label><input name="title" required></div>
        <div class="field"><label>Target amount</label><input name="target" type="number" min="1" required></div>
        <div class="field"><label>Deadline</label><input name="deadline" type="date" required></div>
        <div class="field"><label>Purpose</label><input name="purpose" required></div>
        <div class="field full"><button class="action-btn" type="submit">Submit for approval</button></div>
      </form>
    </section>
  `;
}

function renderDonations() {
  const currentName = state.currentUser?.name || state.users[state.role];
  const visibleDonations = state.role === "User"
    ? state.donations.filter(item => item.donor === currentName)
    : state.donations;
  document.querySelector("#donations").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div><span class="section-label">Donation management</span><h3>Donation records</h3><p>Records are for monitoring and transparency, not full accounting.</p></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Donor</th><th>Amount</th><th>Type</th><th>Purpose</th><th>Reference</th><th>Status</th></tr></thead>
          <tbody>${visibleDonations.map(item => `
            <tr><td>${item.donor}</td><td>${peso(item.amount)}</td><td>${item.type}</td><td>${item.purpose}</td><td>${item.reference}</td><td><span class="badge ${statusClass(item.status)}">${item.status}</span></td></tr>
          `).join("")}</tbody>
        </table>
      </div>
    </section>
    <section class="panel form-panel">
      <div class="panel-header"><div><span class="section-label">Donation form</span><h3>Record donation</h3></div></div>
      <form class="form-grid" onsubmit="createDonation(event)">
        <div class="field"><label>Donor name</label><input name="donor" value="${state.users[state.role]}" required></div>
        <div class="field"><label>Amount</label><input name="amount" type="number" min="1" required></div>
        <div class="field"><label>Donation type</label><select name="type"><option>Cash</option><option>Bank Transfer</option><option>In-kind</option></select></div>
        <div class="field"><label>Purpose</label><input name="purpose" required></div>
        <div class="field"><label>Payment reference</label><input name="reference" required></div>
        <div class="field full"><button class="action-btn" type="submit">Save donation</button></div>
      </form>
    </section>
  `;
}

function renderFeedback() {
  const currentName = state.currentUser?.name || state.users[state.role];
  const visibleFeedback = state.role === "User"
    ? state.feedback.filter(item => item.user === currentName)
    : state.feedback;
  document.querySelector("#feedback").innerHTML = `
    <section class="panel">
      <div class="panel-header"><div><span class="section-label">Feedback management</span><h3>Participant feedback</h3></div></div>
      <div class="module-grid">${visibleFeedback.map(item => `
        <article class="card"><h3>${item.event}</h3><p>${item.comment}</p><strong>${item.rating}/5 rating</strong><p>${item.user}</p></article>
      `).join("")}</div>
    </section>
    <section class="panel form-panel">
      <div class="panel-header"><div><span class="section-label">Post-event form</span><h3>Submit feedback</h3></div></div>
      <form class="form-grid" onsubmit="createFeedback(event)">
        <div class="field"><label>Event</label><input name="eventName" required></div>
        <div class="field"><label>Rating</label><select name="rating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div>
        <div class="field full"><label>Comment</label><textarea name="comment" required></textarea></div>
        <div class="field full"><button class="action-btn" type="submit">Submit feedback</button></div>
      </form>
    </section>
  `;
}

function renderAchievements() {
  const currentName = state.currentUser?.name || state.users[state.role];
  const visibleAchievements = state.role === "User"
    ? state.achievements.filter(item => item.user === currentName)
    : state.achievements;
  document.querySelector("#achievements").innerHTML = `
    <section class="panel">
      <div class="panel-header"><div><span class="section-label">Achievement management</span><h3>Badges and points</h3><p>Achievements are based on recorded participation, donations, and feedback.</p></div></div>
      <div class="module-grid">${visibleAchievements.map(item => `
        <article class="card"><h3>${item.badge}</h3><p>${item.basis}</p><strong>${item.points} pts</strong><p>${item.user}</p></article>
      `).join("")}</div>
    </section>
  `;
}

function renderReports() {
  const totalDonations = state.donations.reduce((sum, item) => sum + item.amount, 0);
  document.querySelector("#reports").innerHTML = `
    ${renderStats()}
    <section class="panel">
      <div class="panel-header">
        <div><span class="section-label">Report management</span><h3>Generated summary</h3><p>Printable summaries can be built from these module records.</p></div>
        <button class="action-btn" onclick="generateReport()">Generate report</button>
      </div>
      <div class="module-grid">
        <article class="card"><h3>Event report</h3><p>Approved, pending, and completed events.</p><strong>${state.events.length} records</strong></article>
        <article class="card"><h3>Donation report</h3><p>Verified and pending donation records.</p><strong>${peso(totalDonations)}</strong></article>
        <article class="card"><h3>Feedback report</h3><p>Ratings and participant comments.</p><strong>${state.feedback.length} responses</strong></article>
      </div>
    </section>
  `;
}

function renderLogsTable(logs) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date and time</th><th>User</th><th>Role</th><th>Action</th><th>Module</th><th>Outcome</th></tr></thead>
        <tbody>${logs.map(log => `
          <tr><td>${log.time}</td><td>${log.user}</td><td>${log.role}</td><td>${log.action}</td><td>${log.module}</td><td><span class="badge ${statusClass(log.outcome)}">${log.outcome}</span></td></tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function renderLogs() {
  document.querySelector("#logs").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div><span class="section-label">Logs and audit trail</span><h3>System monitoring</h3><p>Tracks login attempts, approvals, record changes, donations, and security events.</p></div>
      </div>
      ${renderLogsTable(state.logs)}
    </section>
  `;
}

function renderAll() {
  renderDashboard();
  renderEvents();
  renderFundraisers();
  renderDonations();
  renderFeedback();
  renderAchievements();
  renderReports();
  renderLogs();
}

function approveEvent(id) {
  const item = state.events.find(event => event.id === id);
  item.status = "Approved";
  addLog(`Approved event: ${item.title}`, "Approval");
  renderAll();
  showToast("Event approved and published to users.");
}

function rejectEvent(id) {
  const item = state.events.find(event => event.id === id);
  item.status = "Rejected";
  addLog(`Rejected event: ${item.title}`, "Approval");
  renderAll();
  showToast("Event rejected and saved in approval logs.");
}

function joinEvent(id) {
  const item = state.events.find(event => event.id === id);
  if (item.joined >= item.limit) {
    addLog(`Tried to join full event: ${item.title}`, "Events", "Failed");
    showToast("This event is already full.");
    return;
  }
  item.joined += 1;
  addLog(`Joined event: ${item.title}`, "Participants");
  renderAll();
  showToast("You joined the event. Participation history updated.");
}

function markComplete(id) {
  const item = state.events.find(event => event.id === id);
  item.status = "Completed";
  addLog(`Marked event complete: ${item.title}`, "Events");
  renderAll();
  showToast("Event progress updated.");
}

function approveFundraiser(id) {
  const item = state.fundraisers.find(fundraiser => fundraiser.id === id);
  item.status = "Approved";
  addLog(`Approved fundraiser: ${item.title}`, "Approval");
  renderAll();
  showToast("Fundraiser approved and visible to users.");
}

function rejectFundraiser(id) {
  const item = state.fundraisers.find(fundraiser => fundraiser.id === id);
  item.status = "Rejected";
  addLog(`Rejected fundraiser: ${item.title}`, "Approval");
  renderAll();
  showToast("Fundraiser rejected.");
}

function quickDonate(title) {
  setView("donations");
  document.querySelector("[name='purpose']").value = title;
  showToast("Donation form prepared for the selected campaign.");
}

function logReview(module) {
  addLog(`Reviewed ${module.toLowerCase()} records`, module);
  renderAll();
  showToast("Review action recorded in logs.");
}

function createEvent(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  state.events.push({
    id: Date.now(),
    title: form.get("title"),
    type: form.get("type"),
    date: form.get("date"),
    location: form.get("location"),
    limit: Number(form.get("limit")),
    joined: 0,
    status: "Pending",
    owner: state.currentUser?.name || state.users[state.role]
  });
  addLog("Created event for approval", "Events");
  event.target.reset();
  renderAll();
  showToast("Event saved as pending for admin approval.");
}

function createFundraiser(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  state.fundraisers.push({
    id: Date.now(),
    title: form.get("title"),
    purpose: form.get("purpose"),
    target: Number(form.get("target")),
    raised: 0,
    deadline: form.get("deadline"),
    status: "Pending"
  });
  addLog("Created fundraiser for approval", "Fundraisers");
  event.target.reset();
  renderAll();
  showToast("Fundraiser saved as pending for admin approval.");
}

function createDonation(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  state.donations.unshift({
    donor: form.get("donor"),
    amount: Number(form.get("amount")),
    type: form.get("type"),
    purpose: form.get("purpose"),
    reference: form.get("reference"),
    status: state.role === "Admin" || state.role === "Staff" ? "Verified" : "Pending"
  });
  const fundraiser = state.fundraisers.find(item => item.title.toLowerCase() === String(form.get("purpose")).toLowerCase());
  if (fundraiser) fundraiser.raised += Number(form.get("amount"));
  addLog("Submitted donation record", "Donations");
  event.target.reset();
  renderAll();
  showToast("Donation record saved.");
}

function createFeedback(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  state.feedback.unshift({
    event: form.get("eventName"),
    user: state.currentUser?.name || state.users[state.role],
    rating: form.get("rating"),
    comment: form.get("comment")
  });
  addLog("Submitted feedback", "Feedback");
  event.target.reset();
  renderAll();
  showToast("Feedback submitted and connected to event records.");
}

function generateReport() {
  addLog("Generated management report", "Reports");
  renderAll();
  showToast("Report generated and audit log updated.");
}

navItems.forEach(item => item.addEventListener("click", () => setView(item.dataset.view)));
authTabs.forEach(tab => tab.addEventListener("click", () => switchAuthTab(tab.dataset.authTab)));
demoButtons.forEach(button => {
  button.addEventListener("click", () => {
    const account = findAccount(button.dataset.demo, "Password123");
    loginForm.querySelector("[name='email']").value = button.dataset.demo;
    loginForm.querySelector("[name='password']").value = "Password123";
    switchAuthTab("login");
    if (account) {
      showAppFor(account);
      showToast(`Welcome, ${account.name}.`);
    }
  });
});

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const email = String(form.get("email")).trim();
  const password = String(form.get("password"));
  const account = findAccount(email, password);

  if (!account) {
    state.role = "Guest";
    state.currentUser = { name: "Unknown", email, role: "Guest" };
    addLog("Failed login attempt", "Security", "Failed");
    state.currentUser = null;
    state.role = "Admin";
    renderLogs();
    showToast("Invalid email or password.");
    return;
  }

  showAppFor(account);
  showToast(`Welcome, ${account.name}.`);
});

registerForm.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const account = {
    name: String(form.get("name")).trim(),
    email: String(form.get("email")).trim(),
    password: String(form.get("password")),
    role: String(form.get("role"))
  };

  const exists = state.accounts.some(item => item.email.toLowerCase() === account.email.toLowerCase());
  if (exists) {
    showToast("That email is already registered.");
    return;
  }

  state.accounts.push(account);
  saveRegisteredAccounts();
  event.target.reset();
  showAppFor(account);
  showToast("Account created and logged in.");
});

logoutBtn.addEventListener("click", logout);

restoreSession();
