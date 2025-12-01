// ===================================
// State
// ===================================
let invoices = [];
let currentInvoice = null;
let itemCounter = 0;
let logoDataUrl = null;

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadInvoices();
    initializeForm();
    attachEventListeners();
    setDefaultDate();
    generateInvoiceNumber();
    addInitialItem();
});

function initializeForm() {
    // Any additional initialization
}

function setDefaultDate() {
    const dateInput = document.getElementById('invoiceDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function generateInvoiceNumber() {
    const invoiceNumber = document.getElementById('invoiceNumber');
    if (!invoiceNumber.value) {
        invoiceNumber.value = 'INV-' + Date.now().toString().slice(-8);
    }
}

// ===================================
// Event Listeners
// ===================================
function attachEventListeners() {
    // Navigation
    document.getElementById('newInvoiceBtn').addEventListener('click', () => {
        resetForm();
        showView('invoiceForm');
    });

    document.getElementById('viewHistoryBtn').addEventListener('click', async () => {
        await loadInvoices();
        renderInvoiceHistory();
        showView('invoiceHistory');
    });

    document.getElementById('viewBackupsBtn').addEventListener('click', async () => {
        await loadBackups();
        showView('backupManager');
    });

    document.getElementById('backToFormBtn').addEventListener('click', () => {
        showView('invoiceForm');
    });

    document.getElementById('backToFormFromBackupBtn').addEventListener('click', () => {
        showView('invoiceForm');
    });

    document.getElementById('createBackupBtn').addEventListener('click', createManualBackup);

    // Items
    document.getElementById('addItemBtn').addEventListener('click', addItem);

    // Payment method
    document.getElementById('paymentMethod').addEventListener('change', (e) => {
        const financingGroup = document.getElementById('financingCompanyGroup');
        financingGroup.style.display = e.target.value === 'financing' ? 'block' : 'none';
    });

    // Tax location
    document.getElementById('taxLocation').addEventListener('change', calculateTotals);

    // Actions
    document.getElementById('saveInvoiceBtn').addEventListener('click', saveInvoice);
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
}

// ===================================
// Line Items
// ===================================
function addItem() {
    const tbody = document.getElementById('itemsTableBody');
    const row = document.createElement('tr');
    row.dataset.itemId = itemCounter++;

    row.innerHTML = `
        <td><input type="text" class="item-description" placeholder="Sofa, dining table, etc." /></td>
        <td><input type="text" class="item-sku" placeholder="SKU-123" /></td>
        <td><input type="number" class="item-quantity" value="1" min="1" /></td>
        <td><input type="number" class="item-price" value="0" min="0" step="0.01" /></td>
        <td class="item-amount">$0.00</td>
        <td><button class="delete-item-btn" onclick="deleteItem(this)">×</button></td>
    `;

    tbody.appendChild(row);

    const quantity = row.querySelector('.item-quantity');
    const price = row.querySelector('.item-price');
    quantity.addEventListener('input', () => updateItemAmount(row));
    price.addEventListener('input', () => updateItemAmount(row));
}

function addInitialItem() {
    addItem();
}

function deleteItem(button) {
    button.closest('tr').remove();
    calculateTotals();
}

function updateItemAmount(row) {
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const amount = quantity * price;
    row.querySelector('.item-amount').textContent = formatCurrency(amount);
    calculateTotals();
}

// ===================================
// Calculations
// ===================================
function calculateTotals() {
    let subtotal = 0;

    document.querySelectorAll('#itemsTableBody tr').forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += quantity * price;
    });

    const taxLocation = document.getElementById('taxLocation').value;
    const taxRate = taxLocation === 'texas' ? 0.0825 : 0;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ===================================
// Form Management
// ===================================
function resetForm() {
    document.getElementById('invoiceNumber').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerCity').value = '';
    document.getElementById('customerState').value = '';
    document.getElementById('customerZip').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('taxLocation').value = 'texas';
    document.getElementById('paymentMethod').value = '';
    document.getElementById('financingCompany').value = '';
    document.getElementById('invoiceNotes').value = '';

    document.getElementById('itemsTableBody').innerHTML = '';
    itemCounter = 0;

    setDefaultDate();
    generateInvoiceNumber();
    addInitialItem();
    currentInvoice = null;
}

function collectItems() {
    const items = [];
    document.querySelectorAll('#itemsTableBody tr').forEach(row => {
        const description = row.querySelector('.item-description').value.trim();
        const sku = row.querySelector('.item-sku').value.trim();
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;

        if (description && quantity > 0) {
            items.push({ description, sku, quantity, price, amount: quantity * price });
        }
    });
    return items;
}

function getSubtotal() {
    const text = document.getElementById('subtotal').textContent;
    return parseFloat(text.replace(/[$,]/g, ''));
}

function getTax() {
    const text = document.getElementById('taxAmount').textContent;
    return parseFloat(text.replace(/[$,]/g, ''));
}

function getTotal() {
    const text = document.getElementById('totalAmount').textContent;
    return parseFloat(text.replace(/[$,]/g, ''));
}

// ===================================
// API Functions
// ===================================
const API_BASE = '/api';

async function loadInvoices() {
    try {
        const response = await fetch(`${API_BASE}/invoices`);
        if (!response.ok) throw new Error('Failed to load invoices');
        invoices = await response.json();
    } catch (error) {
        console.error('Error loading invoices:', error);
        invoices = [];
    }
}

async function saveInvoice() {
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Please enter customer name');
        return;
    }

    const items = collectItems();
    if (items.length === 0) {
        alert('Please add at least one item');
        return;
    }

    const invoice = {
        id: currentInvoice ? currentInvoice.id : Date.now().toString(),
        invoiceNumber: document.getElementById('invoiceNumber').value,
        date: document.getElementById('invoiceDate').value,
        customer: {
            name: customerName,
            address: document.getElementById('customerAddress').value,
            city: document.getElementById('customerCity').value,
            state: document.getElementById('customerState').value,
            zip: document.getElementById('customerZip').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value
        },
        items: items,
        taxLocation: document.getElementById('taxLocation').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        financingCompany: document.getElementById('financingCompany').value,
        notes: document.getElementById('invoiceNotes').value,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
        createdAt: currentInvoice ? currentInvoice.createdAt : new Date().toISOString()
    };

    try {
        const url = `${API_BASE}/invoices${currentInvoice ? '/' + invoice.id : ''}`;
        const method = currentInvoice ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice)
        });

        if (!response.ok) throw new Error('Failed to save invoice');

        await loadInvoices();
        showSuccessMessage('Invoice saved successfully!');

        setTimeout(() => {
            renderInvoiceHistory();
            showView('invoiceHistory');
        }, 1000);
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving invoice. Please try again.');
    }
}

// ===================================
// Invoice History
// ===================================
function renderInvoiceHistory() {
    const listContainer = document.getElementById('invoiceList');

    if (invoices.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📄</div>
                <h2>No invoices yet</h2>
                <p>Create your first invoice to get started!</p>
            </div>
        `;
        return;
    }

    const sorted = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    listContainer.innerHTML = sorted.map(invoice => `
        <div class="invoice-card" onclick="loadInvoice('${invoice.id}')">
            <div class="invoice-card-info">
                <h3>${invoice.invoiceNumber}</h3>
                <p>${invoice.customer.name}</p>
            </div>
            <div class="invoice-card-info">
                <p>Date: ${formatDate(invoice.date)}</p>
                <p>Payment: ${getPaymentMethodLabel(invoice.paymentMethod)}</p>
            </div>
            <div class="invoice-card-total">${formatCurrency(invoice.total)}</div>
            <div class="invoice-card-actions" onclick="event.stopPropagation()">
                <button class="icon-btn" onclick="downloadInvoicePDF('${invoice.id}')" title="Download PDF">📄</button>
                <button class="icon-btn delete" onclick="deleteInvoice('${invoice.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

function loadInvoice(id) {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    currentInvoice = invoice;

    document.getElementById('invoiceNumber').value = invoice.invoiceNumber;
    document.getElementById('invoiceDate').value = invoice.date;
    document.getElementById('customerName').value = invoice.customer.name;
    document.getElementById('customerAddress').value = invoice.customer.address;
    document.getElementById('customerCity').value = invoice.customer.city;
    document.getElementById('customerState').value = invoice.customer.state;
    document.getElementById('customerZip').value = invoice.customer.zip;
    document.getElementById('customerPhone').value = invoice.customer.phone;
    document.getElementById('customerEmail').value = invoice.customer.email;
    document.getElementById('taxLocation').value = invoice.taxLocation;
    document.getElementById('paymentMethod').value = invoice.paymentMethod;
    document.getElementById('financingCompany').value = invoice.financingCompany || '';
    document.getElementById('invoiceNotes').value = invoice.notes;

    if (invoice.paymentMethod === 'financing') {
        document.getElementById('financingCompanyGroup').style.display = 'block';
    }

    document.getElementById('itemsTableBody').innerHTML = '';
    itemCounter = 0;
    invoice.items.forEach(item => {
        addItem();
        const lastRow = document.querySelector('#itemsTableBody tr:last-child');
        lastRow.querySelector('.item-description').value = item.description;
        lastRow.querySelector('.item-sku').value = item.sku;
        lastRow.querySelector('.item-quantity').value = item.quantity;
        lastRow.querySelector('.item-price').value = item.price;
        updateItemAmount(lastRow);
    });

    showView('invoiceForm');
}

async function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
        const response = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete invoice');

        await loadInvoices();
        renderInvoiceHistory();
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting invoice. Please try again.');
    }
}

// ===================================
// PDF Generation
// ===================================
function generatePDF() {
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Please enter customer name before generating PDF');
        return;
    }

    const items = collectItems();
    if (items.length === 0) {
        alert('Please add at least one item before generating PDF');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const invoiceData = {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        date: document.getElementById('invoiceDate').value,
        customer: {
            name: customerName,
            address: document.getElementById('customerAddress').value,
            city: document.getElementById('customerCity').value,
            state: document.getElementById('customerState').value,
            zip: document.getElementById('customerZip').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value
        },
        items: items,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
        taxLocation: document.getElementById('taxLocation').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        financingCompany: document.getElementById('financingCompany').value,
        notes: document.getElementById('invoiceNotes').value
    };

    createPDFContent(doc, invoiceData);

    const filename = `Invoice_${invoiceData.invoiceNumber}_${invoiceData.customer.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    showSuccessMessage('PDF generated successfully!');
}

function downloadInvoicePDF(id) {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    createPDFContent(doc, invoice);

    const filename = `Invoice_${invoice.invoiceNumber}_${invoice.customer.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
}

function createPDFContent(doc, data) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 15;

    // Add Logo
    const logoImg = document.querySelector('.business-logo');
    if (logoImg && !logoDataUrl) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = logoImg.naturalWidth;
        canvas.height = logoImg.naturalHeight;
        ctx.drawImage(logoImg, 0, 0);
        logoDataUrl = canvas.toDataURL('image/png');
    }

    if (logoDataUrl && logoImg) {
        const logoWidth = 80;
        const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth;
        doc.addImage(logoDataUrl, 'PNG', (pageWidth - logoWidth) / 2, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 10;
    }

    // Business Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('402 S El Paso St, El Paso, TX 79901', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Phone: (915) 730-0160', pageWidth / 2, yPos, { align: 'center' });

    // Line separator
    yPos += 10;
    doc.setDrawColor(220, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Invoice details
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${data.invoiceNumber}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Date: ${formatDate(data.date)}`, pageWidth - 20, yPos, { align: 'right' });

    // Bill To
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(data.customer.name, 20, yPos);
    if (data.customer.address) {
        yPos += 5;
        doc.text(data.customer.address, 20, yPos);
    }
    if (data.customer.city || data.customer.state || data.customer.zip) {
        yPos += 5;
        doc.text(`${data.customer.city}, ${data.customer.state} ${data.customer.zip}`, 20, yPos);
    }
    if (data.customer.phone) {
        yPos += 5;
        doc.text(`Phone: ${data.customer.phone}`, 20, yPos);
    }
    if (data.customer.email) {
        yPos += 5;
        doc.text(`Email: ${data.customer.email}`, 20, yPos);
    }

    // Items table
    yPos += 15;
    doc.setFillColor(220, 0, 0);
    doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, yPos);
    doc.text('SKU', 100, yPos);
    doc.text('Qty', 135, yPos);
    doc.text('Price', 155, yPos);
    doc.text('Amount', pageWidth - 25, yPos, { align: 'right' });

    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    data.items.forEach((item, index) => {
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
        }
        doc.text(item.description, 25, yPos);
        doc.text(item.sku || '-', 100, yPos);
        doc.text(item.quantity.toString(), 135, yPos);
        doc.text(formatCurrency(item.price), 155, yPos);
        doc.text(formatCurrency(item.amount), pageWidth - 25, yPos, { align: 'right' });
        yPos += 8;
    });

    // Totals
    yPos += 10;
    const totalsX = pageWidth - 80;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(formatCurrency(data.subtotal), pageWidth - 25, yPos, { align: 'right' });

    yPos += 6;
    const taxLabel = data.taxLocation === 'texas' ? 'Tax (8.25%)' : 'Tax';
    doc.text(taxLabel + ':', totalsX, yPos);
    doc.text(formatCurrency(data.tax), pageWidth - 25, yPos, { align: 'right' });

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', totalsX, yPos);
    doc.text(formatCurrency(data.total), pageWidth - 25, yPos, { align: 'right' });

    // Payment info
    yPos += 15;
    doc.setFontSize(10);
    doc.text('Payment Terms: Due Upon Receipt', 20, yPos);

    if (data.paymentMethod) {
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        let paymentText = 'Payment Method: ' + getPaymentMethodLabel(data.paymentMethod);
        if (data.paymentMethod === 'financing' && data.financingCompany) {
            paymentText += ' - ' + getFinancingCompanyLabel(data.financingCompany);
        }
        doc.text(paymentText, 20, yPos);
    }

    // Notes
    if (data.notes) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 40);
        doc.text(splitNotes, 20, yPos);
    }

    // Page 1 Footer
    let footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.setFontSize(7);
    doc.text('(See Terms and Conditions on reverse side)', pageWidth / 2, footerY + 4, { align: 'center' });

    // === PAGE 2: Terms & Conditions ===
    doc.addPage();
    yPos = 20;

    if (logoDataUrl && logoImg) {
        const logoWidth = 50;
        const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth;
        doc.addImage(logoDataUrl, 'PNG', (pageWidth - logoWidth) / 2, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 10;
    }

    doc.setDrawColor(220, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 0, 0);
    doc.text('TERMS AND CONDITIONS OF SALE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    // All Sales Are Final
    doc.setFont('helvetica', 'bold');
    doc.text('All Sales Are Final:', 20, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    let text = doc.splitTextToSize('We do not accept returns, exchanges, or cancellations once the merchandise has been received.', pageWidth - 40);
    doc.text(text, 20, yPos);
    yPos += text.length * 4 + 5;

    // Limited Warranty
    doc.setFont('helvetica', 'bold');
    doc.text('Limited Warranty:', 20, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    text = doc.splitTextToSize('We offer a warranty covering factory defects only. Any defect must be reported immediately upon delivery or pickup. This warranty does not cover damages caused by misuse, accidents, or normal wear and tear.', pageWidth - 40);
    doc.text(text, 20, yPos);
    yPos += text.length * 4 + 5;

    // Inspection
    doc.setFont('helvetica', 'bold');
    doc.text('Inspection:', 20, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    text = doc.splitTextToSize("It is the customer's responsibility to inspect the merchandise upon receipt. By signing this receipt, the customer acknowledges receiving the product in good condition and with all its parts.", pageWidth - 40);
    doc.text(text, 20, yPos);
    yPos += text.length * 4 + 5;

    // Customer Pickup
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Pickup:', 20, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    text = doc.splitTextToSize('El Paso Furniture & Style is not responsible for any damage incurred to the merchandise during transportation if the customer chooses to pick up and transport the items themselves.', pageWidth - 40);
    doc.text(text, 20, yPos);
    yPos += text.length * 4 + 15;

    // Signature section
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER ACKNOWLEDGMENT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    text = doc.splitTextToSize('I acknowledge that I have read, understood, and agree to the above Terms and Conditions. I confirm that I have inspected the merchandise and received it in good condition.', pageWidth - 40);
    doc.text(text, 20, yPos);
    yPos += text.length * 4 + 15;

    // Signature lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 95, yPos);
    yPos += 5;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Customer Signature', 20, yPos);

    doc.line(pageWidth - 95, yPos - 5, pageWidth - 20, yPos - 5);
    doc.text('Date', pageWidth - 95, yPos);

    yPos += 12;
    doc.line(20, yPos, 95, yPos);
    yPos += 5;
    doc.text('Print Name', 20, yPos);

    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${data.invoiceNumber}`, pageWidth - 95, yPos, { align: 'left' });

    // Page 2 Footer
    footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('El Paso Furniture & Style | 402 S El Paso St, El Paso, TX 79901 | (915) 730-0160', pageWidth / 2, footerY, { align: 'center' });
}

// ===================================
// Backup Management
// ===================================
async function loadBackups() {
    try {
        const response = await fetch(`${API_BASE}/backups`);
        if (!response.ok) throw new Error('Failed to load backups');
        const backups = await response.json();
        renderBackupList(backups);
    } catch (error) {
        console.error('Error loading backups:', error);
        showError('Failed to load backups');
    }
}

function renderBackupList(backups) {
    const listContainer = document.getElementById('backupList');

    if (backups.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h2>No backups yet</h2>
                <p>Backups will be created automatically every 24 hours or you can create one manually.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = backups.map(backup => `
        <div class="invoice-card" style="cursor: default;">
            <div class="invoice-card-info">
                <h3>💾 ${backup.filename}</h3>
                <p>Created: ${new Date(backup.created).toLocaleString()}</p>
            </div>
            <div class="invoice-card-info">
                <p>Size: ${formatBytes(backup.size)}</p>
            </div>
            <div class="invoice-card-actions">
                <button class="btn btn-accent" onclick="restoreBackup('${backup.filename}')">
                    ♻️ Restore
                </button>
            </div>
        </div>
    `).join('');
}

async function createManualBackup() {
    if (!confirm('📦 Create a backup of the current database?')) return;

    try {
        const response = await fetch(`${API_BASE}/backup`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to create backup');

        const result = await response.json();
        showSuccessMessage(`Backup created: ${result.backup}`);
        await loadBackups();
    } catch (error) {
        console.error('Error creating backup:', error);
        alert('❌ Error creating backup. Please try again.');
    }
}

async function restoreBackup(filename) {
    if (!confirm(`⚠️ WARNING: This will replace the current database with the backup "${filename}".

All current invoices will be replaced with the invoices from this backup.

The server will restart automatically. Are you sure?`)) return;

    try {
        const response = await fetch(`${API_BASE}/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
        });

        if (!response.ok) throw new Error('Failed to restore backup');

        // Show message that server is restarting
        showSuccessMessage('✅ Database restored! Server restarting...');

        // Wait for server to restart (Docker will auto-restart)
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } catch (error) {
        console.error('Error restoring backup:', error);
        alert('❌ Error restoring backup. Please try again.');
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showError(message) {
    alert('❌ ' + message);
}

// ===================================
// Utilities
// ===================================
function showView(viewId) {
    document.getElementById('invoiceForm').style.display = 'none';
    document.getElementById('invoiceHistory').style.display = 'none';
    document.getElementById('backupManager').style.display = 'none';
    document.getElementById(viewId).style.display = 'block';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getPaymentMethodLabel(method) {
    const labels = { 'cash': 'Cash', 'card': 'Card', 'financing': 'Financing' };
    return labels[method] || method;
}

function getFinancingCompanyLabel(company) {
    const labels = {
        'progressive': 'Progressive Leasing',
        'acima': 'Acima',
        'snap': 'Snap Finance',
        'american': 'American First Finance',
        'synchrony': 'Synchrony Bank'
    };
    return labels[company] || company;
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #DC0000 0%, #B00000 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
