import { useState } from 'react'
import type { Device } from '../../../shared/types/dashboard.types'
import ModalBase from '../../../shared/components/ModalBase'
import { getStockClass, getStockStatus, INV_CATEGORIES, INV_CONDITIONS, INV_WAREHOUSES } from './inventoryHelpers'

interface ViewProps  { device: Device; onClose: () => void }
interface EditProps  { device: Device; onClose: () => void; onSave: (d: Device) => void }
interface AdjProps   { device: Device; onClose: () => void; onSave: (d: Device) => void }
interface AddProps {
  onClose: () => void
  onSave: (input: {
    brand: string
    model: string
    originalSerialNumber?: string
    condition: string
    batteryHealth: number
    basePrice: number
    price: number
    warehouse: string
    stock: number
  }) => Promise<void>
}

export function AddDeviceModal({ onClose, onSave }: AddProps) {
  const [form, setForm] = useState({
    brand: '',
    model: '',
    originalSerialNumber: '',
    condition: 'GOOD',
    batteryHealth: '100',
    basePrice: '',
    price: '',
    warehouse: INV_WAREHOUSES[0],
    stock: '1',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [key]: e.target.value }))

  async function handleSave() {
    if (!form.brand.trim() || !form.model.trim() || !form.basePrice || !form.price) {
      setError('Brand, model, acquisition cost, and selling price are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        brand: form.brand.trim(),
        model: form.model.trim(),
        originalSerialNumber: form.originalSerialNumber.trim() || undefined,
        condition: form.condition,
        batteryHealth: Number(form.batteryHealth),
        basePrice: Number(form.basePrice),
        price: Number(form.price),
        warehouse: form.warehouse,
        stock: Number(form.stock),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this device.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalBase title="Add Device to Inventory" onClose={onClose} footer={
      <>
        <button type="button" className="um-btn-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="um-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Adding...' : 'Add Device'}
        </button>
      </>
    }>
      <p className="um-form-note">Register a device intake record. It will be saved to the database immediately.</p>
      {error && <div className="inv-form-error" role="alert">{error}</div>}
      <div className="um-form-grid">
        <label className="um-form-field">
          <span className="um-form-label">Brand</span>
          <input className="um-form-input" value={form.brand} onChange={set('brand')} placeholder="e.g. Apple" />
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Model</span>
          <input className="um-form-input" value={form.model} onChange={set('model')} placeholder="e.g. iPhone 14 Pro" />
        </label>
        <label className="um-form-field" style={{ gridColumn: '1 / -1' }}>
          <span className="um-form-label">Serial Number</span>
          <input className="um-form-input" value={form.originalSerialNumber} onChange={set('originalSerialNumber')} placeholder="Optional device serial number" />
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Condition</span>
          <select className="um-form-input" value={form.condition} onChange={set('condition')}>
            {['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'].map((condition) => <option key={condition}>{condition}</option>)}
          </select>
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Battery Health (%)</span>
          <input className="um-form-input" type="number" min="1" max="100" value={form.batteryHealth} onChange={set('batteryHealth')} />
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Warehouse</span>
          <select className="um-form-input" value={form.warehouse} onChange={set('warehouse')}>
            {INV_WAREHOUSES.map((warehouse) => <option key={warehouse}>{warehouse}</option>)}
          </select>
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Initial Stock</span>
          <input className="um-form-input" type="number" min="0" step="1" value={form.stock} onChange={set('stock')} />
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Acquisition Cost ($)</span>
          <input className="um-form-input" type="number" min="0" step="0.01" value={form.basePrice} onChange={set('basePrice')} placeholder="0.00" />
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Selling Price ($)</span>
          <input className="um-form-input" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
        </label>
      </div>
    </ModalBase>
  )
}

export function DeviceViewModal({ device, onClose }: ViewProps) {
  return (
    <ModalBase title="Device Details" onClose={onClose} footer={
      <button type="button" className="um-btn-secondary" onClick={onClose}>Close</button>
    }>
      <div className="inv-view-hero">
        <div className="inv-view-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div>
          <p className="inv-view-model">{device.model}</p>
          <p className="inv-view-sku">{device.sku}</p>
        </div>
      </div>
      <div className="um-info-grid">
        <div className="um-info-item"><span className="um-info-label">Category</span><span className="um-info-value">{device.category}</span></div>
        <div className="um-info-item"><span className="um-info-label">Condition</span><span className="um-info-value">{device.condition}</span></div>
        <div className="um-info-item"><span className="um-info-label">Warehouse</span><span className="um-info-value">{device.warehouse}</span></div>
        <div className="um-info-item"><span className="um-info-label">List Price</span><span className="um-info-value">${device.listPrice.toLocaleString()}</span></div>
        <div className="um-info-item"><span className="um-info-label">Stock</span><span className="um-info-value">{device.stock} units</span></div>
        <div className="um-info-item">
          <span className="um-info-label">Status</span>
          <span className={`stock-pill ${getStockClass(device.stock)}`}>{getStockStatus(device.stock)}</span>
        </div>
      </div>
    </ModalBase>
  )
}

export function DeviceEditModal({ device, onClose, onSave }: EditProps) {
  const [form, setForm] = useState({
    model: device.model,
    category: device.category,
    condition: device.condition,
    warehouse: device.warehouse,
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <ModalBase title="Edit Device" onClose={onClose} footer={
      <>
        <button type="button" className="um-btn-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="um-btn-primary" onClick={() => { if (!form.model.trim()) return; onSave({ ...device, ...form }); onClose() }}>Save Changes</button>
      </>
    }>
      <p className="um-form-note">SKU: <strong>{device.sku}</strong></p>
      <div className="um-form-grid">
        <label className="um-form-field" style={{ gridColumn: '1 / -1' }}>
          <span className="um-form-label">Model Name</span>
          <input className="um-form-input" type="text" value={form.model} onChange={set('model')} />
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Category</span>
          <select className="um-form-input" value={form.category} onChange={set('category')}>
            {INV_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="um-form-field">
          <span className="um-form-label">Condition</span>
          <select className="um-form-input" value={form.condition} onChange={set('condition')}>
            {INV_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="um-form-field" style={{ gridColumn: '1 / -1' }}>
          <span className="um-form-label">Warehouse</span>
          <select className="um-form-input" value={form.warehouse} onChange={set('warehouse')}>
            {INV_WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
          </select>
        </label>
      </div>
    </ModalBase>
  )
}

export function AdjustStockModal({ device, onClose, onSave }: AdjProps) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('Restock')
  const delta    = parseInt(amount, 10) || 0
  const newStock = Math.max(0, device.stock + delta)

  return (
    <ModalBase title="Adjust Stock" onClose={onClose} footer={
      <>
        <button type="button" className="um-btn-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="um-btn-primary" onClick={() => { if (delta === 0) return; onSave({ ...device, stock: newStock }); onClose() }} disabled={delta === 0}>Apply</button>
      </>
    }>
      <p className="um-form-note"><strong>{device.model}</strong> · {device.sku}</p>
      <div className="inv-adj-current">
        <span className="inv-adj-label">Current Stock</span>
        <span className="inv-adj-big">{device.stock} units</span>
      </div>
      <div className="inv-adj-row">
        <button type="button" className="inv-adj-btn" onClick={() => setAmount((a) => String((parseInt(a, 10) || 0) - 1))}>−</button>
        <input type="number" className="inv-adj-input" value={amount} placeholder="0" onChange={(e) => setAmount(e.target.value)} />
        <button type="button" className="inv-adj-btn" onClick={() => setAmount((a) => String((parseInt(a, 10) || 0) + 1))}>+</button>
      </div>
      {delta !== 0 && (
        <div className={`inv-adj-preview inv-adj-preview--${delta > 0 ? 'add' : 'remove'}`}>
          {delta > 0 ? `+${delta}` : delta} units → New total: <strong>{newStock}</strong>
          <span className={`stock-pill ${getStockClass(newStock)}`}>{getStockStatus(newStock)}</span>
        </div>
      )}
      <label className="um-form-field" style={{ marginTop: '8px' }}>
        <span className="um-form-label">Reason</span>
        <select className="um-form-input" value={reason} onChange={(e) => setReason(e.target.value)}>
          {['Restock', 'Damaged / Write-off', 'Transfer In', 'Transfer Out', 'Correction'].map((r) => <option key={r}>{r}</option>)}
        </select>
      </label>
    </ModalBase>
  )
}
