import React, { useState, useEffect } from "react";
import { Member, MemberFormData } from "../../types";
import { X, Users } from "lucide-react";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => Promise<boolean>;
  initialMember?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialMember,
}) => {
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    membershipNumber: "",
    status: "active",
    bio: "",
    hobbies: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMember) {
      setFormData({
        id: initialMember.id,
        name: initialMember.name,
        email: initialMember.email,
        phone: initialMember.phone || "",
        membershipNumber: initialMember.membershipNumber,
        status: initialMember.status,
        bio: initialMember.bio || "",
        hobbies: initialMember.hobbies || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        membershipNumber: `LIB-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: "active",
        bio: "",
        hobbies: "",
      });
    }
    setErrors({});
  }, [initialMember, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@"))
      errs.email = "Valid email is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const saved = await onSubmit(formData);
      if (saved) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      id="member-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="member-modal-dialog"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Users size={17} />
            </div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              {initialMember ? "Edit Patron Profile" : "Register New Patron"}
            </h2>
          </div>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
            id="close-member-modal-btn"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="member-name-input"
              >
                Full Name *
              </label>
              <input
                id="member-name-input"
                type="text"
                className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="e.g. Elena Rostova"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="member-email-input"
              >
                Email Address *
              </label>
              <input
                id="member-email-input"
                type="email"
                className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="elena@university.edu"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone & Card Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="member-phone-input"
                >
                  Phone Number
                </label>
                <input
                  id="member-phone-input"
                  type="text"
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="+1 (555) 019-2831"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="member-card-input"
                >
                  Membership Card ID
                </label>
                <input
                  id="member-card-input"
                  type="text"
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
                  value={formData.membershipNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      membershipNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="member-status-select"
              >
                Privilege Status
              </label>
              <select
                id="member-status-select"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="active">Active Privileges</option>
                <option value="suspended">
                  Suspended (Borrowing restricted)
                </option>
              </select>
            </div>

            {/* Bio / Affiliation */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="member-bio-input"
              >
                Patron Bio / Department
              </label>
              <textarea
                id="member-bio-input"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed"
                rows={3}
                placeholder="Department, faculty, or library affiliation notes..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="member-bio-input"
              >
                Hobbies
              </label>
              <textarea
                id="member-bio-input"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed"
                rows={3}
                placeholder="Swimming, cooking, teaching, watching..."
                value={formData.hobbies}
                onChange={(e) =>
                  setFormData({ ...formData, hobbies: e.target.value })
                }
              />
            </div>
          </div>

          <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
              onClick={onClose}
              id="cancel-member-modal-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/25 cursor-pointer"
              id="submit-member-btn"
            >
              {isSubmitting
                ? "Saving..."
                : initialMember
                  ? "Save Profile"
                  : "Register Patron"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
