import React from "react";
import "../styles/Compliance.css";

const Compliance = () => {
    return (
        <div className="main">
            <div className="topbar">
                <input placeholder="Search compliance, documents..." />
                <div className="user">Raima</div>
            </div>

            <h2>Compliance Management</h2>
            <p className="subtitle">
                Manage and track statutory compliance across all plants
            </p>

            <div className="filters">
                <input placeholder="Search by ID, type, category..." />
                <select><option>All Plants</option></select>
                <select><option>All Departments</option></select>
                <select><option>All Status</option></select>
                <button className="add-btn">+ Add Compliance</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Compliance ID</th>
                            <th>Plant</th>
                            <th>Department</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Frequency</th>
                            <th>Criticality</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td className="link">CMP-001</td>
                            <td>Mumbai Plant A</td>
                            <td>Operations</td>
                            <td>Safety Inspection</td>
                            <td>Health & Safety</td>
                            <td>Monthly</td>
                            <td><span className="tag high">High</span></td>
                            <td><span className="status completed">Completed</span></td>
                        </tr>

                        <tr>
                            <td className="link">CMP-002</td>
                            <td>Delhi Plant B</td>
                            <td>Quality</td>
                            <td>ISO Audit</td>
                            <td>Quality Mgmt</td>
                            <td>Quarterly</td>
                            <td><span className="tag critical">Critical</span></td>
                            <td><span className="status pending">Pending</span></td>
                        </tr>

                        <tr>
                            <td className="link">CMP-003</td>
                            <td>Mumbai Plant A</td>
                            <td>HR</td>
                            <td>Labour Law</td>
                            <td>Statutory</td>
                            <td>Annual</td>
                            <td><span className="tag medium">Medium</span></td>
                            <td><span className="status progress">In Progress</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Compliance;