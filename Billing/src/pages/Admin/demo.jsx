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

  const [searchBill, setSearchBill] = useState("");
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

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
  // FILTER
  // =========================
  const filteredReports = reports.filter((bill) =>
    bill.bill_no.toLowerCase().includes(searchBill.toLowerCase())
  );

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

    if (startDate && endDate) {
      message += `📅 Date: ${startDate} to ${endDate}\n\n`;
    }

    reports.forEach((bill, index) => {
      message += `#${index + 1} ${bill.bill_no}\n`;
      message += `₹ ${bill.grand_total} | ${bill.payment_mode}\n`;
      message += `${new Date(bill.created_at).toLocaleString()}\n\n`;
    });

    message += `\n------------------------\n`;
    message += `Total Sales: ₹ ${Number(totalSales).toFixed(2)}\n`;
    message += `Total GST: ₹ ${Number(totalGST).toFixed(2)}\n`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container-fluid mt-2">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>📊 Reports</h5>

        <div className="d-flex gap-2 align-items-center">

          {/* ✅ SEARCH NEAR BUTTONS */}
          <input
            type="text"
            placeholder="Search Bill..."
            className="form-control form-control-sm"
            style={{ width: "150px" }}
            value={searchBill}
            onChange={(e) => setSearchBill(e.target.value)}
          />

          <button className="btn btn-sm btn-success" onClick={downloadExcel}>
            Excel
          </button>

          <button className="btn btn-sm btn-danger" onClick={downloadPDF}>
            PDF
          </button>

          {/* ✅ WHATSAPP KEPT */}
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
              <input type="date" className="form-control form-control-sm"
                value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="col-md-3">
              <input type="date" className="form-control form-control-sm"
                value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            {user.role === "admin" && (
              <div className="col-md-3">
                <select className="form-select form-select-sm"
                  value={shopId} onChange={(e) => setShopId(e.target.value)}>
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
              <button className="btn btn-sm btn-primary w-100" onClick={fetchReports}>
                Apply
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body p-0" style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover mb-0">

            <thead className="table-primary" style={{ position: "sticky", top: 0 }}>
              <tr>
                <th>#</th>
                <th>Bill</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((bill, index) => (
                  <tr key={bill.id}>
                    <td>{index + 1}</td>
                    <td>{bill.bill_no}</td>
                    <td>{bill.customer_name || "Walk-in"}</td>
                    <td>₹ {Number(bill.subtotal).toFixed(2)}</td>
                    <td>₹ {Number(bill.gst_total).toFixed(2)}</td>
                    <td>₹ {Number(bill.grand_total).toFixed(2)}</td>
                    <td>{bill.payment_mode}</td>
                    <td>{new Date(bill.created_at).toLocaleString()}</td>

                    <td>
                      <button className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowItemsModal(true);
                        }}>
                        View
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No Data Found</td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL */}
      {showItemsModal && selectedBill && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h5>🧾 Bill: {selectedBill.bill_no}</h5>

            <table className="table table-sm table-bordered mt-2">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {selectedBill.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.item_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>₹ {item.item_price}</td>
                    <td>₹ {item.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-end">
              <button className="btn btn-sm btn-danger"
                onClick={() => setShowItemsModal(false)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;