// Maps between Supabase DB rows (snake_case) and app objects (camelCase)

export function productFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.category || 'General',
    price: Number(row.price),
    stock: row.stock || 0,
    isStockTracked: row.is_stock_tracked || false,
    sizes: row.sizes || [],
    image: row.image || '',
    media: row.media || [],
  };
}

export function productToDb(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    category: p.category || 'General',
    price: p.price,
    stock: p.stock || 0,
    is_stock_tracked: p.isStockTracked || false,
    sizes: p.sizes || [],
    image: p.image || '',
    media: p.media || [],
  };
}

export function settingsFromDb(row) {
  return {
    storeName: row.store_name,
    tagline: row.tagline,
    whatsappNumber: row.whatsapp_number,
    momoNumber: row.momo_number,
    momoName: row.momo_name,
    momoNetwork: row.momo_network || 'MTN Mobile Money',
    currency: row.currency,
    adminPin: row.admin_pin,
  };
}

export function settingsToDb(s) {
  return {
    store_name: s.storeName,
    tagline: s.tagline,
    whatsapp_number: s.whatsappNumber,
    momo_number: s.momoNumber,
    momo_name: s.momoName,
    momo_network: s.momoNetwork || 'MTN Mobile Money',
    currency: s.currency,
    admin_pin: s.adminPin,
    updated_at: new Date().toISOString(),
  };
}

export function orderFromDb(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address || '',
    notes: row.notes || '',
    items: row.items || [],
    totalAmount: Number(row.total_amount),
    status: row.status,
    date: row.date,
  };
}

export function orderToDb(o) {
  return {
    id: o.id,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_address: o.customerAddress || '',
    notes: o.notes || '',
    items: o.items,
    total_amount: o.totalAmount,
    status: o.status,
    date: o.date,
  };
}
