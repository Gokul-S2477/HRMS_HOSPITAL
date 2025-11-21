import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* -------------------------
   Types & Constants
   ------------------------- */
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
  alternate_phone?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
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

const API_EMP = "http://localhost:8000/api/employees/";
const API_DEPT = "http://localhost:8000/api/departments/";
const API_DESIG = "http://localhost:8000/api/designations/";

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

/* -------------------------
   Component
   ------------------------- */
const EmployeeList: React.FC = () => {
  const navigate = useNavigate();

  // MAIN DATA
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);

  // UI States
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedDesig, setSelectedDesig] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Modal States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const defaultForm = {
    emp_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    joining_date: "",
    salary: "",
    employment_type: "Full-Time",
    address: "",
  };

  const [formData, setFormData] = useState<Record<string, any>>(defaultForm);

  // default permissions typed as Record<string, PermissionSet>
  const defaultPermissions: Record<string, PermissionSet> = {};
  MODULES.forEach((m) => {
    defaultPermissions[m] = {
      read: false,
      write: false,
      create: false,
      delete: false,
      import: false,
      export: false,
    };
  });

  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>(defaultPermissions);
  const [permissionsSelectAll, setPermissionsSelectAll] = useState<boolean>(false);

  /* -------------------------
     Fetch functions
     ------------------------- */
  const fetchEmployees = async () => {
    try {
      const res = await axios.get<Employee[]>(API_EMP);
      setEmployees(res.data || []);
    } catch (err) {
      console.error("fetchEmployees error:", err);
    }
  };

  const fetchMeta = async () => {
    try {
      const [dRes, desRes] = await Promise.all([axios.get<Dept[]>(API_DEPT), axios.get<Desig[]>(API_DESIG)]);
      setDepartments(dRes.data || []);
      setDesignations(desRes.data || []);
    } catch (err) {
      console.error("fetchMeta error:", err);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchEmployees();
  }, []);

  /* -------------------------
     Filtering & Pagination
     ------------------------- */
  const filtered = useMemo(() => {
    let list = [...employees];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        const first = (e.first_name || "").toString().toLowerCase();
        const last = (e.last_name || "").toString().toLowerCase();
        const email = (e.email || "").toString().toLowerCase();
        const code = (e.emp_code || "").toString().toLowerCase();
        return first.includes(q) || last.includes(q) || email.includes(q) || code.includes(q);
      });
    }

    if (selectedDept) list = list.filter((e) => (e.department?.id ?? "").toString() === selectedDept);
    if (selectedDesig) list = list.filter((e) => (e.designation?.id ?? "").toString() === selectedDesig);
    if (selectedStatus === "active") list = list.filter((e) => e.is_active === true);
    if (selectedStatus === "inactive") list = list.filter((e) => e.is_active === false);

    if (sortBy === "joining_desc")
      list.sort((a, b) => (new Date(b.joining_date || "").getTime() || 0) - (new Date(a.joining_date || "").getTime() || 0));
    if (sortBy === "joining_asc")
      list.sort((a, b) => (new Date(a.joining_date || "").getTime() || 0) - (new Date(b.joining_date || "").getTime() || 0));

    return list;
  }, [employees, search, selectedDept, selectedDesig, selectedStatus, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /* -------------------------
     Helpers & Actions
     ------------------------- */
  const smallName = (e: Employee) => `${e.first_name ?? ""} ${e.last_name ?? ""}`;
  const avatarSrc = (e: Employee) => (e.photo ? (e.photo.startsWith("http") ? e.photo : `http://localhost:8000${e.photo}`) : "/assets/images/avatar.png");

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete employee?")) return;
    try {
      await axios.delete(`${API_EMP}${id}/`);
      await fetchEmployees();
    } catch (err) {
      console.error("delete error:", err);
      alert("Delete failed. See console.");
    }
  };

  /* -------------------------
     Modal: open/close + edit
     ------------------------- */
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...defaultForm });
    setPermissions({ ...defaultPermissions });
    setPermissionsSelectAll(false);
    setPhotoFile(null);

    const el = document.getElementById("add_employee_modal");
    if (el && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(el as Element);
      modal.show();
    }
  };

  const openEditModal = async (id: number) => {
    try {
      const res = await axios.get<Employee>(`${API_EMP}${id}/`);
      const emp = res.data;
      setEditingId(emp.id);
      setFormData({
        emp_code: emp.emp_code ?? "",
        first_name: emp.first_name ?? "",
        last_name: emp.last_name ?? "",
        email: emp.email ?? "",
        phone: emp.phone ?? "",
        department: emp.department ? String(emp.department.id) : "",
        designation: emp.designation ? String(emp.designation.id) : "",
        joining_date: emp.joining_date ?? "",
        salary: emp.salary ?? "",
        employment_type: emp.employment_type ?? "Full-Time",
        address: emp.address ?? "",
      });

      // try to parse permissions
      if (emp.permissions) {
        try {
          const perms = typeof emp.permissions === "string" ? JSON.parse(emp.permissions) : emp.permissions;
          // ensure typing
          const mapped: Record<string, PermissionSet> = { ...defaultPermissions };
          MODULES.forEach((m) => {
            mapped[m] = {
              read: !!perms[m]?.read,
              write: !!perms[m]?.write,
              create: !!perms[m]?.create,
              delete: !!perms[m]?.delete,
              import: !!perms[m]?.import,
              export: !!perms[m]?.export,
            };
          });
          setPermissions(mapped);
          const allOn = MODULES.every((m) => {
            const s = mapped[m];
            return s.read || s.write || s.create || s.delete || s.import || s.export;
          });
          setPermissionsSelectAll(allOn);
        } catch {
          setPermissions({ ...defaultPermissions });
          setPermissionsSelectAll(false);
        }
      } else {
        setPermissions({ ...defaultPermissions });
        setPermissionsSelectAll(false);
      }

      // open modal
      const el = document.getElementById("add_employee_modal");
      if (el && (window as any).bootstrap) {
        const modal = new (window as any).bootstrap.Modal(el as Element);
        modal.show();
      }
    } catch (err) {
      console.error("openEditModal error:", err);
      alert("Failed to load employee data.");
    }
  };

  /* -------------------------
     Form submit
     ------------------------- */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((f) => {
        const val = (formData as Record<string, any>)[f];
        // append as string (FormData requires string|Blob)
        if (val !== undefined && val !== null) payload.append(f, String(val));
      });

      payload.append("permissions", JSON.stringify(permissions));
      if (photoFile) payload.append("photo", photoFile);

      if (editingId) {
        await axios.put(`${API_EMP}${editingId}/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Employee updated");
      } else {
        await axios.post(API_EMP, payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Employee created");
      }

      await fetchEmployees();

      const el = document.getElementById("add_employee_modal");
      if (el && (window as any).bootstrap) {
        const modalInstance = (window as any).bootstrap.Modal.getInstance(el as Element) as any;
        if (modalInstance) modalInstance.hide();
      }
    } catch (err) {
      console.error("handleSubmit error:", err);
      alert("Save failed. See console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------
     Permissions helpers
     ------------------------- */
  const togglePermission = (module: string, key: keyof PermissionSet) => {
    setPermissions((prev) => {
      const prevSet = prev[module] ?? { read: false, write: false, create: false, delete: false, import: false, export: false };
      return { ...prev, [module]: { ...prevSet, [key]: !prevSet[key] } };
    });
  };

  const toggleSelectAll = () => {
    const newVal = !permissionsSelectAll;
    setPermissionsSelectAll(newVal);
    const updated: Record<string, PermissionSet> = {};
    MODULES.forEach((m) => {
      updated[m] = { read: newVal, write: newVal, create: newVal, delete: newVal, import: newVal, export: newVal };
    });
    setPermissions(updated);
  };

  /* -------------------------
     Rendering
     ------------------------- */
  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="page-title">Employee List</h3>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="ti ti-plus" /> Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="card p-3">
          <div className="row g-2">
            <div className="col-md-3">
              <input className="form-control" placeholder="Search employee..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>

            <div className="col-md-3">
              <select className="form-select" value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}>
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={String(d.id)}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select className="form-select" value={selectedDesig} onChange={(e) => { setSelectedDesig(e.target.value); setPage(1); }}>
                <option value="">All Designations</option>
                {designations.map((d) => (
                  <option key={d.id} value={String(d.id)}>{d.title}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select className="form-select" value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value as any); setPage(1); }}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card mt-3">
          <div className="card-body">
            <table className="table table-dark table-hover">
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
                        <img src={avatarSrc(e)} alt={e.first_name} style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover" }} className="me-2" />
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
                    <td>
                      <span className={`badge ${e.is_active ? "bg-success" : "bg-secondary"}`}>{e.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEditModal(e.id)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && <tr><td colSpan={8} className="text-center">No employees</td></tr>}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-outline-light btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span>Page {page} of {pageCount}</span>
              <button className="btn btn-outline-light btn-sm" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <div className="modal fade" id="add_employee_modal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content bg-dark text-light">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? "Edit Employee" : "Add Employee"}</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
              </div>

              <div className="modal-body">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#basicTab" type="button">Basic Info</button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#permTab" type="button">Permissions</button>
                  </li>
                </ul>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="basicTab">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Profile Photo</label>
                        <input type="file" className="form-control" onChange={(e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files && files[0]) setPhotoFile(files[0]);
                        }} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Emp Code</label>
                        <input className="form-control" value={formData.emp_code} onChange={(e) => setFormData({ ...formData, emp_code: e.target.value })} required />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">First Name</label>
                        <input className="form-control" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Last Name</label>
                        <input className="form-control" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Phone</label>
                        <input className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Department</label>
                        <select className="form-select" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                          <option value="">Select</option>
                          {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Designation</label>
                        <select className="form-select" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                          <option value="">Select</option>
                          {designations.map((d) => <option key={d.id} value={String(d.id)}>{d.title}</option>)}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Joining Date</label>
                        <input type="date" className="form-control" value={formData.joining_date} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Salary</label>
                        <input className="form-control" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Address</label>
                        <textarea className="form-control" rows={3} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="tab-pane fade" id="permTab">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Permissions</h5>
                      <label className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" checked={permissionsSelectAll} onChange={toggleSelectAll} />
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
                                  <input type="checkbox" checked={!!permissions[m]?.[p]} onChange={() => togglePermission(m, p)} />
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

              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
