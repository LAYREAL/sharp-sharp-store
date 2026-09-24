export function printInvoice(order, storeSettings) {
  const { storeName, tagline, momoNumber, momoName, momoNetwork, currency } = storeSettings;
  const invoiceDate = new Date(order.date || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const invoiceWindow = window.open('', '_blank', 'width=800,height=900');
  if (!invoiceWindow) {
    alert("Please allow popups to generate customer invoices.");
    return;
  }

  const itemsHtml = order.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
          ${item.selectedSize || item.size ? `<br><small style="color:#666">Variant/Size: ${item.selectedSize || item.size}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currency} ${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${currency} ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${order.id} | ${storeName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
          .invoice-box { max-width: 720px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .brand-title { font-size: 26px; font-weight: 800; color: #4f46e5; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .brand-tagline { font-size: 12px; color: #64748b; margin-top: 4px; }
          .invoice-badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 10px; }
          .info-table { width: 100%; margin-bottom: 20px; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
          .items-table th { background: #f8fafc; color: #475569; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
          .total-box { margin-top: 25px; text-align: right; font-size: 16px; border-top: 2px solid #1e293b; padding-top: 15px; }
          .footer-note { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; }
          .no-print { margin-bottom: 20px; text-align: right; }
          .btn-print { background: #4f46e5; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; }
          @media print { .no-print { display: none; } body { padding: 0; } .invoice-box { border: none; box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">Print / Save PDF Invoice</button>
        </div>

        <div class="invoice-box">
          <table class="header-table">
            <tr>
              <td>
                <h1 class="brand-title">${storeName}</h1>
                <div class="brand-tagline">${tagline}</div>
              </td>
              <td style="text-align: right;">
                <div class="invoice-badge">OFFICIAL INVOICE</div>
                <h3 style="margin: 8px 0 4px; font-size: 18px;">${order.id}</h3>
                <div style="font-size: 12px; color: #64748b;">${invoiceDate}</div>
              </td>
            </tr>
          </table>

          <div class="section-title">Customer Details</div>
          <table class="info-table">
            <tr>
              <td><strong>Customer Name:</strong> ${order.customerName}</td>
              <td style="text-align: right;"><strong>Phone:</strong> ${order.customerPhone}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 4px;"><strong>Delivery Address:</strong> ${order.customerAddress}</td>
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
            <strong style="font-size: 22px; color: #4f46e5; margin-left: 10px;">${currency} ${order.totalAmount.toLocaleString()}</strong>
          </div>

          <div style="margin-top: 20px; background: #f8fafc; padding: 12px 15px; border-radius: 8px; font-size: 13px;">
            <strong>Payment Method:</strong> Mobile Money (${momoNetwork})<br>
            <strong>MoMo Account:</strong> ${momoNumber} (${momoName})<br>
            <strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">${order.status || 'Paid'}</span>
          </div>

          <div class="footer-note">
            Thank you for shopping with <strong>${storeName}</strong>!<br>
            For inquiries or support, please contact us on WhatsApp.
          </div>
        </div>
      </body>
    </html>
  `;

  invoiceWindow.document.write(htmlContent);
  invoiceWindow.document.close();
}
