import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Member } from '../types';
import {
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  ArrowLeftRight,
  Search
} from 'lucide-react';

interface MembersViewProps {
  onOpenAddMember: () => void;
  onOpenEditMember: (member: Member) => void;
  onOpenIssueBookToMember: (member: Member) => void;
  onRequestDeleteMember: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  onOpenAddMember,
  onOpenEditMember,
  onOpenIssueBookToMember,
  onRequestDeleteMember,
}) => {
  const { members, loans } = useLibrary();

  const [searchMember, setSearchMember] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (statusFilter !== 'all' && member.status !== statusFilter) return false;

      if (searchMember.trim()) {
        const q = searchMember.toLowerCase();
        const matchName = member.name.toLowerCase().includes(q);
        const matchEmail = member.email.toLowerCase().includes(q);
        const matchNumber = member.membershipNumber.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchNumber) return false;
      }
      return true;
    });
  }, [members, statusFilter, searchMember]);

  const getMemberActiveLoanCount = (memberId: string) => {
    return loans.filter((l) => l.memberId === memberId && (l.status === 'active' || l.status === 'overdue')).length;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-fadeIn" id="members-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Patron & Member Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage library cardholders, track active borrowings, and review privileges.
          </p>
        </div>

        <button
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          onClick={onOpenAddMember}
          id="members-add-btn"
        >
          <UserPlus size={16} />
          <span>Register New Patron</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <select
          className="h-9 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          id="member-status-filter"
          aria-label="Filter member status"
        >
          <option value="all">All Member Statuses</option>
          <option value="active">Active Cardholders</option>
          <option value="suspended">Suspended Accounts</option>
        </select>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="Search patron name, card #, email..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            id="member-search-input"
          />
        </div>
      </div>

      {/* Members Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => {
          const activeLoansCount = getMemberActiveLoanCount(member.id);
          const initials = member.name
            .split(' ') // [Ephesians] [Lewis]
            .map((n) => n[0]) // E [Ephesians] L [Lewis]
            .join('') // EL
            .toUpperCase()

          return (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              id={`member-card-${member.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0 ${
                        member.status === 'active'
                          ? 'bg-gradient-to-br from-indigo-500 to-cyan-500'
                          : 'bg-gradient-to-br from-amber-500 to-rose-500'
                      }`}
                    >
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {member.name}
                      </h3>
                      <div className="text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400">
                        {member.membershipNumber}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      member.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {member.status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Member since {member.joinedDate}</span>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{member.bio}"
                  </p>
                )}

                 {member.hobbies && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{member.hobbies}"
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <BookOpen size={14} className="text-indigo-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">{getMemberActiveLoanCount(member.id)}</span>
                  <span className="text-slate-400">borrowed</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => onOpenEditMember(member)}
                    title="Edit Member"
                    id={`edit-member-${member.id}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    onClick={() => onRequestDeleteMember(member)}
                    title="Remove Member"
                    id={`delete-member-${member.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      member.status === 'suspended'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-sm'
                    }`}
                    onClick={() => onOpenIssueBookToMember(member)}
                    disabled={member.status === 'suspended'}
                    title={member.status === 'suspended' ? 'Suspended member' : 'Issue book'}
                    id={`member-issue-btn-${member.id}`}
                  >
                    <ArrowLeftRight size={12} />
                    <span>Issue</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
