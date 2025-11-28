import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../utils/axiosInstance";

const PayslipView = () => {
  const { id } = useParams();
  const [payslip, setPayslip] = useState(null);

  const loadPayslip = async () => {
    try {
      const res = await axios.get(`/employee-payroll/${id}/`);
      setPayslip(res.data);
    } catch (error) {
      console.error("Error loading payslip:", error);
    }
  };

  useEffect(() => {
    loadPayslip();
  }, []);

  if (!payslip) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        <div className="page-header">
          <h3 className="page-title">Payslip</h3>
        </div>

        <div className="card p-4">

          {/* Header */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h4>Company Name</h4>
              <p>Address Line 1<br />City, State</p>
            </div>
            <div className="col-md-6 text-end">
              <h5>Payslip for {payslip.month} {payslip.year}</h5>
              <p>Payslip No: {payslip.id}</p>
            </div>
          </div>

          <hr />

          {/* Employee Info */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h6>Employee Details</h6>
              <p>
                <b>{payslip.employee_name}</b><br />
                Employee ID: {payslip.employee_id}<br />
                Department: {payslip.department || "N/A"}<br />
                Designation: {payslip.designation || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <h6>Salary Information</h6>
              <p>
                Basic Salary: ₹ {payslip.basic_salary} <br />
                Net Pay: <b>₹ {payslip.total_salary}</b><br />
                Paid On: {payslip.paid_on || "Not Paid"}
              </p>
            </div>
          </div>

          <hr />

          {/* Salary Breakdown */}
          <h5 className="mb-3">Salary Components</h5>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Component</th>
                <th>Type</th>
                <th className="text-end">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* Earnings */}
              {payslip.earnings?.map((e, idx) => (
                <tr key={`earn-${idx}`}>
                  <td>{e.name}</td>
                  <td>Earning</td>
                  <td className="text-end">{e.amount}</td>
                </tr>
              ))}

              {/* Deductions */}
              {payslip.deductions?.map((d, idx) => (
                <tr key={`ded-${idx}`}>
                  <td>{d.name}</td>
                  <td>Deduction</td>
                  <td className="text-end">{d.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          {/* Net Salary */}
          <div className="text-end">
            <h4>Net Salary: ₹ {payslip.total_salary}</h4>
          </div>

          <div className="text-center mt-4">
            <button
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              Print / Download
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PayslipView;
