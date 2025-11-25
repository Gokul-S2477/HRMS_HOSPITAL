import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * SmartHR-styled Employee List + Add/Edit Modal (Full permissions)
 * Paste as: frontend/src/feature-module/mainMenu/employeeDashboard/employee-list.tsx
 *
 * Backend endpoints used (adjust if different):
 *  - GET  /api/employees/
 *  - GET  /api/employees/:id/
 *  - POST /api/employees/
 *  - PUT  /api/employees/:id/
 *  - DELETE /api/employees/:id/
 *  - GET  /api/departments/
 *  - GET  /api/designations/
 */

type Dept = { id: number; name: string };
type Desig = { id: number; title: string };

type PermissionSet = {
  read: boolean;
  write: boolean;
  create: boolean;
  delete: boolean;
  import: boolean;
  export: boolean;
};

type Employee = {
  id: number;
  emp_code: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  joining_date?: string | null;
  employment_type?: string | null;
  role?: string | null;
  department?: Dept | null;
  designation?: Desig | null;
  salary?: number | null;
  is_active?: boolean;
  photo?: string | null;
  created_at?: string | null;
  permissions?: any;
};

const API_BASE = "http://localhost:8000";
const API_EMP = `${API_BASE}/api/employees/`;
const API_DEPT = `${API_BASE}/api/departments/`;
const API_DESIG = `${API_BASE}/api/designations/`;

const MODULES = [
  "Holidays",
  "Leaves",
  "Clients",
  "Projects",
  "Tasks",
  "Chats",
  "Assets",
  "TimingSheets",
  "Payroll",
  "Attendance",
  "Reports",
];

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();

  // Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // UI & filters
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedDesig, setSelectedDesig] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Modal / form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const defaultForm = {
    emp_code: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    joining_date: "",
    employment_type: "Full-Time",
    role: "Other",
    department: "",
    designation: "",
    salary: "",
    is_active: true,
  };

  const [formData, setFormData] = useState<Record<string, any>>({ ...defaultForm });

  // permissions typed record
  const defaultPermissions: Record<string, PermissionSet> = {};
  MODULES.forEach((m) => {
    defaultPermissions[m] = { read: false, write: false, create: false, delete: false, import: false, export: false };
  });
  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>({ ...defaultPermissions });
  const [permissionsSelectAll, setPermissionsSelectAll] = useState<boolean>(false);

  // Fetch meta and employees
  const fetchMeta = async () => {
    try {
      const [dRes, desRes] = await Promise.all([axios.get<Dept[]>(API_DEPT), axios.get<Desig[]>(API_DESIG)]);
      setDepartments(dRes.data || []);
      setDesignations(desRes.data || []);
    } catch (err) {
      console.error("fetchMeta error:", err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Employee[]>(API_EMP);
      setEmployees(res.data || []);
    } catch (err) {
      console.error("fetchEmployees error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchEmployees();
  }, []);

  // Derived totals
  const totals = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.is_active).length;
    const inactive = total - active;
    const newHires = employees.filter((e) => {
      if (!e.joining_date) return false;
      const jd = new Date(e.joining_date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - jd.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;
    return { total, active, inactive, newHires };
  }, [employees]);

  // Filtering & pagination
  const filtered = useMemo(() => {
    let list = employees.slice();
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        const name = `${e.first_name ?? ""} ${e.middle_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
        return name.includes(q) || (e.email ?? "").toLowerCase().includes(q) || (e.emp_code ?? "").toLowerCase().includes(q);
      });
    }
    if (selectedDept) list = list.filter((e) => String(e.department?.id ?? "") === selectedDept);
    if (selectedDesig) list = list.filter((e) => String(e.designation?.id ?? "") === selectedDesig);
    if (selectedStatus === "active") list = list.filter((e) => e.is_active);
    if (selectedStatus === "inactive") list = list.filter((e) => !e.is_active);

    if (sortBy === "joining_desc") list.sort((a, b) => (new Date(b.joining_date ?? "").getTime() || 0) - (new Date(a.joining_date ?? "").getTime() || 0));
    if (sortBy === "joining_asc") list.sort((a, b) => (new Date(a.joining_date ?? "").getTime() || 0) - (new Date(b.joining_date ?? "").getTime() || 0));
    if (sortBy === "recent") list.sort((a, b) => (new Date(b.created_at ?? "").getTime() || 0) - (new Date(a.created_at ?? "").getTime() || 0));

    return list;
  }, [employees, search, selectedDept, selectedDesig, selectedStatus, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Helpers
  const avatarSrc = (e: Employee) => (e.photo ? (e.photo.startsWith("http") ? e.photo : `${API_BASE}${e.photo}`) : "/assets/images/avatar.png");
  const smallName = (e: Employee) => `${e.first_name ?? ""} ${e.last_name ?? ""}`;

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${API_EMP}${id}/`);
      await fetchEmployees();
    } catch (err) {
      console.error("delete error:", err);
      alert("Delete failed (see console).");
    }
  };

  // Modal open for Add
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...defaultForm });
    setPhotoFile(null);
    setPermissions({ ...defaultPermissions });
    setPermissionsSelectAll(false);

    const el = document.getElementById("add_employee_modal");
    if (el && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(el as Element);
      modal.show();
    } else {
      // If bootstrap isn't loaded, fallback to showing a basic alert so user knows
      console.warn("Bootstrap modal not found on window. Make sure you imported bootstrap JS.");
      alert("Bootstrap JS not loaded; modal cannot open. Please add `import 'bootstrap/dist/js/bootstrap.bundle.min.js'` to your index.tsx.");
    }
  };

  // Modal open for Edit
  const openEditModal = async (id: number) => {
    try {
      const res = await axios.get<Employee>(`${API_EMP}${id}/`);
      const emp = res.data;
      setEditingId(emp.id);
      setFormData({
        emp_code: emp.emp_code ?? "",
        first_name: emp.first_name ?? "",
        middle_name: emp.middle_name ?? "",
        last_name: emp.last_name ?? "",
        email: emp.email ?? "",
        phone: emp.phone ?? "",
        address: emp.address ?? "",
        joining_date: emp.joining_date ?? "",
        employment_type: emp.employment_type ?? "Full-Time",
        role: emp.role ?? "Other",
        department: emp.department ? String(emp.department.id) : "",
        designation: emp.designation ? String(emp.designation.id) : "",
        salary: emp.salary ?? "",
        is_active: emp.is_active ?? true,
      });

      // load permissions if present
      if (emp.permissions) {
        try {
          const parsed = typeof emp.permissions === "string" ? JSON.parse(emp.permissions) : emp.permissions;
          const mapped: Record<string, PermissionSet> = {};
          MODULES.forEach((m) => {
            mapped[m] = {
              read: !!parsed[m]?.read,
              write: !!parsed[m]?.write,
              create: !!parsed[m]?.create,
              delete: !!parsed[m]?.delete,
              import: !!parsed[m]?.import,
              export: !!parsed[m]?.export,
            };
          });
          setPermissions(mapped);
          setPermissionsSelectAll(MODULES.every((m) => Object.values(mapped[m]).some(Boolean)));
        } catch {
          setPermissions({ ...defaultPermissions });
          setPermissionsSelectAll(false);
        }
      } else {
        setPermissions({ ...defaultPermissions });
        setPermissionsSelectAll(false);
      }

      const el = document.getElementById("add_employee_modal");
      if (el && (window as any).bootstrap) {
        const modal = new (window as any).bootstrap.Modal(el as Element);
        modal.show();
      } else {
        alert("Bootstrap JS not loaded; cannot open modal. Add bootstrap JS import to index.tsx.");
      }
    } catch (err) {
      console.error("openEditModal error:", err);
      alert("Failed to load employee data.");
    }
  };

  // Photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) setPhotoFile(files[0]);
  };

  // Toggle permission
  const handlePermissionToggle = (module: string, key: keyof PermissionSet, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [module]: { ...(prev[module] || { read: false, write: false, create: false, delete: false, import: false, export: false }), [key]: value } }));
  };

  const handleSelectAllPermissions = (value: boolean) => {
    const p: Record<string, PermissionSet> = {};
    MODULES.forEach((m) => (p[m] = { read: value, write: value, create: value, delete: value, import: value, export: value }));
    setPermissions(p);
    setPermissionsSelectAll(value);
  };

  // Submit create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((k) => {
        const v = formData[k];
        if (v !== undefined && v !== null) payload.append(k, String(v));
      });
      if (photoFile) payload.append("photo", photoFile);
      payload.append("permissions", JSON.stringify(permissions));

      if (editingId) {
        await axios.put(`${API_EMP}${editingId}/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Employee updated successfully.");
      } else {
        await axios.post(API_EMP, payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Employee created successfully.");
      }

      await fetchEmployees();

      const el = document.getElementById("add_employee_modal");
      if (el && (window as any).bootstrap) {
        const current = (window as any).bootstrap.Modal.getInstance(el as Element) || new (window as any).bootstrap.Modal(el as Element);
        current.hide();
      }
    } catch (err) {
      console.error("submit error:", err);
      alert("Save failed. See console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV export
  const exportCSV = () => {
    const rows = filtered.map((e) => ({
      id: e.id,
      emp_code: e.emp_code,
      name: `${e.first_name} ${e.last_name ?? ""}`.trim(),
      email: e.email,
      department: e.department?.name ?? "",
      designation: e.designation?.title ?? "",
      joining_date: e.joining_date ?? "",
    }));
    if (!rows.length) return alert("No data to export");
    const csv = [Object.keys(rows[0]).join(","), ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* Header */}
        <div className="page-header d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="page-title">Employees</h2>
            <small className="text-muted">Manage employees, roles and permissions</small>
          </div>

          <div className="d-flex align-items-center">
            <div className="me-3">
              <button className={`btn btn-sm btn-outline-light ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="List view">
                <i className="ti ti-list" />
              </button>
              <button className={`btn btn-sm btn-outline-light ms-2 ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view">
                <i className="ti ti-layout-grid" />
              </button>
            </div>

            <div className="me-2">
              <button className="btn btn-sm btn-outline-light" onClick={exportCSV}><i className="ti ti-download" /> Export</button>
            </div>

            <div>
              <button className="btn btn-primary" onClick={openAddModal}><i className="ti ti-plus" /> Add Employee</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="card p-3">
              <small className="text-muted">Total</small>
              <h4>{totals.total}</h4>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card p-3">
              <small className="text-muted">Active</small>
              <h4>{totals.active}</h4>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card p-3">
              <small className="text-muted">Inactive</small>
              <h4>{totals.inactive}</h4>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card p-3">
              <small className="text-muted">New (30 days)</small>
              <h4>{totals.newHires}</h4>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-3 p-3">
          <div className="row g-2">
            <div className="col-md-4">
              <input className="form-control" placeholder="Search by name, email or ID" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={selectedDesig} onChange={(e) => { setSelectedDesig(e.target.value); setPage(1); }}>
                <option value="">All Designations</option>
                {designations.map((d) => <option key={d.id} value={String(d.id)}>{d.title}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}>
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value as any); setPage(1); }}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Sort: Recent</option>
                <option value="joining_desc">Joining: New → Old</option>
                <option value="joining_asc">Joining: Old → New</option>
              </select>
            </div>
          </div>
        </div>

        {/* List / Grid */}
        {viewMode === "list" ? (
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Designation</th>
                      <th>Joining</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((e) => (
                      <tr key={e.id}>
                        <td>{e.emp_code}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={avatarSrc(e)} alt={e.first_name} style={{ width: 42, height: 42, borderRadius: 8, objectFit: "cover" }} className="me-2" />
                            <div>
                              <div>{smallName(e)}</div>
                              <small className="text-muted">{e.department?.name ?? ""}</small>
                            </div>
                          </div>
                        </td>
                        <td>{e.email}</td>
                        <td>{e.phone}</td>
                        <td>{e.designation?.title ?? "-"}</td>
                        <td>{e.joining_date ?? "-"}</td>
                        <td><span className={`badge ${e.is_active ? "bg-success" : "bg-secondary"}`}>{e.is_active ? "Active" : "Inactive"}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline-light me-1" onClick={() => navigate(`/employee-details?id=${e.id}`)}>View</button>
                          <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEditModal(e.id)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && <tr><td colSpan={8} className="text-center">No employees found</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <button className="btn btn-outline-light btn-sm me-2" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
                  <button className="btn btn-outline-light btn-sm" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount}>Next</button>
                </div>
                <div>Page {page} of {pageCount}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {filtered.map((e) => (
              <div key={e.id} className="col-md-3 mb-3">
                <div className="card h-100 p-3 text-center">
                  <img src={avatarSrc(e)} alt={e.first_name} style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }} />
                  <h5 className="mt-2">{smallName(e)}</h5>
                  <p className="mb-1"><small className="badge bg-light text-dark">{e.designation?.title ?? ""}</small></p>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => openEditModal(e.id)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-12 text-center">No employees</div>}
          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      <div className="modal fade" id="add_employee_modal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content bg-dark text-light">
            <form onSubmit={handleSubmit}>
              <div className="modal-header border-0">
                <h5 className="modal-title">{editingId ? "Edit Employee" : "Add Employee"}</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
              </div>
              <div className="modal-body">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item"><button className="nav-link active" data-bs-toggle="tab" data-bs-target="#basicTab" type="button">Basic Information</button></li>
                  <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#permTab" type="button">Permissions</button></li>
                </ul>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="basicTab">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Profile Photo</label>
                        <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handlePhotoChange} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Employee ID</label>
                        <input className="form-control" value={formData.emp_code || ""} onChange={(e) => setFormData({ ...formData, emp_code: e.target.value })} required />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">First Name</label>
                        <input className="form-control" value={formData.first_name || ""} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Last Name</label>
                        <input className="form-control" value={formData.last_name || ""} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Phone</label>
                        <input className="form-control" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Department</label>
                        <select className="form-select" value={formData.department || ""} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                          <option value="">Select</option>
                          {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Designation</label>
                        <select className="form-select" value={formData.designation || ""} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                          <option value="">Select</option>
                          {designations.map((d) => <option key={d.id} value={String(d.id)}>{d.title}</option>)}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Joining Date</label>
                        <input type="date" className="form-control" value={formData.joining_date || ""} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Salary</label>
                        <input className="form-control" value={formData.salary || ""} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Address</label>
                        <textarea className="form-control" rows={3} value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="tab-pane fade" id="permTab">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <strong>Permissions</strong>
                      <label className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" checked={permissionsSelectAll} onChange={(e) => handleSelectAllPermissions(e.target.checked)} />
                        <span className="ms-2">Select All</span>
                      </label>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-dark table-hover">
                        <thead>
                          <tr>
                            <th>Module</th>
                            <th>Read</th>
                            <th>Write</th>
                            <th>Create</th>
                            <th>Delete</th>
                            <th>Import</th>
                            <th>Export</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MODULES.map((m) => (
                            <tr key={m}>
                              <td>{m}</td>
                              {(["read", "write", "create", "delete", "import", "export"] as (keyof PermissionSet)[]).map((p) => (
                                <td key={p}>
                                  <input type="checkbox" checked={!!permissions[m]?.[p]} onChange={(ev) => handlePermissionToggle(m, p, (ev.target as HTMLInputElement).checked)} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (editingId ? "Update Employee" : "Add Employee")}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeList;
