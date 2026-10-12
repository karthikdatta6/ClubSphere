
import { useEffect, useMemo, useState } from "react";
import { clubApi } from "./api";
import "./App.css";

const REGISTRATION_KEY = "clubsphere_demo_registrations";
const JOIN_REQUEST_KEY = "clubsphere_demo_join_requests";

const CATEGORIES = ["Music", "Dance", "Arts", "Sports", "Education", "Other"];

const SAMPLE_CLUBS = [
  {
    id: "DEMO-1",
    name: "Harmony Music Club",
    category: "Music",
    country: "India",
    location: "Visakhapatnam",
    institution: "Demo University",
    email: "harmony@example.com",
    description: "A sample club for singing, instruments, and music events.",
    status: "APPROVED",
    isSample: true,
  },
  {
    id: "DEMO-2",
    name: "Rhythm Dance Society",
    category: "Dance",
    country: "India",
    location: "Hyderabad",
    institution: "Demo Arts Centre",
    email: "rhythm@example.com",
    description: "A sample community for dance practice and performances.",
    status: "APPROVED",
    isSample: true,
  },
  {
    id: "DEMO-3",
    name: "Creative Canvas",
    category: "Arts",
    country: "India",
    location: "Bengaluru",
    institution: "Demo Creative Studio",
    email: "canvas@example.com",
    description: "A sample arts club for drawing, painting, and crafts.",
    status: "APPROVED",
    isSample: true,
  },
  {
    id: "DEMO-4",
    name: "Campus Sports Circle",
    category: "Sports",
    country: "India",
    location: "Chennai",
    institution: "Demo Sports Centre",
    email: "sports@example.com",
    description: "A sample group for sports and friendly competitions.",
    status: "APPROVED",
    isSample: true,
  },
];

const EMPTY_REGISTRATION = {
  name: "",
  category: "Music",
  country: "",
  location: "",
  institution: "",
  email: "",
  description: "",
};

function readStorage(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeClub(club) {
  return {
    ...club,
    email: club.contactEmail ?? club.email ?? "",
    isSample: false,
  };
}

function StatusBadge({ status }) {
  const labels = {
    PENDING_APPROVAL: "Pending review",
    PENDING: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  return (
    <span className={`status-badge status-${(status || "pending").toLowerCase()}`}>
      {labels[status] || status}
    </span>
  );
}

function CategoryIcon({ category }) {
  const icons = {
    Music: "🎵",
    Dance: "💃",
    Arts: "🎨",
    Sports: "⚽",
    Education: "📚",
    Other: "✨",
  };

  return <>{icons[category] || "✨"}</>;
}

function App() {
  const [page, setPage] = useState("home");
  const [registrations, setRegistrations] = useState([]);
  const [joinRequests, setJoinRequests] = useState(() =>
    readStorage(JOIN_REQUEST_KEY)
  );

  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubsError, setClubsError] = useState("");
  const [busyClubId, setBusyClubId] = useState(null);

  const [selectedClub, setSelectedClub] = useState(null);
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [adminTab, setAdminTab] = useState("clubs");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatus, setAdminStatus] = useState("ALL");

  const [registration, setRegistration] = useState(EMPTY_REGISTRATION);
  const [joinForm, setJoinForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Load all clubs from the Spring Boot API / PostgreSQL.
  useEffect(() => {
    let cancelled = false;

    async function loadClubs() {
      try {
        setClubsLoading(true);
        setClubsError("");

        const data = await clubApi.getAll();

        if (cancelled) return;

        setRegistrations(
          Array.isArray(data) ? data.map(normalizeClub) : []
        );
      } catch (error) {
        if (!cancelled) {
          setClubsError(
            error.message ||
              "Unable to load clubs. Check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) setClubsLoading(false);
      }
    }

    loadClubs();

    return () => {
      cancelled = true;
    };
  }, []);

  // Membership requests remain in browser storage for now.
  useEffect(() => {
    try {
      localStorage.setItem(JOIN_REQUEST_KEY, JSON.stringify(joinRequests));
    } catch {
      setNotice("Could not save membership requests in browser storage.");
    }
  }, [joinRequests]);

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [page, searchTerm]);

  const pendingClubs = registrations.filter(
    (club) => club.status === "PENDING_APPROVAL"
  );

  const approvedClubs = registrations.filter(
    (club) => club.status === "APPROVED"
  );

  const rejectedClubs = registrations.filter(
    (club) => club.status === "REJECTED"
  );

  const pendingJoins = joinRequests.filter(
    (request) => request.status === "PENDING"
  );

  const approvedJoins = joinRequests.filter(
    (request) => request.status === "APPROVED"
  );

  const rejectedJoins = joinRequests.filter(
    (request) => request.status === "REJECTED"
  );

  const directoryClubs = useMemo(
    () => [
      ...SAMPLE_CLUBS,
      ...registrations.filter((club) => club.status === "APPROVED"),
    ],
    [registrations]
  );

  const filteredClubs = directoryClubs.filter((club) => {
    const term = searchTerm.trim().toLowerCase();

    const matchesSearch = [
      club.name,
      club.category,
      club.country,
      club.location,
      club.institution,
      club.description,
    ].some((value) => (value || "").toLowerCase().includes(term));

    const matchesCategory =
      categoryFilter === "All" || club.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const adminClubResults = registrations.filter((club) => {
    const term = adminSearch.trim().toLowerCase();

    const matchesSearch = [
      club.name,
      club.category,
      club.location,
      club.country,
      club.institution,
      club.email,
    ].some((value) => (value || "").toLowerCase().includes(term));

    return (
      matchesSearch &&
      (adminStatus === "ALL" || club.status === adminStatus)
    );
  });

  const adminJoinResults = joinRequests.filter((request) => {
    const term = adminSearch.trim().toLowerCase();

    const matchesSearch = [
      request.name,
      request.email,
      request.clubName,
      request.message,
    ].some((value) => (value || "").toLowerCase().includes(term));

    return (
      matchesSearch &&
      (adminStatus === "ALL" || request.status === adminStatus)
    );
  });

  function navigate(nextPage) {
    setNotice("");
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateRegistration(event) {
    const { name, value } = event.target;
    setRegistration((previous) => ({ ...previous, [name]: value }));
  }

  async function submitRegistration(event) {
    event.preventDefault();
    setNotice("");

    const newClub = {
      name: registration.name.trim(),
      category: registration.category,
      country: registration.country.trim(),
      location: registration.location.trim(),
      institution: registration.institution.trim(),
      email: registration.email.trim(),
      description: registration.description.trim(),
    };

    if (
      !newClub.name ||
      !newClub.category ||
      !newClub.country ||
      !newClub.location ||
      !newClub.institution ||
      !newClub.description ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClub.email)
    ) {
      setNotice("Please complete all fields with valid information.");
      return;
    }

    try {
      const savedClub = await clubApi.register(newClub);
      const frontendClub = normalizeClub(savedClub);

      setRegistrations((previous) => [
        frontendClub,
        ...previous.filter(
          (club) => String(club.id) !== String(frontendClub.id)
        ),
      ]);

      setRegistration(EMPTY_REGISTRATION);
      setNotice("Your club registration has been submitted for review.");
      navigate("registration-success");
    } catch (error) {
      console.error("Club registration failed:", error);
      setNotice(
        error.message ||
          "Registration failed. Make sure the backend is running."
      );
    }
  }

  function openClub(club) {
    setSelectedClub(club);
    setJoinForm({ name: "", email: "", message: "" });
    setNotice("");
    navigate("club-details");
  }

  function submitJoinRequest(event) {
    event.preventDefault();

    if (!selectedClub) return;

    const email = joinForm.email.trim().toLowerCase();

    const existingRequest = joinRequests.some(
      (request) =>
        String(request.clubId) === String(selectedClub.id) &&
        request.email.toLowerCase() === email &&
        request.status !== "REJECTED"
    );

    if (existingRequest) {
      setNotice("A request from this email already exists for this club.");
      return;
    }

    const newRequest = {
      id: makeId("JOIN"),
      clubId: selectedClub.id,
      clubName: selectedClub.name,
      name: joinForm.name.trim(),
      email,
      message: joinForm.message.trim(),
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };

    setJoinRequests((previous) => [newRequest, ...previous]);
    setJoinForm({ name: "", email: "", message: "" });
    setNotice("Your membership request has been submitted for review.");
  }

  async function updateClubStatus(clubId, status) {
    setNotice("");

    if (status !== "APPROVED" && status !== "REJECTED") {
      setNotice(
        "The backend does not currently support resetting a club to pending."
      );
      return;
    }

    try {
      setBusyClubId(clubId);

      const updatedClub =
        status === "APPROVED"
          ? await clubApi.approve(clubId)
          : await clubApi.reject(clubId);

      const normalized = normalizeClub(updatedClub);

      setRegistrations((previous) =>
        previous.map((club) =>
          String(club.id) === String(clubId) ? normalized : club
        )
      );

      if (
        selectedClub &&
        String(selectedClub.id) === String(clubId)
      ) {
        setSelectedClub(normalized);
      }

      setNotice(
        status === "APPROVED"
          ? "Club approved successfully."
          : "Club rejected successfully."
      );
    } catch (error) {
      console.error("Club status update failed:", error);
      setNotice(error.message || "Could not update the club status.");
    } finally {
      setBusyClubId(null);
    }
  }

  function updateJoinStatus(requestId, status) {
    setJoinRequests((previous) =>
      previous.map((request) =>
        request.id === requestId ? { ...request, status } : request
      )
    );
    setNotice("Membership request status updated.");
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString();
  }

  function renderClubCard(club) {
    return (
      <article className="club-card" key={club.id}>
        <div className="club-card-top">
          <span className="club-emoji">
            <CategoryIcon category={club.category} />
          </span>
          <span className="club-category">{club.category}</span>
        </div>

        <h3>{club.name}</h3>
        <p className="club-description">{club.description}</p>

        <div className="club-meta">
          <span>📍 {club.location}, {club.country}</span>
          <span>🏫 {club.institution}</span>
        </div>

        {club.isSample && (
          <span className="sample-label">DEMO EXAMPLE</span>
        )}

        <button className="card-link" onClick={() => openClub(club)}>
          View club <span>→</span>
        </button>
      </article>
    );
  }

  function renderAdminRecord(item, type) {
    const isClub = type === "club";
    const isBusy = isClub && String(busyClubId) === String(item.id);

    return (
      <article className="admin-record" key={`${type}-${item.id}`}>
        <div className="record-main">
          <div className="record-icon">{isClub ? "🏷️" : "👤"}</div>

          <div>
            <h3>{item.name}</h3>

            {isClub ? (
              <>
                <p>{item.category} · {item.location}, {item.country}</p>
                <p>{item.institution} · {item.email}</p>
                <p className="record-description">{item.description}</p>
              </>
            ) : (
              <>
                <p>{item.email}</p>
                <p><strong>Club:</strong> {item.clubName}</p>
                {item.message && (
                  <p className="record-description">{item.message}</p>
                )}
              </>
            )}

            <p className="record-date">
              Submitted: {formatDate(item.submittedAt)}
            </p>
          </div>
        </div>

        <div className="record-actions">
          <StatusBadge status={item.status} />

          <div className="action-buttons">
            <button
              className="approve-button"
              disabled={isBusy || item.status === "APPROVED"}
              onClick={() =>
                isClub
                  ? updateClubStatus(item.id, "APPROVED")
                  : updateJoinStatus(item.id, "APPROVED")
              }
            >
              {isBusy ? "Saving..." : "Approve"}
            </button>

            <button
              className="reject-button"
              disabled={isBusy || item.status === "REJECTED"}
              onClick={() =>
                isClub
                  ? updateClubStatus(item.id, "REJECTED")
                  : updateJoinStatus(item.id, "REJECTED")
              }
            >
              Reject
            </button>

            {item.status !== (isClub ? "PENDING_APPROVAL" : "PENDING") && (
              <button
                className="reset-button"
                onClick={() => {
                  if (isClub) {
                    setNotice(
                      "Reset is not available in the current backend."
                    );
                  } else {
                    updateJoinStatus(item.id, "PENDING");
                  }
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="clubsphere-app">
      <header className="site-header">
        <button className="brand" onClick={() => navigate("home")}>
          <span className="brand-icon">C</span>
          <span>ClubSphere</span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={page === "home" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("home")}
          >
            Home
          </button>

          <button
            className={page === "directory" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("directory")}
          >
            Explore Clubs
          </button>

          <button
            className={page === "register" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("register")}
          >
            Register a Club
          </button>

          <button
            className={page === "admin" ? "nav-link admin-nav active" : "nav-link admin-nav"}
            onClick={() => navigate("admin")}
          >
            Admin Dashboard
            {pendingClubs.length + pendingJoins.length > 0 && (
              <span className="nav-count">
                {pendingClubs.length + pendingJoins.length}
              </span>
            )}
          </button>
        </nav>
      </header>

      <main>
        {notice && (
          <div className="notice-message" role="status">
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {page === "home" && (
          <>
            <section className="hero-section">
              <div className="hero-content">
                <span className="eyebrow">DISCOVER YOUR COMMUNITY</span>
                <h1>
                  Find your people.
                  <br />
                  <span>Follow your passion.</span>
                </h1>
                <p>
                  Discover clubs, meet people who share your interests, and
                  build communities through music, dance, arts, sports,
                  education, and more.
                </p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => navigate("directory")}>
                    Explore clubs <span>→</span>
                  </button>
                  <button className="secondary-button" onClick={() => navigate("register")}>
                    Register your club
                  </button>
                </div>
                <div className="hero-note">
                  <span className="note-dot" />
                  A directory for communities around the world
                </div>
              </div>

              <div className="hero-visual" aria-label="Club categories">
                <div className="visual-orbit orbit-one" />
                <div className="visual-orbit orbit-two" />
                <div className="visual-center">
                  <span>🌎</span>
                  <strong>Find your circle</strong>
                  <small>Connect • Create • Grow</small>
                </div>
                <div className="floating-tile tile-music">🎵 Music</div>
                <div className="floating-tile tile-dance">💃 Dance</div>
                <div className="floating-tile tile-art">🎨 Arts</div>
                <div className="floating-tile tile-sport">⚽ Sports</div>
                <div className="floating-tile tile-learn">📚 Learning</div>
              </div>
            </section>

            <section className="section category-section">
              <div className="section-heading">
                <span className="eyebrow">EXPLORE YOUR INTERESTS</span>
                <h2>There’s a club for everyone.</h2>
                <p>Start with what you love. Find a community that helps you grow.</p>
              </div>

              <div className="category-grid">
                {[
                  ["🎵", "Music", "Sing, play, and perform"],
                  ["💃", "Dance", "Move and express yourself"],
                  ["🎨", "Arts", "Make something original"],
                  ["⚽", "Sports", "Play and compete together"],
                  ["📚", "Education", "Learn and share knowledge"],
                  ["✨", "Other", "Explore new interests"],
                ].map(([icon, title, description]) => (
                  <button
                    className="category-card"
                    key={title}
                    onClick={() => {
                      setCategoryFilter(title);
                      navigate("directory");
                    }}
                  >
                    <span className="category-icon">{icon}</span>
                    <strong>{title}</strong>
                    <span>{description}</span>
                    <span className="category-arrow">↗</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="how-section">
              <div className="section-heading">
                <span className="eyebrow">GET STARTED</span>
                <h2>Your community is three steps away.</h2>
              </div>
              <div className="steps-grid">
                <article className="step-card">
                  <span className="step-number">01</span>
                  <h3>Explore</h3>
                  <p>Search clubs by interest, location, or institution.</p>
                </article>
                <article className="step-card">
                  <span className="step-number">02</span>
                  <h3>Connect</h3>
                  <p>Discover a club and send a membership request.</p>
                </article>
                <article className="step-card">
                  <span className="step-number">03</span>
                  <h3>Grow together</h3>
                  <p>Meet people, learn new skills, and share experiences.</p>
                </article>
              </div>
            </section>

            <section className="cta-section">
              <div>
                <span className="eyebrow">BUILD YOUR COMMUNITY</span>
                <h2>Have a club of your own?</h2>
                <p>Register it on ClubSphere and help people find you.</p>
              </div>
              <button className="primary-button" onClick={() => navigate("register")}>
                Register a club <span>→</span>
              </button>
            </section>
          </>
        )}

        {page === "directory" && (
          <section className="page-section">
            <div className="page-heading">
              <span className="eyebrow">THE CLUB DIRECTORY</span>
              <h1>Find your community.</h1>
              <p>Explore approved clubs and discover your next favourite activity.</p>
            </div>

            <div className="directory-controls">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search clubs, cities, countries..."
                aria-label="Search clubs"
              />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {clubsLoading && <p>Loading clubs from the server...</p>}
            {clubsError && <p role="alert">{clubsError}</p>}

            <p className="results-count">
              {filteredClubs.length} club{filteredClubs.length === 1 ? "" : "s"} found
            </p>

            {filteredClubs.length ? (
              <div className="club-grid">
                {filteredClubs.map(renderClubCard)}
              </div>
            ) : !clubsLoading ? (
              <div className="empty-state">
                <span>🔎</span>
                <h3>No clubs found</h3>
                <p>Try another search term or category.</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : null}
          </section>
        )}

        {page === "register" && (
          <section className="page-section form-page">
            <div className="page-heading">
              <span className="eyebrow">GROW YOUR COMMUNITY</span>
              <h1>Register your club.</h1>
              <p>
                Submit your details for review. Your club will appear in the
                public directory after approval.
              </p>
            </div>

            <form className="form-card" onSubmit={submitRegistration}>
              <div className="form-intro">
                <h2>Club information</h2>
                <p>Fields marked * are required.</p>
              </div>

              <label>
                Club name *
                <input
                  name="name"
                  value={registration.name}
                  onChange={updateRegistration}
                  required
                  maxLength={100}
                  placeholder="e.g. Harmony Music Club"
                />
              </label>

              <label>
                Category *
                <select
                  name="category"
                  value={registration.category}
                  onChange={updateRegistration}
                  required
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <div className="form-two-columns">
                <label>
                  Country *
                  <input
                    name="country"
                    value={registration.country}
                    onChange={updateRegistration}
                    required
                    maxLength={80}
                    placeholder="e.g. India"
                  />
                </label>
                <label>
                  City / Location *
                  <input
                    name="location"
                    value={registration.location}
                    onChange={updateRegistration}
                    required
                    maxLength={100}
                    placeholder="e.g. Visakhapatnam"
                  />
                </label>
              </div>

              <label>
                Institution or organisation *
                <input
                  name="institution"
                  value={registration.institution}
                  onChange={updateRegistration}
                  required
                  maxLength={120}
                  placeholder="School, college, university, or organisation"
                />
              </label>

              <label>
                Contact email *
                <input
                  name="email"
                  type="email"
                  value={registration.email}
                  onChange={updateRegistration}
                  required
                  maxLength={254}
                  placeholder="club@example.com"
                />
              </label>

              <label>
                About your club *
                <textarea
                  name="description"
                  value={registration.description}
                  onChange={updateRegistration}
                  required
                  minLength={20}
                  maxLength={600}
                  rows={5}
                  placeholder="Describe your club and its activities..."
                />
                <span className="field-hint">
                  {registration.description.length}/600 characters
                </span>
              </label>

              <button className="primary-button form-submit" type="submit">
                Submit for approval <span>→</span>
              </button>

              <p className="privacy-note">
                Your club registration is saved to the ClubSphere database.
              </p>
            </form>
          </section>
        )}

        {page === "registration-success" && (
          <section className="success-page">
            <div className="success-icon">✓</div>
            <span className="eyebrow">SUBMISSION RECEIVED</span>
            <h1>Your club is in review.</h1>
            <p>
              Your registration has been saved to the database and is waiting
              for an administrator to review it.
            </p>
            <div className="success-actions">
              <button className="primary-button" onClick={() => navigate("directory")}>
                Explore clubs
              </button>
              <button className="secondary-button" onClick={() => navigate("admin")}>
                Open dashboard
              </button>
            </div>
          </section>
        )}

        {page === "club-details" && selectedClub && (
          <section className="page-section details-page">
            <button className="back-link" onClick={() => navigate("directory")}>
              ← Back to directory
            </button>

            <article className="details-card">
              <div className="details-icon">
                <CategoryIcon category={selectedClub.category} />
              </div>
              <span className="club-category">{selectedClub.category}</span>
              <h1>{selectedClub.name}</h1>
              <p className="details-description">{selectedClub.description}</p>

              <div className="details-facts">
                <p><strong>Location:</strong> {selectedClub.location}, {selectedClub.country}</p>
                <p><strong>Institution:</strong> {selectedClub.institution}</p>
                <p><strong>Contact:</strong> {selectedClub.email || "Not provided"}</p>
              </div>

              <div className="join-panel">
                <h2>Interested in joining?</h2>
                <p>Send a membership request to this club.</p>

                <form className="join-form" onSubmit={submitJoinRequest}>
                  <label>
                    Your name *
                    <input
                      value={joinForm.name}
                      onChange={(event) =>
                        setJoinForm((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                      required
                      maxLength={100}
                      placeholder="Enter your name"
                    />
                  </label>

                  <label>
                    Your email *
                    <input
                      type="email"
                      value={joinForm.email}
                      onChange={(event) =>
                        setJoinForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                      required
                      maxLength={254}
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    Message (optional)
                    <textarea
                      value={joinForm.message}
                      onChange={(event) =>
                        setJoinForm((previous) => ({
                          ...previous,
                          message: event.target.value,
                        }))
                      }
                      rows={3}
                      maxLength={300}
                      placeholder="Why would you like to join?"
                    />
                  </label>

                  <button className="primary-button" type="submit">
                    Request to join <span>→</span>
                  </button>
                </form>
              </div>
            </article>
          </section>
        )}

        {page === "admin" && (
          <section className="page-section admin-page">
            <div className="page-heading admin-heading">
              <span className="eyebrow">CLUBSPHERE MANAGEMENT</span>
              <h1>Admin Dashboard</h1>
              <p>Search registrations, filter by status, and manage membership requests.</p>
              <div className="demo-warning">
                Demo dashboard: administrator authentication has not yet been implemented.
                Membership requests are currently stored in this browser.
              </div>
            </div>

            {clubsLoading && <p>Loading club registrations...</p>}
            {clubsError && <p role="alert">{clubsError}</p>}

            <div className="stats-grid">
              <article className="stat-card stat-total">
                <span>Total registrations</span>
                <strong>{registrations.length}</strong>
                <small>Submitted clubs</small>
              </article>
              <article className="stat-card stat-pending">
                <span>Pending clubs</span>
                <strong>{pendingClubs.length}</strong>
                <small>Waiting for review</small>
              </article>
              <article className="stat-card stat-approved">
                <span>Approved clubs</span>
                <strong>{approvedClubs.length}</strong>
                <small>Visible in directory</small>
              </article>
              <article className="stat-card stat-rejected">
                <span>Rejected clubs</span>
                <strong>{rejectedClubs.length}</strong>
                <small>Not in public directory</small>
              </article>
              <article className="stat-card stat-requests">
                <span>Pending join requests</span>
                <strong>{pendingJoins.length}</strong>
                <small>Membership applications</small>
              </article>
            </div>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="eyebrow">MANAGEMENT CENTRE</span>
                  <h2>Review submissions</h2>
                </div>
                <span className="panel-count">
                  {adminTab === "clubs"
                    ? `${registrations.length} clubs`
                    : `${joinRequests.length} requests`}
                </span>
              </div>

              <div className="admin-tools">
                <div className="admin-tabs">
                  <button
                    className={adminTab === "clubs" ? "admin-tab active" : "admin-tab"}
                    onClick={() => {
                      setAdminTab("clubs");
                      setAdminSearch("");
                      setAdminStatus("ALL");
                    }}
                  >
                    Club registrations <span>{registrations.length}</span>
                  </button>

                  <button
                    className={adminTab === "joins" ? "admin-tab active" : "admin-tab"}
                    onClick={() => {
                      setAdminTab("joins");
                      setAdminSearch("");
                      setAdminStatus("ALL");
                    }}
                  >
                    Membership requests <span>{joinRequests.length}</span>
                  </button>
                </div>

                <div className="admin-filters">
                  <input
                    type="search"
                    value={adminSearch}
                    onChange={(event) => setAdminSearch(event.target.value)}
                    placeholder={
                      adminTab === "clubs"
                        ? "Search club, category, city, email..."
                        : "Search member, email, club..."
                    }
                    aria-label="Search dashboard records"
                  />

                  <select
                    value={adminStatus}
                    onChange={(event) => setAdminStatus(event.target.value)}
                    aria-label="Filter records by status"
                  >
                    <option value="ALL">All statuses</option>
                    <option value={adminTab === "clubs" ? "PENDING_APPROVAL" : "PENDING"}>
                      Pending
                    </option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {adminTab === "clubs" ? (
                adminClubResults.length ? (
                  <div className="admin-record-list">
                    {adminClubResults.map((club) => renderAdminRecord(club, "club"))}
                  </div>
                ) : (
                  <div className="admin-empty">
                    <span>📋</span>
                    <h3>No matching registrations</h3>
                    <p>Try changing the search term or status filter.</p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setAdminSearch("");
                        setAdminStatus("ALL");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )
              ) : adminJoinResults.length ? (
                <div className="admin-record-list">
                  {adminJoinResults.map((request) => renderAdminRecord(request, "join"))}
                </div>
              ) : (
                <div className="admin-empty">
                  <span>🤝</span>
                  <h3>No matching membership requests</h3>
                  <p>Try changing the search term or status filter.</p>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setAdminSearch("");
                      setAdminStatus("ALL");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>

            <section className="admin-panel admin-summary">
              <h2>Membership request summary</h2>
              <div className="summary-row">
                <span>Pending</span><strong>{pendingJoins.length}</strong>
              </div>
              <div className="summary-row">
                <span>Approved</span><strong>{approvedJoins.length}</strong>
              </div>
              <div className="summary-row">
                <span>Rejected</span><strong>{rejectedJoins.length}</strong>
              </div>
            </section>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <button className="footer-brand" onClick={() => navigate("home")}>
          <span className="brand-icon">C</span>
          ClubSphere
        </button>
        <p>Discover your people. Build your community.</p>
        <span>© {new Date().getFullYear()} ClubSphere · Student project demo</span>
      </footer>
    </div>
  );
}

export default App;
