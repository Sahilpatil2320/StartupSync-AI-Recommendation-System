import {
  ArrowRight,
  Award,
  CheckCircle2,
  Filter,
  Lightbulb,
  MapPin,
  Search,
  UsersRound
} from "lucide-react";
import { useMemo, useState } from "react";

import "./FounderMentors.css";

const mentors = [
  {
    id: 1,
    name: "Ananya Sharma",
    expertise: "Product Strategy",
    industries: ["SaaS", "Technology", "AI"],
    experience: "10+ Years",
    format: "Online",
    location: "Bengaluru, Karnataka",
    availability: "Weekly",
    startups: 18,
    match: 96
  },
  {
    id: 2,
    name: "Rohan Kulkarni",
    expertise: "Fundraising & Finance",
    industries: ["FinTech", "SaaS", "Technology"],
    experience: "8 Years",
    format: "Online & Offline",
    location: "Pune, Maharashtra",
    availability: "Every 2 Weeks",
    startups: 12,
    match: 93
  },
  {
    id: 3,
    name: "Priya Deshmukh",
    expertise: "Marketing & Growth",
    industries: ["Consumer", "EdTech", "Technology"],
    experience: "7 Years",
    format: "Online",
    location: "Mumbai, Maharashtra",
    availability: "Weekly",
    startups: 21,
    match: 91
  },
  {
    id: 4,
    name: "Vikram Joshi",
    expertise: "Technology & Product",
    industries: ["AI", "SaaS", "Enterprise"],
    experience: "12 Years",
    format: "Online & Offline",
    location: "Hyderabad, Telangana",
    availability: "Monthly",
    startups: 25,
    match: 89
  },
  {
    id: 5,
    name: "Meera Iyer",
    expertise: "Business Development",
    industries: ["Technology", "Healthcare", "SaaS"],
    experience: "9 Years",
    format: "Online",
    location: "Chennai, Tamil Nadu",
    availability: "Every 2 Weeks",
    startups: 16,
    match: 87
  },
  {
    id: 6,
    name: "Amit Patil",
    expertise: "Legal & Compliance",
    industries: ["Technology", "FinTech", "Enterprise"],
    experience: "11 Years",
    format: "Online",
    location: "Delhi, India",
    availability: "Monthly",
    startups: 14,
    match: 84
  }
];

function FounderMentors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [formatFilter, setFormatFilter] = useState("All");
  const [requestedMentors, setRequestedMentors] = useState([]);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        mentor.name.toLowerCase().includes(search) ||
        mentor.expertise.toLowerCase().includes(search) ||
        mentor.location.toLowerCase().includes(search) ||
        mentor.industries.some((industry) =>
          industry.toLowerCase().includes(search)
        );

      const matchesExpertise =
        expertiseFilter === "All" ||
        mentor.expertise === expertiseFilter;

      const matchesIndustry =
        industryFilter === "All" ||
        mentor.industries.includes(industryFilter);

      const matchesFormat =
        formatFilter === "All" ||
        mentor.format === formatFilter;

      return (
        matchesSearch &&
        matchesExpertise &&
        matchesIndustry &&
        matchesFormat
      );
    });
  }, [
    searchTerm,
    expertiseFilter,
    industryFilter,
    formatFilter
  ]);

  const handleRequest = (mentorId) => {
    setRequestedMentors((current) =>
      current.includes(mentorId)
        ? current
        : [...current, mentorId]
    );
  };

  return (
    <div className="founder-mentors-page">

      {/* Header */}

      <section className="founder-mentors-header">
        <div>
          <span className="founder-mentors-badge">
            Mentor Discovery
          </span>

          <h2>Find Mentors</h2>

          <p>
            Connect with experienced professionals who can
            guide your startup through important growth stages.
          </p>
        </div>
      </section>

      {/* Search and Filters */}

      <section className="founder-mentors-filters">

        <div className="founder-mentors-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search mentors, expertise or industries..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="founder-mentors-filter-row">

          <div className="founder-mentors-filter">
            <Lightbulb size={15} />

            <select
              value={expertiseFilter}
              onChange={(event) =>
                setExpertiseFilter(event.target.value)
              }
            >
              <option value="All">
                All Expertise
              </option>

              <option value="Product Strategy">
                Product Strategy
              </option>

              <option value="Fundraising & Finance">
                Fundraising & Finance
              </option>

              <option value="Marketing & Growth">
                Marketing & Growth
              </option>

              <option value="Technology & Product">
                Technology & Product
              </option>

              <option value="Business Development">
                Business Development
              </option>

              <option value="Legal & Compliance">
                Legal & Compliance
              </option>
            </select>
          </div>

          <div className="founder-mentors-filter">
            <Filter size={15} />

            <select
              value={industryFilter}
              onChange={(event) =>
                setIndustryFilter(event.target.value)
              }
            >
              <option value="All">
                All Industries
              </option>

              <option value="Technology">
                Technology
              </option>

              <option value="SaaS">
                SaaS
              </option>

              <option value="AI">
                AI
              </option>

              <option value="FinTech">
                FinTech
              </option>

              <option value="EdTech">
                EdTech
              </option>

              <option value="Healthcare">
                Healthcare
              </option>
            </select>
          </div>

          <div className="founder-mentors-filter">
            <UsersRound size={15} />

            <select
              value={formatFilter}
              onChange={(event) =>
                setFormatFilter(event.target.value)
              }
            >
              <option value="All">
                All Formats
              </option>

              <option value="Online">
                Online
              </option>

              <option value="Online & Offline">
                Online & Offline
              </option>
            </select>
          </div>

        </div>
      </section>

      {/* Result Header */}

      <div className="founder-mentors-results-header">
        <div>
          <h3>Recommended Mentors</h3>

          <p>
            {filteredMentors.length} mentor
            {filteredMentors.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Mentor Cards */}

      {filteredMentors.length > 0 ? (
        <section className="founder-mentors-grid">

          {filteredMentors.map((mentor) => {
            const isRequested =
              requestedMentors.includes(mentor.id);

            return (
              <article
                className="founder-mentor-card"
                key={mentor.id}
              >

                {/* Card Header */}

                <div className="founder-mentor-card-top">

                  <div className="founder-mentor-avatar">
                    {mentor.name.charAt(0)}
                  </div>

                  <div className="founder-mentor-heading">
                    <h4>{mentor.name}</h4>

                    <span>{mentor.expertise}</span>
                  </div>

                  <div className="founder-mentor-match">
                    <strong>{mentor.match}%</strong>
                    <span>Match</span>
                  </div>

                </div>

                {/* Location */}

                <div className="founder-mentor-location">
                  <MapPin size={14} />
                  {mentor.location}
                </div>

                {/* Experience */}

                <div className="founder-mentor-details">

                  <div>
                    <span>Experience</span>
                    <strong>
                      {mentor.experience}
                    </strong>
                  </div>

                  <div>
                    <span>Availability</span>
                    <strong>
                      {mentor.availability}
                    </strong>
                  </div>

                </div>

                {/* Industries */}

                <div className="founder-mentor-industries">
                  {mentor.industries.map((industry) => (
                    <span key={industry}>
                      {industry}
                    </span>
                  ))}
                </div>

                {/* Experience Summary */}

                <div className="founder-mentor-network">

                  <Award size={15} />

                  <span>
                    Mentored {mentor.startups} startups
                  </span>

                </div>

                <div className="founder-mentor-format">
                  <Lightbulb size={14} />

                  <span>
                    {mentor.format} mentoring
                  </span>
                </div>

                {/* Actions */}

                <div className="founder-mentor-actions">

                  <button
                    type="button"
                    className="founder-mentor-view-button"
                  >
                    View Profile
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    className={`founder-mentor-request-button ${
                      isRequested
                        ? "founder-mentor-requested"
                        : ""
                    }`}
                    onClick={() =>
                      handleRequest(mentor.id)
                    }
                    disabled={isRequested}
                  >
                    {isRequested ? (
                      <>
                        <CheckCircle2 size={15} />
                        Request Sent
                      </>
                    ) : (
                      "Request Mentorship"
                    )}
                  </button>

                </div>

              </article>
            );
          })}

        </section>
      ) : (
        <section className="founder-mentors-empty">

          <div className="founder-mentors-empty-icon">
            <Search size={25} />
          </div>

          <h3>No mentors found</h3>

          <p>
            Try changing your search or filter criteria.
          </p>

        </section>
      )}

    </div>
  );
}

export default FounderMentors;