export function generateWhatsAppLink(storeSettings, cartItems, totalAmount, customerDetails) {
  const { storeName, whatsappNumber, momoNumber, momoName, momoNetwork, currency } = storeSettings;
  const { name, phone, address, notes } = customerDetails;

  const itemsListFormatted = cartItems
    .map(item => `• ${item.quantity}x ${item.name}${item.selectedSize ? ` [Size: ${item.selectedSize}]` : ''} (${currency} ${(item.price * item.quantity).toLocaleString()})`)
    .join('\n');

  const cleanWhatsAppNumber = (whatsappNumber || '').replace(/[^0-9]/g, '');

  const messageText = `*NEW ORDER - ${storeName.toUpperCase()}*
----------------------------------
*CUSTOMER INFORMATION:*
• *Name:* ${name}
• *Phone:* ${phone}
• *Delivery Address:* ${address}${notes ? `\n• *Note:* ${notes}` : ''}

*ORDER ITEMS:*
${itemsListFormatted}

----------------------------------
*Total Amount:* ${currency} ${totalAmount.toLocaleString()}
*Payment Method:* ${momoNetwork}
*MoMo Account:* ${momoNumber} (${momoName})

----------------------------------
*Status:* Payment sent via Mobile Money. Please verify and confirm delivery timeframe. Thank you!`;

  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanWhatsAppNumber}?text=${encodedText}`;
}

export function generateCustomerInvoiceWhatsAppLink(order, storeSettings) {
  const { storeName, currency } = storeSettings;
  const cleanCustomerPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');

  const itemsListFormatted = (order.items || [])
    .map(item => `• ${item.quantity}x ${item.name}${item.selectedSize ? ` [Size: ${item.selectedSize}]` : ''} (${currency} ${(item.price * item.quantity).toLocaleString()})`)
    .join('\n');

  const invoiceMessageText = `*PAYMENT CONFIRMED & INVOICE - ${storeName.toUpperCase()}*
----------------------------------
Dear *${order.customerName}*,

Your Mobile Money payment for Order *#${order.id}* has been verified!

*OFFICIAL INVOICE DETAILS:*
• *Invoice / Order ID:* ${order.id}
• *Date:* ${new Date(order.date || Date.now()).toLocaleDateString()}
• *Delivery Address:* ${order.customerAddress}

*CONFIRMED ITEMS:*
${itemsListFormatted}

----------------------------------
*Total Amount Paid:* ${currency} ${order.totalAmount.toLocaleString()}
*Status:* Paid & Verified (Processing for Delivery)

Thank you for shopping with *${storeName}*! You can view or download your printable receipt anytime in your store history.`;

  const encodedText = encodeURIComponent(invoiceMessageText);
  return `https://wa.me/${cleanCustomerPhone}?text=${encodedText}`;
}
