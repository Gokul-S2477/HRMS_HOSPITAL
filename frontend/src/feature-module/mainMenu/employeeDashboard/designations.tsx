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

type Employee = {
  id: number;
  first_name: string;
  department?: { id: number; name?: string } | null;
  designation?: { id: number; title?: string } | null;
};

const API_BASE = "http://localhost:8000/api";

const DesignationsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);

  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [deptInput, setDeptInput] = useState("");

  const [search, setSearch] = useState("");

  const axiosInstance = useMemo(() => {
    const inst = axios.create();
    const token = getToken ? getToken() : localStorage.getItem("token");
    if (token) inst.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return inst;
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dRes, deptRes, eRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/designations/`),
        axiosInstance.get(`${API_BASE}/departments/`),
        axiosInstance.get(`${API_BASE}/employees/?limit=2000`),
      ]);

      setDesignations(dRes.data || []);
      setDepartments(deptRes.data || []);

      const rawEmp = eRes.data;
      const empList = Array.isArray(rawEmp) ? rawEmp : rawEmp.results || [];
      setEmployees(empList);
    } catch (err) {
      console.error("Load failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return designations.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      (d.description || "").toLowerCase().includes(q)
    );
  }, [designations, search]);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!titleInput.trim()) return alert("Title required");

    try {
      await axiosInstance.post(`${API_BASE}/designations/`, {
        title: titleInput.trim(),
        description: descInput.trim() || "",
        department: deptInput ? Number(deptInput) : null,
      });

      resetForm();
      setShowAdd(false);
      loadAll();
    } catch (err) {
      console.error("Add failed", err);
      alert("Failed to add designation");
    }
  };

  const openEdit = (d: Designation) => {
    setEditing(d);
    setTitleInput(d.title);
    setDescInput(d.description ?? "");
    const dept = d.department ?? d.department_detail?.id ?? "";
    setDeptInput(String(dept));
    setShowEdit(true);
  };

  const handleEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editing) return;

    try {
      await axiosInstance.patch(`${API_BASE}/designations/${editing.id}/`, {
        title: titleInput.trim(),
        description: descInput.trim() || "",
        department: deptInput ? Number(deptInput) : null,
      });

      resetForm();
      setShowEdit(false);
      setEditing(null);
      loadAll();
    } catch (err) {
      console.error("Edit failed", err);
      alert("Failed to update");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete designation?")) return;
    try {
      await axiosInstance.delete(`${API_BASE}/designations/${id}/`);
      loadAll();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete");
    }
  };

  const resetForm = () => {
    setTitleInput("");
    setDescInput("");
    setDeptInput("");
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* Header */}
        <div className="page-header d-flex justify-content-between align-items-center mb-4">
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
              <i className="fa fa-plus me-2" /> Add Designation
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm">
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
                      <td className="fw-bold">{d.title}</td>
                      <td>{d.description || "-"}</td>
                      <td>{d.department_detail?.name || "-"}</td>

                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-light me-2"
                          onClick={() => openEdit(d)}
                        >
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
        <div className="modal show d-block">
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
                    <label className="form-label">Department</label>
                    <select className="form-select" value={deptInput} onChange={(e) => setDeptInput(e.target.value)}>
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
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
          <div className="modal-backdrop show"></div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && editing && (
        <div className="modal show d-block">
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
                    <label className="form-label">Department</label>
                    <select className="form-select" value={deptInput} onChange={(e) => setDeptInput(e.target.value)}>
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" value={descInput} onChange={(e) => setDescInput(e.target.value)} />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => { setShowEdit(false); setEditing(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}

    </div>
  );
};

export default DesignationsPage;
