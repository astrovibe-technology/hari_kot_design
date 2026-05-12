import React, { useEffect, useState } from "react";
import { FaRupeeSign, FaUsers, FaPrint, FaBox } from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const API = "http://127.0.0.1:8000";

const AdminDashboard = () => {

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const [summary, setSummary] = useState({});
  const [branches, setBranches] = useState([]);
  const [payments, setPayments] = useState([]);
  const [topItems, setTopItems] = useState([]);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

  // =========================
  // FETCH DATA
  // =========================
  const fetchDashboard = async () => {
    try {
      let url = `${API}/reports/dashboard?user_id=${user.id}&role=${user.role}`;

      if (user.role !== "admin") {
        url += `&shop_id=${user.shop_id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status) {
        setSummary(data.summary);
        setBranches(data.branches);
        setPayments(data.payments);
        setTopItems(data.top_items);
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="container-fluid p-2 p-md-3">

      <h5 className="fw-bold mb-3">📊 Admin Dashboard</h5>

      {/* ===== CARDS ===== */}
      <div className="row g-2">

        <div className="col-6 col-md-3">
          <div className="card text-white p-2 border-0 shadow-sm"
            style={{ background: "linear-gradient(135deg,#4f46e5,#3b82f6)", borderRadius: "12px" }}>
            <FaRupeeSign />
            <h6 className="mt-1 mb-0">₹ {Number(summary.total_sales || 0).toFixed(2)}</h6>
            <small>Total Sales</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-white p-2 border-0 shadow-sm"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: "12px" }}>
            <FaUsers />
            <h6 className="mt-1 mb-0">{summary.total_bills || 0}</h6>
            <small>Total Bills</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-white p-2 border-0 shadow-sm"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", borderRadius: "12px" }}>
            <FaBox />
            <h6 className="mt-1 mb-0">₹ {Number(summary.total_gst || 0).toFixed(2)}</h6>
            <small>Total GST</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-white p-2 border-0 shadow-sm"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6366f1)", borderRadius: "12px" }}>
            <FaPrint />
            <h6 className="mt-1 mb-0">{branches.length}</h6>
            <small>Branches</small>
          </div>
        </div>

      </div>

      {/* ===== CHARTS ===== */}
      <div className="row mt-3 g-2">

        {/* BAR CHART */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-2">
            <h6 className="fw-bold mb-1">Branch Sales</h6>

            <div style={{ width: "100%", height: "180px" }}>
              <ResponsiveContainer>
                <BarChart data={branches}>
                  <XAxis dataKey="shop_name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        {/* PIE CHART */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-2">
            <h6 className="fw-bold mb-1">Payment Modes</h6>

            <div style={{ width: "100%", height: "180px" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={payments}
                    dataKey="amount"
                    nameKey="mode"
                    outerRadius={60}
                    label={{ fontSize: 10 }}
                  >
                    {payments.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

      </div>

      {/* ===== TABLE ===== */}
      <div className="card mt-3 shadow-sm border-0">

        <div className="card-header bg-white fw-bold">
          Top Selling Items
        </div>

        <div
          className="table-responsive"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="table table-bordered table-hover mb-0">

            <thead className="table-light sticky-top">
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Sales</th>
              </tr>
            </thead>

            <tbody>
              {topItems && topItems.length > 0 ? (
                topItems.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.item_name}</td>
                    <td>{item.qty}</td>
                    <td>₹ {Number(item.sales).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;