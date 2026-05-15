import React, { useState, useEffect ,useRef } from "react";
import { FaSearch, FaTrash } from "react-icons/fa";
const API = "http://127.0.0.1:8000";

const Billing = () => {
   let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  // ✅ DYNAMIC DATA
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [products, setProducts] = useState([]);
  const [backendBillNo, setBackendBillNo] = useState("");

  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [orderType, setOrderType] = useState("Dine-In");
  const [dateTime, setDateTime] = useState(new Date());

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    discount: "",
  });
  const qtyRefs = useRef({});


const [searchTerm, setSearchTerm] = useState("");
const [showBill, setShowBill] = useState(false);
 const billNo = backendBillNo;

  useEffect(() => {
    fetchCategories();
  fetchProducts();
   fetchBillNumber();

    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
 const fetchCategories = async () => {
  try {

    let url = `${API}/category/list`;

    // ✅ pass as query params
    if (user.role && user.shop_id) {
      url += `?role=${user.role}&shop_id=${user.shop_id}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.status) {
      setCategories([
        { id: "All", category_name: "All" },
        ...data.data,
      ]);
    }

  } catch (err) {
    console.log(err);
  }
};
const fetchProductsByCategory = async (catId) => {
  try {

    let url = "";

    if (catId === "All") {
      // ✅ USE SAME API
      url = `${API}/items/allitems`;

      if (user.role && user.shop_id) {
        url += `?role=${user.role}&shop_id=${user.shop_id}`;
      }

    } else {
      // ✅ category filter API
      url = `${API}/category/category/${catId}`;

      if (user.role && user.shop_id) {
        url += `?role=${user.role}&shop_id=${user.shop_id}`;
      }
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.status) {
      setProducts(data.data);
    }

  } catch (err) {
    console.log(err);
  }
};
const fetchProducts = async () => {
  try {
    let url = `${API}/items/allitems`;

    // ✅ IMPORTANT: pass role + shop_id ALWAYS
    if (user.role && user.shop_id) {
      url += `?role=${user.role}&shop_id=${user.shop_id}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.status) {
      setProducts(data.data);
    }

  } catch (err) {
    console.log(err);
  }
};
const fetchBillNumber = async () => {

  try {

    const res = await fetch(
      `${API}/bill/bill/generate-number`
    );

    const data = await res.json();

    if (data.status) {
      setBackendBillNo(data.bill_no);
    }

  } catch (err) {
    console.log(err);
  }
};
const addToCart = (product) => {
  const exist = cart.find((item) => item.id === product.id);

  let updatedCart;

  if (exist) {
    updatedCart = cart.map((item) =>
      item.id === product.id
        ? { ...item, qty: item.qty + 1 }
        : item
    );
  } else {
    updatedCart = [
      ...cart,
      {
        ...product,
        qty: 1,
        unit: "kg",
      },
    ];
  }

  setCart(updatedCart);

  // ✅ focus after render
  setTimeout(() => {
    qtyRefs.current[product.id]?.focus();
  }, 100);
};
  const updateQty = (id, type) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty: type === "inc" ? item.qty + 1 : item.qty - 1,
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

const subtotal = cart.reduce(
  (sum, item) =>
    sum +
    item.price *
      (item.unit === "kg"|| item.unit === "pc" || item.unit === "litre"? item.qty : item.qty / 1000),
  0
);
// CATEGORY WISE PRINT FUNCTION (NO DESIGN CHANGE)
const printCategoryWiseBills = (billNumber) => {
  if (cart.length === 0) return;

  // ✅ GROUP ITEMS CATEGORY WISE
  const grouped = {};

  cart.forEach((item) => {
    const category = item.category || "Others";

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(item);
  });

  // ✅ OPEN PRINT WINDOW
const printWindow = window.open("", "", "width=350,height=600");

if (!printWindow) {
  alert("Please allow popups for printing");
  return;
}

let html = `
<html>
<head>
  <title>Print</title>

  <style>

    @page{
      size: 80mm auto;
      margin: 0;
    }

    body{
      font-family: monospace;
      width: 72mm;
      margin: 0 auto;
      padding: 2mm;
      font-size: 12px;
      color:#000;
    }

    .bill{
      padding-bottom: 5mm;
    }

    .center{
      text-align:center;
    }

    .row{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      margin:3px 0;
      font-size:12px;
    }

    .table-header,
    .table-row{
      display:flex;
      justify-content:space-between;
      font-size:12px;
      margin:2px 0;
    }

    .col-item{
      width:40%;
      text-align:left;
      word-break:break-word;
    }

    .col-qty{
      width:15%;
      text-align:center;
    }

    .col-price{
      width:20%;
      text-align:right;
    }

    .col-total{
      width:25%;
      text-align:right;
    }

    .total-row{
      font-size:14px;
      font-weight:bold;
    }

    hr{
      border:none;
      border-top:1px dashed #000;
      margin:5px 0;
    }

    h2,h3,p{
      margin:2px 0;
    }

  </style>
</head>

<body>
`;

// ✅ CATEGORY WISE
Object.keys(grouped).forEach((category) => {

  const items = grouped[category];
const subtotal = cart.reduce(
  (sum, item) =>
    sum +
    item.price *
      (item.unit === "kg"|| item.unit === "pc" || item.unit === "litre" ? item.qty : item.qty / 1000),
  0
);

  const gst = items.reduce((sum, item) => {
  const amount =
  item.price *
  (item.unit === "kg" || item.unit === "pc" || item.unit === "litre" ? item.qty : item.qty / 1000);

  const gstAmount =
    (amount * item.gst) / (100 + item.gst);

  return sum + gstAmount;
}, 0);

  const total = subtotal + gst;

  const now = new Date();

  const date = now.toLocaleDateString();

  const time = now.toLocaleTimeString();

  html += `

    <div class="bill">

      <!-- SHOP DETAILS -->
      <div class="center">
        <h2>Hari Groups</h2>
        <p>ABC Street, Alangulam</p>
        <p>Mobile No : 9876543210</p>
      </div>

      <hr>

      <!-- BILL DETAILS -->
      <div class="row">
        <span>Invoice : ${billNumber}</span>
        <span>${customer.name || "Walk-in"}</span>
      </div>

      <div class="row">
        <span>Date : ${date}</span>
        <span>Time : ${time}</span>
      </div>

      <div class="row">
        <span>Payment : ${paymentMode}</span>
        <span>Order : ${orderType}</span>
      </div>

      <hr>

      <!-- CATEGORY -->
      <div class="center">
        <h3>${category.toUpperCase()}</h3>
      </div>

      <hr>

      <!-- TABLE HEADER -->
      <div class="table-header">
        <div class="col-item"><b>Item</b></div>
        <div class="col-qty"><b>Qty</b></div>
        <div class="col-price"><b>Price</b></div>
        <div class="col-total"><b>Total</b></div>
      </div>

      <hr>

      <!-- ITEMS -->
      ${items.map((item) => `
        <div class="table-row">

          <div class="col-item">
            ${item.name}
          </div>

          <div class="col-qty">
            ${item.qty} ${item.unit}
          </div>
  
          <div class="col-price">
            ₹ ${item.price.toFixed(2)}
          </div>

          <div class="col-total">
          ₹ ${(item.price * (
  item.unit === "kg" || item.unit === "pc" || item.unit === "litre"
    ? item.qty
    : item.qty / 1000
)).toFixed(2)}
          </div>

        </div>
      `).join("")}

      <hr>

      <!-- TOTALS -->
      <div class="row">
        <span>Subtotal</span>
        <span>₹ ${subtotal.toFixed(2)}</span>
      </div>

      <div class="row">
        <span>GST</span>
        <span>₹ ${gst.toFixed(2)}</span>
      </div>

      <hr>

      <div class="row total-row">
        <span>Total</span>
        <span>₹ ${subtotal.toFixed(2)}</span>
      </div>

      <hr>

      <div class="center">
        <p>Thank You Visit Again</p>
      </div>

    </div>
  `;
});

html += `
</body>
</html>
`;
 printWindow.document.open();
printWindow.document.write(html);
printWindow.document.close();

printWindow.onload = () => {

  printWindow.focus();

  printWindow.print();

  // ✅ CLOSE AFTER PRINT
  printWindow.onafterprint = () => {
    printWindow.close();
  };

  // ✅ EXTRA SAFETY CLOSE
  setTimeout(() => {
    printWindow.close();
  }, 200);

};
};
const totalGST = cart.reduce(
  (sum, item) => {
   const amount =
  item.price *
  (item.unit === "kg" || item.unit === "pc" || item.unit === "litre" ? item.qty : item.qty / 1000);

    const gstAmount =
  (amount * item.gst) / (100 + item.gst);

    return sum + gstAmount;
  },
  0
);
const saveBill = async () => {

  try {

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const currentBillNo = backendBillNo;

    // ✅ GET UNIQUE SHOP IDS FROM CART
    const shopIds = [
      ...new Set(
        cart.map((item) => Number(item.shop_id))
      ),
    ];

    // ✅ ITEMS PAYLOAD
    const payloadItems = cart.map((item) => ({

      item_id: item.id,

      quantity: item.qty,
      unit: item.unit, 

      item_price: item.price,

      gst_percent: item.gst,

     total_price:
  item.price *
  (
    item.unit === "kg" || item.unit === "pc" || item.unit === "litre"
      ? item.qty
      : item.qty / 1000
  ),

      category_name: item.category,

      // ✅ IMPORTANT
      shop_id: Number(item.shop_id),

    }));

    // ✅ FINAL PAYLOAD
    const payload = {

      bill_no: currentBillNo,

      customer_name: customer.name || "Walk-in",

      customer_phone: customer.phone || "",

      subtotal,

      gst_total: totalGST,

      grand_total: total,

      discount: customer.discount || 0,

      payment_mode: paymentMode,

      created_by: user.id,

      shop_ids: shopIds,

      items: payloadItems,
      unit: cart.length > 0 ? cart[0].unit : "kg",
    };

    console.log("FINAL PAYLOAD:", payload);

    const res = await fetch(`${API}/bill/create`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),

    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed");
    }

    printCategoryWiseBills(currentBillNo);

    alert("Bill Created Successfully");

    setCart([]);

    setShowBill(false);

    fetchBillNumber();

  } catch (err) {

    console.log(err);

    alert(err.message);

  }

};
  const sgst = totalGST / 2;
  const cgst = totalGST / 2;
  const total = subtotal;

const filteredProducts = products.filter((p) =>
  (p.item_name || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
  return (
    <div className="billing-container">

      {/* LEFT */}
      <div className="left-panel">

       <div className="search-box">
  <FaSearch />
  <input
    placeholder="Search product..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

        <div className="categories">
{categories.map((cat) => (
  <button
    key={cat.id}
    className={
      activeCat === cat.id ? "active" : ""
    }
    onClick={() => {
      setActiveCat(cat.id);
      fetchProductsByCategory(cat.id);
    }}
  >
    {cat.category_name}
  </button>
))}
        </div>

        <div className="products">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="product-card"
             onClick={() =>
 addToCart({
  id: p.id,
  name: p.item_name,
  price: p.price,
  gst: p.gst_percent,

  category:
    p.category_name ||
    categories.find(c => c.id === activeCat)?.category_name ||
    "Others",

  // ✅ ADD THIS
  shop_id: p.shop_id,

  shop_ids: p.shop_ids || [p.shop_id]
})
             }
            >
             <div className="product-name">{p.item_name}</div>
              <div className="product-price">₹ {p.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="right-panel">

        {/* BILL HEADER */}
        <div className="bill-header">
          <div className="bill-top">
            <span>BILL #{billNo}</span>
            <span>{dateTime.toLocaleDateString()}</span>
          </div>
          <div className="bill-bottom">
            {dateTime.toLocaleTimeString()}
          </div>

          <div className="order-type">
  {[
    { name: "Dine-In", icon: "🍽️" },
    { name: "Pickup", icon: "🛍️" },
    { name: "Online", icon: "🌐" },
  ].map((type) => (
    <div
      key={type.name}
      className={`order-btn ${orderType === type.name ? "active" : ""}`}
      onClick={() => setOrderType(type.name)}
    >
      <span className="icon">{type.icon}</span>
      <span>{type.name}</span>
    </div>
  ))}
</div>
        </div>
  <div className="payment-section">

  {/* <div className="payment-title">Payment Mode</div> */}

  <div className="payment-grid">
    {[
      { name: "Cash", icon: "💵", color: "cash" },
      { name: "Card", icon: "💳", color: "card" },
      { name: "UPI", icon: "📱", color: "upi" },
      { name: "Other", icon: "🧾", color: "other" },
    ].map((mode) => (
      <div
        key={mode.name}
        className={`pay-btn ${mode.color} ${
          paymentMode === mode.name ? "active" : ""
        }`}
        onClick={() => setPaymentMode(mode.name)}
      >
        <span className="icon">{mode.icon}</span>
        <span className="label">{mode.name}</span>
      </div>
    ))}
  </div>

</div>

        {/* CUSTOMER */}
       <button
  className="customer-btn"
  onClick={() => setShowCustomerModal(true)}
>
  + Customer Details
</button>
{showCustomerModal && (
  <div className="modal-overlay">
    <div className="modal-box">

      <h2>Customer Details</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customer.name}
        onChange={(e) =>
          setCustomer({ ...customer, name: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={customer.phone}
        onChange={(e) =>
          setCustomer({ ...customer, phone: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Discount %"
        value={customer.discount}
        onChange={(e) =>
          setCustomer({ ...customer, discount: e.target.value })
        }
      />

      <div className="modal-actions">
        <button
          className="save-btn"
          onClick={() => setShowCustomerModal(false)}
        >
          Save
        </button>

        <button
          className="cancel-btn"
          onClick={() => setShowCustomerModal(false)}
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
        {/* CART */}
        <div className="cart">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">

              <div className="item-left">
                <span>{item.name}</span>
                <small>{item.gst}% GST</small>
              </div>

              <div className="qty">

  <input
  ref={(el) => (qtyRefs.current[item.id] = el)}
  type="number"
  value={item.qty}
  placeholder={item.unit === "g" ? "grams" : "kg"}
  onFocus={(e) => e.target.select()} // ✅ auto select text
  onChange={(e) => {
    const value = e.target.value;

    setCart(
      cart.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              qty: value === "" ? "" : parseFloat(value),
            }
          : cartItem
      )
    );
  }}
  onBlur={() => {
    setCart(
      cart.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              qty:
                cartItem.qty === "" || isNaN(cartItem.qty)
                  ? 1
                  : cartItem.qty,
            }
          : cartItem
      )
    );
  }}
  className="qty-input"
/>
  {/* ✅ UNIT SELECT */}
 <select
  value={item.unit}
  onChange={(e) => {
    const newUnit = e.target.value;

    setCart(
      cart.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              unit: newUnit, // ✅ ONLY change unit
            }
          : cartItem
      )
    );
  }}
  className="unit-select"
>
  <option value="g">g</option>
  <option value="kg">kg</option>
  <option value="pc">pc</option> 
  <option value="litre">ltr</option> 
</select>

</div>
              <div className="item-right">
                {/* <span>₹ {(item.price * (item.unit === "kg" ? item.qty : item.qty / 1000)).toFixed(2)}</span> */}
                <span>
  ₹ {(
    item.price *
    (
      item.unit === "kg" || item.unit === "pc" || item.unit === "litre"
        ? item.qty
        : item.qty / 1000
    )
  ).toFixed(2)}
</span>
                <FaTrash
                  className="delete"
                  onClick={() => removeItem(item.id)}
                />
              </div>

            </div>
          ))}
        </div>

        {/* SUMMARY */}
     <div className="summary">

  {/* ✅ SUBTOTAL BUTTON */}
  <div
    className="summary-btn"
    onClick={() => setShowSummaryDetails(!showSummaryDetails)}
  >
    <span>Subtotal</span>
    <span>₹ {subtotal.toFixed(2)}</span>
  </div>

  {/* ✅ EXPAND DETAILS */}
 {showSummaryDetails && (
  <div className="summary-details">

    <div className="summary-row">
      <span>GST</span>
      <span className="amount">₹ {totalGST.toFixed(2)}</span>
    </div>

    <div className="summary-row">
      <span>SGST</span>
      <span className="amount">₹ {sgst.toFixed(2)}</span>
    </div>

    <div className="summary-row">
      <span>CGST</span>
      <span className="amount">₹ {cgst.toFixed(2)}</span>
    </div>
    <div className="summary-row">
      <span>Total</span>
      <span className="amount">₹ {total.toFixed(2)}</span>
    </div>

    {/* ✅ MOVE DIVIDER HERE */}
    <div className="summary-divider"></div>

  </div>
)}
  <div className="summary-divider"></div>

  {/* ✅ TOTAL BUTTON (HIGHLIGHT) */}
  <div className="total-btn">
    <span>Total</span>
    <span></span>
  </div>

</div>

        {/* PAYMENT */}
      
        {/* ACTIONS */}
        <div className="actions">
           <button
  className="save-btn"
  onClick={async () => {
    await saveBill();
    // printCategoryWiseBills();
  }}
>
  Print  ₹ {total.toFixed(0)}
</button>
          {/* <button className="pay" onClick={() => setShowBill(true)}>
  PAY ₹ {total.toFixed(0)}
</button> */}
{showBill && (
  <div className="modal-overlay">
    <div className="bill-modal">

      <h2>🧾 Invoice</h2>

      <div className="bill-info">
  <p><strong>Bill No:</strong> {billNo}</p>
  <p><strong>Date:</strong> {dateTime.toLocaleString()}</p>

  <p><strong>Order Type:</strong> {orderType}</p>
  <p><strong>Payment Mode:</strong> {paymentMode}</p>

  <p><strong>Customer:</strong> {customer.name || "Walk-in"}</p>
  <p><strong>Phone:</strong> {customer.phone || "-"}</p>
</div>

      <div className="bill-items">
        {cart.map((item) => (
          <div key={item.id} className="bill-row">
            <span>{item.name} x {item.qty}</span>
            <span>₹ {(item.price * (item.unit === "kg" ? item.qty : item.qty / 1000)).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <hr />

      <div className="bill-summary">
        <div><span>Subtotal:</span><span>₹ {subtotal.toFixed(2)}</span></div>
        <div><span>GST:</span><span>₹ {totalGST.toFixed(2)}</span></div>

        {customer.discount && (
          <div>
            <span>Discount ({customer.discount}%):</span>
            <span>
              ₹ {(total * customer.discount / 100).toFixed(2)}
            </span>
          </div>
        )}

        <div className="total">
          <strong>Total:</strong>
          <strong>
            ₹ {(total - (total * (customer.discount || 0) / 100)).toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="modal-actions">
       <button
  className="save-btn"
  onClick={async () => {
    await saveBill();
    // printCategoryWiseBills();
  }}
>
  Print 
</button>

        <button
          className="cancel-btn"
          onClick={() => {
            setShowBill(false);
            setCart([]);
          }}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
          <button className="clear" onClick={() => setCart([])}>Clear</button>
        </div>

      </div>
    </div>
  );
};

export default Billing;