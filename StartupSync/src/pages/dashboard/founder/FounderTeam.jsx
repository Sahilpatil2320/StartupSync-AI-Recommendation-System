import {
  BriefcaseBusiness,
  CheckCircle2,
  Mail,
  MapPin,
  Plus,
  Search,
  Send,
  UserPlus,
  UsersRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./FounderTeam.css";

const initialMembers = [
  {
    id: 1,
    name: "Aarav Patil",
    role: "Co-Founder & CTO",
    skills: "React, Node.js, MongoDB",
    location: "Pune, Maharashtra",
    joined: "Jan 2026",
    status: "Active",
    initials: "AP"
  },
  {
    id: 2,
    name: "Sneha Kulkarni",
    role: "UI/UX Designer",
    skills: "Figma, UI Design, Prototyping",
    location: "Mumbai, Maharashtra",
    joined: "Feb 2026",
    status: "Active",
    initials: "SK"
  },
  {
    id: 3,
    name: "Aditya Joshi",
    role: "Backend Developer",
    skills: "Node.js, Express, PostgreSQL",
    location: "Bengaluru, Karnataka",
    joined: "Mar 2026",
    status: "Active",
    initials: "AJ"
  },
  {
    id: 4,
    name: "Riya Deshmukh",
    role: "Marketing Specialist",
    skills: "Digital Marketing, SEO, Branding",
    location: "Nagpur, Maharashtra",
    joined: "Apr 2026",
    status: "Active",
    initials: "RD"
  }
];

const openPositions = [
  {
    id: 1,
    title: "Frontend Developer",
    type: "Technical",
    skills: "React, JavaScript, CSS",
    openings: 1
  },
  {
    id: 2,
    title: "Business Development Associate",
    type: "Business",
    skills: "Sales, Partnerships, Communication",
    openings: 1
  },
  {
    id: 3,
    title: "Content & Social Media Specialist",
    type: "Marketing",
    skills: "Content Writing, Social Media, SEO",
    openings: 1
  }
];

function FounderTeam() {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "",
    message: ""
  });

  const [inviteError, setInviteError] = useState("");

  const [pendingInvites, setPendingInvites] = useState([
    {
      id: 101,
      name: "Kunal Shah",
      email: "kunal@example.com",
      role: "Frontend Developer"
    }
  ]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const searchValue = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        member.name.toLowerCase().includes(searchValue) ||
        member.role.toLowerCase().includes(searchValue) ||
        member.skills.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "All Roles" ||
        member.role.toLowerCase().includes(roleFilter.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [members, searchTerm, roleFilter]);

  const handleInviteChange = (event) => {
    const { name, value } = event.target;

    setInviteForm((previous) => ({
      ...previous,
      [name]: value
    }));

    if (inviteError) {
      setInviteError("");
    }
  };

  const handleInviteSubmit = (event) => {
    event.preventDefault();

    if (
      !inviteForm.fullName.trim() ||
      !inviteForm.email.trim() ||
      !inviteForm.role.trim()
    ) {
      setInviteError("Please complete all required fields.");
      return;
    }

    const newInvite = {
      id: Date.now(),
      name: inviteForm.fullName,
      email: inviteForm.email,
      role: inviteForm.role
    };

    setPendingInvites((previous) => [newInvite, ...previous]);

    setInviteForm({
      fullName: "",
      email: "",
      role: "",
      message: ""
    });

    setInviteError("");
    setIsInviteModalOpen(false);
  };

  const handleRemoveInvite = (id) => {
    setPendingInvites((previous) =>
      previous.filter((invite) => invite.id !== id)
    );
  };

  return (
    <div className="founder-team-page">
      {/* Page Header */}
      <section className="founder-team-header">
        <div>
          <span className="founder-team-badge">
            <UsersRound size={15} />
            Team Management
          </span>

          <h2>Build Your Startup Team</h2>

          <p>
            Manage your existing team members and discover people
            who can help your startup grow.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary founder-team-invite-button"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus size={18} />
          Invite Member
        </button>
      </section>

      {/* Statistics */}
      <section className="founder-team-stats">
        <div className="founder-team-stat-card">
          <div className="founder-team-stat-icon">
            <UsersRound size={21} />
          </div>

          <div>
            <span>Total Members</span>
            <strong>{members.length}</strong>
          </div>
        </div>

        <div className="founder-team-stat-card">
          <div className="founder-team-stat-icon">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span>Open Positions</span>
            <strong>{openPositions.length}</strong>
          </div>
        </div>

        <div className="founder-team-stat-card">
          <div className="founder-team-stat-icon">
            <Mail size={21} />
          </div>

          <div>
            <span>Pending Invites</span>
            <strong>{pendingInvites.length}</strong>
          </div>
        </div>

        <div className="founder-team-stat-card">
          <div className="founder-team-stat-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Active Members</span>
            <strong>
              {members.filter((member) => member.status === "Active").length}
            </strong>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="founder-team-section">
        <div className="founder-team-section-heading">
          <div>
            <h3>Current Team</h3>
            <p>
              People currently working with your startup.
            </p>
          </div>
        </div>

        <div className="founder-team-toolbar">
          <div className="founder-team-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by name, role or skill..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option>All Roles</option>
            <option>Founder</option>
            <option>Developer</option>
            <option>Designer</option>
            <option>Marketing</option>
          </select>
        </div>

        {filteredMembers.length > 0 ? (
          <div className="founder-team-member-grid">
            {filteredMembers.map((member) => (
              <article
                className="founder-team-member-card"
                key={member.id}
              >
                <div className="founder-team-member-top">
                  <div className="founder-team-avatar">
                    {member.initials}
                  </div>

                  <span className="founder-team-status">
                    <span />
                    {member.status}
                  </span>
                </div>

                <div className="founder-team-member-info">
                  <h4>{member.name}</h4>

                  <p className="founder-team-member-role">
                    {member.role}
                  </p>

                  <p className="founder-team-member-skills">
                    {member.skills}
                  </p>
                </div>

                <div className="founder-team-member-meta">
                  <span>
                    <MapPin size={15} />
                    {member.location}
                  </span>

                  <span>
                    Joined {member.joined}
                  </span>
                </div>

                <button
                  type="button"
                  className="founder-team-view-button"
                  onClick={() =>
                    alert(`Opening profile of ${member.name}`)
                  }
                >
                  View Profile
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="founder-team-empty">
            <UsersRound size={32} />
            <h4>No team members found</h4>
            <p>
              Try changing your search or role filter.
            </p>
          </div>
        )}
      </section>

      {/* Open Positions */}
      <section className="founder-team-section">
        <div className="founder-team-section-heading">
          <div>
            <h3>Open Team Opportunities</h3>
            <p>
              Roles you are currently looking to fill in your startup.
            </p>
          </div>

          <button
            type="button"
            className="founder-team-outline-button"
            onClick={() =>
              alert("Open position management will be connected later.")
            }
          >
            <Plus size={17} />
            Add Position
          </button>
        </div>

        <div className="founder-team-position-grid">
          {openPositions.map((position) => (
            <article
              className="founder-team-position-card"
              key={position.id}
            >
              <div className="founder-team-position-icon">
                <BriefcaseBusiness size={21} />
              </div>

              <div className="founder-team-position-content">
                <span>{position.type}</span>

                <h4>{position.title}</h4>

                <p>{position.skills}</p>

                <div className="founder-team-position-footer">
                  <small>
                    {position.openings} opening
                    {position.openings > 1 ? "s" : ""}
                  </small>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Finding candidates for ${position.title}`
                      )
                    }
                  >
                    Find Talent
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pending Invitations */}
      <section className="founder-team-section">
        <div className="founder-team-section-heading">
          <div>
            <h3>Pending Invitations</h3>
            <p>
              Invitations waiting for a response.
            </p>
          </div>
        </div>

        {pendingInvites.length > 0 ? (
          <div className="founder-team-invite-list">
            {pendingInvites.map((invite) => (
              <div
                className="founder-team-invite-row"
                key={invite.id}
              >
                <div className="founder-team-invite-avatar">
                  {invite.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="founder-team-invite-info">
                  <strong>{invite.name}</strong>
                  <span>{invite.email}</span>
                </div>

                <span className="founder-team-invite-role">
                  {invite.role}
                </span>

                <span className="founder-team-pending">
                  Pending
                </span>

                <button
                  type="button"
                  className="founder-team-remove-button"
                  onClick={() => handleRemoveInvite(invite.id)}
                  aria-label={`Remove invitation for ${invite.name}`}
                >
                  <X size={17} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="founder-team-empty founder-team-empty-small">
            <Mail size={28} />
            <p>No pending invitations.</p>
          </div>
        )}
      </section>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div
          className="founder-team-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsInviteModalOpen(false);
            }
          }}
        >
          <div className="founder-team-modal">
            <div className="founder-team-modal-header">
              <div>
                <span className="founder-team-modal-icon">
                  <UserPlus size={20} />
                </span>

                <h3>Invite Team Member</h3>

                <p>
                  Send an invitation to someone you want to
                  collaborate with.
                </p>
              </div>

              <button
                type="button"
                className="founder-team-modal-close"
                onClick={() => setIsInviteModalOpen(false)}
                aria-label="Close invitation modal"
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="founder-team-invite-form"
              onSubmit={handleInviteSubmit}
            >
              <div className="founder-team-form-group">
                <label htmlFor="team-full-name">
                  Full Name *
                </label>

                <input
                  id="team-full-name"
                  name="fullName"
                  type="text"
                  value={inviteForm.fullName}
                  onChange={handleInviteChange}
                  placeholder="Enter member name"
                />
              </div>

              <div className="founder-team-form-group">
                <label htmlFor="team-email">
                  Email Address *
                </label>

                <input
                  id="team-email"
                  name="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={handleInviteChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="founder-team-form-group">
                <label htmlFor="team-role">
                  Role *
                </label>

                <input
                  id="team-role"
                  name="role"
                  type="text"
                  value={inviteForm.role}
                  onChange={handleInviteChange}
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div className="founder-team-form-group">
                <label htmlFor="team-message">
                  Message
                </label>

                <textarea
                  id="team-message"
                  name="message"
                  value={inviteForm.message}
                  onChange={handleInviteChange}
                  placeholder="Add a short message..."
                  rows="3"
                />
              </div>

              {inviteError && (
                <p className="founder-team-form-error">
                  {inviteError}
                </p>
              )}

              <div className="founder-team-modal-actions">
                <button
                  type="button"
                  className="founder-team-cancel-button"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Send size={17} />
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FounderTeam;