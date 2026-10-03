import { useState, useEffect } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";
function App() {
  const [student, setStudent] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerBranch, setRegisterBranch] = useState("");
  const [registerCgpa, setRegisterCgpa] = useState("");
  const [registerSkills, setRegisterSkills] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // Resume upload state
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeMessage, setResumeMessage] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  // Fetch all jobs
  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        return response.json();
      })
      .then((data) => setJobs(data))
      .catch((error) => {
        console.error("Error fetching jobs:", error);
      });
  }, []);

  // Fetch profile when logged in, including after page refresh
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setStudent(null);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/students/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setStudent(null);
          return;
        }

        const data = await response.json();
        setStudent(data.student);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    } else {
      setStudent(null);
    }
  }, [isLoggedIn]);

  // Fetch applications belonging to the logged-in student
  
// Fetch applications belonging to the logged-in student
useEffect(() => {
  if (!isLoggedIn) {
    setApplications([]);
    return;
  }

  const fetchMyApplications = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/applications/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  fetchMyApplications();
}, [isLoggedIn]);


  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/students/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      setPassword("");
      setEmail("");
      setShowLogin(false);
      setLoginMessage("");
    } catch (error) {
      setLoginMessage("Unable to connect to the backend");
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");

    const skillsArray = registerSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    try {
      const response = await fetch(
        "http://localhost:5000/api/students",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registerName,
            email: registerEmail,
            password: registerPassword,
            branch: registerBranch,
            cgpa: Number(registerCgpa),
            skills: skillsArray,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRegisterMessage(data.message || "Registration failed");
        return;
      }

      setRegisterMessage("Registration successful! Please log in.");
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterBranch("");
      setRegisterCgpa("");
      setRegisterSkills("");
    } catch (error) {
      setRegisterMessage("Unable to connect to the backend");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setStudent(null);
    setApplications([]);
    setLoginMessage("");
    setEmail("");
    setPassword("");
  };

  // Open the resume upload form when the student clicks Apply Now
  const handleApply = (jobId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLogin(true);
      return;
    }

    setSelectedJobId(jobId);
    setResumeFile(null);
    setResumeMessage("");
    setShowResumeModal(true);
  };

  // Submit the application with the selected PDF resume
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setResumeMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setShowResumeModal(false);
      setShowLogin(true);
      return;
    }

    if (!selectedJobId) {
      setResumeMessage("Please select a job first.");
      return;
    }

    if (!resumeFile) {
      setResumeMessage("Please select your resume in PDF format.");
      return;
    }

    const isPdf =
      resumeFile.type === "application/pdf" ||
      resumeFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setResumeMessage("Only PDF resumes are allowed.");
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      setResumeMessage("Resume size must be 5 MB or less.");
      return;
    }

    try {
      setIsSubmittingApplication(true);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await fetch(
        `http://localhost:5000/api/applications/${selectedJobId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setResumeMessage(
          data.message || "Failed to submit the application. Please try again."
        );
        return;
      }

      setShowResumeModal(false);
      setResumeFile(null);
      setResumeMessage("");
      alert("Application submitted successfully!");

      const applicationsResponse = await fetch(
        "http://localhost:5000/api/applications/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      setResumeMessage(
        "Could not connect to the server. Check that the backend is running."
      );
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  // Search jobs by company, role, or location
  const filteredJobs = jobs.filter((job) => {
    const query = searchTerm.toLowerCase();

    return (
      (job.company || "").toLowerCase().includes(query) ||
      (job.role || "").toLowerCase().includes(query) ||
      (job.location || "").toLowerCase().includes(query)
    );
  });

  const appliedJobIds = new Set(
    applications.map((application) => application.job?._id)
  );

  const suggestedJobs = jobs
    .filter((job) => !appliedJobIds.has(job._id))
    .slice(0, 3);

  const companies = [
    ...new Set(jobs.map((job) => job.company).filter(Boolean)),
  ].slice(0, 4);

  // Show a separate dashboard for administrators
if (isLoggedIn && student?.role === "admin") {
  return <AdminDashboard onLogout={handleLogout} />;
}

return (
    <div className="app">
      {/* Top navigation */}
      <nav className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">C</span>
          <span>Career<span className="brand-blue">Track</span></span>
        </a>

        <div className="nav-links">
          <a href="#jobs">Find Jobs</a>
          <a href="#applications">My Applications</a>
          <a href="#preparation">Placement Preparation</a>
        </div>

        <div className="nav-user">
          {isLoggedIn ? (
            <>
              <div className="nav-avatar">
                {student?.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <span>{student?.name || "Student"}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-login"
                onClick={() => setShowLogin(true)}
              >
                Login
              </button>
              <button
                className="nav-register"
                onClick={() => setShowRegister(true)}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Login form */}
      {showLogin && (
        <div className="form-overlay">
          <div className="login-form">
            <button
              className="form-close"
              onClick={() => setShowLogin(false)}
              aria-label="Close login"
            >
              ×
            </button>

            <h2>Welcome Back</h2>
            <p>Log in to your CareerTrack account.</p>

            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="primary-btn full-btn">
                Login
              </button>
            </form>

            {loginMessage && <p className="form-message">{loginMessage}</p>}

            <p className="form-switch">
              New to CareerTrack?{" "}
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Registration form */}
      {showRegister && (
        <div className="form-overlay">
          <div className="login-form">
            <button
              className="form-close"
              onClick={() => setShowRegister(false)}
              aria-label="Close registration"
            >
              ×
            </button>

            <h2>Create Account</h2>
            <p>Join CareerTrack to explore job opportunities.</p>

            <form onSubmit={handleRegister}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />

              <label>Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />

              <label>Branch</label>
              <input
                type="text"
                placeholder="e.g. Information Science"
                value={registerBranch}
                onChange={(e) => setRegisterBranch(e.target.value)}
                required
              />

              <label>CGPA</label>
              <input
                type="number"
                placeholder="CGPA out of 10"
                min="0"
                max="10"
                step="0.01"
                value={registerCgpa}
                onChange={(e) => setRegisterCgpa(e.target.value)}
                required
              />

              <label>Skills</label>
              <input
                type="text"
                placeholder="Python, Java, SQL"
                value={registerSkills}
                onChange={(e) => setRegisterSkills(e.target.value)}
              />

              <button type="submit" className="primary-btn full-btn">
                Create Account
              </button>
            </form>

            {registerMessage && (
              <p className="form-message">{registerMessage}</p>
            )}

            <p className="form-switch">
              Already registered?{" "}
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Resume upload modal */}
      {showResumeModal && (
        <div className="form-overlay">
          <div className="login-form">
            <button
              type="button"
              className="form-close"
              onClick={() => {
                setShowResumeModal(false);
                setResumeFile(null);
                setResumeMessage("");
              }}
              aria-label="Close resume upload"
            >
              ×
            </button>

            <h2>Submit Your Application</h2>
            <p>Select your resume as a PDF file (maximum 5 MB).</p>

            <form onSubmit={handleSubmitApplication}>
              <label htmlFor="resume-upload">Resume (PDF)</label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  setResumeFile(e.target.files?.[0] || null);
                  setResumeMessage("");
                }}
                required
              />

              {resumeFile && (
                <p className="form-message">
                  Selected: {resumeFile.name}
                </p>
              )}

              {resumeMessage && (
                <p className="form-message" role="alert">
                  {resumeMessage}
                </p>
              )}

              <button
                type="submit"
                className="primary-btn full-btn"
                disabled={isSubmittingApplication}
              >
                {isSubmittingApplication
                  ? "Submitting..."
                  : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard layout */}
      <div className="dashboard-layout" id="home">
        {/* Left sidebar */}
        <aside className="dashboard-sidebar">
          <section className="profile sidebar-card">
            <div className="card-heading">
              <h2>Student Profile</h2>
              <span className="profile-icon">♙</span>
            </div>

            {isLoggedIn && student ? (
              <>
                <div className="profile-avatar">
                  {student.name?.charAt(0).toUpperCase() || "S"}
                </div>

                <h3 className="profile-name">{student.name}</h3>
                <p className="profile-email">{student.email}</p>

                <div className="profile-details">
                  <p>
                    <strong>Branch</strong>
                    <span>{student.branch}</span>
                  </p>
                  <p>
                    <strong>CGPA</strong>
                    <span>{student.cgpa}</span>
                  </p>
                  <p>
                    <strong>Year</strong>
                    <span>4th Year</span>
                  </p>
                  <p>
                    <strong>College</strong>
                    <span>RNS Institute of Technology</span>
                  </p>
                </div>

                <div className="profile-skills">
                  <h3>Skills</h3>
                  <div className="skill-tags">
                    {student.skills?.length > 0 ? (
                      student.skills.map((skill, index) => (
                        <span key={`${skill}-${index}`}>{skill}</span>
                      ))
                    ) : (
                      <span>Add skills to your profile</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="profile-guest">
                <div className="profile-avatar">?</div>
                <h3>Welcome to CareerTrack</h3>
                <p>Log in to view your student profile and applications.</p>
                <button
                  className="primary-btn full-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Login to Continue
                </button>
              </div>
            )}
          </section>

          <section className="sidebar-card filter-card">
            <div className="card-heading">
              <h2>Quick Links</h2>
            </div>

            <a href="#jobs" className="quick-link">
              <span>▣</span> Browse Jobs
            </a>
            <a href="#applications" className="quick-link">
              <span>▤</span> My Applications
            </a>
            <a href="#preparation" className="quick-link">
              <span>◎</span> Placement Preparation
            </a>
          </section>
        </aside>

        {/* Center content */}
        <main className="dashboard-main">
          <section className="search-banner">
            <div className="banner-content">
              <span className="banner-label">YOUR CAREER STARTS HERE</span>
              <h1>Find your next opportunity</h1>
              <p>
                Explore job openings and discover opportunities to build
                your career.
              </p>

              <form
                className="job-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("jobs")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className="search-icon">⌕</span>
                <input
                  type="text"
                  placeholder="Search jobs, companies or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>
            </div>
            <div className="banner-decoration">↗</div>
          </section>

          {/* Jobs */}
          <section id="jobs" className="jobs-section">
            <div className="section-heading">
              <div>
                <h2>Latest Job Openings</h2>
                <p>Explore opportunities that match your career goals.</p>
              </div>
              <span className="result-count">
                {filteredJobs.length} jobs
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <span>⌕</span>
                <h3>No jobs found</h3>
                <p>Try another company, role, or location.</p>
              </div>
            ) : (
              <div className="jobs-container">
                {filteredJobs.map((job) => {
                  const alreadyApplied = appliedJobIds.has(job._id);

                  return (
                    <article className="job-card" key={job._id}>
                      <div className="company-logo">
                        {(job.company || "?").charAt(0).toUpperCase()}
                      </div>

                      <div className="job-info">
                        <div className="job-title-row">
                          <div>
                            <h3>{job.role}</h3>
                            <p className="company-name">{job.company}</p>
                          </div>
                          <span className="job-type">Full Time</span>
                        </div>

                        <div className="job-meta">
                          <span>⌖ {job.location}</span>
                          <span>₹ {job.package}</span>
                          <span>CGPA: {job.minimumCGPA}+</span>
                        </div>

                        <p className="job-eligibility">
                          <strong>Eligibility:</strong> {job.eligibility}
                        </p>

                        <p className="job-deadline">
                          <strong>Deadline:</strong>{" "}
                          {new Date(job.deadline).toLocaleDateString()}
                        </p>

                        <div className="job-actions">
                          {alreadyApplied && (
                            <span className="already-applied">
                              Already Applied
                            </span>
                          )}

                          <button
                            className="apply-btn"
                            onClick={() => handleApply(job._id)}
                            disabled={!isLoggedIn || alreadyApplied}
                            title={
                              !isLoggedIn
                                ? "Log in to apply"
                                : alreadyApplied
                                ? "You have already applied"
                                : "Apply for this job"
                            }
                          >
                            {!isLoggedIn
                              ? "Login to Apply"
                              : alreadyApplied
                              ? "Applied ✓"
                              : "Apply Now"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* My applications */}
          <section id="applications" className="applications-section">
            <div className="section-heading">
              <div>
                <h2>My Applications</h2>
                <p>Keep track of your job application progress.</p>
              </div>
              <span className="result-count">
                {isLoggedIn ? applications.length : 0} applied
              </span>
            </div>

            {!isLoggedIn ? (
              <div className="empty-state">
                <h3>Track your applications</h3>
                <p>Log in to see your submitted applications.</p>
                <button
                  className="primary-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <h3>No applications yet</h3>
                <p>Apply for a job to see it listed here.</p>
                <a className="primary-btn" href="#jobs">
                  Explore Jobs
                </a>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((application) => (
                  <article
                    className="application-card"
                    key={application._id}
                  >
                    <div className="company-logo">
                      {(application.job?.company || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="application-info">
                      <h3>{application.job?.role || "Job"}</h3>
                      <p className="company-name">
                        {application.job?.company || "Company"}
                      </p>
                      <p>
                        {application.job?.location || "Location not available"}
                        {" · "}
                        {application.job?.package || "Package not specified"}
                      </p>
                      <p>
                        Applied on:{" "}
                        {new Date(
                          application.createdAt
                        ).toLocaleDateString()}
                      </p>
                      {application.resumeUrl && (
          <p className="resume-link">
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              >
                 View Resume (PDF)
              </a>
               </p>
              )}
                    </div>

                    <span
                      className={`status-badge ${(
                        application.status || "Applied"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {application.status || "Applied"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Feature cards */}
          <section id="preparation" className="features">
  <div className="feature-card">
    <div className="feature-icon">▣</div>
    <h3>Job Tracking</h3>
    <p>Keep your job search and applications organized.</p>
    <a href="#jobs">View Jobs →</a>
  </div>

  <div className="feature-card">
    <div className="feature-icon">▥</div>
    <h3>Application Status</h3>
    <p>Check the latest status of your submitted applications.</p>
    <a href="#applications">Track Status →</a>
  </div>

  <div className="feature-card">
    <div className="feature-icon">◎</div>
    <h3>Placement Preparation</h3>
    <p>Prepare for coding, aptitude, and technical interviews.</p>
    <a
      href="https://www.geeksforgeeks.org/"
      target="_blank"
      rel="noreferrer"
    >
      Explore Preparation Resources →
    </a>
  </div>
</section>


        </main>

        {/* Right sidebar */}
        <aside className="dashboard-right">
          <section className="sidebar-card insights-card">
            <div className="card-heading">
              <h2>Placement Insights</h2>
            </div>

            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-icon blue">▣</span>
                <div>
                  <strong>{jobs.length}</strong>
                  <p>Total Jobs</p>
                </div>
              </div>

              <div className="insight-item">
                <span className="insight-icon green">▤</span>
                <div>
                  <strong>{applications.length}</strong>
                  <p>Applied</p>
                </div>
              </div>

              <div className="insight-item">
                <span className="insight-icon orange">★</span>
                <div>
                  <strong>
                    {
                      applications.filter(
                        (application) =>
                          application.status === "Shortlisted"
                      ).length
                    }
                  </strong>
                  <p>Shortlisted</p>
                </div>
              </div>

              <div className="insight-item">
                <span className="insight-icon purple">✓</span>
                <div>
                  <strong>
                    {
                      applications.filter(
                        (application) =>
                          application.status === "Selected"
                      ).length
                    }
                  </strong>
                  <p>Selected</p>
                </div>
              </div>
            </div>
          </section>

          <section className="sidebar-card suggested-card">
            <div className="card-heading">
              <h2>Suggested Jobs</h2>
              <a href="#jobs">View all</a>
            </div>

            {suggestedJobs.length === 0 ? (
              <p className="sidebar-empty">No additional jobs available.</p>
            ) : (
              suggestedJobs.map((job) => (
                <a
                  href="#jobs"
                  className="suggested-job"
                  key={job._id}
                  onClick={() => setSearchTerm(job.company)}
                >
                  <div className="suggested-logo">
                    {(job.company || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{job.company}</h3>
                    <p>{job.role}</p>
                    <span>
                      {job.location} · {job.package}
                    </span>
                  </div>
                  <span className="suggested-arrow">›</span>
                </a>
              ))
            )}
          </section>

          <section className="sidebar-card companies-card">
            <div className="card-heading">
              <h2>Companies Hiring</h2>
            </div>

            {companies.length === 0 ? (
              <p className="sidebar-empty">No companies listed yet.</p>
            ) : (
              companies.map((company) => (
                <button
                  className="company-row"
                  key={company}
                  onClick={() => {
                    setSearchTerm(company);
                    document
                      .getElementById("jobs")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="suggested-logo">
                    {company.charAt(0).toUpperCase()}
                  </span>
                  <span>{company}</span>
                  <span className="suggested-arrow">›</span>
                </button>
              ))
            )}
          </section>
        </aside>
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} CareerTrack. Built for your career journey.</p>
      </footer>
    </div>
  );
}

export default App;