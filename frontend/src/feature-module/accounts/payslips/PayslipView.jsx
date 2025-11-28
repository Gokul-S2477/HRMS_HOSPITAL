import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../api/axios";

const PayslipView = () => {
  const { id } = useParams();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPayslip = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/employee-payroll/${id}/`);
      setPayslip(res.data);
    } catch (err) {
      console.error("Failed to load payslip", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadPayslip();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!payslip) return <p>No payslip found.</p>;

  return (
    <div>
      <h3>Payslip - {payslip.employee_name || (payslip.employee && payslip.employee.name)}</h3>

      <p>
        <strong>Month:</strong> {payslip.month} / {payslip.year}
      </p>

      <p>
        <strong>Gross Salary:</strong> {payslip.gross_salary}
      </p>

      <p>
        <strong>Total Deductions:</strong> {payslip.total_deductions}
      </p>

      <p>
        <strong>Net Salary:</strong> {payslip.net_salary}
      </p>

      <h5 className="mt-4">Components</h5>
      <ul>
        {payslip.components && payslip.components.length > 0 ? (
          payslip.components.map((c) => (
            <li key={c.id}>
              {c.name} ({c.component_type}): {c.amount}
            </li>
          ))
        ) : (
          <li>No components</li>
        )}
      </ul>
    </div>
  );
};

export default PayslipView;
