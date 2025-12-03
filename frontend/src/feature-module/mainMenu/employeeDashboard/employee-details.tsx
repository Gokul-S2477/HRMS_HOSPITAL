// frontend/src/feature-module/mainMenu/employeeDashboard/employee-details.tsx

import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import API from "../../../api/axios";

// Types
type Dept = { id: number; name: string };
type Desig = { id: number; title: string };

type Employee = {
  id: number;
  emp_code: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  alternate_phone?: string | null;
  address?: string | null;
  department?: Dept | null;
  designation?: Desig | null;
  joining_date?: string | null;
  date_of_birth?: string | null;
  role?: string | null;
  salary?: number | null;
  photo?: string | null;
  is_active?: boolean;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EmployeeDetails: React.FC = () => {
  const q = useQuery();
  const id = q.get("id");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const API_EMP = "/employees/"; // Correct & final endpoint

  // Load employee data
  const load = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const res = await API.get(`${API_EMP}${id}/`);
      setEmployee(res.data);
    } catch (err) {
      console.error("Error loading employee details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!id) {
    return (
      <div className="card text-center mt-4">
        <div className="card-body">
          <h5>No employee selected</h5>
          <p>Select an employee from the list.</p>
          <Link to="/employees" className="btn btn-primary">Go Back</Link>
        </div>
      </div>
    );
  }

  const photoUrl =
    employee?.photo
      ? employee.photo.startsWith("http")
        ? employee.photo
        : `http://127.0.0.1:8000${employee.photo}`
      : "/assets/images/avatar.png";

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* Header */}
        <div className="page-header d-flex justify-content-between align-items-center mb-3">
          <h3 className="page-title">Employee Details</h3>

          <div>
            <Link to="/employees" className="btn btn-outline-secondary me-2">
              Back to List
            </Link>

            <Link to={`/employee-details?id=${id}`} className="btn btn-primary">
              Refresh
            </Link>
          </div>
        </div>

        <div className="card p-4">
          {loading || !employee ? (
            <h5>Loading...</h5>
          ) : (
            <div className="row">

              {/* Profile */}
              <div className="col-md-3 text-center">
                <img
                  src={photoUrl}
                  alt={employee.first_name}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 10,
                    objectFit: "cover",
                  }}
                />
                <h4 className="mt-3">
                  {employee.first_name} {employee.last_name ?? ""}
                </h4>
                <p className="text-muted">{employee.emp_code}</p>
                <p><strong>{employee.role ?? "-"}</strong></p>
              </div>

              {/* Details */}
              <div className="col-md-9">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th>Email</th>
                      <td>{employee.email}</td>
                    </tr>

                    <tr>
                      <th>Phone</th>
                      <td>{employee.phone ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Alternate Phone</th>
                      <td>{employee.alternate_phone ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Department</th>
                      <td>{employee.department?.name ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Designation</th>
                      <td>{employee.designation?.title ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Joining Date</th>
                      <td>{employee.joining_date ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Date of Birth</th>
                      <td>{employee.date_of_birth ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Salary</th>
                      <td>{employee.salary ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Address</th>
                      <td>{employee.address ?? "-"}</td>
                    </tr>

                    <tr>
                      <th>Status</th>
                      <td>
                        {employee.is_active ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmployeeDetails;