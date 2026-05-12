import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = "http://127.0.0.1:8000";

const Reports = () => {

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
  // FETCH REPORTS
  // =========================
  const fetchReports = async () => {
    try {
      let url = `${API}/reports/reports?user_id=${user.id}&role=${user.role}`;

      if (user.role !== "admin") {
        url += `&shop_id=${user.shop_id}`;
      }

      if (shopId) url += `&shop_id=${shopId}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      // prevent cache
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
    if (user.role === "admin") {
      fetchShops();
    }
  }, []);

  // =========================
  // EXPORT EXCEL
  // =========================
  const downloadExcel = () => {
    const data = reports.map((bill, index) => ({
      No: index + 1,
      Bill_No: bill.bill_no,
      Customer: bill.customer_name,
      Subtotal: bill.subtotal,
      GST: bill.gst_total,
      Total: bill.grand_total,
      Payment: bill.payment_mode,
      Date: new Date(bill.created_at).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Reports");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([buffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "Reports.xlsx");
  };

  // =========================
  // EXPORT PDF
  // =========================
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Sales Report", 14, 10);

    const rows = reports.map((bill, index) => [
      index + 1,
      bill.bill_no,
      bill.customer_name || "Walk-in",
      bill.subtotal,
      bill.gst_total,
      bill.grand_total,
      bill.payment_mode,
      new Date(bill.created_at).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["#", "Bill", "Customer", "Subtotal", "GST", "Total", "Payment", "Date"]],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("Reports.pdf");
  };

  // =========================
  // WHATSAPP SHARE
  // =========================
  const shareWhatsApp = () => {

  let message = `📊 Sales Report\n\n`;

  // ✅ ADD DATE RANGE HERE
  if (startDate && endDate) {
    message += `📅 Date: ${startDate} to ${endDate}\n\n`;
  } else if (startDate) {
    message += `📅 Date: ${startDate}\n\n`;
  } else {
    message += `📅 Date: Today\n\n`;
  }

  // ✅ BILL DATA
  reports.forEach((bill, index) => {
    message += `#${index + 1} ${bill.bill_no}\n`;
    message += `₹ ${bill.grand_total} | ${bill.payment_mode}\n`;
    message += `${new Date(bill.created_at).toLocaleString()}\n\n`;
  });

  // ✅ TOTALS
  message += `\n------------------------\n`;
  message += `Total Sales: ₹ ${Number(totalSales).toFixed(2)}\n`;
  message += `Total GST: ₹ ${Number(totalGST).toFixed(2)}\n`;

  // ✅ OPEN WHATSAPP
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

  return (
    <div className="container-fluid mt-2">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>📊 Reports</h5>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-success" onClick={downloadExcel}>
            Excel
          </button>

          <button className="btn btn-sm btn-danger" onClick={downloadPDF}>
            PDF
          </button>

          <button className="btn btn-sm btn-success" onClick={shareWhatsApp}>
            WhatsApp
          </button>

         
        </div>
      </div>

      {/* FILTERS */}
      <div className="card shadow-sm mb-2">
        <div className="card-body py-2">
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
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.shop_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-md-3">
              <button
                className="btn btn-sm btn-primary w-100"
                onClick={fetchReports}
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="row mb-2">

        <div className="col-md-4">
          <div className="card bg-primary text-white text-center">
            <div className="card-body py-2">
              <small>Total Bills</small>
              <h6>{count}</h6>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white text-center">
            <div className="card-body py-2">
              <small>Total Sales</small>
              <h6>₹ {Number(totalSales).toFixed(2)}</h6>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-info text-dark text-center">
            <div className="card-body py-2">
              <small>Total GST</small>
              <h6>₹ {Number(totalGST).toFixed(2)}</h6>
            </div>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div
          className="card-body p-0"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <table className="table table-bordered table-hover mb-0">

            <thead
              className="table-primary"
              style={{ position: "sticky", top: 0 }}
            >
              <tr>
                <th>#</th>
                <th>Bill</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {reports.length > 0 ? (
                reports.map((bill, index) => (
                  <tr key={bill.id}>
                    <td>{index + 1}</td>
                    <td>{bill.bill_no}</td>
                    <td>{bill.customer_name || "Walk-in"}</td>
                    <td>₹ {Number(bill.subtotal).toFixed(2)}</td>
                    <td>₹ {Number(bill.gst_total).toFixed(2)}</td>
                    <td>₹ {Number(bill.grand_total).toFixed(2)}</td>
                    <td>{bill.payment_mode}</td>
                    <td>{new Date(bill.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Data Found
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

export default Reports;