"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Download,
  FileText,
  Plus,
  Trash2,
  Clock,
  ImagePlus,
  X,
  Lock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { EstimateData, LineItem } from "@/lib/estimate";
import { JOB_TYPES, MAX_ESTIMATE_TITLE_LENGTH, MAX_ESTIMATE_NUMBER_LENGTH } from "@/lib/estimate";

type Props = {
  isPro: boolean;
  usage: { used: number; limit: number };
  businessProfile: {
    businessName: string;
    businessPhone: string;
    businessEmail: string;
    licenseNumber: string;
  };
  recentEstimates: {
    id: string;
    jobDescription: string;
    jobType: string;
    total: number;
    createdAt: string;
  }[];
};

export function EstimateTool({ isPro, usage, businessProfile, recentEstimates }: Props) {
  const [view, setView] = useState<"input" | "generating" | "editor">("input");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("repair");
  const [photos, setPhotos] = useState<string[]>([]);
  const [estimateId, setEstimateId] = useState<string | null>(null);
  const [estimateNumber, setEstimateNumber] = useState<string>("");
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [currentUsage, setCurrentUsage] = useState(usage);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [contractPreview, setContractPreview] = useState<string | null>(null);
  const [contractFull, setContractFull] = useState<string | null>(null);
  const [generatingContract, setGeneratingContract] = useState(false);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).slice(0, 3 - photos.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [...prev, reader.result as string].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
  }, [photos.length]);

  const generate = async () => {
    setError("");
    setGenerating(true);
    setView("generating");

    try {
      const res = await fetch("/api/estimate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobType,
          photoUrls: photos.length > 0 ? photos : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate estimate");
        setView("input");
        setGenerating(false);
        return;
      }

      setEstimateId(data.id);
      setEstimateNumber(data.estimateNumber || "");
      const est = data.data;
      setEstimate({
        ...est,
        estimateTitle: est.estimateTitle ?? "ESTIMATE",
        taxPercent: est.taxPercent ?? 0,
        taxAmount: est.taxAmount ?? 0,
        subtotal: est.subtotal ?? (est.materialSubtotal + est.laborSubtotal + est.markupAmount),
      });
      setCurrentUsage(data.usage);
      setView("editor");
    } catch {
      setError("Network error. Try again.");
      setView("input");
    }
    setGenerating(false);
  };

  const updateEstimate = (updates: Partial<EstimateData>) => {
    if (!estimate) return;
    const updated = { ...estimate, ...updates };

    // Recalculate totals
    updated.materialSubtotal = updated.lineItems.reduce((sum, item) => sum + item.total, 0);
    updated.laborSubtotal = updated.laborHours * updated.laborRate;
    updated.markupAmount =
      Math.round((updated.materialSubtotal + updated.laborSubtotal) * updated.markupPercent) / 100;
    updated.subtotal =
      Math.round((updated.materialSubtotal + updated.laborSubtotal + updated.markupAmount) * 100) / 100;
    updated.taxAmount = Math.round(updated.subtotal * (updated.taxPercent || 0)) / 100;
    updated.total = Math.round((updated.subtotal + updated.taxAmount) * 100) / 100;

    setEstimate(updated);
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    if (!estimate) return;
    const items = [...estimate.lineItems];
    items[index] = { ...items[index], ...updates };
    items[index].total = Math.round(items[index].quantity * items[index].unitPrice * 100) / 100;
    updateEstimate({ lineItems: items });
  };

  const addLineItem = () => {
    if (!estimate) return;
    updateEstimate({
      lineItems: [
        ...estimate.lineItems,
        { description: "New item", quantity: 1, unit: "each", unitPrice: 0, total: 0 },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    if (!estimate) return;
    updateEstimate({ lineItems: estimate.lineItems.filter((_, i) => i !== index) });
  };

  const saveEstimate = async () => {
    if (!estimateId || !estimate) return;
    setSaving(true);
    await fetch(`/api/estimate/${estimateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: estimate, estimateNumber }),
    });
    setSaving(false);
  };

  const downloadPdf = () => {
    if (!estimateId) return;
    window.open(`/api/estimate/${estimateId}/pdf`, "_blank");
  };

  const generateContract = async () => {
    if (!isPro) {
      // Show preview for free users
      setContractPreview(
        `SERVICE AGREEMENT\n\nThis Service Agreement ("Agreement") is entered into between ${businessProfile.businessName || "[Your Business Name]"} ("Contractor") and ${estimate?.customerName || "[Customer Name]"} ("Customer").\n\n1. SCOPE OF WORK\n${estimate?.scopeOfWork || ""}\n\n2. PRICE AND PAYMENT\nThe total price for the work described above is $${estimate?.total?.toLocaleString() || "0.00"}...`
      );
      return;
    }

    setGeneratingContract(true);
    try {
      const res = await fetch(`/api/estimate/${estimateId}/contract`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setContractFull(data.content);
      } else {
        setError(data.error || "Failed to generate contract");
      }
    } catch {
      setError("Failed to generate contract");
    }
    setGeneratingContract(false);
  };

  const startNew = () => {
    setView("input");
    setJobDescription("");
    setPhotos([]);
    setEstimate(null);
    setEstimateId(null);
    setEstimateNumber("");
    setContractPreview(null);
    setContractFull(null);
    setError("");
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── INPUT VIEW ──
  if (view === "input") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Estimate Generator</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Describe the job. Get a professional estimate in 60 seconds.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
            {error.includes("Upgrade to Pro") && (
              <a href="/estimate/pro" className="ml-2 font-semibold text-[var(--accent)] hover:underline">
                Upgrade now
              </a>
            )}
          </div>
        )}

        {/* Usage meter */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
          <div className="text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text)]">{currentUsage.used}</span> / {currentUsage.limit} estimates this month
            {!isPro && (
              <span className="ml-2 text-xs">(Free tier)</span>
            )}
          </div>
          {!isPro && (
            <a
              href="/estimate/pro"
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Upgrade to Pro
            </a>
          )}
        </div>

        <div className="space-y-5">
          {/* Job type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Job Type</label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setJobType(type.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    jobType === type.value
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Describe the Job</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm leading-relaxed focus:border-[var(--accent)] focus:outline-none"
              placeholder="Bathroom remodel, relocate toilet 3 feet, new shower valve, replace all supply lines from copper to PEX, 1960s house with cast iron drain"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Photos <span className="text-[var(--text-secondary)]">(optional, up to 3)</span>
            </label>
            <div className="flex gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative">
                  <img src={photo} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                  <ImagePlus className="h-5 w-5 text-[var(--text-secondary)]" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={jobDescription.trim().length < 10 || currentUsage.used >= currentUsage.limit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            Generate Estimate
          </button>
        </div>

        {/* Recent estimates */}
        {recentEstimates.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-bold">Recent Estimates</h2>
            <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
              {recentEstimates.map((est) => (
                <a
                  key={est.id}
                  href={`/estimate/${est.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-card)] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{est.jobDescription}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      {new Date(est.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" "}&middot;{" "}
                      {JOB_TYPES.find((t) => t.value === est.jobType)?.label || est.jobType}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-sm font-semibold">${fmt(est.total)}</span>
                    <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── GENERATING VIEW ──
  if (view === "generating") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-32 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
        <p className="mt-4 text-lg font-medium">Generating your estimate...</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Analyzing job details and calculating materials, labor, and pricing.
        </p>
      </div>
    );
  }

  // ── EDITOR VIEW ──
  if (!estimate) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={estimate.estimateTitle || "ESTIMATE"}
              onChange={(e) => updateEstimate({ estimateTitle: e.target.value.slice(0, MAX_ESTIMATE_TITLE_LENGTH) })}
              className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-lg font-bold focus:border-[var(--accent)] focus:outline-none"
              placeholder="ESTIMATE"
              maxLength={MAX_ESTIMATE_TITLE_LENGTH}
            />
            <input
              type="text"
              value={estimateNumber}
              onChange={(e) => setEstimateNumber(e.target.value.slice(0, MAX_ESTIMATE_NUMBER_LENGTH))}
              className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-sm font-medium text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="EST-001"
              maxLength={MAX_ESTIMATE_NUMBER_LENGTH}
            />
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{jobDescription.slice(0, 80)}{jobDescription.length > 80 ? "..." : ""}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveEstimate}
            disabled={saving}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-card)] transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={downloadPdf}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            onClick={startNew}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-card)] transition-colors"
          >
            New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Scope of work */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Scope of Work
        </h2>
        <textarea
          value={estimate.scopeOfWork}
          onChange={(e) => updateEstimate({ scopeOfWork: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm leading-relaxed focus:border-[var(--accent)] focus:outline-none"
        />
      </section>

      {/* Customer info (optional) */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Customer Name</label>
          <input
            type="text"
            value={estimate.customerName}
            onChange={(e) => updateEstimate({ customerName: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Customer Address</label>
          <input
            type="text"
            value={estimate.customerAddress}
            onChange={(e) => updateEstimate({ customerAddress: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </section>

      {/* Line items */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Materials
          </h2>
          <button
            onClick={addLineItem}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)]">Description</th>
                <th className="w-20 px-3 py-2 text-right text-xs font-medium text-[var(--text-secondary)]">Qty (Ea.)</th>
                <th className="w-24 px-3 py-2 text-right text-xs font-medium text-[var(--text-secondary)]">Price</th>
                <th className="w-24 px-3 py-2 text-right text-xs font-medium text-[var(--text-secondary)]">Total</th>
                <th className="w-10 px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {estimate.lineItems.map((item, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(i, { description: e.target.value })}
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(i, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent text-right text-sm focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent text-right text-sm focus:outline-none"
                      step="0.01"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium">${fmt(item.total)}</td>
                  <td className="px-2 py-1.5">
                    <button
                      onClick={() => removeLineItem(i)}
                      className="rounded p-1 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Labor */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Labor
        </h2>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--text-secondary)]" />
            <input
              type="number"
              value={estimate.laborHours}
              onChange={(e) => updateEstimate({ laborHours: parseFloat(e.target.value) || 0 })}
              className="w-16 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-center text-sm focus:border-[var(--accent)] focus:outline-none"
              step="0.5"
            />
            <span className="text-sm text-[var(--text-secondary)]">hrs</span>
          </div>
          <span className="text-[var(--text-secondary)]">&times;</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-[var(--text-secondary)]">$</span>
            <input
              type="number"
              value={estimate.laborRate}
              onChange={(e) => updateEstimate({ laborRate: parseFloat(e.target.value) || 0 })}
              className="w-20 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-center text-sm focus:border-[var(--accent)] focus:outline-none"
              step="5"
            />
            <span className="text-sm text-[var(--text-secondary)]">/hr</span>
          </div>
          <span className="ml-auto text-sm font-semibold">${fmt(estimate.laborSubtotal)}</span>
        </div>
      </section>

      {/* Totals */}
      <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="divide-y divide-[var(--border)]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[var(--text-secondary)]">Materials</span>
            <span className="text-sm">${fmt(estimate.materialSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[var(--text-secondary)]">Labor</span>
            <span className="text-sm">${fmt(estimate.laborSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">Markup</span>
              <input
                type="number"
                value={estimate.markupPercent}
                onChange={(e) => updateEstimate({ markupPercent: parseFloat(e.target.value) || 0 })}
                className="w-14 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-center text-xs focus:border-[var(--accent)] focus:outline-none"
                step="1"
              />
              <span className="text-xs text-[var(--text-secondary)]">%</span>
            </div>
            <span className="text-sm">${fmt(estimate.markupAmount)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[var(--text-secondary)]">Subtotal</span>
            <span className="text-sm">${fmt(estimate.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">Tax</span>
              <input
                type="number"
                value={estimate.taxPercent}
                onChange={(e) => updateEstimate({ taxPercent: parseFloat(e.target.value) || 0 })}
                className="w-14 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-center text-xs focus:border-[var(--accent)] focus:outline-none"
                step="0.1"
              />
              <span className="text-xs text-[var(--text-secondary)]">%</span>
            </div>
            <span className="text-sm">${fmt(estimate.taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-base font-bold">Total</span>
            <span className="text-xl font-bold text-[var(--accent)]">${fmt(estimate.total)}</span>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Notes & Conditions
        </h2>
        <textarea
          value={estimate.notes}
          onChange={(e) => updateEstimate({ notes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm leading-relaxed focus:border-[var(--accent)] focus:outline-none"
        />
      </section>

      {/* Contract generation - THE BAIT */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-start gap-4">
          <FileText className="mt-0.5 h-8 w-8 shrink-0 text-[var(--accent)]" />
          <div className="flex-1">
            <h2 className="text-lg font-bold">Generate Service Agreement</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Turn this estimate into a binding contract with scope, payment terms, warranty, and liability protection. One click.
            </p>

            {contractFull ? (
              <div className="mt-4">
                <pre className="whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm leading-relaxed">
                  {contractFull}
                </pre>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => window.open(`/api/estimate/${estimateId}/contract/pdf`, "_blank")}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download Contract PDF
                  </button>
                </div>
              </div>
            ) : contractPreview && !isPro ? (
              <div className="mt-4">
                <div className="relative">
                  <pre className="whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm leading-relaxed">
                    {contractPreview}
                  </pre>
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                </div>
                <div className="mt-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-center">
                  <Lock className="mx-auto h-5 w-5 text-[var(--accent)]" />
                  <p className="mt-2 text-sm font-medium">Upgrade to Pro to generate contracts</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    30 estimates/month + contract generation from any estimate
                  </p>
                  <a
                    href="/estimate/pro"
                    className="mt-3 inline-block rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Upgrade to Pro - $19/mo
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={generateContract}
                disabled={generatingContract}
                className={`mt-4 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                  isPro
                    ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                    : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {generatingContract ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate Contract
                    {!isPro && <span className="ml-1 rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">PRO</span>}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
