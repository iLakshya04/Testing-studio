import { useEffect, useMemo, useState } from 'react'
import { formatINR, formatNumber } from './utils'

type Page = 'home' | 'invoice' | 'stock' | 'collections' | 'gst'

type InvoiceItem = { name: string; quantity: number; rate: number; gst: number }
type Sale = { id: string; date: string; customer: string; amount: number; payment: 'UPI' | 'Cash' | 'Credit'; gst: number }
type StockItem = { id: string; name: string; sku: string; stock: number; unit: string; salePrice: number }

const initialSales: Sale[] = [
  { id: 'INV-1043', date: 'Today', customer: 'Mehta Stores', amount: 12480, payment: 'UPI', gst: 2246.44 },
  { id: 'INV-1042', date: 'Today', customer: 'Anita General', amount: 5860, payment: 'Cash', gst: 1054.8 },
  { id: 'INV-1041', date: 'Today', customer: 'Kumar & Sons', amount: 8300, payment: 'Credit', gst: 1494 },
]

const initialStock: StockItem[] = [
  { id: '1', name: 'A2 Milk 1L', sku: 'DAIRY-101', stock: 18, unit: 'packs', salePrice: 72 },
  { id: '2', name: 'Atta 5kg', sku: 'GROC-204', stock: 7, unit: 'bags', salePrice: 260 },
  { id: '3', name: 'Sunflower Oil 1L', sku: 'GROC-118', stock: 3, unit: 'bottles', salePrice: 180 },
  { id: '4', name: 'Rice 10kg', sku: 'GROC-301', stock: 22, unit: 'bags', salePrice: 520 },
]

function useSavedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue] as const
}

function ToolTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <header className="tool-header">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
      {action}
    </header>
  )
}

function AppHeader({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  const nav: Array<{ page: Page; label: string }> = [
    { page: 'home', label: 'Overview' },
    { page: 'invoice', label: 'Invoices' },
    { page: 'stock', label: 'Stock' },
    { page: 'collections', label: 'Collections' },
  ]
  return (
    <header className="app-header">
      <button className="brand" onClick={() => setPage('home')} aria-label="Go to overview">
        <span className="brand-mark">V</span>
        <span>Vyapar<span> Desk</span></span>
      </button>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map((item) => (
          <button key={item.page} className={page === item.page ? 'active' : ''} onClick={() => setPage(item.page)}>
            {item.label}
          </button>
        ))}
      </nav>
      <button className="profile-button" aria-label="Open business profile">SR</button>
    </header>
  )
}

function Home({ setPage, sales, stock }: { setPage: (page: Page) => void; sales: Sale[]; stock: StockItem[] }) {
  const todaySales = sales.reduce((sum, sale) => sum + sale.amount, 0)
  const due = sales.filter((sale) => sale.payment === 'Credit').reduce((sum, sale) => sum + sale.amount, 0)
  const lowStock = stock.filter((item) => item.stock <= 10).length

  return (
    <main className="page home-page">
      <section className="business-hero">
        <div>
          <p className="eyebrow">SATURDAY, 22 NOVEMBER</p>
          <h1>Good morning, Sharma General Store.</h1>
          <p>Here is your shop summary for today.</p>
        </div>
        <button className="primary-button wide" onClick={() => setPage('invoice')}>＋ New invoice</button>
      </section>

      <section className="metric-grid" aria-label="Business summary">
        <article className="metric-card dark">
          <p>Today's sales</p>
          <strong>{formatINR(todaySales)}</strong>
          <small>↑ 12% from yesterday</small>
        </article>
        <article className="metric-card">
          <p>Cash collected</p>
          <strong>{formatINR(sales.filter((s) => s.payment !== 'Credit').reduce((sum, s) => sum + s.amount, 0))}</strong>
          <small>{sales.filter((s) => s.payment !== 'Credit').length} paid transactions</small>
        </article>
        <article className="metric-card">
          <p>Outstanding</p>
          <strong>{formatINR(due)}</strong>
          <small>2 customers with dues</small>
        </article>
        <article className="metric-card alert">
          <p>Low stock</p>
          <strong>{lowStock} items</strong>
          <small>Needs restocking</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel recent-sales">
          <div className="panel-heading">
            <div><p className="eyebrow">TODAY</p><h2>Recent sales</h2></div>
            <button onClick={() => setPage('collections')}>View all</button>
          </div>
          <div className="sales-table" role="table" aria-label="Recent sales">
            {sales.slice(0, 4).map((sale) => (
              <div className="sale-row" role="row" key={sale.id}>
                <span className="avatar">{sale.customer.slice(0, 1)}</span>
                <span><strong>{sale.customer}</strong><small>{sale.id}</small></span>
                <span className={`payment ${sale.payment.toLowerCase()}`}>{sale.payment}</span>
                <strong>{formatINR(sale.amount)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel action-card">
          <p className="eyebrow">FAST ACTIONS</p>
          <button onClick={() => setPage('invoice')}><span>＋</span><div><strong>Create invoice</strong><small>Add items and share on WhatsApp</small></div><b>→</b></button>
          <button onClick={() => setPage('stock')}><span>▦</span><div><strong>Update stock</strong><small>Restock or adjust quantities</small></div><b>→</b></button>
          <button onClick={() => setPage('gst')}><span>₹</span><div><strong>GST summary</strong><small>View today's tax totals</small></div><b>→</b></button>
        </article>
      </section>
    </main>
  )
}

function InvoicePage({ sales, setSales }: { sales: Sale[]; setSales: (sales: Sale[]) => void }) {
  const [customer, setCustomer] = useState('Walk-in customer')
  const [phone, setPhone] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: 'A2 Milk 1L', quantity: 2, rate: 72, gst: 0 },
  ])

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const gst = items.reduce((sum, item) => sum + item.quantity * item.rate * item.gst / 100, 0)
  const total = subtotal + gst

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const saveInvoice = () => {
    const invoice: Sale = {
      id: `INV-${1044 + sales.length}`,
      date: 'Today',
      customer,
      amount: total,
      payment: 'UPI',
      gst,
    }
    setSales([invoice, ...sales])
  }

  const shareWhatsApp = () => {
    const text = `Invoice for ${customer}\nSubtotal: ${formatINR(subtotal)}\nGST: ${formatINR(gst)}\nTotal: ${formatINR(total)}`
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="page tool-page">
      <ToolTitle eyebrow="BILLING" title="Create invoice" action={<button className="secondary-button" onClick={() => window.print()}>Print</button>} />
      <div className="invoice-layout">
        <section className="panel invoice-form">
          <div className="form-grid">
            <label className="field"><span>Customer name</span><input value={customer} onChange={(e) => setCustomer(e.target.value)} /></label>
            <label className="field"><span>WhatsApp number</span><input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="91XXXXXXXXXX" /></label>
          </div>
          <div className="invoice-items">
            <div className="invoice-item-heading"><span>Item</span><span>Qty</span><span>Rate</span><span>GST</span><span></span></div>
            {items.map((item, index) => (
              <div className="invoice-item" key={index}>
                <input aria-label="Item name" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} />
                <input aria-label="Quantity" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} />
                <input aria-label="Rate" type="number" min="0" value={item.rate} onChange={(e) => updateItem(index, 'rate', Number(e.target.value))} />
                <select aria-label="GST rate" value={item.gst} onChange={(e) => updateItem(index, 'gst', Number(e.target.value))}>
                  {[0, 5, 12, 18, 28].map((rate) => <option value={rate} key={rate}>{rate}%</option>)}
                </select>
                <button aria-label="Remove item" onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>×</button>
              </div>
            ))}
          </div>
          <button className="text-button" onClick={() => setItems((current) => [...current, { name: '', quantity: 1, rate: 0, gst: 0 }])}>＋ Add item</button>
        </section>

        <aside className="panel invoice-summary">
          <p className="eyebrow">INVOICE TOTAL</p>
          <h2>{formatINR(total)}</h2>
          <div className="breakdown dark-breakdown">
            <div><span>Subtotal</span><strong>{formatINR(subtotal)}</strong></div>
            <div><span>GST</span><strong>{formatINR(gst)}</strong></div>
            <div><span>Round off</span><strong>₹0</strong></div>
          </div>
          <button className="primary-button" onClick={saveInvoice}>Save invoice</button>
          <button className="whatsapp-button" onClick={shareWhatsApp}>Share on WhatsApp</button>
        </aside>
      </div>
    </main>
  )
}

function StockPage({ stock, setStock }: { stock: StockItem[]; setStock: (stock: StockItem[]) => void }) {
  const [query, setQuery] = useState('')
  const visible = stock.filter((item) => `${item.name} ${item.sku}`.toLowerCase().includes(query.toLowerCase()))

  const adjustStock = (id: string, change: number) => {
    setStock(stock.map((item) => item.id === id ? { ...item, stock: Math.max(0, item.stock + change) } : item))
  }

  return (
    <main className="page tool-page">
      <ToolTitle eyebrow="INVENTORY" title="Stock control" action={<button className="primary-button compact">＋ Add product</button>} />
      <section className="panel stock-panel">
        <div className="stock-toolbar">
          <label className="search stock-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product or SKU" /></label>
          <span>{visible.length} products</span>
        </div>
        <div className="stock-table">
          <div className="stock-heading"><span>Product</span><span>SKU</span><span>Available</span><span>Sale price</span><span>Action</span></div>
          {visible.map((item) => (
            <div className="stock-row" key={item.id}>
              <span><strong>{item.name}</strong><small>{item.unit}</small></span>
              <span>{item.sku}</span>
              <span className={item.stock <= 10 ? 'stock-low' : ''}><strong>{item.stock}</strong> {item.unit}</span>
              <strong>{formatINR(item.salePrice)}</strong>
              <span className="stock-actions">
                <button aria-label={`Reduce ${item.name}`} onClick={() => adjustStock(item.id, -1)}>−</button>
                <button aria-label={`Increase ${item.name}`} onClick={() => adjustStock(item.id, 1)}>＋</button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function CollectionsPage({ sales }: { sales: Sale[] }) {
  const collected = sales.filter((s) => s.payment !== 'Credit').reduce((sum, s) => sum + s.amount, 0)
  const credit = sales.filter((s) => s.payment === 'Credit').reduce((sum, s) => sum + s.amount, 0)

  return (
    <main className="page tool-page">
      <ToolTitle eyebrow="PAYMENTS" title="Collections" />
      <section className="collection-summary">
        <article><p>Collected today</p><strong>{formatINR(collected)}</strong></article>
        <article><p>Outstanding</p><strong>{formatINR(credit)}</strong></article>
        <article><p>UPI</p><strong>{formatINR(sales.filter((s) => s.payment === 'UPI').reduce((sum, s) => sum + s.amount, 0))}</strong></article>
        <article><p>Cash</p><strong>{formatINR(sales.filter((s) => s.payment === 'Cash').reduce((sum, s) => sum + s.amount, 0))}</strong></article>
      </section>
      <section className="panel stock-panel">
        <div className="panel-heading"><div><p className="eyebrow">TODAY</p><h2>Transactions</h2></div></div>
        <div className="transaction-table">
          {sales.map((sale) => (
            <div className="transaction-row" key={sale.id}>
              <span className="avatar">{sale.customer.slice(0, 1)}</span>
              <span><strong>{sale.customer}</strong><small>{sale.id} · {sale.date}</small></span>
              <span className={`payment ${sale.payment.toLowerCase()}`}>{sale.payment}</span>
              <strong>{formatINR(sale.amount)}</strong>
              {sale.payment === 'Credit' && <button className="whatsapp-small">Remind</button>}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function GSTPage({ sales }: { sales: Sale[] }) {
  const taxable = sales.reduce((sum, sale) => sum + (sale.amount - sale.gst), 0)
  const gst = sales.reduce((sum, sale) => sum + sale.gst, 0)
  return (
    <main className="page tool-page">
      <ToolTitle eyebrow="NOVEMBER 2026" title="GST summary" />
      <section className="gst-grid">
        <article className="metric-card dark"><p>Taxable sales</p><strong>{formatINR(taxable)}</strong></article>
        <article className="metric-card"><p>GST collected</p><strong>{formatINR(gst)}</strong></article>
        <article className="metric-card"><p>CGST · SGST</p><strong>{formatINR(gst / 2)} / {formatINR(gst / 2)}</strong></article>
      </section>
      <section className="panel gst-breakdown">
        <div className="panel-heading"><div><p className="eyebrow">DRAFT RETURN</p><h2>Today’s tax ledger</h2></div><button className="secondary-button">Export CSV</button></div>
        {sales.map((sale) => (
          <div className="gst-row" key={sale.id}>
            <span><strong>{sale.id}</strong><small>{sale.customer}</small></span>
            <span>Taxable <strong>{formatINR(sale.amount - sale.gst)}</strong></span>
            <span>GST <strong>{formatINR(sale.gst)}</strong></span>
          </div>
        ))}
      </section>
    </main>
  )
}

function MobileNav({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  const items: Array<{ page: Page; label: string; icon: string }> = [
    { page: 'home', label: 'Overview', icon: '⌂' },
    { page: 'invoice', label: 'Invoice', icon: '+' },
    { page: 'stock', label: 'Stock', icon: '▦' },
    { page: 'collections', label: 'Payments', icon: '₹' },
  ]
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {items.map((item) => (
        <button key={item.page} className={page === item.page ? 'active' : ''} onClick={() => setPage(item.page)}>
          <span>{item.icon}</span><small>{item.label}</small>
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [sales, setSales] = useSavedState<Sale[]>('vyapar-sales', initialSales)
  const [stock, setStock] = useSavedState<StockItem[]>('vyapar-stock', initialStock)

  return (
    <div className="app">
      <AppHeader page={page} setPage={setPage} />
      {page === 'home' && <Home setPage={setPage} sales={sales} stock={stock} />}
      {page === 'invoice' && <InvoicePage sales={sales} setSales={setSales} />}
      {page === 'stock' && <StockPage stock={stock} setStock={setStock} />}
      {page === 'collections' && <CollectionsPage sales={sales} />}
      {page === 'gst' && <GSTPage sales={sales} />}
      <MobileNav page={page} setPage={setPage} />
    </div>
  )
}
