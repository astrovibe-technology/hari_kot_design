import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const API = import.meta.env.VITE_API_BASE_URL;

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const AdminDashboard = () => {

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {}

  const [summary, setSummary] = useState({});
  const [branches, setBranches] = useState([]);
  const [payments, setPayments] = useState([]);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
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
  };

  return (
    <div className="container-fluid p-2">

      <h6 className="fw-bold mb-2">📊 Admin Dashboard</h6>

      {/* CARDS */}
      <div className="row g-2">

        {[
          { label: "Sales", value: summary.total_sales, color: "#4f46e5" },
          { label: "Bills", value: summary.total_bills, color: "#10b981" },
          { label: "GST", value: summary.total_gst, color: "#f59e0b" },
          { label: "Branches", value: branches.length, color: "#8b5cf6" },
        ].map((c, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="p-2 text-white rounded text-center"
              style={{ background: c.color }}>
              <small>{c.label}</small>
              <div className="fw-bold">{c.value}</div>
            </div>
          </div>
        ))}

      </div>

      {/* CHARTS */}
      <div className="row mt-2 g-2">

        <div className="col-12 col-lg-6">
          <div className="card p-2">
            <small>Branch Sales</small>
            <div style={{ height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={branches}>
                  <XAxis dataKey="shop_name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-2">
            <small>Payments</small>
            <div style={{ height: 180 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={payments} dataKey="amount" nameKey="mode" outerRadius={60}>
                    {payments.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="card mt-2">

        <div className="card-header py-2 fw-bold">
          Top Items
        </div>

        <div style={{ maxHeight: "220px", overflow: "auto" }}>

          <table className="table table-sm mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Sales</th>
              </tr>
            </thead>

            <tbody>
              {topItems?.map((i, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{i.item_name}</td>
                  <td>{i.qty}</td>
                  <td>₹ {i.sales}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;