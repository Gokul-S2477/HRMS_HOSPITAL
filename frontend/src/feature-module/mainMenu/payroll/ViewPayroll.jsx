import React, { useEffect, useState } from "react";
import { getPayrollById } from "./payrollApi";
import { useParams, Link } from "react-router-dom";

const ViewPayroll = () => {
    const { id } = useParams();
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load payroll data
    const loadPayroll = async () => {
        try {
            const res = await getPayrollById(id);
            setPayroll(res.data);
        } catch (error) {
            console.error("Error loading payroll:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayroll();
    }, []);

    if (loading) return <p className="p-4">Loading payroll details…</p>;
    if (!payroll) return <p className="p-4">Payroll not found.</p>;

    const earnings = payroll.components_details.filter((c) => c.component_type === "earning");
    const deductions = payroll.components_details.filter((c) => c.component_type === "deduction");

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">Payroll Details</h4>
                <Link to="/main/payroll/list" className="btn btn-secondary">Back</Link>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">

                    {/* Employee and Month/Year */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <p><strong>Employee:</strong> {payroll.employee_name}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Month/Year:</strong> {payroll.month}/{payroll.year}</p>
                        </div>
                    </div>

                    {/* Basic & HRA */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <p><strong>Basic Salary:</strong> ₹{payroll.basic_salary}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>HRA:</strong> ₹{payroll.hra}</p>
                        </div>
                    </div>

                    <hr />

                    {/* Earnings */}
                    <h5 className="mt-3">Earnings</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.length === 0 ? (
                                    <tr><td colSpan="2" className="text-center">No earnings</td></tr>
                                ) : (
                                    earnings.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>₹{item.amount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Deductions */}
                    <h5 className="mt-4">Deductions</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deductions.length === 0 ? (
                                    <tr><td colSpan="2" className="text-center">No deductions</td></tr>
                                ) : (
                                    deductions.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>₹{item.amount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <hr />

                    {/* Summary */}
                    <div className="mt-3">
                        <p><strong>Gross Salary:</strong> ₹{payroll.gross_salary}</p>
                        <p><strong>Total Deductions:</strong> ₹{payroll.total_deductions}</p>
                        <p>
                            <strong className="text-success">Net Salary:</strong>
                            <span className="fw-bold"> ₹{payroll.net_salary}</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewPayroll;
