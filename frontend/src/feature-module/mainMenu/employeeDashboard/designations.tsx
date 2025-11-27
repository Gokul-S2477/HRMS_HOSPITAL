import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getToken } from "../../../core/auth/auth";

type Designation = {
  id: number;
  title: string;
  description?: string | null;
};

type Employee = {
  id: number;
  first_name: string;
  last_name?: string;
  emp_code?: string;
  designation?: { id: number; title?: string } | null;
  department?: { id: number; name?: string } | null;
  is_active?: boolean;
};

const API_BASE = "http://localhost:8000/api";

const DesignationsPage: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);

  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "count">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // axios instance with token
  const axiosInstance = React.useMemo(() => {
    const instance = axios.create();
    const token = getToken ? getToken() : localStorage.getItem("token");
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    instance.defaults.headers.common["Content-Type"] = "application/json";
    return instance;
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // fetch designations and employees in parallel
      const [dRes, eRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/designations/`),
        // large limit; change if you need more
        axiosInstance.get(`${API_BASE}/employees/?limit=2000`).catch(() => ({ data: [] })),
      ]);
      setDesignations(Array.isArray(dRes.data) ? dRes.data : []);
      // employees may be paginated; handle both array and {results:[]}
      const rawEmp = eRes.data;
      const empList = Array.isArray(rawEmp) ? rawEmp : rawEmp.results || [];
      setEmployees(empList);
    } catch (err) {
      console.error("Failed loading designations/employees", err);
      setDesignations([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // compute counts and most-common department for each designation
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();

    // map employees by designation id
    const byDesig: Record<number, Employee[]> = {};
    for (const emp of employees) {
      const did = emp.designation?.id;
      if (!did) continue;
      if (!byDesig[did]) byDesig[did] = [];
      byDesig[did].push(emp);
    }

    // helper to get most common department name for a given employee list
    const mostCommonDept = (emps: Employee[]) => {
      const freq: Record<number | string, { name?: string; count: number }> = {};
      for (const e of emps) {
        const d = e.department;
        if (!d || !d.id) continue;
        const key: number | string = d.id;
        if (!freq[key]) freq[key] = { name: d.name || "", count: 0 };
        freq[key].count += 1;
      }
      let bestKey: number | string | null = null;
      let bestCount = 0;
      for (const k of Object.keys(freq)) {
        if (freq[k].count > bestCount) {
          bestCount = freq[k].count;
          bestKey = k;
        }
      }
      if (bestKey === null) return { id: null, name: "", count: 0 };
      return { id: bestKey, name: freq[bestKey].name || "", count: freq[bestKey].count };
    };

    // build list
    const list = designations
      .map((d) => {
        const emps = byDesig[d.id] || [];
        const emp_count = emps.length;
        const deptInfo = mostCommonDept(emps);
        return {
          ...d,
          emp_count,
          department_name: deptInfo.name || "",
          department_id: deptInfo.id,
        };
      })
      .filter((d) => {
        if (!q) return true;
        return (
          d.title.toLowerCase().includes(q) ||
          (d.description || "").toLowerCase().includes(q) ||
          (d.department_name || "").toLowerCase().includes(q)
        );
      });

    list.sort((a: any, b: any) => {
      if (sortBy === "name") {
        const r = a.title.localeCompare(b.title);
        return sortDir === "asc" ? r : -r;
      } else {
        const r = (a.emp_count || 0) - (b.emp_count || 0);
        return sortDir === "asc" ? r : -r;
      }
    });

    return list;
  }, [designations, employees, search, sortBy, sortDir]);

  // Add designation
  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!titleInput.trim()) return alert("Title required");
    try {
      await axiosInstance.post(`${API_BASE}/designations/`, {
        title: titleInput.trim(),
        description: descInput.trim() || "",
      });
      setTitleInput("");
      setDescInput("");
      setShowAdd(false);
      await loadAll();
    } catch (err) {
      console.error("Add designation failed", err);
      alert("Failed to add designation");
    }
  };

  // Edit
  const openEdit = (d: Designation) => {
    setEditing(d);
    setTitleInput(d.title);
    setDescInput(d.description ?? "");
    setShowEdit(true);
  };

  const handleEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editing) return;
    try {
      await axiosInstance.patch(`${API_BASE}/designations/${editing.id}/`, {
        title: titleInput.trim(),
        description: descInput.trim() || "",
      });
      setShowEdit(false);
      setEditing(null);
      setTitleInput("");
      setDescInput("");
      await loadAll();
    } catch (err) {
      console.error("Edit designation failed", err);
      alert("Failed to save changes");
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete designation?")) return;
    try {
      await axiosInstance.delete(`${API_BASE}/designations/${id}/`);
      await loadAll();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete designation");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        {/* Header */}
        <div className="page-header d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="page-title">Designations</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Employee</li>
              <li className="breadcrumb-item active">Designations</li>
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
              <i className="fa fa-plus me-2" /> Add Designation
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0">Designation List</h4>
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
                    <th>Designation</th>
                    <th style={{ width: 220 }}>Department</th>
                    <th style={{ width: 140, textAlign: "center" }}>No of Employees</th>
                    <th style={{ width: 120, textAlign: "center" }}>Status</th>
                    <th style={{ width: 120, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                  ) : processed.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">No designations found.</td></tr>
                  ) : (
                    processed.map((d: any) => (
                      <tr key={d.id}>
                        <td><input type="checkbox" /></td>
                        <td>
                          <h6 className="mb-0">{d.title}</h6>
                          <small className="text-muted">{d.description ?? ""}</small>
                        </td>

                        <td>{d.department_name ? <span className="text-muted">{d.department_name}</span> : <span className="text-muted">-</span>}</td>

                        <td style={{ textAlign: "center" }}>{String(d.emp_count).padStart(2, "0")}</td>

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
                  <h5 className="modal-title">Add Designation</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} required />
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
                  <h5 className="modal-title">Edit Designation</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowEdit(false); setEditing(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} required />
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

export default DesignationsPage;
