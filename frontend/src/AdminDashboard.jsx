import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard({ onLogout }) {
const [jobs, setJobs] = useState([]);
const [message, setMessage] = useState("");
const [applications, setApplications] = useState([]);
const [editingJobId, setEditingJobId] = useState(null);
const [loading, setLoading] = useState(true);
const [applicationsLoading, setApplicationsLoading] = useState(true);

const [form, setForm] = useState({
  role: "",
  company: "",
  location: "",
  description: "",
  package: "",
  minimumCGPA: "",
  eligibility: "",
  deadline: "",
});
const token = localStorage.getItem("token");

const fetchJobs = async () => {
try {
const response = await fetch(
"http://localhost:5000/api/jobs"
);

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  const data = await response.json();
  setJobs(data);
} catch (error) {
  setMessage(
    "Could not load jobs. Check that the backend is running."
  );
} finally {
  setLoading(false);
}


};

const fetchApplications = async () => {
try {
const response = await fetch(
"http://localhost:5000/api/applications",
{
headers: {
Authorization: `Bearer ${token}`,
},
}
);


  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch applications"
    );
  }

  setApplications(data);
} catch (error) {
  setMessage(
    error.message || "Could not load applications"
  );
} finally {
  setApplicationsLoading(false);
}


};

const handleStatusChange = async (applicationId, status) => {
setMessage("");


try {
  const response = await fetch(
    `http://localhost:5000/api/applications/${applicationId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update application status"
    );
  }

  setMessage("Application status updated successfully!");
  await fetchApplications();
} catch (error) {
  setMessage(
    error.message || "Unable to update application status"
  );
}


};

useEffect(() => {
fetchJobs();
fetchApplications();
}, []);

const handleChange = (e) => {
setForm({
...form,
[e.target.name]: e.target.value,
});
};

const resetForm = () => {
setForm({
role: "",
company: "",
location: "",
description: "",
package: "",
minimumCGPA: "",
eligibility: "",
deadline: "",
});


setEditingJobId(null);


};

const handleAddJob = async (e) => {
e.preventDefault();
setMessage("");


const isEditing = Boolean(editingJobId);

try {
  const response = await fetch(
    isEditing
      ? `http://localhost:5000/api/jobs/${editingJobId}`
      : "http://localhost:5000/api/jobs",
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        package: Number(form.package),
        minimumCGPA: Number(form.minimumCGPA),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setMessage(
      data.message ||
        (isEditing
          ? "Failed to update job"
          : "Failed to add job")
    );
    return;
  }

  setMessage(
    isEditing
      ? "Job updated successfully!"
      : "Job added successfully!"
  );

  resetForm();
  await fetchJobs();
} catch (error) {
  setMessage("Unable to connect to the backend");
}


};

const handleDeleteJob = async (jobId) => {
if (
!window.confirm("Are you sure you want to delete this job?")
) {
return;
}


setMessage("");

try {
  const response = await fetch(
    `http://localhost:5000/api/jobs/${jobId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setMessage(data.message || "Failed to delete job");
    return;
  }

  setMessage("Job deleted successfully!");
  await fetchJobs();
} catch (error) {
  setMessage("Unable to connect to the backend");
}


};

const handleEditJob = (job) => {
setForm({
role: job.role || "",
company: job.company || "",
location: job.location || "",
description: job.description || "",
package: job.package ?? "",
minimumCGPA: job.minimumCGPA ?? "",
eligibility: job.eligibility || "",
deadline: job.deadline
? new Date(job.deadline).toISOString().split("T")[0]
: "",
});


setEditingJobId(job._id);

document.getElementById("add-job")?.scrollIntoView({
  behavior: "smooth",
  block: "start",
});


};

const uniqueStudents = new Set(
applications
.map((application) => application.student?._id)
.filter(Boolean)
).size;

const activeJobs = jobs.filter(
(job) =>
!job.deadline ||
new Date(job.deadline).setHours(23, 59, 59, 999) >=
new Date().getTime()
).length;

const formatDate = (date) => {
if (!date) return "Not specified";


return new Date(date).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});


};

const getInitial = (name) =>
name?.trim()?.charAt(0)?.toUpperCase() || "?";

const getStatusClass = (status) =>
(status || "Applied")
.toLowerCase()
.replace(/\s+/g, "-");

const scrollToSection = (id) => {
document.getElementById(id)?.scrollIntoView({
behavior: "smooth",
block: "start",
});
};

return ( <div className="admin-layout"> <aside className="admin-sidebar"> <div className="sidebar-brand"> <div className="brand-icon">CT</div> <div> <h2>CareerTrack</h2> <p>Admin Panel</p> </div> </div>


    <nav className="sidebar-nav">
      <button
        className="nav-item active"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="nav-icon">▦</span>
        Dashboard
      </button>

      <button
        className="nav-item"
        onClick={() => scrollToSection("manage-jobs")}
      >
        <span className="nav-icon">▤</span>
        Manage Jobs
      </button>

      <button
        className="nav-item"
        onClick={() => scrollToSection("student-applications")}
      >
        <span className="nav-icon">▣</span>
        Student Applications
      </button>

      <button
        className="nav-item"
        onClick={() => scrollToSection("student-applications")}
      >
        <span className="nav-icon">♙</span>
        Students
      </button>
    </nav>

    <div className="sidebar-bottom">
      <div className="sidebar-admin">
        <div className="admin-avatar">A</div>
        <div>
          <strong>Administrator</strong>
          <span>Admin account</span>
        </div>
      </div>

      <button className="nav-item logout-item" onClick={onLogout}>
        <span className="nav-icon">⇥</span>
        Logout
      </button>
    </div>
  </aside>

  <main className="admin-main">
    <header className="admin-topbar">
      <div>
        <p className="topbar-eyebrow">CAREERTRACK / OVERVIEW</p>
        <h1>Admin Dashboard</h1>
        <p className="topbar-subtitle">
          Manage job postings and student applications.
        </p>
      </div>

      <div className="topbar-profile">
        <div className="admin-avatar">A</div>
        <div>
          <strong>Administrator</strong>
          <span>Admin</span>
        </div>
      </div>
    </header>

    {message && (
      <div className="dashboard-message" role="status">
        <span>{message}</span>
        <button
          type="button"
          aria-label="Dismiss message"
          onClick={() => setMessage("")}
        >
          ×
        </button>
      </div>
    )}

    <section className="stats-grid" aria-label="Dashboard statistics">
      <article className="stat-card stat-blue">
        <div className="stat-icon">▣</div>
        <div>
          <p>Total Jobs</p>
          <h2>{loading ? "—" : jobs.length}</h2>
          <span>Job postings</span>
        </div>
      </article>

      <article className="stat-card stat-green">
        <div className="stat-icon">♧</div>
        <div>
          <p>Total Applications</p>
          <h2>{applicationsLoading ? "—" : applications.length}</h2>
          <span>Applications received</span>
        </div>
      </article>

      <article className="stat-card stat-purple">
        <div className="stat-icon">♙</div>
        <div>
          <p>Registered Students</p>
          <h2>{applicationsLoading ? "—" : uniqueStudents}</h2>
          <span>Students who applied</span>
        </div>
      </article>

      <article className="stat-card stat-orange">
        <div className="stat-icon">▥</div>
        <div>
          <p>Active Jobs</p>
          <h2>{loading ? "—" : activeJobs}</h2>
          <span>Based on deadlines</span>
        </div>
      </article>
    </section>

    <div className="dashboard-content-grid">
      <section className="dashboard-panel add-job-panel" id="add-job">
        <div className="panel-heading">
          <div className="panel-heading-icon">＋</div>
          <div>
            <h2>{editingJobId ? "Edit Job" : "Add New Job"}</h2>
            <p>
              {editingJobId
                ? "Update the job posting details."
                : "Post a new opportunity for students."}
            </p>
          </div>
        </div>

        <form className="job-form" onSubmit={handleAddJob}>
          <div className="form-field">
            <label htmlFor="job-role">Job Role *</label>
            <input
              id="job-role"
              name="role"
              placeholder="e.g. Software Engineer"
              value={form.role}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="job-company">Company *</label>
            <input
              id="job-company"
              name="company"
              placeholder="e.g. Infosys"
              value={form.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="job-location">Location *</label>
            <input
              id="job-location"
              name="location"
              placeholder="e.g. Bangalore / Remote"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter job description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="job-package">Package (LPA) *</label>
            <input
              id="job-package"
              name="package"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 8"
              value={form.package}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="job-cgpa">Minimum CGPA *</label>
            <input
              id="job-cgpa"
              name="minimumCGPA"
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="e.g. 7.0"
              value={form.minimumCGPA}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="job-eligibility">
              Eligibility Criteria *
            </label>
            <input
              id="job-eligibility"
              name="eligibility"
              placeholder="e.g. BE/BTech in CSE or related branches"
              value={form.eligibility}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="job-deadline">Application Deadline *</label>
            <input
              id="job-deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            {editingJobId && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

            <button className="btn btn-primary" type="submit">
              {editingJobId ? "✓ Update Job" : "＋ Add Job"}
            </button>
          </div>
        </form>
      </section>

      <section className="dashboard-panel recent-panel">
        <div className="panel-heading recent-heading">
          <div className="panel-heading-icon">♧</div>
          <div>
            <h2>Recent Applications</h2>
            <p>Latest student applications</p>
          </div>
          <button
            className="text-button"
            onClick={() => scrollToSection("student-applications")}
          >
            View all →
          </button>
        </div>

        {applicationsLoading ? (
          <p className="empty-state">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="empty-state">No applications yet.</p>
        ) : (
          <div className="recent-list">
            {applications.slice(0, 4).map((application) => (
              <article className="recent-item" key={application._id}>
                <div className="student-avatar">
                  {getInitial(application.student?.name)}
                </div>

                <div className="recent-info">
                  <strong>
                    {application.student?.name || "Unknown Student"}
                  </strong>
                  <p>
                    {application.job?.role || "Job unavailable"}
                    {" · "}
                    {application.job?.company || "Unknown company"}
                  </p>
                  <span>{formatDate(application.createdAt)}</span>
                </div>

                <span
                  className={`status-badge ${getStatusClass(
                    application.status
                  )}`}
                >
                  {application.status || "Applied"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>

    <section className="dashboard-panel jobs-panel" id="manage-jobs">
      <div className="panel-heading jobs-heading">
        <div className="panel-heading-icon">▤</div>
        <div>
          <h2>Manage Jobs</h2>
          <p>
            {loading
              ? "Loading job postings..."
              : `${jobs.length} job posting${jobs.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            scrollToSection("add-job");
          }}
        >
          ＋ Add Job
        </button>
      </div>

      {loading ? (
        <p className="empty-state">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="empty-state">
          No jobs have been posted yet. Add your first job above.
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Job Role</th>
                <th>Company</th>
                <th>Location</th>
                <th>Package</th>
                <th>Min CGPA</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job, index) => {
                const isActive =
                  !job.deadline ||
                  new Date(job.deadline).setHours(23, 59, 59, 999) >=
                    new Date().getTime();

                return (
                  <tr key={job._id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{job.role}</strong>
                    </td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>{job.package} LPA</td>
                    <td>{job.minimumCGPA}</td>
                    <td>{formatDate(job.deadline)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          isActive ? "selected" : "rejected"
                        }`}
                      >
                        {isActive ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEditJob(job)}
                        >
                          ✎ Edit
                        </button>

                        <button
                          className="btn btn-delete"
                          onClick={() => handleDeleteJob(job._id)}
                        >
                          × Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>

    <section
      className="dashboard-panel applications-panel"
      id="student-applications"
    >
      <div className="panel-heading">
        <div className="panel-heading-icon">♧</div>
        <div>
          <h2>Student Applications</h2>
          <p>
            Review applicants, view resumes, and update their status.
          </p>
        </div>
      </div>

      {applicationsLoading ? (
        <p className="empty-state">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="empty-state">No student applications found.</p>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <article
              className="application-card"
              key={application._id}
            >
              <div className="application-student">
                <div className="student-avatar large-avatar">
                  {getInitial(application.student?.name)}
                </div>

                <div>
                  <h3>
                    {application.student?.name || "Unknown Student"}
                  </h3>
                  <p>
                    {application.student?.email || "No email"}
                  </p>
                  <span>
                    {application.student?.branch || "N/A"}
                    {" · CGPA "}
                    {application.student?.cgpa ?? "N/A"}
                  </span>
                </div>
              </div>

              <div className="application-job">
                <strong>
                  {application.job?.role || "Job unavailable"}
                </strong>
                <p>
                  {application.job?.company || "Unknown company"}
                  {" · "}
                  {application.job?.location || "N/A"}
                </p>
                <span>
                  Applied on {formatDate(application.createdAt)}
                </span>
              </div>

              <div className="application-actions">
                {application.resumeUrl && (
                  <a
                    className="btn btn-secondary resume-link"
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ↗ View Resume
                  </a>
                )}

                <label className="status-control">
                  <span>Application Status</span>
                  <select
                    value={application.status || "Applied"}
                    onChange={(e) =>
                      handleStatusChange(
                        application._id,
                        e.target.value
                      )
                    }
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Selected">Selected</option>
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <footer className="admin-footer">
      <span>CareerTrack Admin Panel</span>
      <span>Job and placement management</span>
    </footer>
  </main>
</div>


);
}

export default AdminDashboard;
