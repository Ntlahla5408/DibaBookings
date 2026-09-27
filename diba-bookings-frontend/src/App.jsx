import { useState } from "react";
import "./App.css";

const NMU_LOGO =
  "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Nelson_Mandela_University_logo.svg/1200px-Nelson_Mandela_University_logo.svg.png";

function App() {
  const [view, setView] = useState("start");
  const [activeTab, setActiveTab] = useState("organizer-venues");

  const showView = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  if (view === "start") {
    return <StartPage showView={showView} />;
  }

  if (view === "signin") {
    return <LoginPage showView={showView} />;
  }

  if (view === "register") {
    return <RegisterPage showView={showView} />;
  }

  return (
    <Dashboard
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      showView={showView}
    />
  );
}

/* =========================
   START PAGE
========================= */

function StartPage({ showView }) {
  return (
    <div className="start-page">
      <img
        src={NMU_LOGO}
        alt="Nelson Mandela University"
        className="start-logo"
      />

      <h1 className="display-4 fw-bold text-white">
        Campus Venue Booking System
      </h1>

      <p className="nmu-yellow fw-bold text-uppercase letter-spacing">
        Nelson Mandela University Portal
      </p>

      <div className="d-flex gap-3 mt-4">
        <button
          className="btn nmu-btn px-5"
          onClick={() => showView("signin")}
        >
          Sign In
        </button>

        <button
          className="btn btn-outline-light px-5"
          onClick={() => showView("register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}

/* =========================
   LOGIN PAGE
========================= */

function LoginPage({ showView }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          src={NMU_LOGO}
          alt="NMU Logo"
          className="auth-logo"
        />

        <h2 className="fw-bold mb-4">
          LOGIN TO SYSTEM
        </h2>

        <input
          type="text"
          className="form-control form-control-lg mb-3"
          placeholder="ID Number / Username"
        />

        <input
          type="password"
          className="form-control form-control-lg mb-4"
          placeholder="Password"
        />

        <button
          className="btn nmu-btn btn-lg w-100"
          onClick={() => showView("dashboard")}
        >
          Login
        </button>

        <button
          className="btn btn-link mt-3"
          onClick={() => showView("register")}
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}

/* =========================
   REGISTER PAGE
========================= */

function RegisterPage({ showView }) {
  return (
    <div className="auth-page">
      <div className="register-card">
        <img
          src={NMU_LOGO}
          alt="NMU Logo"
          className="register-logo"
        />

        <h2 className="fw-bold text-center mb-4">
          SYSTEM REGISTRATION
        </h2>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="First Name"
            />
          </div>

          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Last Name"
            />
          </div>
        </div>

        <input
          type="email"
          className="form-control form-control-lg mb-3"
          placeholder="Email Address"
        />

        <input
          type="password"
          className="form-control form-control-lg mb-4"
          placeholder="Create Password"
        />

        <button
          className="btn nmu-btn btn-lg w-100"
          onClick={() => showView("signin")}
        >
          Register
        </button>

        <button
          className="btn btn-link w-100 mt-2"
          onClick={() => showView("signin")}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  activeTab,
  setActiveTab,
  showView,
}) {
  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <img
            src={NMU_LOGO}
            alt="NMU Logo"
          />

          <p>Venue Portal</p>
        </div>

        <div className="role-header">
          Event Organizer
        </div>

        <SidebarButton
          active={activeTab === "organizer-venues"}
          onClick={() => setActiveTab("organizer-venues")}
        >
          Search & View Venues
        </SidebarButton>

        <SidebarButton
          active={activeTab === "organizer-booking"}
          onClick={() => setActiveTab("organizer-booking")}
        >
          Submit Booking Request
        </SidebarButton>

        <SidebarButton
          active={activeTab === "organizer-history"}
          onClick={() => setActiveTab("organizer-history")}
        >
          View Booking History
        </SidebarButton>

        <div className="role-header">
          Staff
        </div>

        <SidebarButton
          active={activeTab === "staff-manage"}
          onClick={() => setActiveTab("staff-manage")}
        >
          Manage Booking Requests
        </SidebarButton>

        <SidebarButton
          active={activeTab === "staff-enquiries"}
          onClick={() => setActiveTab("staff-enquiries")}
        >
          Respond to Enquiries
        </SidebarButton>

        <SidebarButton
          active={activeTab === "staff-venues"}
          onClick={() => setActiveTab("staff-venues")}
        >
          Add/Update Venues
        </SidebarButton>

        <div className="role-header">
          System Admin
        </div>

        <SidebarButton
          active={activeTab === "admin-users"}
          onClick={() => setActiveTab("admin-users")}
        >
          Manage User Accounts
        </SidebarButton>

        <SidebarButton
          active={activeTab === "admin-settings"}
          onClick={() => setActiveTab("admin-settings")}
        >
          Manage System Settings
        </SidebarButton>

        <div className="role-header">
          Common
        </div>

        <SidebarButton
          active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        >
          Update Profile
        </SidebarButton>

        <button
          className="sidebar-item logout"
          onClick={() => showView("start")}
        >
          Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main className="dashboard-content">

        <div className="top-logo">
          <img
            src={NMU_LOGO}
            alt="NMU"
          />
        </div>

        {activeTab === "organizer-venues" && (
          <OrganizerVenues />
        )}

        {activeTab === "organizer-booking" && (
          <OrganizerBooking />
        )}

        {activeTab === "organizer-history" && (
          <OrganizerHistory />
        )}

        {activeTab === "staff-manage" && (
          <StaffManage />
        )}

        {activeTab === "staff-enquiries" && (
          <StaffEnquiries />
        )}

        {activeTab === "staff-venues" && (
          <StaffVenues />
        )}

        {activeTab === "admin-users" && (
          <AdminUsers />
        )}

        {activeTab === "admin-settings" && (
          <AdminSettings />
        )}

        {activeTab === "profile" && (
          <Profile />
        )}

      </main>
    </div>
  );
}

/* =========================
   SIDEBAR BUTTON
========================= */

function SidebarButton({
  children,
  active,
  onClick,
}) {
  return (
    <button
      className={`sidebar-item ${
        active ? "sidebar-active" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* =========================
   VENUES
========================= */

function OrganizerVenues() {
  return (
    <section>

      <h1 className="page-title">
        Search & Filter Venues
      </h1>

      <p className="text-muted mb-4">
        View and filter available campus spaces.
      </p>

      <div className="row g-3 mb-4">

        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
          />
        </div>

        <div className="col-md-4">
          <select className="form-select">
            <option>Filter by Capacity</option>
            <option>50+</option>
            <option>200+</option>
          </select>
        </div>

      </div>

      <div className="row">

        <div className="col-md-6">

          <div className="venue-card">

            <div className="venue-image"></div>

            <h4 className="fw-bold">
              Embizweni - Conference Room
            </h4>

            <p className="text-muted small">
              South Campus | Capacity: 150
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

/* =========================
   BOOKING
========================= */

function OrganizerBooking() {
  return (
    <section>

      <h1 className="page-title">
        Submit Booking Request
      </h1>

      <p className="text-muted mb-4">
        Submit or update your event booking details.
      </p>

      <div className="booking-form">

        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Event Name"
        />

        <input
          type="date"
          className="form-control form-control-lg"
        />

        <textarea
          className="form-control form-control-lg"
          placeholder="Event Description/Requirements"
          rows="5"
        />

        <button className="btn nmu-btn btn-lg w-100">
          Submit Request
        </button>

      </div>

    </section>
  );
}

/* =========================
   HISTORY
========================= */

function OrganizerHistory() {
  return (
    <section>

      <h1 className="page-title mb-4">
        Booking History
      </h1>

      <div className="table-responsive">

        <table className="table align-middle">

          <thead className="table-light">
            <tr>
              <th>Reference</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr>

              <td className="fw-bold">
                #REQ-992
              </td>

              <td>
                Main Hall
              </td>

              <td>
                <span className="badge bg-warning text-dark">
                  Pending
                </span>
              </td>

              <td>
                <button className="btn btn-link fw-bold">
                  Update
                </button>
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>
  );
}

/* =========================
   STAFF - MANAGE
========================= */

function StaffManage() {
  return (
    <section>

      <h1 className="page-title">
        Manage Booking Requests
      </h1>

      <p className="text-muted mb-4">
        View, review, and manage incoming event requests.
      </p>

      <div className="request-card">

        <div>
          <h6 className="fw-bold">
            Student Society Meeting
          </h6>

          <p className="small text-muted mb-0">
            Embizweni 102 | Review Details
          </p>
        </div>

        <div className="d-flex gap-2">

          <button className="btn btn-success btn-sm">
            Approve
          </button>

          <button className="btn btn-danger btn-sm">
            Decline
          </button>

        </div>

      </div>

    </section>
  );
}

/* =========================
   STAFF - ENQUIRIES
========================= */

function StaffEnquiries() {
  return (
    <section>

      <h1 className="page-title mb-4">
        Respond to Enquiries
      </h1>

      <div className="enquiry-card">

        <h6 className="fw-bold">
          Query regarding Audio Visual in Auditorium
        </h6>

        <p className="fst-italic small">
          "Do you provide HDMI cables?"
        </p>

        <button className="btn btn-link p-0 fw-bold">
          Send Response
        </button>

      </div>

    </section>
  );
}

/* =========================
   STAFF - VENUES
========================= */

function StaffVenues() {
  return (
    <section>

      <h1 className="page-title mb-4">
        Venue Management
      </h1>

      <button className="btn nmu-btn mb-4">
        + Add New Venue
      </button>

      <div className="venue-management">

        <span className="fw-bold">
          Boardroom A
        </span>

        <button className="btn btn-link fw-bold">
          Update Information
        </button>

      </div>

    </section>
  );
}

/* =========================
   ADMIN - USERS
========================= */

function AdminUsers() {
  return (
    <section>

      <h1 className="page-title mb-4">
        User Account Management
      </h1>

      <div className="row g-4">

        <div className="col-md-4">

          <div className="admin-card navy-card">

            <p className="small text-uppercase nmu-yellow fw-bold">
              Create Account
            </p>

            <button className="btn btn-light btn-sm mt-3">
              New User +
            </button>

          </div>

        </div>

        <div className="col-md-4">

          <div className="admin-card">

            <p className="small text-uppercase fw-bold">
              Edit Accounts
            </p>

            <h3 className="fw-bold">
              1,240 Users
            </h3>

          </div>

        </div>

        <div className="col-md-4">

          <div className="admin-card">

            <p className="small text-uppercase fw-bold">
              Assign Roles
            </p>

            <button className="btn btn-outline-dark btn-sm mt-3">
              Roles Panel
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

/* =========================
   ADMIN - SETTINGS
========================= */

function AdminSettings() {
  return (
    <section>

      <h1 className="page-title mb-4">
        Manage System Settings
      </h1>

      <div className="settings-card">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <p className="fw-bold mb-0">
            Email Notifications
          </p>

          <input
            type="checkbox"
            className="form-check-input"
            defaultChecked
          />

        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">

          <p className="fw-bold mb-0">
            Booking Deadline (Days)
          </p>

          <input
            type="number"
            defaultValue="7"
            className="form-control"
            style={{ width: "80px" }}
          />

        </div>

        <button className="btn nmu-btn w-100">
          Save System Config
        </button>

      </div>

    </section>
  );
}

/* =========================
   PROFILE
========================= */

function Profile() {
  return (
    <section>

      <h1 className="page-title mb-4">
        Update Profile
      </h1>

      <div className="profile-card">

        <div className="profile-avatar">
          JS
        </div>

        <input
          type="text"
          defaultValue="John Smith"
          className="form-control form-control-lg mb-3"
        />

        <button className="btn nmu-btn btn-lg w-100">
          Save Changes
        </button>

      </div>

    </section>
  );
}

export default App;