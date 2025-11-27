import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

type Department = { id: number; name: string };
type Policy = {
  id: number;
  title: string;
  description?: string;
  department?: Department | null;
  department_detail?: Department | null;
  file?: string;
  created_at?: string;
};

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deptId, setDeptId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [editItem, setEditItem] = useState<Policy | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  // Load Policies + Departments
  const loadData = async () => {
    setLoading(true);
    try {
      const [polRes, deptRes] = await Promise.all([
        axios.get(`${API}/policies/`, {
          params: {
            search: search || undefined,
            department: deptId || undefined,
            from: fromDate || undefined,
            to: toDate || undefined,
          },
        }),
        axios.get(`${API}/departments/`),
      ]);

      setPolicies(polRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("Policy load error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ------------------ Add Policy ------------------
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", title);
    form.append("description", desc);
    if (deptId) form.append("department", deptId);
    if (file) form.append("file", file);

    try {
      await axios.post(`${API}/policies/`, form);
      resetForm();
      loadData();
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add policy");
    }
  };

  // ------------------ Edit Policy ------------------
  const openEdit = (p: Policy) => {
    setEditItem(p);
    setTitle(p.title);
    setDesc(p.description || "");
    setDeptId(p.department?.id ? String(p.department.id) : "");
    setFile(null);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    const form = new FormData();
    form.append("title", title);
    form.append("description", desc);
    if (deptId) form.append("department", deptId);
    if (file) form.append("file", file);

    try {
      await axios.put(`${API}/policies/${editItem.id}/`, form);
      resetForm();
      setEditItem(null);
      loadData();
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update policy");
    }
  };

  // ------------------ Delete Policy ------------------
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete policy?")) return;

    try {
      await axios.delete(`${API}/policies/${id}/`);
      loadData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setDeptId("");
    setFile(null);
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* ------------------- Header ------------------- */}
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h3 className="page-title">Policies</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Employees</li>
              <li className="breadcrumb-item active">Policies</li>
            </ul>
          </div>

          <button
            className="btn btn-primary btn-lg"
            data-bs-toggle="modal"
            data-bs-target="#addPolicyModal"
          >
            <i className="fa fa-plus me-2"></i> Add Policy
          </button>
        </div>

        {/* ------------------- Filters ------------------- */}
        <div className="card p-3 mb-4 shadow-sm">
          <div className="row g-3">

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Search Policy"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={loadData}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={deptId}
                onChange={(e) => {
                  setDeptId(e.target.value);
                  loadData();
                }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  loadData();
                }}
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  loadData();
                }}
              />
            </div>

            <div className="col-md-2">
              <button className="btn btn-secondary w-100" onClick={loadData}>
                Apply
              </button>
            </div>

          </div>
        </div>

        {/* ------------------- Table ------------------- */}
        <div className="card shadow-sm">
          <div className="card-header bg-secondary text-white">
            <h4 className="card-title">Policy List</h4>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Description</th>
                    <th>Attachment</th>
                    <th>Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                  ) : policies.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">No Policies Found</td></tr>
                  ) : (
                    policies.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-bold">{p.title}</td>
                        <td>{p.department_detail?.name || "-"}</td>
                        <td>{p.description || "-"}</td>

                        <td>
                          {p.file ? (
                            <a
                              href={p.file}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fa fa-file"></i> View
                            </a>
                          ) : "-"}
                        </td>

                        <td>{p.created_at?.slice(0, 10)}</td>

                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-light me-2"
                            onClick={() => openEdit(p)}
                            data-bs-toggle="modal"
                            data-bs-target="#editPolicyModal"
                          >
                            <i className="fa fa-edit"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ------------------- Add Modal ------------------- */}
        <div className="modal fade" id="addPolicyModal">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content shadow-lg" onSubmit={handleAdd}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Add Policy</h5>
                <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Policy Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Department</label>
                  <select
                    className="form-select"
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label fw-bold">Attachment</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>

        {/* ------------------- Edit Modal ------------------- */}
        <div className="modal fade" id="editPolicyModal">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content shadow-lg" onSubmit={handleEditSave}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Policy</h5>
                <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Policy Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Department</label>
                  <select
                    className="form-select"
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label fw-bold">Replace File</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Policies;
