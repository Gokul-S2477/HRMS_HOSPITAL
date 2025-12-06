/* eslint-disable no-restricted-globals */
/*
  Employee Grid (UPDATED)
  - Uses your project's central API axios instance (keeps auth headers & baseURL)
  - Handles both array and paginated { results: [...] } responses
  - Smart search (name, email, department, designation, emp_code startsWith)
  - Filters (department, designation, status)
  - Pagination
  - Neat SmartHR-like white cards, hover lift, actions placed at bottom
  - No bulk selection / consistent theme
*/

import React, { useEffect, useMemo, useState } from "react";
import API from "../../../api/axios"; // <-- use project axios instance
import all_routes from "../../router/all_routes";
import { useNavigate } from "react-router-dom";

type Dept = { id: number; name: string };
type Desig = { id: number; title: string };

type Employee = {
  id: number;
  emp_code?: string;
  first_name?: string;
  last_name?: string | null;
  email?: string;
  phone?: string | null;
  date_of_birth?: string | null;
  joining_date?: string | null;
  department?: Dept | null;
  designation?: Desig | null;
  is_active?: boolean;
  photo?: string | null;
  created_at?: string | null;
};

const EmployeeGrid: React.FC = () => {
  const navigate = useNavigate();

  // Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("");
  const [filterDesig, setFilterDesig] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<
    "recent" | "name_asc" | "name_desc" | "joining_asc" | "joining_desc"
  >("recent");

  // pagination
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(12);

  // ---------------- load meta & employees ----------------
  const loadMeta = async () => {
    try {
      const [dRes, desRes] = await Promise.all([API.get("/departments/"), API.get("/designations/")]);
      setDepartments(Array.isArray(dRes.data) ? dRes.data : dRes.data.results || []);
      setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data.results || []);
    } catch (err) {
      console.error("meta load error", err);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employees/");
      // support both array and paginated results
      const data = Array.isArray(res.data) ? res.data : res.data?.results ? res.data.results : [];
      setEmployees(data);
    } catch (err) {
      console.error("employees load error", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- helpers ----------------
  const calculateAge = (dob?: string | null) => {
    if (!dob) return "-";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return "-";
    return Math.abs(new Date(Date.now() - d.getTime()).getUTCFullYear() - 1970);
  };

  // use project's baseAPI for photos if relative path is returned (API base is set in API instance)
  const avatarSrc = (e: Employee) =>
    e.photo ? (e.photo.startsWith("http") ? e.photo : `${(API.defaults.baseURL || "").replace(/\/$/, "")}${e.photo}`) : "/assets/images/avatar.png";

  // ---------------- smart filter + search + sort ----------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...employees];

    if (q) {
      list = list.filter((e) => {
        const fullName = `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
        const empcode = (e.emp_code ?? "").toLowerCase();
        const email = (e.email ?? "").toLowerCase();
        const dept = (e.department?.name ?? "").toLowerCase();
        const desig = (e.designation?.title ?? "").toLowerCase();

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          dept.includes(q) ||
          desig.includes(q) ||
          empcode.startsWith(q) // emp_code -> startsWith behaviour
        );
      });
    }

    if (filterDept) list = list.filter((e) => String(e.department?.id ?? "") === filterDept);
    if (filterDesig) list = list.filter((e) => String(e.designation?.id ?? "") === filterDesig);

    if (filterStatus === "active") list = list.filter((e) => e.is_active);
    if (filterStatus === "inactive") list = list.filter((e) => !e.is_active);

    if (sortBy === "name_asc") {
      list.sort((a, b) => (a.first_name ?? "").localeCompare(b.first_name ?? ""));
    } else if (sortBy === "name_desc") {
      list.sort((a, b) => (b.first_name ?? "").localeCompare(a.first_name ?? ""));
    } else if (sortBy === "joining_asc") {
      list.sort((a, b) => new Date(a.joining_date ?? "").getTime() - new Date(b.joining_date ?? "").getTime());
    } else if (sortBy === "joining_desc") {
      list.sort((a, b) => new Date(b.joining_date ?? "").getTime() - new Date(a.joining_date ?? "").getTime());
    } else {
      // recent - fallback by created_at or joining_date
      list.sort((a, b) => {
        const ta = new Date(a.created_at ?? a.joining_date ?? "").getTime() || 0;
        const tb = new Date(b.created_at ?? b.joining_date ?? "").getTime() || 0;
        return tb - ta;
      });
    }

    return list;
  }, [employees, search, filterDept, filterDesig, filterStatus, sortBy]);

  // pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    // when filters/paging change reset to page 1
    setPage(1);
  }, [rowsPerPage, search, filterDept, filterDesig, filterStatus, sortBy]);

  // ---------------- delete ----------------
  const deleteEmployee = async (id: number) => {
    // window.confirm used across project; keep for UX. eslint disabled at top.
    if (!window.confirm("Delete this employee?")) return;
    try {
      await API.delete(`/employees/${id}/`);
      await loadEmployees();
    } catch (err) {
      console.error("delete error", err);
      alert("Delete failed.");
    }
  };

  // ---------------- card style (keeps SmartHR feel) ----------------
  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 6px 20px rgba(28,31,39,0.06)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
    padding: 18,
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const hoverStyle = {
    transform: "translateY(-6px)",
    boxShadow: "0 14px 40px rgba(28,31,39,0.12)",
  } as React.CSSProperties;

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* Header & Controls */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="page-title">Employee</h2>
            <small className="text-muted">Grid view — smart search & filters</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <input
              className="form-control"
              placeholder="Smart search: name / email / dept / designation / emp code (starts)"
              style={{ width: 360 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select className="form-select" style={{ width: 160 }} value={filterDesig} onChange={(e) => setFilterDesig(e.target.value)}>
              <option value="">All Designations</option>
              {designations.map((d) => <option key={d.id} value={String(d.id)}>{d.title}</option>)}
            </select>

            <select className="form-select" style={{ width: 160 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
            </select>

            <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select className="form-select" style={{ width: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="recent">Sort: Recent</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="joining_desc">Joining: New → Old</option>
              <option value="joining_asc">Joining: Old → New</option>
            </select>

            <select className="form-select" style={{ width: 120 }} value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
              <option value={8}>8 / page</option>
              <option value={12}>12 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <button className="btn btn-primary" onClick={() => navigate(all_routes.employeeAdd)}>Add Employee</button>
          </div>
        </div>

        {/* Grid */}
        <div className="row">
          {paged.map((e) => (
            <div key={e.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
              <div
                className="card"
                style={cardBase}
                onMouseEnter={(ev) => Object.assign(ev.currentTarget.style, hoverStyle)}
                onMouseLeave={(ev) => Object.assign(ev.currentTarget.style, cardBase)}
              >
                <div onClick={() => navigate(`${all_routes.employeeDetails}?id=${e.id}`)} style={{ cursor: "pointer" }}>
                  <div className="text-center">
                    <img
                      src={avatarSrc(e)}
                      alt={e.first_name}
                      style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid #ff8a00" }}
                    />
                  </div>

                  <h5 className="mt-3 mb-1 text-center" style={{ color: "#111" }}>
                    {e.first_name} {e.last_name ?? ""}
                  </h5>

                  <div className="text-center">
                    <span className="badge bg-light text-dark px-3 py-2">
                      {e.designation?.title ?? "No Designation"}
                    </span>
                  </div>

                  <p className="text-muted text-center my-2">{e.department?.name ?? "No Department"}</p>

                  <div className="d-flex justify-content-between px-2">
                    <small className="text-muted"><strong>ID:</strong> {e.emp_code ?? "-"}</small>
                    <small className="text-muted"><strong>Age:</strong> {calculateAge(e.date_of_birth)}</small>
                  </div>

                  <div className="text-center mt-2">
                    <small style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: e.is_active ? "#4cd964" : "#ff3b30", display: "inline-block" }} />
                      {e.is_active ? "Active" : "Inactive"}
                    </small>
                  </div>
                </div>

                {/* actions - separate from clickable area */}
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      navigate(`${all_routes.employeeDetails}?id=${e.id}`);
                    }}
                  >
                    View
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      navigate(`${all_routes.employeeAdd}?id=${e.id}`);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      deleteEmployee(e.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {paged.length === 0 && !loading && (
            <div className="col-12 text-center py-5">
              <h5>No employees found</h5>
              <p className="text-muted">Try clearing filters or adding employees.</p>
            </div>
          )}

          {loading && (
            <div className="col-12 text-center py-5">
              <h5>Loading employees...</h5>
            </div>
          )}
        </div>

        {/* pagination controls */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <button className="btn btn-outline-light btn-sm me-2" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Prev
            </button>
            <button className="btn btn-outline-light btn-sm" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount}>
              Next
            </button>
          </div>

          <div>
            Page {page} of {pageCount} • {filtered.length} results
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeGrid;
