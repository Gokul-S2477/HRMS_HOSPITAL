import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../utils/axiosInstance"; // your axios wrapper

const EmployeePayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get("/employee-payroll/");
      setPayrolls(res.data);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    }
  };

  const deletePayroll = async (id) => {
    if (!window.confirm("Delete this payroll?")) return;

    try {
      await axios.delete(`/employee-payroll/${id}/`);
      fetchPayrolls();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Employee Payroll</h3>
            </div>
            <div className="col-auto">
              <Link
                className="btn btn-primary"
                to="/accounts/employee-payroll/create"
              >
                <i className="fa fa-plus"></i> Add Payroll
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">

            <div className="table-responsive">
              <table className="table table-hover table-center">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Total Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No payroll records found.
                      </td>
                    </tr>
                  ) : (
                    payrolls.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.employee_name}</td>
                        <td>{p.month}</td>
                        <td>{p.year}</td>
                        <td>{p.total_salary}</td>
                        <td>
                          <Link
                            className="btn btn-sm btn-info me-2"
                            to={`/accounts/payslips/view/${p.id}`}
                          >
                            View
                          </Link>

                          <Link
                            className="btn btn-sm btn-warning me-2"
                            to={`/accounts/employee-payroll/edit/${p.id}`}
                          >
                            Edit
                          </Link>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deletePayroll(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeePayrollList;
