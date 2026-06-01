import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API = import.meta.env.VITE_API_BASE_URL;

const ItemWiseReport = () => {

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const today = new Date().toISOString().split("T")[0];

  const [reports, setReports] = useState([]);
  const [shops, setShops] = useState([]);

  const [totalSales, setTotalSales] = useState(0);
  const [totalGST, setTotalGST] = useState(0);
  const [count, setCount] = useState(0);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [shopId, setShopId] = useState("");

  // =========================
  // FETCH REPORT
  // =========================
  const fetchReports = async () => {
    try {
      let url = `${API}/reports/item-wise?user_id=${user.id}&role=${user.role}`;

      if (user.role !== "admin") {
        url += `&shop_id=${user.shop_id}`;
      }

      if (shopId) url += `&shop_id=${shopId}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      url += `&_=${new Date().getTime()}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data.status) {
        setReports(data.data);
        setTotalSales(data.total_sales);
        setTotalGST(data.total_gst);
        setCount(data.count);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // FETCH SHOPS
  // =========================
  const fetchShops = async () => {
    try {
      const res = await fetch(`${API}/shops/list`);
      const data = await res.json();

      if (data.status) {
        setShops(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchReports();
    if (user.role === "admin") fetchShops();
  }, []);

  // =========================
  // EXPORT EXCEL
  // =========================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Item Report");
    XLSX.writeFile(wb, "item_report.xlsx");
  };

  // =========================
  // EXPORT PDF
  // =========================
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableData = reports.map((r, i) => [
      i + 1,
      r.item_name,
      r.total_qty,
      r.total_sales,
      r.total_gst,
    ]);

    doc.text("Item Wise Report", 14, 10);

    doc.autoTable({
      head: [["#", "Item", "Qty", "Sales", "GST"]],
      body: tableData,
    });

    doc.save("item_report.pdf");
  };

  // =========================
  // WHATSAPP SHARE
  // =========================
  // =========================
// WHATSAPP SHARE (UPDATED)
// =========================
const shareWhatsApp = () => {

  let text = `📊 Item Wise Report\n`;
  text += `Date: ${startDate} to ${endDate}\n\n`;

  reports.forEach((r, i) => {
    text += `${i + 1}. ${r.item_name}\n`;
    text += `   Qty: ${r.total_qty}\n`;
    text += `   Sales: ₹${r.total_sales}\n`;
    text += `   GST: ₹${r.total_gst}\n\n`;
  });

  text += `----------------------\n`;
  text += `Total Items: ${count}\n`;
  text += `Total Sales: ₹${totalSales}\n`;
  text += `Total GST: ₹${totalGST}`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

  return (
    <div className="container-fluid mt-2">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-2">
        <h5>📊 Item-wise Report</h5>

        <div>
          <button className="btn btn-sm btn-success me-1" onClick={exportExcel}>
            Excel
          </button>
          <button className="btn btn-sm btn-danger me-1" onClick={exportPDF}>
            PDF
          </button>
          <button className="btn btn-sm btn-success" onClick={shareWhatsApp}>
            WhatsApp
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="card p-2 mb-2 shadow-sm">
        <div className="row g-2">

          <div className="col-md-3">
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {user.role === "admin" && (
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              >
                <option value="">All Shops</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shop_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-md-3">
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={fetchReports}
            >
              Apply
            </button>
          </div>

        </div>
      </div>

      {/* SUMMARY */}
      <div className="row mb-2">

        <div className="col-md-4">
          <div className="card bg-primary text-white text-center py-2">
            <small>Items</small>
            <h6>{count}</h6>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white text-center py-2">
            <small>Total Sales</small>
            <h6>₹ {totalSales.toFixed(2)}</h6>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-info text-dark text-center py-2">
            <small>Total GST</small>
            <h6>₹ {totalGST.toFixed(2)}</h6>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="card">
        <div
          className="table-responsive"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <table className="table table-bordered table-sm mb-0">

            <thead className="table-primary sticky-top">
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Sales</th>
                <th>GST</th>
              </tr>
            </thead>

            <tbody>
              {reports.length > 0 ? (
                reports.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.item_name}</td>
                    <td>{r.total_qty}</td>
                    <td>₹ {r.total_sales}</td>
                    <td>₹ {r.total_gst}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Data
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

export default ItemWiseReport;