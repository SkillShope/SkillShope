"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Pencil,
  Trash2,
  Lock,
  Loader2,
  ArrowLeft,
  Plus,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type { EstimateData, ContractData, LineItem } from "@/lib/estimate";
import { MAX_ESTIMATE_TITLE_LENGTH, MAX_ESTIMATE_NUMBER_LENGTH } from "@/lib/estimate";

type Props = {
  id: string;
  estimateNumber: string | null;
  jobDescription: string;
  data: EstimateData;
  contractData: ContractData | null;
  isPro: boolean;
  businessProfile: {
    businessName: string;
    businessPhone: string;
    businessEmail: string;
    licenseNumber: string;
  };
};

export function EstimateViewer({ id, estimateNumber: initialNumber, jobDescription, data, contractData, isPro, businessProfile }: Props) {
  const [estimate, setEstimate] = useState<EstimateData>({
    ...data,
    estimateTitle: data.estimateTitle ?? "ESTIMATE",
    taxPercent: data.taxPercent ?? 0,
    taxAmount: data.taxAmount ?? 0,
    subtotal: data.subtotal ?? (data.materialSubtotal + data.laborSubtotal + data.markupAmount),
  });
  const [estNumber, setEstNumber] = useState(initialNumber || "");
  const [contract, setContract] = useState<string | null>(contractData?.content || null);
  const [contractPreview, setContractPreview] = useState<string | null>(null);
  const [generatingContract, setGeneratingContract] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const updateEstimate = (updates: Partial<EstimateData>) => {
    const updated = { ...estimate, ...updates };
    updated.materialSubtotal = updated.lineItems.reduce((sum, item) => sum + item.total, 0);
    updated.laborSubtotal = updated.laborHours * updated.laborRate;
    updated.markupAmount = Math.round((updated.materialSubtotal + updated.laborSubtotal) * updated.markupPercent) / 100;
    updated.subtotal = Math.round((updated.materialSubtotal + updated.laborSubtotal + updated.markupAmount) * 100) / 100;
    updated.taxAmount = Math.round(updated.subtotal * (updated.taxPercent || 0)) / 100;
    updated.total = Math.round((updated.subtotal + updated.taxAmount) * 100) / 100;
    setEstimate(updated);
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    const items = [...estimate.lineItems];
    items[index] = { ...items[index], ...updates };
    items[index].total = Math.round(items[index].quantity * items[index].unitPrice * 100) / 100;
    updateEstimate({ lineItems: items });
  };

  const addLineItem = () => {
    updateEstimate({
      lineItems: [...estimate.lineItems, { description: "New item", quantity: 1, unit: "each", unitPrice: 0, total: 0 }],
    });
  };

  const removeLineItem = (index: number) => {
    updateEstimate({ lineItems: estimate.lineItems.filter((_, i) => i !== index) });
  };

  const save = async () => {
    setSaving(true);
    await fetch(`/api/estimate/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: estimate, estimateNumber: estNumber }),
    });
    setSaving(false);
    setEditing(false);
  };

  const generateContract = async () => {
    if (!isPro) {
      setContractPreview(
        `SERVICE AGREEMENT\n\nThis Service Agreement ("Agreement") is entered into between ${businessProfile.businessName || "[Your Business Name]"} ("Contractor") and ${estimate.customerName || "[Customer Name]"} ("Customer").\n\n1. SCOPE OF WORK\n${estimate.scopeOfWork}\n\n2. PRICE AND PAYMENT\nThe total price for the work described above is $${fmt(estimate.total)}...`
      );
      return;
    }

    setGeneratingContract(true);
    try {
      const res = await fetch(`/api/estimate/${id}/contract`, { method: "POST" });
      const result = await res.json();
      if (res.ok) {
        setContract(result.content);
      } else {
        setError(result.error || "Failed to generate contract");
      }
    } catch {
      setError("Failed to generate contract");
    }
    setGeneratingContract(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/estimate"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Estimates
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <input
                  type="text"
                  value={estimate.estimateTitle}
                  onChange={(e) => updateEstimate({ estimateTitle: e.target.value.slice(0, MAX_ESTIMATE_TITLE_LENGTH) })}
                  className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-lg font-bold focus:border-[var(--accent)] focus:outline-none"
                  placeholder="ESTIMATE"
                  maxLength={MAX_ESTIMATE_TITLE_LENGTH}
                />
                <input
                  type="text"
                  value={estNumber}
                  onChange={(e) => setEstNumber(e.target.value.slice(0, MAX_ESTIMATE_NUMBER_LENGTH))}
                  className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-sm font-medium text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="EST-001"
                  maxLength={MAX_ESTIMATE_NUMBER_LENGTH}
                />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{estimate.estimateTitle || "Estimate"}</h1>
                {estNumber && <span className="rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-sm font-medium text-[var(--text-secondary)]">{estNumber}</span>}
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{jobDescription.slice(0, 100)}{jobDescription.length > 100 ? "..." : ""}</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <button onClick={save} disabled={saving} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-card)] transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          <a
            href={`/api/estimate/${id}/pdf`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Download className="h-4 w-4" /> PDF
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Scope */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Scope of Work</h2>
        {editing ? (
          <textarea value={estimate.scopeOfWork} onChange={(e) => updateEstimate({ scopeOfWork: e.target.value })} rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm leading-relaxed focus:border-[var(--accent)] focus:outline-none" />
        ) : (
          <p className="text-sm leading-relaxed">{estimate.scopeOfWork}</p>
        )}
      </section>

      {/* Line items */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Materials</h2>
          {editing && (
            <button onClick={addLineItem} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)]">Description</th>
                <th className="w-20 px-3 py-2 text-right text-xs font-medium text-[var(--text-secondary)]">Qty (Ea.)</th>
                <th className="w-24 px-3 py-2 text-right text-xs font-medium text-[var(--text-secondary)]">Price</th>
                <th className="w-24 px-3 py-2 text-right text-xs font-medium text-[var(--text-secondary)]">Total</th>
                {editing && <th className="w-10 px-2 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {estimate.lineItems.map((item, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-1.5">
                    {editing ? (
                      <input type="text" value={item.description} onChange={(e) => updateLineItem(i, { description: e.target.value })} className="w-full bg-transparent text-sm focus:outline-none" />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {editing ? (
                      <input type="number" value={item.quantity} onChange={(e) => updateLineItem(i, { quantity: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent text-right text-sm focus:outline-none" step="0.5" />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {editing ? (
                      <input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(i, { unitPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent text-right text-sm focus:outline-none" step="0.01" />
                    ) : (
                      `$${fmt(item.unitPrice)}`
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium">${fmt(item.total)}</td>
                  {editing && (
                    <td className="px-2 py-1.5">
                      <button onClick={() => removeLineItem(i)} className="rounded p-1 text-[var(--text-secondary)] hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Labor */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Labor</h2>
        {editing ? (
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--text-secondary)]" />
              <input type="number" value={estimate.laborHours} onChange={(e) => updateEstimate({ laborHours: parseFloat(e.target.value) || 0 })} className="w-16 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-center text-sm focus:border-[var(--accent)] focus:outline-none" step="0.5" />
              <span className="text-sm text-[var(--text-secondary)]">hrs</span>
            </div>
            <span className="text-[var(--text-secondary)]">&times;</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[var(--text-secondary)]">$</span>
              <input type="number" value={estimate.laborRate} onChange={(e) => updateEstimate({ laborRate: parseFloat(e.target.value) || 0 })} className="w-20 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-center text-sm focus:border-[var(--accent)] focus:outline-none" step="5" />
              <span className="text-sm text-[var(--text-secondary)]">/hr</span>
            </div>
            <span className="ml-auto text-sm font-semibold">${fmt(estimate.laborSubtotal)}</span>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm">
            {estimate.laborHours} hrs @ ${fmt(estimate.laborRate)}/hr = <span className="font-semibold">${fmt(estimate.laborSubtotal)}</span>
          </div>
        )}
      </section>

      {/* Totals */}
      <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="divide-y divide-[var(--border)]">
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-[var(--text-secondary)]">Materials</span>
            <span>${fmt(estimate.materialSubtotal)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-[var(--text-secondary)]">Labor</span>
            <span>${fmt(estimate.laborSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            {editing ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-secondary)]">Markup</span>
                  <input type="number" value={estimate.markupPercent} onChange={(e) => updateEstimate({ markupPercent: parseFloat(e.target.value) || 0 })} className="w-14 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-center text-xs focus:border-[var(--accent)] focus:outline-none" step="1" />
                  <span className="text-xs text-[var(--text-secondary)]">%</span>
                </div>
                <span>${fmt(estimate.markupAmount)}</span>
              </>
            ) : (
              <>
                <span className="text-[var(--text-secondary)]">Markup ({estimate.markupPercent}%)</span>
                <span>${fmt(estimate.markupAmount)}</span>
              </>
            )}
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span>${fmt(estimate.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            {editing ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-secondary)]">Tax</span>
                  <input type="number" value={estimate.taxPercent} onChange={(e) => updateEstimate({ taxPercent: parseFloat(e.target.value) || 0 })} className="w-14 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-center text-xs focus:border-[var(--accent)] focus:outline-none" step="0.1" />
                  <span className="text-xs text-[var(--text-secondary)]">%</span>
                </div>
                <span>${fmt(estimate.taxAmount)}</span>
              </>
            ) : (
              <>
                <span className="text-[var(--text-secondary)]">Tax ({estimate.taxPercent || 0}%)</span>
                <span>${fmt(estimate.taxAmount)}</span>
              </>
            )}
          </div>
          <div className="flex justify-between px-4 py-4">
            <span className="font-bold">Total</span>
            <span className="text-xl font-bold text-[var(--accent)]">${fmt(estimate.total)}</span>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Notes</h2>
        {editing ? (
          <textarea value={estimate.notes} onChange={(e) => updateEstimate({ notes: e.target.value })} rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm leading-relaxed focus:border-[var(--accent)] focus:outline-none" />
        ) : estimate.notes ? (
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{estimate.notes}</p>
        ) : (
          <p className="text-sm italic text-[var(--text-secondary)]">No notes</p>
        )}
      </section>

      {/* Contract section */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-start gap-4">
          <FileText className="mt-0.5 h-8 w-8 shrink-0 text-[var(--accent)]" />
          <div className="flex-1">
            <h2 className="text-lg font-bold">Service Agreement</h2>

            {contract ? (
              <div className="mt-4">
                <pre className="whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm leading-relaxed">{contract}</pre>
                <a
                  href={`/api/estimate/${id}/contract/pdf`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Contract PDF
                </a>
              </div>
            ) : contractPreview && !isPro ? (
              <div className="mt-4">
                <div className="relative">
                  <pre className="whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm leading-relaxed">{contractPreview}</pre>
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                </div>
                <div className="mt-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-center">
                  <Lock className="mx-auto h-5 w-5 text-[var(--accent)]" />
                  <p className="mt-2 text-sm font-medium">Upgrade to Pro to generate contracts</p>
                  <a href="/estimate/pro" className="mt-3 inline-block rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors">
                    Upgrade to Pro - $19/mo
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Turn this estimate into a binding contract with scope, payment terms, warranty, and liability protection.</p>
                <button
                  onClick={generateContract}
                  disabled={generatingContract}
                  className={`mt-4 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${isPro ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]" : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-secondary)]"}`}
                >
                  {generatingContract ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="h-4 w-4" /> Generate Contract {!isPro && <span className="ml-1 rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">PRO</span>}</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
