let sales = JSON.parse(localStorage.getItem('sales')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || {};

function showSection(section) {
    document.getElementById('sales-section').classList.add('hidden');
    document.getElementById('stock-section').classList.add('hidden');
    document.getElementById('reports-section').classList.add('hidden');
    document.getElementById(section + '-section').classList.remove('hidden');
    if(section === 'stock') renderStock();
    if(section === 'reports') renderSales();
}

// Stock Update လုပ်ရန်
function updateStock() {
    const name = document.getElementById('stockName').value;
    const qty = parseInt(document.getElementById('stockQty').value);
    if (!name || isNaN(qty)) return alert("အချက်အလက်ပြည့်စုံစွာထည့်ပါ။");

    inventory[name] = (inventory[name] || 0) + qty;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderStock();
    alert("Stock အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။");
}

// အရောင်းစာရင်းသွင်းပြီး Invoice ထုတ်ရန်
function processSale() {
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const qty = parseInt(document.getElementById('itemQty').value);
    const method = document.getElementById('payMethod').value;

    if (!name || isNaN(price) || isNaN(qty)) return alert("အချက်အလက် အကုန်ဖြည့်ပါ။");
    
    // Stock စစ်ဆေးခြင်း
    if (!inventory[name] || inventory[name] < qty) {
        return alert("Stock မလုံလောက်ပါ။ လက်ကျန်: " + (inventory[name] || 0));
    }

    const total = price * qty;
    const saleData = { date: new Date().toLocaleString(), name, price, qty, total, method };
    
    sales.push(saleData);
    inventory[name] -= qty; // Stock လျှော့ခြင်း

    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('inventory', JSON.stringify(inventory));

    printInvoice(saleData);
}

function renderStock() {
    const body = document.getElementById('stockTableBody');
    body.innerHTML = Object.keys(inventory).map(name => 
        `<tr><td>${name}</td><td>${inventory[name]}</td></tr>`
    ).join('');
}

function renderSales() {
    const body = document.getElementById('salesTableBody');
    body.innerHTML = sales.map((s, index) => 
        `<tr><td>${s.date}</td><td>${s.name}</td><td>${s.total}</td><td>${s.method}</td>
        <td><button onclick="deleteSale(${index})">ဖျက်</button></td></tr>`
    ).reverse().join('');
}

function deleteSale(index) {
    sales.splice(index, 1);
    localStorage.setItem('sales', JSON.stringify(sales));
    renderSales();
}

function printInvoice(data) {
    const printArea = document.getElementById('invoice-print');
    printArea.innerHTML = `
        <div style="padding: 20px; border: 1px solid #000; width: 300px; margin: auto;">
            <h3 style="text-align:center;">INVOICE</h3>
            <p>နေ့စွဲ: ${data.date}</p>
            <hr>
            <p>ပစ္စည်း: ${data.name}</p>
            <p>အရေအတွက်: ${data.qty}</p>
            <p>ဈေးနှုန်း: ${data.price}</p>
            <hr>
            <h4>စုစုပေါင်း: ${data.total} Ks</h4>
            <p>ပေးချေမှု: ${data.method}</p>
            <p style="text-align:center;">ကျေးဇူးတင်ပါသည်!</p>
        </div>
    `;
    window.print();
}
