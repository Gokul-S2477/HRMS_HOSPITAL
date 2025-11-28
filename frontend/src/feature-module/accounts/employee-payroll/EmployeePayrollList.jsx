import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../../api/axios";

const EmployeePayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employee-payroll/");
      setPayrolls(res.data);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Employee Payroll</h3>
        <Link to="/accounts/employee-payroll/create" className="btn btn-primary">
          + Add Payroll
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Month/Year</th>
              <th>Total Salary</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4}>Loading...</td>
              </tr>
            )}
            {!loading && payrolls.length === 0 && (
              <tr>
                <td colSpan={4}>No payrolls found.</td>
              </tr>
            )}
            {!loading &&
              payrolls.map((p) => (
                <tr key={p.id}>
                  <td>{p.employee_name || (p.employee && p.employee.name)}</td>
                  <td>
                    {p.month} / {p.year}
                  </td>
                  <td>{p.total_salary}</td>
                  <td>
                    <Link
                      to={`/accounts/employee-payroll/edit/${p.id}`}
                      className="btn btn-sm btn-warning me-2"
                    >
                      Edit
                    </Link>

                    <Link
                      to={`/accounts/payslips/view/${p.id}`}
                      className="btn btn-sm btn-info"
                    >
                      View Payslip
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeePayrollList;
