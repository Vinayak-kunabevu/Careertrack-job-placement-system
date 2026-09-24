import { useState } from "react";
import "./App.css";
function App() {
  const [message, setMessage] = useState("");

const testBackend = async () => {
    const response = await fetch("http://localhost:5000/api/test");
    const data = await response.json();

    setMessage(data.message);
};
  return (
    <div className="app">
      {/* Backend Test */}
      <button onClick={testBackend}>
        Test Backend
      </button>

      <p>{message}</p>

      <nav className="navbar">
        <h2>CareerTrack</h2>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Jobs</a>
          <a href="#">Applications</a>
          <button>Login</button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <h1>
            Track Your Career.
            <br />
            <span>Build Your Future.</span>
          </h1>

          <p>
            CareerTrack helps students discover jobs, track applications,
            prepare for placements, and manage their career journey in one
            place.
          </p>

          <div className="buttons">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">Explore Jobs</button>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <h3>💼 Job Tracking</h3>
          <p>Track the jobs and companies you have applied to.</p>
        </div>

        <div className="feature-card">
          <h3>📊 Application Status</h3>
          <p>Monitor your application progress from one dashboard.</p>
        </div>

        <div className="feature-card">
          <h3>🎯 Placement Preparation</h3>
          <p>Prepare for coding, aptitude and technical interviews.</p>
        </div>
      </section>

    </div>
  );
}

export default App;