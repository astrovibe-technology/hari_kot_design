import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const API = import.meta.env.VITE_API_BASE_URL;

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
    <div
      className="container-fluid py-2 px-2"
      style={{
        background: "#f4f6fb",
        minHeight: "100vh",
        overflowX: "hidden"
      }}
    >

      {/* HEADER (compact) */}
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
        <h6 className="fw-bold mb-0">
          {user.role === "Cashier"
            ? "🏢 All Shops Dashboard"
            : "🏬 My Shop Dashboard"}
        </h6>

        <span className="badge bg-dark">
          {new Date().toLocaleString()}
        </span>
      </div>

      {/* SUMMARY (compact cards) */}
      <div className="row g-2">

        <div className="col-lg-4 col-md-6">
          <div
            className="p-2 rounded text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg,#4facfe,#00c6ff)",
              minHeight: "65px"
            }}
          >
            <h6 className="mb-0">Total Sales</h6>
            <h5 className="mb-0">₹ {summary.total_sales}</h5>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div
            className="p-2 rounded text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg,#f7971e,#ffd200)",
              minHeight: "65px"
            }}
          >
            <h6 className="mb-0">Total GST</h6>
            <h5 className="mb-0">₹ {summary.total_gst}</h5>
          </div>
        </div>

        <div className="col-lg-4 col-md-12">
          <div
            className="p-2 rounded text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg,#8e2de2,#4a00e0)",
              minHeight: "65px"
            }}
          >
            <h6 className="mb-0">Total Bills</h6>
            <h5 className="mb-0">{summary.total_bills}</h5>
          </div>
        </div>

      </div>

      {/* CHARTS (compact height) */}
      <div className="row mt-2 g-2">

        <div className="col-lg-6 col-12">
          <div className="card shadow-sm border-0 p-1">
            <h6 className="mb-1">🔥 Top Items</h6>

            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={top_items}>
                  <XAxis dataKey="item_name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#4facfe" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        <div className="col-lg-6 col-12">
          <div className="card shadow-sm border-0 p-1">
            <h6 className="mb-1">💳 Payments</h6>

            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={payments}
                    dataKey="amount"
                    nameKey="mode"
                    outerRadius={60}
                  >
                    {payments.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

      </div>

      {/* CASHIER TABLE */}
      {user.role === "Cashier" && (
        <div className="card mt-2 shadow-sm border-0">

          <div className="card-header bg-dark text-white py-1">
            Branch Sales
          </div>

          {/* SCROLL FIX */}
          <div
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              overflowX: "auto"
            }}
          >

            <table className="table table-hover table-sm mb-0">

              <thead className="table-primary">
                <tr>
                  <th>Shop</th>
                  <th className="text-end">Sales</th>
                </tr>
              </thead>

              <tbody>
                {branches?.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No Data
                    </td>
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
        <div className="row mt-2 g-2">

          <div className="col-md-6">
            <div className="card p-2 text-center shadow-sm">
              <h6 className="mb-1">My Sales</h6>
              <h5 className="text-success mb-0">
                ₹ {summary.total_sales}
              </h5>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-2 text-center shadow-sm">
              <h6 className="mb-1">My Bills</h6>
              <h5 className="mb-0">{summary.total_bills}</h5>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;