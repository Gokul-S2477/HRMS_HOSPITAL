// frontend/src/feature-module/mainMenu/employeeDashboard/employee-add.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../../api/axios";

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

const MODULES = [
  "Holidays","Leaves","Clients","Projects","Tasks","Chats","Assets","TimingSheets","Payroll","Attendance","Reports"
];

const API_BASE = "http://localhost:8000";
const API_EMP = `${API_BASE}/api/employees/`;
const API_DEPT = `${API_BASE}/api/departments/`;
const API_DESIG = `${API_BASE}/api/designations/`;

const useQuery = () => new URLSearchParams(useLocation().search);

const EmployeeAdd: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const editId = query.get("id");

  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const defaultPermissions: Record<string, PermissionSet> = {};
  MODULES.forEach(m => defaultPermissions[m] = { read:false, write:false, create:false, delete:false, import:false, export:false });

  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>({...defaultPermissions});
  const [permissionsSelectAll, setPermissionsSelectAll] = useState(false);

  const [formData, setFormData] = useState<any>({
    emp_code: "", first_name: "", middle_name: "", last_name: "", email: "", phone: "", address: "",
    joining_date: "", employment_type: "Full-Time", role: "Other", department: "", designation: "", salary: "", is_active: true
  });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [dRes, desRes] = await Promise.all([API.get(API_DEPT), API.get(API_DESIG)]);
        setDepartments(dRes.data || []);
        setDesignations(desRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    if (!editId) return;
    // fetch employee
    (async () => {
      try {
        const res = await API.get(`${API_EMP}${editId}/`);
        const emp = res.data;
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
            setPermissionsSelectAll(MODULES.every(m => Object.values(mapped[m]).some(Boolean)));
          } catch {
            setPermissions({...defaultPermissions});
          }
        }
      } catch (err) {
        console.error("load employee", err);
        alert("Failed to load employee");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPhotoFile(f);
  };

  const togglePermission = (module: string, key: keyof PermissionSet, value: boolean) => {
    setPermissions(prev => ({ ...prev, [module]: { ...(prev[module] || { read:false, write:false, create:false, delete:false, import:false, export:false }), [key]: value } }));
  };

  const handleSelectAll = (val: boolean) => {
    const p: Record<string, PermissionSet> = {};
    MODULES.forEach(m => p[m] = { read:val, write:val, create:val, delete:val, import:val, export:val});
    setPermissions(p);
    setPermissionsSelectAll(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(k => {
        const v = formData[k];
        if (v !== undefined && v !== null) payload.append(k, String(v));
      });
      if (photoFile) payload.append("photo", photoFile);
      payload.append("permissions", JSON.stringify(permissions));

      if (editId) {
        await API.put(`${API_EMP}${editId}/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Updated");
      } else {
        await API.post(API_EMP, payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Created");
      }
      navigate("/employees");
    } catch (err) {
      console.error("submit", err);
      alert("Save failed (see console)");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title">{editId ? "Edit Employee" : "Add Employee"}</h2>
            <small className="text-muted">{editId ? "Update employee details" : "Add new employee details"}</small>
          </div>
          <div>
            <button className="btn btn-secondary me-2" onClick={() => navigate("/employee-list")}>Back</button>
            <button className="btn btn-primary" form="empForm">{isSubmitting ? "Saving..." : (editId ? "Update" : "Create")}</button>
          </div>
        </div>

        <div className="card p-3">
          <form id="empForm" onSubmit={handleSubmit}>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item"><button className="nav-link active" data-bs-toggle="tab" data-bs-target="#basic" type="button">Basic</button></li>
              <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#permissions" type="button">Permissions</button></li>
            </ul>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="basic">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Profile Photo</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handlePhotoChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Employee ID</label>
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
                      {departments.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Designation</label>
                    <select className="form-select" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                      <option value="">Select</option>
                      {designations.map(d => <option key={d.id} value={String(d.id)}>{d.title}</option>)}
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
                    <textarea className="form-control" rows={3} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}/>
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="permissions">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <strong>Permissions</strong>
                  <label className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={permissionsSelectAll} onChange={(e) => handleSelectAll(e.target.checked)} />
                    <span className="ms-2">Select All</span>
                  </label>
                </div>

                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th>Module</th><th>Read</th><th>Write</th><th>Create</th><th>Delete</th><th>Import</th><th>Export</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map(m => (
                        <tr key={m}>
                          <td>{m}</td>
                          {(["read","write","create","delete","import","export"] as (keyof PermissionSet)[]).map(p => (
                            <td key={p}>
                              <input type="checkbox" checked={!!permissions[m]?.[p]} onChange={(ev) => togglePermission(m, p, (ev.target as HTMLInputElement).checked)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default EmployeeAdd;
