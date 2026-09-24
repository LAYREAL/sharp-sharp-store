export function productFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    image: row.image,
    media: row.media || [],
    description: row.description || '',
    stock: row.stock,
    isStockTracked: row.is_stock_tracked,
    sizes: row.sizes || []
  };
}

export function productToDb(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image,
    media: p.media || [],
    description: p.description || '',
    stock: p.stock,
    is_stock_tracked: p.isStockTracked,
    sizes: p.sizes || []
  };
}

export function settingsFromDb(row) {
  return {
    storeName: row.store_name,
    tagline: row.tagline,
    whatsappNumber: row.whatsapp_number,
    currency: row.currency,
    momoNumber: row.momo_number,
    momoName: row.momo_name,
    momoNetwork: row.momo_network,
    adminPin: row.admin_pin
  };
}

export function settingsToDb(s) {
  return {
    id: 'main',
    store_name: s.storeName,
    tagline: s.tagline,
    whatsapp_number: s.whatsappNumber,
    currency: s.currency,
    momo_number: s.momoNumber,
    momo_name: s.momoName,
    momo_network: s.momoNetwork,
    admin_pin: s.adminPin
  };
}

export function orderFromDb(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    notes: row.notes || '',
    items: row.items || [],
    totalAmount: Number(row.total_amount),
    status: row.status,
    date: row.created_at
  };
}

export function orderToDb(o) {
  return {
    id: o.id,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_address: o.customerAddress,
    notes: o.notes || '',
    items: o.items,
    total_amount: o.totalAmount,
    status: o.status
  };
}
