import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
};

const API_BASE = "http://localhost:8000";
const API_EMP = `${API_BASE}/api/employees/`;
const API_DEPT = `${API_BASE}/api/departments/`;
const API_DESIG = `${API_BASE}/api/designations/`;

const EmployeeGrid: React.FC = () => {
  const navigate = useNavigate();

  // Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>(""); // id as string
  const [filterDesig, setFilterDesig] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<
    "recent" | "name_asc" | "name_desc" | "joining_asc" | "joining_desc"
  >("recent");

  // selection & pagination
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const [selectAllVisible, setSelectAllVisible] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(12);

  // hover state for polished card hover
  const [hovered, setHovered] = useState<number | null>(null);

  // load meta & employees
  const loadMeta = async () => {
    try {
      const [dRes, desRes] = await Promise.all([axios.get(API_DEPT), axios.get(API_DESIG)]);
      setDepartments(Array.isArray(dRes.data) ? dRes.data : dRes.data.results || []);
      setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data.results || []);
    } catch (err) {
      console.error("meta load error", err);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_EMP);
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setEmployees(data);
    } catch (err) {
      console.error("employees load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers
  const calculateAge = (dob?: string | null) => {
    const d = dob || "";
    if (!d) return "-";
    const birth = new Date(d);
    if (isNaN(birth.getTime())) return "-";
    const diff = Date.now() - birth.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const avatarSrc = (e: Employee) =>
    e.photo ? (e.photo.startsWith("http") ? e.photo : `${API_BASE}${e.photo}`) : "/assets/images/avatar.png";

  // smart filter + search + sort
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
          empcode.startsWith(q) // emp_code -> startsWith behavior
        );
      });
    }

    if (filterDept) {
      list = list.filter((e) => String(e.department?.id ?? "") === filterDept);
    }

    if (filterDesig) {
      list = list.filter((e) => String(e.designation?.id ?? "") === filterDesig);
    }

    if (filterStatus === "active") list = list.filter((e) => e.is_active);
    if (filterStatus === "inactive") list = list.filter((e) => !e.is_active);

    // sorting
    if (sortBy === "name_asc") {
      list.sort((a, b) => (a.first_name ?? "").localeCompare(b.first_name ?? ""));
    } else if (sortBy === "name_desc") {
      list.sort((a, b) => (b.first_name ?? "").localeCompare(a.first_name ?? ""));
    } else if (sortBy === "joining_asc") {
      list.sort((a, b) => new Date(a.joining_date ?? "").getTime() - new Date(b.joining_date ?? "").getTime());
    } else if (sortBy === "joining_desc") {
      list.sort((a, b) => new Date(b.joining_date ?? "").getTime() - new Date(a.joining_date ?? "").getTime());
    } else {
      // recent: fallback - sort by id desc (if created_at not present)
      list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }

    return list;
  }, [employees, search, filterDept, filterDesig, filterStatus, sortBy]);

  // pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    // whenever page size or filters change, reset to page 1
    setPage(1);
  }, [rowsPerPage, search, filterDept, filterDesig, filterStatus, sortBy]);

  // selection handlers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const toggleSelectAllVisible = (val: boolean) => {
    setSelectAllVisible(val);
    if (val) {
      const next: Record<number, boolean> = {};
      paged.forEach((p) => (next[p.id] = true));
      setSelectedIds(next);
    } else {
      // remove only visible page ids
      setSelectedIds((prev) => {
        const next = { ...prev };
        paged.forEach((p) => delete next[p.id]);
        return next;
      });
    }
  };

  const deleteEmployee = async (id: number) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await axios.delete(`${API_EMP}${id}/`);
      await loadEmployees();
      // remove from selection map
      setSelectedIds((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } catch (err) {
      console.error("delete error", err);
      alert("Delete failed.");
    }
  };

  const deleteSelected = async () => {
    const ids = Object.keys(selectedIds).map((k) => Number(k));
    if (!ids.length) return alert("No employees selected.");
    if (!window.confirm(`Delete ${ids.length} selected employees? This cannot be undone.`)) return;

    try {
      for (const id of ids) {
        await axios.delete(`${API_EMP}${id}/`);
      }
      await loadEmployees();
      setSelectedIds({});
      setSelectAllVisible(false);
    } catch (err) {
      console.error("bulk delete error", err);
      alert("Bulk delete failed (see console).");
    }
  };

  const exportCSV = () => {
    const rows = filtered.map((e) => ({
      id: e.id,
      emp_code: e.emp_code,
      name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
      email: e.email ?? "",
      department: e.department?.name ?? "",
      designation: e.designation?.title ?? "",
      joining_date: e.joining_date ?? "",
    }));
    if (!rows.length) return alert("No data to export");

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v ?? "")?.replace(/"/g, '""')}"`)
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

  // polished card styles (inline + dynamic for easy portability)
  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    transition: "transform 220ms cubic-bezier(.2,.9,.2,1), box-shadow 220ms cubic-bezier(.2,.9,.2,1)",
    overflow: "hidden",
    cursor: "pointer",
    background: "#1b1b28", // slight darker - consistent with SmartHR dark card
    border: "1px solid rgba(255,255,255,0.03)",
  };

  const avatarWrapperStyle: React.CSSProperties = {
    width: 96,
    height: 96,
    borderRadius: "50%",
    overflow: "hidden",
    display: "inline-block",
    padding: 3,
    background: "linear-gradient(135deg,#ff9d3d22,#ff8a00)", // soft ring
  };

  const nameStyle: React.CSSProperties = {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: 0.2,
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-block",
    background: "#ffd7f0",
    color: "#000",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 8,
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        {/* Header & Actions */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="page-title">Employee</h2>
            <small className="text-muted">Employee Grid — polished SmartHR look</small>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <input
              className="form-control"
              placeholder="Smart search: name / email / dept / designation / emp code (starts)"
              style={{ width: 360 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select className="form-select" value={filterDesig} onChange={(e) => setFilterDesig(e.target.value)} style={{ width: 180 }}>
              <option value="">All Designations</option>
              {designations.map((d) => (
                <option key={d.id} value={String(d.id)}>{d.title}</option>
              ))}
            </select>

            <select className="form-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ width: 180 }}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>{d.name}</option>
              ))}
            </select>

            <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} style={{ width: 140 }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ width: 160 }}>
              <option value="recent">Sort: Recent</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="joining_desc">Joining: New → Old</option>
              <option value="joining_asc">Joining: Old → New</option>
            </select>

            <select className="form-select" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} style={{ width: 120 }}>
              <option value={8}>8 / page</option>
              <option value={12}>12 / page</option>
              <option value={20}>20 / page</option>
              <option value={40}>40 / page</option>
            </select>

            <button className="btn btn-outline-light" onClick={exportCSV}>Export</button>
            <button className="btn btn-primary" onClick={() => navigate(all_routes.employeeAdd)}>Add Employee</button>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <label className="form-check form-switch d-flex align-items-center gap-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectAllVisible}
                onChange={(e) => toggleSelectAllVisible(e.target.checked)}
              />
              <span className="form-check-label">Select page</span>
            </label>

            <button className="btn btn-danger btn-sm ms-2" onClick={deleteSelected} disabled={Object.keys(selectedIds).length === 0}>
              Delete Selected ({Object.keys(selectedIds).length})
            </button>
          </div>

          <div>
            <small className="text-muted">Showing {filtered.length} results — Page {page} / {pageCount}</small>
          </div>
        </div>

        {/* Grid */}
        <div className="row">
          {paged.map((e) => {
            const selected = !!selectedIds[e.id];
            const isHovered = hovered === e.id;

            return (
              <div key={e.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                <div
                  className="card p-3"
                  style={{
                    ...cardBase,
                    transform: isHovered ? "translateY(-6px) scale(1.02)" : selected ? "scale(0.995)" : undefined,
                    boxShadow: isHovered
                      ? "0 18px 40px rgba(0,0,0,0.55)"
                      : "0 6px 18px rgba(0,0,0,0.35)",
                  }}
                  onMouseEnter={() => setHovered(e.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* top row */}
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(ev) => {
                          ev.stopPropagation();
                          toggleSelect(e.id);
                        }}
                      />
                    </div>

                    <div className="dropdown">
                      <button className="btn btn-sm btn-link text-light p-0" onClick={(ev) => ev.stopPropagation()} title="Actions">
                        <i className="ti ti-dots-vertical" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <button
                          className="dropdown-item"
                          onClick={() => navigate(`${all_routes.employeedetails}?id=${e.id}`)}
                        >
                          View
                        </button>

                        <button className="dropdown-item" onClick={() => navigate(`${all_routes.employeeAdd}?id=${e.id}`)}>
                          Edit
                        </button>

                        <button className="dropdown-item text-danger" onClick={() => deleteEmployee(e.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* clickable area */}
                  <div
                    style={{ cursor: "pointer", paddingTop: 6 }}
                    onClick={() => navigate(`${all_routes.employeedetails}?id=${e.id}`)}
                    className="text-center"
                  >
                    <div style={avatarWrapperStyle}>
                      <img
                        src={avatarSrc(e)}
                        alt={e.first_name}
                        style={{
                          width: 86,
                          height: 86,
                          borderRadius: "50%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>

                    <div style={nameStyle}>
                      {e.first_name} {e.last_name ?? ""}
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <span style={badgeStyle}>
                        {e.designation?.title ?? "No Designation"}
                      </span>
                    </div>

                    <p className="text-muted mt-2 mb-1" style={{ fontSize: 13 }}>
                      {e.department?.name ?? "No Department"}
                    </p>

                    <p className="text-light mb-0" style={{ fontSize: 13 }}>
                      <strong>ID:</strong> {e.emp_code ?? "-"}
                    </p>

                    <p className="text-light mb-1" style={{ fontSize: 13 }}>
                      <strong>Age:</strong> {calculateAge(e.date_of_birth)}
                    </p>

                    <div className="mt-2 d-flex justify-content-center align-items-center gap-2">
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          display: "inline-block",
                          borderRadius: "50%",
                          background: e.is_active ? "#4cd964" : "#ff3b30",
                          boxShadow: isHovered ? (e.is_active ? "0 0 8px #4cd96455" : "0 0 8px #ff3b3055") : undefined,
                        }}
                      />
                      <small className="text-light">{e.is_active ? "Active" : "Inactive"}</small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
