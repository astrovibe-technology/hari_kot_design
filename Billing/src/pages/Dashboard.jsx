import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const API = "http://127.0.0.1:8000";

const COLORS = ["#4facfe", "#00c6ff", "#43e97b", "#fa709a"];

function Dashboard() {
  const [data, setData] = useState(null);

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {}

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    let url = `${API}/reports/dashboard?user_id=${user.id}&role=${user.role}`;

    if (user.role === "shop_staff" && user.shop_id) {
      url += `&shop_id=${user.shop_id}`;
    }

    const res = await fetch(url);
    const result = await res.json();

    if (result.status) setData(result);
  };

  if (!data) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const { summary, top_items, branches, payments } = data;

  return (
    <div className="container-fluid py-3 px-2" style={{ background: "#f4f6fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h5 className="fw-bold mb-2">
          {user.role === "Cashier" ? "🏢 All Shops Dashboard" : "🏬 My Shop Dashboard"}
        </h5>
        <span className="badge bg-dark">
          {new Date().toLocaleString()}
        </span>
      </div>

      {/* SUMMARY */}
      <div className="row g-3">

        <div className="col-lg-4 col-md-6">
          <div className="p-3 rounded text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#4facfe,#00c6ff)" }}>
            <h6 className="mb-1">Total Sales</h6>
            <h4>₹ {summary.total_sales}</h4>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="p-3 rounded text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#f7971e,#ffd200)" }}>
            <h6 className="mb-1">Total GST</h6>
            <h4>₹ {summary.total_gst}</h4>
          </div>
        </div>

        <div className="col-lg-4 col-md-12">
          <div className="p-3 rounded text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#8e2de2,#4a00e0)" }}>
            <h6 className="mb-1">Total Bills</h6>
            <h4>{summary.total_bills}</h4>
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="row mt-3 g-3">

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-2">
            <h6 className="mb-2">🔥 Top Items</h6>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top_items}>
                <XAxis dataKey="item_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#4facfe" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-2">
            <h6 className="mb-2">💳 Payments</h6>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={payments}
                  dataKey="amount"
                  nameKey="mode"
                  outerRadius={75}
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

      {/* CASHIER VIEW */}
      {user.role === "Cashier" && (
        <div className="card mt-3 shadow-sm border-0">
          <div className="card-header bg-dark text-white py-2">
            Branch Sales
          </div>

          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Shop</th>
                  <th className="text-end">Sales</th>
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center">No Data</td>
                  </tr>
                ) : (
                  branches.map((b, i) => (
                    <tr key={i}>
                      <td>{b.shop_name}</td>
                      <td className="text-end text-success fw-bold">
                        ₹ {b.sales}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHOP STAFF */}
      {user.role === "shop_staff" && (
        <div className="row mt-3 g-3">
          <div className="col-md-6">
            <div className="card p-3 text-center shadow-sm">
              <h6>My Sales</h6>
              <h4 className="text-success">₹ {summary.total_sales}</h4>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-3 text-center shadow-sm">
              <h6>My Bills</h6>
              <h4>{summary.total_bills}</h4>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;