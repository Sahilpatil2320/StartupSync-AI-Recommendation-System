import { useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Filter,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X
} from "lucide-react";

import "./AdminUsers.css";

const initialUsers = [
  {
    id: 1,
    name: "Aarav Kulkarni",
    email: "aarav.kulkarni@example.com",
    role: "Founder",
    organization: "FinFlow Technologies",
    location: "Pune, Maharashtra",
    status: "Active",
    joined: "12 Sep 2026",
    verified: true
  },
  {
    id: 2,
    name: "Ananya Mehta",
    email: "ananya.mehta@example.com",
    role: "Investor",
    organization: "Mehta Ventures",
    location: "Mumbai, Maharashtra",
    status: "Active",
    joined: "10 Sep 2026",
    verified: true
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "Mentor",
    organization: "Independent",
    location: "Bengaluru, Karnataka",
    status: "Active",
    joined: "08 Sep 2026",
    verified: true
  },
  {
    id: 4,
    name: "Rahul Patil",
    email: "rahul.patil@example.com",
    role: "Student",
    organization: "D.Y. Patil College",
    location: "Kolhapur, Maharashtra",
    status: "Pending",
    joined: "27 Sep 2026",
    verified: false
  },
  {
    id: 5,
    name: "Meera Joshi",
    email: "meera.joshi@example.com",
    role: "Incubator",
    organization: "Innovation Hub",
    location: "Nashik, Maharashtra",
    status: "Active",
    joined: "05 Sep 2026",
    verified: true
  },
  {
    id: 6,
    name: "Vikram Deshmukh",
    email: "vikram.deshmukh@example.com",
    role: "Founder",
    organization: "GreenGrid Systems",
    location: "Nagpur, Maharashtra",
    status: "Pending",
    joined: "28 Sep 2026",
    verified: false
  },
  {
    id: 7,
    name: "Neha Patil",
    email: "neha.patil@example.com",
    role: "Student",
    organization: "ABC Institute of Technology",
    location: "Pune, Maharashtra",
    status: "Suspended",
    joined: "02 Sep 2026",
    verified: true
  },
  {
    id: 8,
    name: "Amit Desai",
    email: "amit.desai@example.com",
    role: "Mentor",
    organization: "Tech Advisory Network",
    location: "Mumbai, Maharashtra",
    status: "Active",
    joined: "31 Aug 2026",
    verified: true
  }
];

const roleFilters = [
  "All Roles",
  "Founder",
  "Investor",
  "Mentor",
  "Student",
  "Incubator",
  "Admin"
];

const statusFilters = [
  "All Status",
  "Active",
  "Pending",
  "Suspended"
];

function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] =
    useState("All Status");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.organization.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All Roles" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const pendingUsers = users.filter(
    (user) => user.status === "Pending"
  ).length;

  const verifiedUsers = users.filter(
    (user) => user.verified
  ).length;

  const handleVerifyUser = (id) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              verified: true,
              status:
                user.status === "Pending"
                  ? "Active"
                  : user.status
            }
          : user
      )
    );

    setSelectedUser((current) =>
      current?.id === id
        ? {
            ...current,
            verified: true,
            status:
              current.status === "Pending"
                ? "Active"
                : current.status
          }
        : current
    );
  };

  const handleToggleStatus = (id) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === "Suspended"
                  ? "Active"
                  : "Suspended"
            }
          : user
      )
    );

    setSelectedUser((current) =>
      current?.id === id
        ? {
            ...current,
            status:
              current.status === "Suspended"
                ? "Active"
                : "Suspended"
          }
        : current
    );
  };

  const handleContactUser = (user) => {
    window.alert(
      `Email communication with ${user.name} will be connected to the backend later.`
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("All Roles");
    setStatusFilter("All Status");
  };

  return (
    <section className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <span className="admin-users-eyebrow">
            Platform Administration
          </span>

          <h1>User Management</h1>

          <p>
            Manage StartupSync accounts, roles, verification
            and account status.
          </p>
        </div>

        <div className="admin-users-header-badge">
          <ShieldCheck size={18} />
          <span>Administrator Access</span>
        </div>
      </div>

      <div className="admin-user-stats">
        <div className="admin-user-stat-card">
          <div className="admin-user-stat-icon">
            <Users size={20} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="admin-user-stat-card">
          <div className="admin-user-stat-icon admin-stat-success">
            <Check size={20} />
          </div>

          <div>
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="admin-user-stat-card">
          <div className="admin-user-stat-icon admin-stat-warning">
            <UserRound size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingUsers}</strong>
          </div>
        </div>

        <div className="admin-user-stat-card">
          <div className="admin-user-stat-icon admin-stat-verified">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Verified</span>
            <strong>{verifiedUsers}</strong>
          </div>
        </div>
      </div>

      <div className="admin-users-card">
        <div className="admin-users-toolbar">
          <div className="admin-user-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search users, organizations or locations..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />
          </div>

          <button
            type="button"
            className={`admin-filter-button ${
              showFilters
                ? "admin-filter-button-active"
                : ""
            }`}
            onClick={() =>
              setShowFilters((current) => !current)
            }
          >
            <Filter size={17} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="admin-users-filter-panel">
            <div className="admin-filter-group">
              <label>Role</label>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
              >
                {roleFilters.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-filter-group">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                {statusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="admin-clear-filter-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Location</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-table-user">
                        <div className="admin-table-avatar">
                          {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <strong>{user.name}</strong>

                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-role-badge">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <div className="admin-organization-cell">
                        <Building2 size={14} />
                        <span>{user.organization}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-location-cell">
                        <MapPin size={14} />
                        <span>{user.location}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`admin-status-badge admin-status-${user.status.toLowerCase()}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <span className="admin-joined-date">
                        {user.joined}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-view-user-button"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                      >
                        View
                        <ChevronRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="admin-no-users-cell"
                  >
                    <Search size={26} />

                    <strong>No users found</strong>

                    <span>
                      Try changing your search or filters.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-users-footer">
          Showing <strong>{filteredUsers.length}</strong> of{" "}
          <strong>{users.length}</strong> users
        </div>
      </div>

      {selectedUser && (
        <div
          className="admin-user-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-user-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-user-modal-header">
              <div className="admin-modal-user">
                <div className="admin-modal-avatar">
                  {selectedUser.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <h2>{selectedUser.name}</h2>

                  <span>{selectedUser.role}</span>
                </div>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedUser(null)}
                aria-label="Close user details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-user-verification">
              <div
                className={`admin-verification-icon ${
                  selectedUser.verified
                    ? "admin-verification-complete"
                    : ""
                }`}
              >
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>
                  {selectedUser.verified
                    ? "Verified Account"
                    : "Verification Pending"}
                </strong>

                <span>
                  {selectedUser.verified
                    ? "This account has completed verification."
                    : "This account requires administrator verification."}
                </span>
              </div>
            </div>

            <div className="admin-user-details-grid">
              <div>
                <span>Email</span>

                <strong>
                  <Mail size={14} />
                  {selectedUser.email}
                </strong>
              </div>

              <div>
                <span>Organization</span>

                <strong>
                  <Building2 size={14} />
                  {selectedUser.organization}
                </strong>
              </div>

              <div>
                <span>Location</span>

                <strong>
                  <MapPin size={14} />
                  {selectedUser.location}
                </strong>
              </div>

              <div>
                <span>Joined</span>

                <strong>{selectedUser.joined}</strong>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-secondary-action"
                onClick={() =>
                  handleContactUser(selectedUser)
                }
              >
                <Mail size={16} />
                Contact
              </button>

              {!selectedUser.verified && (
                <button
                  type="button"
                  className="admin-primary-action"
                  onClick={() =>
                    handleVerifyUser(selectedUser.id)
                  }
                >
                  <Check size={16} />
                  Verify User
                </button>
              )}

              {selectedUser.verified && (
                <button
                  type="button"
                  className="admin-danger-action"
                  onClick={() =>
                    handleToggleStatus(selectedUser.id)
                  }
                >
                  {selectedUser.status === "Suspended"
                    ? "Activate Account"
                    : "Suspend Account"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminUsers;