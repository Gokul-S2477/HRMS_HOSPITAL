import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

type Dept = { id: number; name: string };
type Desig = { id: number; title: string };
type Employee = {
  id: number;
  emp_code: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  department?: Dept | null;
  designation?: Desig | null;
  joining_date?: string | null;
  salary?: number | null;
  is_active?: boolean;
  photo?: string | null;
};

const API = "http://localhost:8000/api/employees/";

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [designFilter, setDesignFilter] = useState<string>("");
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [designations, setDesignations] = useState<Desig[]>([]);

  const loadEmployees = async () => {
    try {
      const res = await axios.get(API);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error loading employees", err);
    }
  };

  const loadMeta = async () => {
    try {
      const d = await axios.get("http://localhost:8000/api/departments/");
      const g = await axios.get("http://localhost:8000/api/designations/");
      setDepartments(d.data);
      setDesignations(g.data);
    } catch (err) {
      console.warn("Error loading meta", err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadMeta();
  }, []);

  const filtered = employees.filter((e) => {
    const name = `${e.first_name} ${e.middle_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter && e.department?.id.toString() !== deptFilter) return false;
    if (designFilter && e.designation?.id.toString() !== designFilter) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await axios.delete(`${API}${id}/`);
      setEmployees((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed (check console).");
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Employees</h3>
        <div>
          <Link to="/employee-dashboard" className="btn btn-outline-secondary me-2">Dashboard</Link>
          <Link to="/employees-grid" className="btn btn-outline-secondary me-2">Grid</Link>
          <Link to="/employees-details" className="btn btn-primary">Details</Link>
        </div>
      </div>

      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-4">
            <input className="form-control" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={designFilter} onChange={(e) => setDesignFilter(e.target.value)}>
              <option value="">All Designations</option>
              {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="col-md-2 text-end">
            <button className="btn btn-success" onClick={loadEmployees}>Refresh</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Emp Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining</th>
                <th>Salary</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.emp_code}</td>
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department?.name ?? "-"}</td>
                  <td>{emp.designation?.title ?? "-"}</td>
                  <td>{emp.joining_date ?? "-"}</td>
                  <td>{emp.salary ?? "-"}</td>
                  <td>{emp.is_active ? "Yes" : "No"}</td>
                  <td>
                    <Link to={`/employees-details?id=${emp.id}`} className="btn btn-sm btn-outline-primary me-1">View</Link>
                    <Link to={`/employees-details?id=${emp.id}`} className="btn btn-sm btn-outline-secondary me-1">Edit</Link>
                    <button onClick={() => handleDelete(emp.id)} className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
