// LocalStorage ကနေ ဒေတာဖတ်မယ်
let items = JSON.parse(localStorage.getItem('mha_items_v6')) || [];
let sales = JSON.parse(localStorage.getItem('mha_sales_v6')) || [];

// App စဖွင့်ချိန်မှာ Dropdown တွေ ဖြည့်မယ်
document.addEventListener('DOMContentLoaded', () => {
    refreshSelectors();
    renderInventoryTable();
});

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tab + '-tab').classList.remove('hidden');
    document.getElementById('btn-' + tab).classList.add('active');

    if(tab === 'items') renderItemsTable();
    if(tab === 'inventory') renderInventoryTable();
    if(tab === 'reports') renderReportsTable();
    refreshSelectors();
}

function handleSale() {
    const custName = document.getElementById('custName').value;
    const itemName = document.getElementById('saleItemSelect').value;
    const price = parseFloat(document.getElementById('salePrice').value);
    const qty = parseInt(document.getElementById('saleQty').value);

    if(!itemName || !qty) return alert("ပစ္စည်းနှင့် အရေအတွက် ထည့်ပါ");

    const item = items.find(i => i.name === itemName);
    if(item.qty < qty) return alert("စတော့မလုံလောက်ပါ");

    item.qty -= qty;
    const total = price * qty;
    const saleData = {
        id: Date.now(),
        custName,
        custPh: document.getElementById('custPh').value,
        custAddr: document.getElementById('custAddr').value,
        custGate: document.getElementById('custGate').value,
        itemName, price, qty, total,
        date: new Date().toLocaleString()
    };

    sales.push(saleData);
    saveAllData();
    alert("စာရင်းသွင်းပြီးပါပြီ");
    clearInputs();
}

function openInvoice(id) {
    const data = sales.find(s => s.id === id);
    if(!data) return;

    document.getElementById('invoice-customer-info').innerHTML = `
        ဝယ်သူ: <b>${data.custName || '-'}</b><br>
        လိပ်စာ/ဂိတ်: ${data.custAddr || '-'} / ${data.custGate || '-'}
    `;
    document.getElementById('invoice-content').innerHTML = `
        <p>နေ့စွဲ: ${data.date}</p>
        <div style="border-bottom:1px solid #eee; padding:5px 0;">
            <b>${data.itemName}</b><br>
            ${data.qty} pk x ${data.price} Ks
        </div>
        <h3 style="text-align:right;">စုစုပေါင်း: ${data.total.toLocaleString()} Ks</h3>
    `;
    const modal = document.getElementById('invoice-preview-container');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function closeInvoice() {
    const modal = document.getElementById('invoice-preview-container');
    modal.style.display = 'none';
    modal.classList.add('hidden');
}

function saveInvoiceAsImage() {
    const card = document.getElementById('invoice-card');
    html2canvas(card).then(canvas => {
        const link = document.createElement('a');
        link.download = `Invoice_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

function addNewItem() {
    const name = document.getElementById('newItemName').value;
    const price = document.getElementById('newItemPrice').value;
    if(!name) return;
    items.push({ name, price: parseFloat(price), qty: 0 });
    saveAllData();
    renderItemsTable();
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemPrice').value = '';
}

function addStockQty() {
    const name = document.getElementById('stockItemSelect').value;
    const qty = parseInt(document.getElementById('stockAddQty').value);
    const item = items.find(i => i.name === name);
    if(item && qty) {
        item.qty += qty;
        saveAllData();
        alert("စတော့တိုးပြီးပါပြီ");
        document.getElementById('stockAddQty').value = '';
        renderInventoryTable();
    }
}

function renderItemsTable() {
    document.getElementById('itemsTableBody').innerHTML = items.map((i, idx) => `
        <tr><td>${i.name}</td><td>${i.price}</td><td><button onclick="deleteItem(${idx})" style="color:red; border:none; background:none;">ဖျက်</button></td></tr>
    `).join('');
}

function renderInventoryTable() {
    document.getElementById('inventoryTableBody').innerHTML = items.map(i => `
        <tr><td>${i.name}</td><td>${i.qty} pk</td></tr>
    `).join('');
}

function renderReportsTable() {
    document.getElementById('salesTableBody').innerHTML = sales.map(s => `
        <tr>
            <td><b>${s.custName || 'အမည်မသိ'}</b><br><small>${s.itemName}</small></td>
            <td style="text-align:right;">
                ${s.total.toLocaleString()} Ks<br>
                <button onclick="openInvoice(${s.id})" style="background:var(--p-blue); color:white; border:none; border-radius:4px; padding:3px 8px; font-size:10px;">Invoice</button>
            </td>
        </tr>
    `).reverse().join('');
}

function refreshSelectors() {
    let opt = '<option value="">-- ရွေးပါ --</option>';
    items.forEach(i => opt += `<option value="${i.name}">${i.name}</option>`);
    document.getElementById('saleItemSelect').innerHTML = opt;
    document.getElementById('stockItemSelect').innerHTML = opt;
}

function updatePriceHint() {
    const item = items.find(i => i.name === document.getElementById('saleItemSelect').value);
    if(item) document.getElementById('salePrice').value = item.price;
}

function deleteItem(idx) {
    if(confirm("ဖျက်မှာလား?")) { items.splice(idx, 1); saveAllData(); renderItemsTable(); }
}

function clearInputs() {
    ['custName','custPh','custAddr','custGate','saleQty','salePrice','saleItemSelect'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function saveAllData() {
    localStorage.setItem('mha_items_v6', JSON.stringify(items));
    localStorage.setItem('mha_sales_v6', JSON.stringify(sales));
}
