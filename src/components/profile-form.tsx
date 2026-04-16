"use client";

import { useState } from "react";
import { User, Mail, FileText, CreditCard, Sparkles, Check } from "lucide-react";
import Link from "next/link";

type Props = {
  name: string;
  email: string;
  image: string | null;
  bio: string;
  showAvatar: boolean;
  joinedAt: string;
  subscription: {
    status: string | null;
    endDate: string | null;
  };
};

export function ProfileForm({ name: initialName, email, image, bio: initialBio, showAvatar: initialShowAvatar, joinedAt, subscription }: Props) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [showAvatar, setShowAvatar] = useState(initialShowAvatar);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, showAvatar }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const joinDate = new Date(joinedAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Manage your public profile and account settings.
      </p>

      <div className="mt-8 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {image ? (
              <img src={image} alt={name} className="h-20 w-20 rounded-full" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                <User className="h-10 w-10 text-[var(--accent)]" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{name || "User"}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Member since {joinDate}
            </p>
          </div>
        </div>
        <label className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
          <div>
            <p className="text-sm font-medium">Show profile photo publicly</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {showAvatar ? "Your photo appears on template cards and your creator profile" : "A placeholder icon is shown instead of your photo"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAvatar(!showAvatar)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${showAvatar ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${showAvatar ? "translate-x-5" : ""}`} />
          </button>
        </label>

        {/* Form */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <User className="h-4 w-4 text-[var(--text-secondary)]" />
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-secondary)] cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Managed by your Google account.
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Tell others about yourself..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-[var(--border)] pt-5">
            {saved && (
              <span className="mr-4 text-sm text-[var(--green)]">Saved</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Billing */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-5 w-5 text-[var(--text-secondary)]" />
            Billing
          </h2>

          {subscription.status === "active" ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-400">
                  <Check className="h-3.5 w-3.5" />
                  Pro
                </span>
                <span className="text-sm text-[var(--text-secondary)]">$19/month</span>
              </div>
              {subscription.endDate && (
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Current period ends {new Date(subscription.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                30 AI estimates/month + contract generation.
                To manage or cancel your subscription, contact us at{" "}
                <a href="mailto:info@roughinhub.com" className="text-[var(--accent)] hover:underline">info@roughinhub.com</a>.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-sm font-medium text-[var(--text-secondary)]">
                  Free
                </span>
                <span className="text-sm text-[var(--text-secondary)]">3 estimates/month</span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Upgrade to Pro for 30 estimates/month and one-click contract generation.
              </p>
              <Link
                href="/estimate/pro"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro - $19/mo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
