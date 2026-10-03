
import { useEffect, useState } from "react";

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

      setForm({
        role: "",
        company: "",
        location: "",
        package: "",
        minimumCGPA: "",
        eligibility: "",
        deadline: "",
      });

      setEditingJobId(null);

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

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage job postings on CareerTrack.</p>
        </div>

        <button onClick={onLogout}>Logout</button>
      </div>

      {message && (
        <p role="status" style={{ margin: "16px 0" }}>
          {message}
        </p>
      )}

      {/* Add or Edit Job */}
      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <h2>{editingJobId ? "Edit Job" : "Add a Job"}</h2>

        <form
          onSubmit={handleAddJob}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <input
            name="role"
            placeholder="Job role"
            value={form.role}
            onChange={handleChange}
            required
          />

          <input
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <input
            name="package"
            type="number"
            min="0"
            placeholder="Package (LPA)"
            value={form.package}
            onChange={handleChange}
            required
          />

          <input
            name="minimumCGPA"
            type="number"
            min="0"
            max="10"
            step="0.01"
            placeholder="Minimum CGPA"
            value={form.minimumCGPA}
            onChange={handleChange}
            required
          />

          <input
            name="eligibility"
            placeholder="Eligibility criteria"
            value={form.eligibility}
            onChange={handleChange}
            required
          />

          <label>
            Application deadline
            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">
            {editingJobId ? "Update Job" : "Add Job"}
          </button>

          {editingJobId && (
            <button
              type="button"
              onClick={() => {
                setEditingJobId(null);
                setForm({
                  role: "",
                  company: "",
                  location: "",
                  package: "",
                  minimumCGPA: "",
                  eligibility: "",
                  deadline: "",
                });
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      {/* Manage Jobs */}
      <section style={{ marginTop: "32px" }}>
        <h2>Manage Jobs ({jobs.length})</h2>

        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs have been posted yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {jobs.map((job) => (
              <article
                key={job._id}
                style={{
                  padding: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                }}
              >
                <h3>{job.role}</h3>

                <p>
                  {job.company} · {job.location}
                </p>

                <p>Package: {job.package} LPA</p>
                <p>Minimum CGPA: {job.minimumCGPA}</p>
                <p>Eligibility: {job.eligibility}</p>

                <p>
                  Deadline:{" "}
                  {job.deadline
                    ? new Date(
                        job.deadline
                      ).toLocaleDateString()
                    : "Not specified"}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => {
                      setForm({
                        role: job.role || "",
                        company: job.company || "",
                        location: job.location || "",
                        package: job.package ?? "",
                        minimumCGPA: job.minimumCGPA ?? "",
                        eligibility: job.eligibility || "",
                        deadline: job.deadline
                          ? new Date(job.deadline)
                              .toISOString()
                              .split("T")[0]
                          : "",
                      });

                      setEditingJobId(job._id);

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    Edit Job
                  </button>

                  <button
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    Delete Job
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Student Applications */}
      <section style={{ marginTop: "32px" }}>
        <h2>
          Student Applications ({applications.length})
        </h2>

        {applicationsLoading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>No student applications found.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {applications.map((application) => (
              <article
                key={application._id}
                style={{
                  padding: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                }}
              >
                <h3>
                  {application.student?.name ||
                    "Unknown Student"}
                </h3>

                <p>
                  Email: {application.student?.email || "N/A"}
                </p>

                <p>
                  Branch: {application.student?.branch || "N/A"}
                </p>

                <p>
                  CGPA: {application.student?.cgpa ?? "N/A"}
                </p>

                <hr />

                <h4>Job Details</h4>

                <p>
                  Role:{" "}
                  {application.job?.role || "Job unavailable"}
                </p>

                <p>
                  Company: {application.job?.company || "N/A"}
                </p>

                <p>
                  Location: {application.job?.location || "N/A"}
                </p>

                <p>
                  Applied on:{" "}
                  {application.createdAt
                    ? new Date(
                        application.createdAt
                      ).toLocaleDateString()
                    : "N/A"}
                </p>

                {application.resumeUrl && (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Resume (PDF)
                  </a>
                )}
                <div style={{ marginTop: "16px" }}>
  <label>
    Application Status:{" "}
    <select
      value={application.status || "Applied"}
      onChange={(e) =>
        handleStatusChange(application._id, e.target.value)
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
    </div>
  );
}

export default AdminDashboard;

