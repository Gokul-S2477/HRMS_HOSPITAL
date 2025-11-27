import React, { useEffect, useState } from "react";
import { getPayrolls, recalculatePayroll } from "./payrollApi";
import { Link } from "react-router-dom";

const PayrollList = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load payroll list
    const loadPayrolls = async () => {
        setLoading(true);
        try {
            const res = await getPayrolls();
            setPayrolls(res.data);
        } catch (error) {
            console.error("Error loading payroll list:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPayrolls();
    }, []);

    // Recalculate payroll
    const handleRecalculate = async (id) => {
        try {
            await recalculatePayroll(id);
            loadPayrolls();
        } catch (error) {
            console.error("Recalculate failed:", error);
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">Payroll List</h4>

                <Link to="/main/payroll/add" className="btn btn-primary">
                    + Add Payroll
                </Link>
            </div>

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Employee</th>
                                        <th>Month</th>
                                        <th>Basic</th>
                                        <th>HRA</th>
                                        <th>Gross</th>
                                        <th>Deductions</th>
                                        <th>Net Salary</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center">
                                                No payroll records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        payrolls.map((p, index) => (
                                            <tr key={p.id}>
                                                <td>{index + 1}</td>
                                                <td>{p.employee_name}</td>
                                                <td>
                                                    {p.month}/{p.year}
                                                </td>
                                                <td>₹{p.basic_salary}</td>
                                                <td>₹{p.hra}</td>
                                                <td>₹{p.gross_salary}</td>
                                                <td>₹{p.total_deductions}</td>
                                                <td>
                                                    <strong className="text-success">
                                                        ₹{p.net_salary}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <Link
                                                        to={`/main/payroll/view/${p.id}`}
                                                        className="btn btn-sm btn-info me-2"
                                                    >
                                                        View
                                                    </Link>

                                                    <button
                                                        onClick={() => handleRecalculate(p.id)}
                                                        className="btn btn-sm btn-warning"
                                                    >
                                                        Recalculate
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayrollList;
