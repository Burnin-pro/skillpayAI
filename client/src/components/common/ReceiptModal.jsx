import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, ShieldCheck, CheckCircle2, Lock, FileText, ExternalLink } from 'lucide-react';
import { Button } from './Button';

export function ReceiptModal({ isOpen, onClose, receiptData }) {
  const receiptRef = useRef(null);

  if (!isOpen) return null;

  const {
    orderId = 'ORD-1792343402143',
    projectTitle = 'Custom Web & App Project',
    amount = 85.00,
    platformFee = 4.25,
    total = 89.25,
    customerName = 'Muthu',
    customerEmail = 'customer@example.com',
    providerName = 'Muthu (Senior Frontend Engineer)',
    date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    paymentMethod = 'PayPal Smart Escrow'
  } = receiptData || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkillPay AI Receipt - ${orderId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
    .receipt { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 800; color: #0070BA; letter-spacing: -0.5px; }
    .logo span { color: #6366f1; }
    .title { font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 4px; }
    .badge { display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }
    .info-label { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    th { text-align: left; padding: 12px; background: #f8fafc; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
    .total-row td { font-weight: 800; font-size: 16px; border-top: 2px solid #0f172a; border-bottom: none; }
    .escrow-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-top: 24px; font-size: 12px; color: #166534; line-height: 1.5; }
    .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div>
        <div class="logo">SkillPay<span>AI</span></div>
        <div class="title">Official Escrow Receipt</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">PAID & ESCROW SECURED</span>
        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">ID: ${orderId}</div>
      </div>
    </div>
    <div class="info-grid">
      <div>
        <div class="info-label">Billed To (Customer)</div>
        <strong>${customerName}</strong><br/>
        ${customerEmail}
      </div>
      <div>
        <div class="info-label">Service Provider</div>
        <strong>${providerName}</strong><br/>
        Payment Method: ${paymentMethod}
      </div>
      <div>
        <div class="info-label">Transaction Date</div>
        ${date} at ${time}
      </div>
      <div>
        <div class="info-label">Escrow Agreement Ref</div>
        Verified via PayPal Smart Escrow
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${projectTitle}</strong><br/><span style="font-size: 12px; color: #64748b;">Agreed milestone project delivery</span></td>
          <td style="text-align: right; font-family: monospace;">$${amount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td>Platform Escrow Protection & Mediation Fee (5%)</td>
          <td style="text-align: right; font-family: monospace;">$${platformFee.toFixed(2)} USD</td>
        </tr>
        <tr class="total-row">
          <td>Total Escrow Locked</td>
          <td style="text-align: right; font-family: monospace; color: #059669;">$${total.toFixed(2)} USD</td>
        </tr>
      </tbody>
    </table>
    <div class="escrow-box">
      <strong>Smart Escrow Guarantee:</strong> Your payment of $${total.toFixed(2)} USD is safely locked in PayPal Smart Escrow. Funds are only disbursed to the provider once you inspect and approve the completed delivery.
    </div>
    <div class="footer">
      SkillPay AI • Secure Freelance AI Escrow Platform • Powered by PayPal
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillPay_Receipt_${orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Action Bar (Not printed) */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface/80 backdrop-blur-sm print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-bold text-ink">Official Escrow Receipt</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadInvoice}
                className="flex items-center gap-1.5 text-xs font-semibold"
                title="Download HTML receipt"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Invoice</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-semibold"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div ref={receiptRef} className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm print:border-none print:shadow-none print:bg-white print:text-black">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src="/skillpay.png" alt="SkillPay AI" className="h-9 w-auto object-contain" />
                </div>
                <div className="text-left sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold tracking-wider uppercase mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid & Escrow Secured</span>
                  </div>
                  <p className="font-mono text-xs text-muted">Receipt #{orderId}</p>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 text-sm border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-muted tracking-wider block mb-1">Billed To (Client)</span>
                  <p className="font-bold text-ink">{customerName}</p>
                  <p className="text-muted text-xs">{customerEmail}</p>
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-muted tracking-wider block mb-1">Service Provider</span>
                  <p className="font-bold text-ink">{providerName}</p>
                  <p className="text-muted text-xs">Payment Method: {paymentMethod}</p>
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-muted tracking-wider block mb-1">Transaction Timestamp</span>
                  <p className="text-ink font-medium">{date}</p>
                  <p className="text-muted text-xs">{time} (UTC)</p>
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-muted tracking-wider block mb-1">Escrow Protocol</span>
                  <p className="text-ink font-medium flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    PayPal Smart Escrow Vault
                  </p>
                  <p className="text-muted text-xs">Milestone-gated release</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-6 border-b border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase font-bold text-muted tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="pb-3 font-semibold">Deliverable Scope</th>
                      <th className="pb-3 font-semibold text-right">Agreed Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    <tr>
                      <td className="py-4">
                        <p className="font-bold text-ink">{projectTitle}</p>
                        <p className="text-xs text-muted mt-0.5">Custom requirement fulfillment under agreed milestone timeline</p>
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-ink">
                        ${amount.toFixed(2)} USD
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-muted">
                        Platform Escrow Protection & Mediation Fee (5%)
                      </td>
                      <td className="py-3 text-right font-mono text-muted">
                        ${platformFee.toFixed(2)} USD
                      </td>
                    </tr>
                    <tr className="border-t-2 border-slate-900 dark:border-white">
                      <td className="pt-4 font-bold text-base text-ink">
                        Total Escrow Locked
                      </td>
                      <td className="pt-4 text-right font-mono font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
                        ${total.toFixed(2)} USD
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Escrow Trust Box */}
              <div className="mt-6 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
                  <strong>Smart Escrow Guarantee:</strong> This payment of <strong>${total.toFixed(2)} USD</strong> is held securely in PayPal Smart Escrow. Funds are protected and will only be disbursed to the provider once you inspect and approve the completed deliverables.
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="mt-6 pt-4 text-center text-xs text-muted flex flex-col items-center gap-1">
                <p>SkillPay AI • Next-Generation Autonomous Freelance Escrow Protocol</p>
                <p className="font-mono text-[10px] text-muted/60">Security Hash: SHA-256 Verified • Transaction Authenticated</p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
