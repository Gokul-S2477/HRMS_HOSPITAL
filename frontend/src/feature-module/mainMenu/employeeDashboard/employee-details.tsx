import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";

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
  alternate_phone?: string;
  address?: string;
  department?: Dept | null;
  designation?: Desig | null;
  joining_date?: string | null;
  date_of_birth?: string | null;
  role?: string;
  salary?: number | null;
  photo?: string | null;
  is_active?: boolean;
};

const API = "http://localhost:8000/api/employees/";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EmployeeDetails: React.FC = () => {
  const q = useQuery();
  const id = q.get("id");
  const [employee, setEmployee] = useState<Employee | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${API}${id}/`);
      setEmployee(res.data);
    } catch (err) {
      console.error("Error loading employee details", err);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (!id) {
    return (
      <div className="card text-center">
        <div className="card-body">
          <h5>No employee selected</h5>
          <p>Select from the list or grid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Employee Details</h3>
        <div>
          <Link to="/employees-list" className="btn btn-outline-secondary me-2">Back to List</Link>
          <Link to={`/employees-details?id=${id}`} className="btn btn-primary">Refresh</Link>
        </div>
      </div>

      <div className="card-body">
        {!employee ? (
          <div>Loading...</div>
        ) : (
          <div className="row">
            <div className="col-md-3 text-center">
              <img
                src={employee.photo ?? "/assets/images/avatar.png"}
                alt={employee.first_name}
                style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 8 }}
              />
              <h4 className="mt-2">{employee.first_name} {employee.last_name}</h4>
              <p className="text-muted">{employee.emp_code}</p>
              <p><strong>{employee.role}</strong></p>
            </div>

            <div className="col-md-9">
              <table className="table table-borderless">
                <tbody>
                  <tr><th>Email</th><td>{employee.email}</td></tr>
                  <tr><th>Phone</th><td>{employee.phone ?? "-"}</td></tr>
                  <tr><th>Alternate</th><td>{employee.alternate_phone ?? "-"}</td></tr>
                  <tr><th>Department</th><td>{employee.department?.name ?? "-"}</td></tr>
                  <tr><th>Designation</th><td>{employee.designation?.title ?? "-"}</td></tr>
                  <tr><th>Joining Date</th><td>{employee.joining_date ?? "-"}</td></tr>
                  <tr><th>Date of Birth</th><td>{employee.date_of_birth ?? "-"}</td></tr>
                  <tr><th>Salary</th><td>{employee.salary ?? "-"}</td></tr>
                  <tr><th>Address</th><td>{employee.address ?? "-"}</td></tr>
                  <tr><th>Status</th><td>{employee.is_active ? "Active" : "Inactive"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
