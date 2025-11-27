import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getToken } from "../../../core/auth/auth";

type Department = {
  id: number;
  name: string;
};

type Designation = {
  id: number;
  title: string;
  description?: string | null;
  department?: number | null;
  department_detail?: { id: number; name: string } | null;
};

const API_BASE = "http://localhost:8000/api";

const DesignationsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);

  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [deptInput, setDeptInput] = useState("");

  const [search, setSearch] = useState("");

  /** Axios with token */
  const axiosInstance = useMemo(() => {
    const inst = axios.create();
    const token = getToken ? getToken() : localStorage.getItem("token");
    if (token) inst.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    inst.defaults.headers.common["Content-Type"] = "application/json";
    return inst;
  }, []);

  /** Load data */
  const loadAll = async () => {
    setLoading(true);
    try {
      const [desigRes, deptRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/designations/`),
        axiosInstance.get(`${API_BASE}/departments/`),
      ]);

      setDesignations(desigRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error("Load failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  /** Filter */
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return designations.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q) ||
        (d.department_detail?.name || "").toLowerCase().includes(q)
    );
  }, [designations, search]);

  /** Reset form */
  const resetForm = () => {
    setTitleInput("");
    setDescInput("");
    setDeptInput("");
  };

  /** ADD (FIXED → send department_id) */
  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!titleInput.trim()) return alert("Title is required");

    try {
      await axiosInstance.post(`${API_BASE}/designations/`, {
        title: titleInput.trim(),
        description: descInput.trim() || "",
        department_id: deptInput ? Number(deptInput) : null, // 🔥 FIXED
      });

      resetForm();
      setShowAdd(false);
      loadAll();
    } catch (err) {
      console.error("Add failed", err);
      alert("Failed to add designation");
    }
  };

  /** OPEN EDIT */
  const openEdit = (d: Designation) => {
    setEditing(d);
    setTitleInput(d.title);
    setDescInput(d.description || "");
    setDeptInput(String(d.department || d.department_detail?.id || ""));
    setShowEdit(true);
  };

  /** EDIT (FIXED → send department_id) */
  const handleEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editing) return;

    try {
      await axiosInstance.patch(`${API_BASE}/designations/${editing.id}/`, {
        title: titleInput.trim(),
        description: descInput.trim() || "",
        department_id: deptInput ? Number(deptInput) : null, // 🔥 FIXED
      });

      resetForm();
      setShowEdit(false);
      setEditing(null);
      loadAll();
    } catch (err) {
      console.error("Edit failed", err);
      alert("Failed to update designation");
    }
  };

  /** DELETE */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this designation?")) return;

    try {
      await axiosInstance.delete(`${API_BASE}/designations/${id}/`);
      loadAll();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* HEADER */}
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h3 className="page-title">Designations</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Employee</li>
              <li className="breadcrumb-item active">Designations</li>
            </ul>
          </div>

          <div>
            <input
              className="form-control d-inline-block me-2"
              style={{ width: 250 }}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <i className="fa fa-plus me-2"></i> Add Designation
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4 className="card-title mb-0">Designation List</h4>
          </div>

          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Department</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                ) : processed.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4">No Data</td></tr>
                ) : (
                  processed.map((d) => (
                    <tr key={d.id}>
                      <td>{d.title}</td>
                      <td>{d.description || "-"}</td>
                      <td>{d.department_detail?.name || "-"}</td>

                      <td className="text-center">
                        <button className="btn btn-sm btn-light me-2" onClick={() => openEdit(d)}>
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(d.id)}
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
      {showAdd && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleAdd}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add Designation</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAdd(false)} />
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        className="form-control"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={deptInput}
                        onChange={(e) => setDeptInput(e.target.value)}
                      >
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
                      <textarea
                        className="form-control"
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowAdd(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* EDIT MODAL */}
      {showEdit && editing && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Designation</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowEdit(false);
                        setEditing(null);
                      }}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        className="form-control"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={deptInput}
                        onChange={(e) => setDeptInput(e.target.value)}
                      >
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
                      <textarea
                        className="form-control"
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        setShowEdit(false);
                        setEditing(null);
                      }}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default DesignationsPage;
