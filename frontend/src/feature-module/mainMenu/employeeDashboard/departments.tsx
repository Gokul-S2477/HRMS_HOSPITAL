import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getToken } from "../../../core/auth/auth";

type Dept = {
  id: number;
  name: string;
  description?: string | null;
};

const API_BASE = "http://localhost:8000/api";

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Dept | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "count">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const axiosInstance = useMemo(() => {
    const instance = axios.create();
    const token = getToken ? getToken() : localStorage.getItem("token");
    if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    instance.defaults.headers.common["Content-Type"] = "application/json";
    return instance;
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/departments/`),
        axiosInstance.get(`${API_BASE}/employees/department_counts/`).catch(() => ({ data: {} })),
      ]);
      setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
      setCounts(cRes.data || {});
    } catch (err) {
      console.error("Failed to load departments", err);
      setDepartments([]);
      setCounts({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nameInput.trim()) return alert("Department name is required");

    try {
      await axiosInstance.post(`${API_BASE}/departments/`, {
        name: nameInput.trim(),
        description: descInput.trim() || "",
      });
      setNameInput("");
      setDescInput("");
      setShowAdd(false);
      loadAll();
    } catch (err) {
      console.error("add dept", err);
      alert("Failed to add department");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete department?")) return;
    try {
      await axiosInstance.delete(`${API_BASE}/departments/${id}/`);
      loadAll();
    } catch (err) {
      console.error("delete", err);
      alert("Failed to delete department");
    }
  };

  const openEdit = (d: Dept) => {
    setEditing(d);
    setNameInput(d.name);
    setDescInput(d.description ?? "");
    setShowEdit(true);
  };

  const handleEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editing) return;

    try {
      await axiosInstance.patch(`${API_BASE}/departments/${editing.id}/`, {
        name: nameInput.trim(),
        description: descInput.trim() || "",
      });
      setShowEdit(false);
      setEditing(null);
      setNameInput("");
      setDescInput("");
      loadAll();
    } catch (err) {
      console.error("edit", err);
      alert("Failed to save changes");
    }
  };

  // ------------- FIXED LOGIC -------------------
  const processed = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = departments.filter((d) =>
      d.name.toLowerCase().includes(query) ||
      (d.description || "").toLowerCase().includes(query)
    );

    // FIX: read employee count using department ID only
    list = list.map((d) => ({
      ...d,
      emp_count: counts[d.id] ?? 0,
    })) as any[];

    // Sorting
    list.sort((a: any, b: any) => {
      if (sortBy === "name") {
        const res = a.name.localeCompare(b.name);
        return sortDir === "asc" ? res : -res;
      } else {
        const res = (a.emp_count || 0) - (b.emp_count || 0);
        return sortDir === "asc" ? res : -res;
      }
    });

    return list;
  }, [departments, counts, search, sortBy, sortDir]);
  // ----------------------------------------------

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* Header */}
        <div className="page-header d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="page-title">Departments</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Employee</li>
              <li className="breadcrumb-item active">Departments</li>
            </ul>
          </div>

          <div className="d-flex align-items-center">
            <div className="me-2">
              <input
                className="form-control"
                style={{ width: 220 }}
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="me-2">
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="name">Sort: Name</option>
                <option value="count">Sort: No. of Employees</option>
              </select>
            </div>

            <div className="me-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSortDir((s) => (s === "asc" ? "desc" : "asc"))}
              >
                {sortDir === "asc" ? "ASC" : "DESC"}
              </button>
            </div>

            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <i className="fa fa-plus me-2" /> Add Department
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0">Department List</h4>
            <div className="small text-muted">{processed.length} entries</div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: "5%" }}>
                      <input type="checkbox" />
                    </th>
                    <th>Department</th>
                    <th style={{ width: 150, textAlign: "center" }}>No of Employees</th>
                    <th style={{ width: 120, textAlign: "center" }}>Status</th>
                    <th style={{ width: 120, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                  ) : processed.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">No departments found.</td></tr>
                  ) : (
                    processed.map((d: any) => (
                      <tr key={d.id}>
                        <td><input type="checkbox" /></td>

                        <td>
                          <h6 className="mb-0">{d.name}</h6>
                          <small className="text-muted">{d.description ?? ""}</small>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          {String(d.emp_count).padStart(2, "0")}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <span className={`badge ${d.emp_count > 0 ? "bg-success" : "bg-secondary"}`}>
                            {d.emp_count > 0 ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <button className="btn btn-sm btn-light me-2" title="Edit" onClick={() => openEdit(d)}>
                            <i className="fa fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-danger" title="Delete" onClick={() => handleDelete(d.id)}>
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 d-flex justify-content-between align-items-center">
              <div className="small text-muted">Showing 1 - {processed.length} of {processed.length} entries</div>
              <nav aria-label="page">
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled"><button className="page-link">«</button></li>
                  <li className="page-item active"><button className="page-link">1</button></li>
                  <li className="page-item disabled"><button className="page-link">»</button></li>
                </ul>
              </nav>
            </div>

          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAdd}>
                <div className="modal-header">
                  <h5 className="modal-title">Add Department</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" value={descInput} onChange={(e) => setDescInput(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editing && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Department</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowEdit(false); setEditing(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" value={descInput} onChange={(e) => setDescInput(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => { setShowEdit(false); setEditing(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(showAdd || showEdit) && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default DepartmentsPage;
