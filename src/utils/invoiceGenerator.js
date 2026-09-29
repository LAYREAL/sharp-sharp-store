// Escape user-supplied text before placing it into the invoice HTML
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const num = (v) => Number(v || 0).toLocaleString();

export function printInvoice(order, storeSettings) {
  const { storeName, momoNumber, momoName, momoNetwork, currency } = storeSettings;
  const origin = window.location.origin;
  const invoiceDate = new Date(order.date || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) {
    alert("Please allow popups to generate customer invoices.");
    return;
  }

  const itemsHtml = (order.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${esc(item.name)}</strong>
          ${item.selectedSize || item.size ? `<br><small style="color:#666">Variant/Size: ${esc(item.selectedSize || item.size)}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${esc(item.quantity)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${esc(currency)} ${num(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${esc(currency)} ${num((item.price || 0) * (item.quantity || 0))}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice - ${esc(order.id)} | ${esc(storeName)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 0 16px 40px; margin: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .topbar { position: sticky; top: 0; z-index: 10; background: #fff; display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; max-width: 720px; margin-left: auto; margin-right: auto; }
          .btn { border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; }
          .btn-back { background: #eef2f9; color: #0F3460; }
          .btn-print { background: #0F3460; color: #fff; }
          .invoice-box { max-width: 720px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .logo { width: 210px; max-width: 100%; height: auto; display: block; }
          .invoice-badge { display: inline-block; background: #e6edf6; color: #0F3460; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 10px; }
          .info-table { width: 100%; margin-bottom: 20px; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
          .items-table th { background: #f8fafc; color: #475569; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
          .total-box { margin-top: 25px; text-align: right; font-size: 16px; border-top: 2px solid #1e293b; padding-top: 15px; }
          .footer-note { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; }
          .bottom-actions { max-width: 720px; margin: 20px auto 0; display: flex; justify-content: center; }
          @media (max-width: 520px) {
            .invoice-box { padding: 18px; }
            .header-table, .header-table tbody, .header-table tr, .header-table td { display: block; width: 100%; text-align: left !important; }
            .header-table td + td { margin-top: 14px; }
            .items-table { font-size: 12px; }
            .items-table th, .items-table td { padding: 8px 6px !important; }
          }
          @media print { .no-print { display: none !important; } body { padding: 0; } .invoice-box { border: none; box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="topbar no-print">
          <button class="btn btn-back" onclick="goBack()">&larr; Back to store</button>
          <button class="btn btn-print" onclick="window.print()">Print / Save PDF</button>
        </div>

        <div class="invoice-box">
          <table class="header-table">
            <tr>
              <td>
                <img class="logo" src="${origin}/wordmark-full-600.png" alt="${esc(storeName)}" />
              </td>
              <td style="text-align: right;">
                <div class="invoice-badge">OFFICIAL INVOICE</div>
                <h3 style="margin: 8px 0 4px; font-size: 18px;">${esc(order.id)}</h3>
                <div style="font-size: 12px; color: #64748b;">${esc(invoiceDate)}</div>
              </td>
            </tr>
          </table>

          <div class="section-title">Customer Details</div>
          <table class="info-table">
            <tr>
              <td><strong>Customer Name:</strong> ${esc(order.customerName)}</td>
              <td style="text-align: right;"><strong>Phone:</strong> ${esc(order.customerPhone)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 4px;"><strong>Delivery Address:</strong> ${esc(order.customerAddress)}</td>
            </tr>
          </table>

          <div class="section-title">Order Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Price</th>
                <th style="text-align: right; width: 110px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            <span style="color: #64748b;">Total Amount Due: </span>
            <strong style="font-size: 22px; color: #0F3460; margin-left: 10px;">${esc(currency)} ${num(order.totalAmount)}</strong>
          </div>

          <div style="margin-top: 20px; background: #f8fafc; padding: 12px 15px; border-radius: 8px; font-size: 13px;">
            <strong>Payment Method:</strong> Mobile Money (${esc(momoNetwork)})<br>
            <strong>MoMo Account:</strong> ${esc(momoNumber)} (${esc(momoName)})<br>
            <strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">${esc(order.status || 'Paid')}</span>
          </div>

          <div class="footer-note">
            Thank you for shopping with <strong>${esc(storeName)}</strong>!<br>
            For inquiries or support, please contact us on WhatsApp.
          </div>
        </div>

        <div class="bottom-actions no-print">
          <button class="btn btn-back" onclick="goBack()">&larr; Back to store</button>
        </div>

        <script>
          function goBack() {
            // Opened from the store in a new tab/window: just close it and the store is right there.
            try { window.close(); } catch (e) {}
            // If the browser refuses to close it (e.g. installed app / in-app browser), go to the store instead.
            setTimeout(function () { window.location.href = ${JSON.stringify(origin + '/')}; }, 250);
          }
        </script>
      </body>
    </html>
  `;

  invoiceWindow.document.write(htmlContent);
  invoiceWindow.document.close();
}
