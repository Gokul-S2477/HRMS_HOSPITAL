// frontend/src/feature-module/mainMenu/employeeDashboard/employee-add.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../../api/axios";

type Dept = { id: number; name: string };
type Desig = { id: number; title: string };
type EmpSmall = { id: number; first_name: string; last_name?: string; emp_code?: string };

type PermissionSet = {
  read: boolean;
  write: boolean;
  create: boolean;
  delete: boolean;
  import: boolean;
  export: boolean;
};

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

const useQuery = () => new URLSearchParams(useLocation().search);

const EmployeeAdd: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const editId = query.get("id");

  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);
  const [reportingOptions, setReportingOptions] = useState<EmpSmall[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Permissions defaults
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

  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>({
    ...defaultPermissions,
  });

  const [permissionsSelectAll, setPermissionsSelectAll] = useState(false);

  // Correct form state
  const [formData, setFormData] = useState<any>({
    emp_code: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    address: "",
    joining_date: "",
    employment_type: "Full-Time",
    role: "Other",

    department_id: "",
    designation_id: "",

    salary: "",
    is_active: true,
    gender: "",
    date_of_birth: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    reporting_to: "",
    national_id: "",
    blood_group: "",
    marital_status: "Single",
    work_shift: "",
    work_location: "",
  });

  // Fetch dropdowns
  useEffect(() => {
    const load = async () => {
      try {
        const [deptRes, desigRes, empRes] = await Promise.all([
          API.get("departments/"),
          API.get("designations/"),
          API.get("employees/"),
        ]);

        setDepartments(deptRes.data || []);
        setDesignations(desigRes.data || []);

        const empList = Array.isArray(empRes.data)
          ? empRes.data
          : empRes.data.results || [];

        setReportingOptions(
          empList.map((e: any) => ({
            id: e.id,
            first_name: e.first_name,
            last_name: e.last_name,
            emp_code: e.emp_code,
          }))
        );
      } catch (err) {
        console.error("Meta Load Error:", err);
      }
    };
    load();
  }, []);

  // Load employee for editing
  useEffect(() => {
    if (!editId) return;

    (async () => {
      try {
        const res = await API.get(`employees/${editId}/`);
        const emp = res.data;

        setFormData({
          emp_code: emp.emp_code ?? "",
          first_name: emp.first_name ?? "",
          middle_name: emp.middle_name ?? "",
          last_name: emp.last_name ?? "",
          email: emp.email ?? "",
          phone: emp.phone ?? "",
          alternate_phone: emp.alternate_phone ?? "",
          address: emp.address ?? "",
          joining_date: emp.joining_date ?? "",
          employment_type: emp.employment_type ?? "Full-Time",
          role: emp.role ?? "Other",

          department_id: emp.department ? String(emp.department.id) : "",
          designation_id: emp.designation ? String(emp.designation.id) : "",

          salary: emp.salary ?? "",
          is_active: emp.is_active ?? true,
          gender: emp.gender ?? "",
          date_of_birth: emp.date_of_birth ?? "",
          emergency_contact_name: emp.emergency_contact_name ?? "",
          emergency_contact_number: emp.emergency_contact_number ?? "",
          reporting_to: emp.reporting_to ? String(emp.reporting_to) : "",
          national_id: emp.national_id ?? "",
          blood_group: emp.blood_group ?? "",
          marital_status: emp.marital_status ?? "Single",
          work_shift: emp.work_shift ?? "",
          work_location: emp.work_location ?? "",
        });

        // Permissions load
        if (emp.permissions) {
          try {
            const parsed =
              typeof emp.permissions === "string"
                ? JSON.parse(emp.permissions)
                : emp.permissions;

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
            setPermissionsSelectAll(
              MODULES.every((m) => Object.values(mapped[m]).some((v) => v))
            );
          } catch {
            setPermissions({ ...defaultPermissions });
          }
        }
      } catch (err) {
        console.error("Employee Load Error:", err);
      }
    })();
  }, [editId]);

  // Photo handler
  const handlePhotoChange = (e: any) => {
    const f = e.target.files?.[0];
    if (f) setPhotoFile(f);
  };

  // Toggle permission
  const togglePermission = (
    module: string,
    key: keyof PermissionSet,
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [key]: value },
    }));
  };

  // Select all permissions
  const handleSelectAll = (value: boolean) => {
    const all: Record<string, PermissionSet> = {};
    MODULES.forEach((m) => {
      all[m] = {
        read: value,
        write: value,
        create: value,
        delete: value,
        import: value,
        export: value,
      };
    });

    setPermissions(all);
    setPermissionsSelectAll(value);
  };

  // Prevent empty FKs in FormData
  const cleanFormValue = (key: string, value: any) => {
    if (value === "" || value === null || value === undefined) {
      if (["department_id", "designation_id", "reporting_to"].includes(key)) {
        return null;
      }
    }
    return value;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        const cleaned = cleanFormValue(key, formData[key]);
        if (cleaned !== null) {
          payload.append(key, String(cleaned));
        }
      });

      if (photoFile) payload.append("photo", photoFile);

      payload.append("permissions", JSON.stringify(permissions));

      if (editId) {
        await API.put(`employees/${editId}/`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee updated!");
      } else {
        await API.post("employees/", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee created!");
      }

      navigate("/employee-list");
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error saving employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* Header */}
        <div className="page-header mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title">
              {editId ? "Edit Employee" : "Add Employee"}
            </h2>
            <small className="text-muted">
              {editId ? "Update employee details" : "Create a new employee"}
            </small>
          </div>

          <div>
            <button
              className="btn btn-secondary me-2"
              onClick={() => navigate("/employee-list")}
            >
              Back
            </button>

            <button className="btn btn-primary" form="empForm">
              {isSubmitting ? "Saving..." : editId ? "Update" : "Create"}
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="card p-3">
          <form id="empForm" onSubmit={handleSubmit}>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className="nav-link active"
                  data-bs-toggle="tab"
                  type="button"
                  data-bs-target="#basic"
                >
                  Basic
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  data-bs-toggle="tab"
                  type="button"
                  data-bs-target="#permissions"
                >
                  Permissions
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {/* BASIC */}
              <div className="tab-pane fade show active" id="basic">
                <div className="row g-3">

                  <div className="col-md-3">
                    <label className="form-label">Profile Photo</label>
                    <input type="file" className="form-control" onChange={handlePhotoChange} />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Employee ID</label>
                    <input
                      className="form-control"
                      value={formData.emp_code}
                      onChange={(e) =>
                        setFormData({ ...formData, emp_code: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">First Name</label>
                    <input
                      className="form-control"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-control"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                    />
                  </div>

                  {/* Contact */}
                  <div className="col-md-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Alternate Phone</label>
                    <input
                      className="form-control"
                      value={formData.alternate_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alternate_phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Gender */}
                  <div className="col-md-3">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* DOB */}
                  <div className="col-md-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Department */}
                  <div className="col-md-3">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={formData.department_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {departments.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="col-md-3">
                    <label className="form-label">Designation</label>
                    <select
                      className="form-select"
                      value={formData.designation_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {designations.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role */}
                  <div className="col-md-3">
                    <label className="form-label">Role</label>
                    <input
                      className="form-control"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    />
                  </div>

                  {/* Reporting To */}
                  <div className="col-md-3">
                    <label className="form-label">Reporting To</label>
                    <select
                      className="form-select"
                      value={formData.reporting_to}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reporting_to: e.target.value,
                        })
                      }
                    >
                      <option value="">None</option>
                      {reportingOptions.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {`${r.first_name} ${r.last_name ?? ""} ${
                            r.emp_code ? `(${r.emp_code})` : ""
                          }`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Joining */}
                  <div className="col-md-3">
                    <label className="form-label">Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.joining_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          joining_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Employment Type */}
                  <div className="col-md-3">
                    <label className="form-label">Employment Type</label>
                    <select
                      className="form-select"
                      value={formData.employment_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employment_type: e.target.value,
                        })
                      }
                    >
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                      <option>Contract</option>
                      <option>Intern</option>
                    </select>
                  </div>

                  {/* Salary */}
                  <div className="col-md-3">
                    <label className="form-label">Salary</label>
                    <input
                      className="form-control"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                    />
                  </div>

                  {/* National ID */}
                  <div className="col-md-3">
                    <label className="form-label">National ID</label>
                    <input
                      className="form-control"
                      value={formData.national_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          national_id: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Blood Group */}
                  <div className="col-md-3">
                    <label className="form-label">Blood Group</label>
                    <input
                      className="form-control"
                      value={formData.blood_group}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blood_group: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Marital Status */}
                  <div className="col-md-3">
                    <label className="form-label">Marital Status</label>
                    <select
                      className="form-select"
                      value={formData.marital_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marital_status: e.target.value,
                        })
                      }
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  {/* Work Shift */}
                  <div className="col-md-3">
                    <label className="form-label">Work Shift</label>
                    <input
                      className="form-control"
                      value={formData.work_shift}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          work_shift: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Work Location */}
                  <div className="col-md-3">
                    <label className="form-label">Work Location</label>
                    <input
                      className="form-control"
                      value={formData.work_location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          work_location: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Address */}
                  <div className="col-md-12">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  {/* Emergency */}
                  <div className="col-md-4">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      className="form-control"
                      value={formData.emergency_contact_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact_name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Emergency Contact Number</label>
                    <input
                      className="form-control"
                      value={formData.emergency_contact_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact_number: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* PERMISSIONS */}
              <div className="tab-pane fade" id="permissions">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <strong>Permissions</strong>

                  <label className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={permissionsSelectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
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

                          {(
                            ["read", "write", "create", "delete", "import", "export"] as (keyof PermissionSet)[]
                          ).map((perm) => (
                            <td key={perm}>
                              <input
                                type="checkbox"
                                checked={permissions[m][perm]}
                                onChange={(e) =>
                                  togglePermission(m, perm, e.target.checked)
                                }
                              />
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
