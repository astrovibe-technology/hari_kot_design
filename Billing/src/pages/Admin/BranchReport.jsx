import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API = "http://127.0.0.1:8000";

const BranchReport = () => {

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
  const [count, setCount] = useState(0);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [shopId, setShopId] = useState("");

  // =========================
  // FETCH REPORT
  // =========================
  const fetchReports = async () => {
    try {
      let url = `${API}/reports/branch-wise?user_id=${user.id}&role=${user.role}`;

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
        setCount(data.data.length);
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
    const sheetData = reports.map((r, i) => ({
      No: i + 1,
      Branch: r.shop_name,
      Sales: r.total_sales,
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Branch Report");
    XLSX.writeFile(wb, "branch_report.xlsx");
  };

  // =========================
  // EXPORT PDF
  // =========================
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableData = reports.map((r, i) => [
      i + 1,
      r.shop_name,
      r.total_sales,
    ]);

    doc.text("Branch Wise Report", 14, 10);

    doc.autoTable({
      head: [["#", "Branch", "Sales"]],
      body: tableData,
    });

    doc.text(
      `Total Sales: ₹ ${totalSales}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("branch_report.pdf");
  };

  // =========================
  // WHATSAPP SHARE
  // =========================
  const shareWhatsApp = () => {
    let text = `📊 Branch Wise Report\n`;
    text += `Date: ${startDate} to ${endDate}\n\n`;

    reports.forEach((r, i) => {
      text += `${i + 1}. ${r.shop_name} - ₹${r.total_sales}\n`;
    });

    text += `\nTotal Sales: ₹${totalSales}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container-fluid mt-2">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-2">
        <h5>🏪 Branch-wise Report</h5>

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

        <div className="col-md-6">
          <div className="card bg-primary text-white text-center py-2">
            <small>Branches</small>
            <h6>{count}</h6>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card bg-success text-white text-center py-2">
            <small>Total Sales</small>
            <h6>₹ {Number(totalSales).toFixed(2)}</h6>
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
                <th>Branch</th>
                <th>Sales</th>
              </tr>
            </thead>

            <tbody>
              {reports.length > 0 ? (
                reports.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.shop_name}</td>
                    <td>₹ {Number(r.total_sales).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
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

export default BranchReport;