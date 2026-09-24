import { supabase, isSupabaseConfigured } from './supabase';
import { productFromDb, productToDb, settingsFromDb, settingsToDb, orderFromDb, orderToDb } from './mappers';

// ─── Settings ────────────────────────────────────────────────────────────────

export async function fetchSettings() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error || !data) return null;
    return settingsFromDb(data);
  } catch {
    return null;
  }
}

export async function saveSettings(settings) {
  if (!isSupabaseConfigured) return;
  try {
    const row = { id: 1, ...settingsToDb(settings) };
    await supabase.from('store_settings').upsert(row);
  } catch (e) {
    console.error('saveSettings error:', e);
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (error || !data) return null;
    return data.map(productFromDb);
  } catch {
    return null;
  }
}

export async function saveProducts(products) {
  if (!isSupabaseConfigured) return;
  try {
    // Get IDs currently in DB
    const { data: existing } = await supabase.from('products').select('id');
    const existingIds = existing?.map(r => r.id) || [];
    const newIds = products.map(p => p.id);

    // Delete products removed from catalog
    const toDelete = existingIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('products').delete().in('id', toDelete);
    }

    // Upsert all current products
    if (products.length > 0) {
      await supabase.from('products').upsert(products.map(productToDb));
    }
  } catch (e) {
    console.error('saveProducts error:', e);
  }
}

export async function updateProductStock(productId, newStock) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('products').update({ stock: newStock }).eq('id', productId);
  } catch (e) {
    console.error('updateProductStock error:', e);
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function fetchOrders() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
    if (error || !data) return null;
    return data.map(orderFromDb);
  } catch {
    return null;
  }
}

export async function addOrderToDb(order) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('orders').insert(orderToDb(order));
  } catch (e) {
    console.error('addOrderToDb error:', e);
  }
}

export async function updateOrderStatusInDb(orderId, status) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('orders').update({ status }).eq('id', orderId);
  } catch (e) {
    console.error('updateOrderStatusInDb error:', e);
  }
}
