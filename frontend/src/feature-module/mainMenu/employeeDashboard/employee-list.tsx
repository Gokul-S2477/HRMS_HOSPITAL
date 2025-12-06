// frontend/src/feature-module/mainMenu/employeeDashboard/employee-list.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import all_routes from "../../router/all_routes"; // ⭐ ADDED

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

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedDesig, setSelectedDesig] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const fetchMeta = async () => {
    try {
      const [dRes, desRes] = await Promise.all([API.get(API_DEPT), API.get(API_DESIG)]);
      setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
      setDesignations(Array.isArray(desRes.data) ? desRes.data : []);
    } catch (err) {
      console.error("fetchMeta error:", err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_EMP);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results
        ? res.data.results
        : [];

      setEmployees(data);
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

  const totals = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.is_active).length;
    const inactive = total - active;

    const newHires = employees.filter((e) => {
      if (!e.joining_date) return false;
      const diff = (new Date().getTime() - new Date(e.joining_date).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    }).length;

    return { total, active, inactive, newHires };
  }, [employees]);

  const filtered = useMemo(() => {
    let list = [...employees];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        const name = `${e.first_name} ${e.last_name ?? ""}`.toLowerCase();
        return (
          name.includes(q) ||
          (e.email ?? "").toLowerCase().includes(q) ||
          (e.emp_code ?? "").toLowerCase().includes(q)
        );
      });
    }

    if (selectedDept)
      list = list.filter((e) => String(e.department?.id ?? "") === selectedDept);

    if (selectedDesig)
      list = list.filter((e) => String(e.designation?.id ?? "") === selectedDesig);

    if (selectedStatus === "active") list = list.filter((e) => e.is_active);
    if (selectedStatus === "inactive") list = list.filter((e) => !e.is_active);

    if (sortBy === "joining_desc")
      list.sort((a, b) => new Date(b.joining_date ?? "").getTime() - new Date(a.joining_date ?? "").getTime());

    if (sortBy === "joining_asc")
      list.sort((a, b) => new Date(a.joining_date ?? "").getTime() - new Date(b.joining_date ?? "").getTime());

    if (sortBy === "recent")
      list.sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime());

    return list;
  }, [employees, search, selectedDept, selectedDesig, selectedStatus, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const avatarSrc = (e: Employee) =>
    e.photo
      ? e.photo.startsWith("http")
        ? e.photo
        : `${API_BASE}${e.photo}`
      : "/assets/images/avatar.png";

  const smallName = (e: Employee) => `${e.first_name} ${e.last_name ?? ""}`;

  // ⭐ UPDATED PATHS ONLY
  const goToAddPage = () => navigate(all_routes.employeeAdd);

  const goToEditPage = (id: number) =>
    navigate(`${all_routes.employeeAdd}?id=${id}`);

  const goToDetailsPage = (id: number) =>
    navigate(`${all_routes.employeeDetails}?id=${id}`); // FIXED HERE ✔

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await API.delete(`${API_EMP}${id}/`);
      await fetchEmployees();
    } catch (err) {
      console.error("delete error:", err);
      alert("Delete failed (see console).");
    }
  };

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

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

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
            <small className="text-muted">
              Manage employees, roles and permissions
            </small>
          </div>

          <div className="d-flex align-items-center">
            <div className="me-3">
              <button
                className={`btn btn-sm btn-outline-light ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <i className="ti ti-list" />
              </button>
              <button
                className={`btn btn-sm btn-outline-light ms-2 ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <i className="ti ti-layout-grid" />
              </button>
            </div>

            <div className="me-2">
              <button className="btn btn-sm btn-outline-light" onClick={exportCSV}>
                <i className="ti ti-download" /> Export
              </button>
            </div>

            <button className="btn btn-primary" onClick={goToAddPage}>
              <i className="ti ti-plus" /> Add Employee
            </button>
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
              <input
                className="form-control"
                placeholder="Search by name, email or ID"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={selectedDesig}
                onChange={(e) => {
                  setSelectedDesig(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Designations</option>
                {designations.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as any);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Sort: Recent</option>
                <option value="joining_desc">Joining: New → Old</option>
                <option value="joining_asc">Joining: Old → New</option>
              </select>
            </div>
          </div>
        </div>

        {/* List/Grid */}
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
                            <img
                              src={avatarSrc(e)}
                              alt={e.first_name}
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 8,
                                objectFit: "cover",
                              }}
                              className="me-2"
                            />

                            <div>
                              <div>{smallName(e)}</div>
                              <small className="text-muted">
                                {e.department?.name ?? ""}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>{e.email}</td>
                        <td>{e.phone}</td>
                        <td>{e.designation?.title ?? "-"}</td>
                        <td>{e.joining_date ?? "-"}</td>

                        <td>
                          <span
                            className={`badge ${
                              e.is_active ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {e.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn btn-sm btn-outline-light me-1"
                            onClick={() => goToDetailsPage(e.id)}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => goToEditPage(e.id)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(e.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center">
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between alignItems-center mt-3">
                <div>
                  <button
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>

                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setPage(Math.min(pageCount, page + 1))}
                    disabled={page === pageCount}
                  >
                    Next
                  </button>
                </div>

                <div>
                  Page {page} of {pageCount}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {filtered.map((e) => (
              <div key={e.id} className="col-md-3 mb-3">
                <div className="card h-100 p-3 text-center">
                  <img
                    src={avatarSrc(e)}
                    alt={e.first_name}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />

                  <h5 className="mt-2">{smallName(e)}</h5>

                  <p className="mb-1">
                    <small className="badge bg-light text-dark">
                      {e.designation?.title ?? ""}
                    </small>
                  </p>

                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => goToEditPage(e.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-12 text-center">No employees</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
