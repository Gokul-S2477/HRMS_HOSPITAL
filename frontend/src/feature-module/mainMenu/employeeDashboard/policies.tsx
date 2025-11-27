// C:\HRMS_HOSPITAL\frontend\src\feature-module\mainMenu\employeeDashboard\policies.tsx

import React, { useEffect, useState } from "react";
import API from "../../../api/axios";

type Dept = {
  id: number;
  name: string;
  description?: string | null;
};

type Policy = {
  id: number;
  title: string;
  description?: string | null;
  department_id?: number | null;
  department_detail?: Dept | null;
  file?: string | null;
  created_at?: string | null;
};

const Policies: React.FC = () => {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);

  // form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deptId, setDeptId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const [editItem, setEditItem] = useState<Policy | null>(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  // Load departments
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/departments/");
        setDepartments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Department load error:", err);
      }
    })();
  }, []);

  // Load policies
  useEffect(() => {
    loadPolicies();
  }, [search, fromDate, toDate, deptId]);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await API.get("/policies/", {
        params: {
          search: search || undefined,
          department: deptId || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      });

      setPolicies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Policy load error:", err);
      setPolicies([]);
    }
    setLoading(false);
  };

  // Add Policy — FIXED (send department_id)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title required");
      return;
    }

    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", desc || "");

    if (deptId) form.append("department_id", deptId); // FIXED KEY
    if (file) form.append("file", file);

    try {
      await API.post("/policies/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      resetForm();
      loadPolicies();
    } catch (err) {
      console.error("Add policy error:", err);
      alert("Failed to add policy");
    }
  };

  // Open edit modal
  const openEdit = (p: Policy) => {
    setEditItem(p);
    setTitle(p.title || "");
    setDesc(p.description || "");

    const dId = p.department_id ?? p.department_detail?.id;
    setDeptId(dId ? String(dId) : "");

    setFile(null);
  };

  // Edit Policy — FIXED (send department_id)
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", desc || "");

    if (deptId) form.append("department_id", deptId); // FIXED KEY
    if (file) form.append("file", file);

    try {
      await API.put(`/policies/${editItem.id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      resetForm();
      setEditItem(null);
      loadPolicies();
    } catch (err) {
      console.error("Edit policy error:", err);
      alert("Failed to update");
    }
  };

  // Delete Policy
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this policy?")) return;
    try {
      await API.delete(`/policies/${id}/`);
      loadPolicies();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete policy");
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

        {/* HEADER */}
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h3 className="page-title">Policies</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Employee</li>
              <li className="breadcrumb-item active">Policies</li>
            </ul>
          </div>

          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#addPolicyModal"
          >
            <i className="fa fa-plus me-2"></i> Add Policy
          </button>
        </div>

        {/* FILTERS */}
        <div className="card p-3 mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
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
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <button className="btn btn-secondary w-100" onClick={loadPolicies}>
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4 className="card-title mb-0">Policy List</h4>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Description</th>
                    <th>File</th>
                    <th>Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : policies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No policies found
                      </td>
                    </tr>
                  ) : (
                    policies.map((p) => (
                      <tr key={p.id}>
                        <td>{p.title}</td>
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
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td>{p.created_at?.slice(0, 10) || "-"}</td>

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

        {/* ADD MODAL */}
        <div className="modal fade" id="addPolicyModal" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content" onSubmit={handleAdd}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Add Policy</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Attachment</label>
                  <input type="file" className="form-control" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* EDIT MODAL */}
        <div className="modal fade" id="editPolicyModal" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content" onSubmit={handleEditSave}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Policy</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Replace File</label>
                  <input type="file" className="form-control" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Policies;
