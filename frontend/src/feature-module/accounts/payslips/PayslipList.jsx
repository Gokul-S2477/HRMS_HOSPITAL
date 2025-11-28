import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../../api/axios";

const PayslipList = () => {
  const [payslips, setPayslips] = useState([]);

  // Load Payslips
  const loadPayslips = async () => {
    try {
      const res = await API.get("/employee-payroll/");
      setPayslips(res.data);
    } catch (error) {
      console.error("Error loading payslips:", error);
    }
  };

  const deletePayslip = async (id) => {
    if (!window.confirm("Delete this payslip?")) return;

    try {
      await API.delete(`/employee-payroll/${id}/`);
      loadPayslips();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        <div className="page-header">
          <h3 className="page-title">Payslip List</h3>
        </div>

        <div className="card">
          <div className="card-body">
            <table className="table table-hover table-center">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Total Salary</th>
                  <th>Paid On</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p) => (
                  <tr key={p.id}>
                    <td>{p.employee_name || "N/A"}</td>
                    <td>{p.month}</td>
                    <td>{p.year}</td>
                    <td>₹ {p.total_salary}</td>
                    <td>{p.paid_on || "Not Paid"}</td>

                    <td className="text-end">
                      <Link
                        to={`/accounts/payslips/view/${p.id}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => deletePayslip(p.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {payslips.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No payslips found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PayslipList;
