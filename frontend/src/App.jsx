
import { useEffect, useState } from "react";
import "./App.css";

const categories = [
  { name: "Music", icon: "🎵", description: "Singing, instruments and bands" },
  { name: "Dance", icon: "💃", description: "Classical, contemporary and more" },
  { name: "Arts", icon: "🎨", description: "Painting, design and creativity" },
  { name: "Sports", icon: "⚽", description: "Teams, fitness and athletics" },
  { name: "Education", icon: "📚", description: "Academic and learning clubs" },
  { name: "Other Activities", icon: "✨", description: "Explore co-curricular interests" },
];

function App() {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

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
  }, []);

  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">C</span>
          ClubSphere
        </a>

        <nav>
          <a href="#explore">Explore clubs</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="nav-actions">
          <button
            className="btn btn-outline"
            onClick={() => alert("Login will be implemented in the next stage!")}
          >
            Log in
          </button>
          <button
            className="btn btn-primary"
            onClick={() => alert("Club registration is coming next!")}
          >
            Register a club
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-badge">
            <span>✦</span> ONE PLATFORM. EVERY PASSION.
          </div>

          <h1>
            Find your people.
            <br />
            <span>Build your community.</span>
          </h1>

          <p>
            Discover and manage educational and co-curricular clubs from
            anywhere. Bring your community together in one place.
          </p>

          <div className="hero-actions">
            <a className="btn btn-primary btn-large" href="#explore">
              Explore clubs <span className="arrow">→</span>
            </a>
            <button
              className="btn btn-outline btn-large"
              onClick={() => alert("Club registration is coming next!")}
            >
              Start a club
            </button>
          </div>

          <div className="hero-note">
            <span>✓</span> Built for music, dance, arts, sports and education
          </div>
        </section>

        <section className="explore-section reveal" id="explore">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR INTERESTS, YOUR COMMUNITY</span>
              <h2>Explore by category</h2>
              <p>Find the right community for what you love doing.</p>
            </div>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search music, dance, sports..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="category-grid">
            {filteredCategories.map((category, index) => (
              <article
                className="category-card reveal"
                key={category.name}
                style={{ "--delay": `${index * 90}ms` }}
              >
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <a href="#how-it-works">
                  Explore category <span>→</span>
                </a>
              </article>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <p className="empty-state">
              No matching categories. Try another search.
            </p>
          )}
        </section>

        <section className="how-section reveal" id="how-it-works">
          <span className="eyebrow">SIMPLE BY DESIGN</span>
          <h2>Your club, your community</h2>

          <div className="steps-grid">
            <article>
              <span className="step-number">01</span>
              <h3>Register your club</h3>
              <p>Submit your club details for eligibility review and approval.</p>
            </article>

            <article>
              <span className="step-number">02</span>
              <h3>Invite your members</h3>
              <p>Build your community with membership requests and invitations.</p>
            </article>

            <article>
              <span className="step-number">03</span>
              <h3>Manage together</h3>
              <p>Maintain your directory and keep member information up to date.</p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#home">
          <span className="brand-icon">C</span>
          ClubSphere
        </a>
        <p>Bringing communities together, one club at a time.</p>
      </footer>
    </div>
  );
}

export default App;
