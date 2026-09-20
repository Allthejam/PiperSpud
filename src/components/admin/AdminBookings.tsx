'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  BookOpenCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Mail, 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { BookingEvent, BookingStatus } from '@/types/spud';

export const AdminBookings: React.FC = () => {
  const { 
    bookings, 
    approveBooking, 
    rejectBooking, 
    deleteBooking, 
    openBrevoPreview, 
    openPayPalModal 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch = 
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Booking Approvals & Deposit Pipeline</h2>
          <p className="text-xs text-gray-400">Automated Brevo email generation and PayPal deposit tracking</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 font-bold bg-tartan-card px-3 py-1.5 rounded-xl border border-tartan-border">
            Total Inquiries: <strong className="text-tartan-gold">{bookings.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-tartan-card rounded-2xl p-4 border border-tartan-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client, venue, or email..."
            className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {['all', 'pending', 'approved', 'deposit_paid', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                filterStatus === status
                  ? 'bg-gold-gradient text-tartan-dark shadow'
                  : 'bg-tartan-navy text-gray-300 hover:bg-slate-700 border border-tartan-border'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / Card List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center bg-tartan-card rounded-3xl border border-tartan-border text-gray-400 text-xs">
            No bookings match your filter query.
          </div>
        ) : (
          filteredBookings.map((bk: BookingEvent) => {
            const isPending = bk.status === 'pending';
            const isApproved = bk.status === 'approved';
            const isPaid = bk.status === 'deposit_paid';
            const isCancelled = bk.status === 'cancelled';

            let statusBadge = (
              <span className="bg-amber-950/80 text-yellow-300 border border-yellow-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Pending Approval</span>
              </span>
            );
            if (isApproved) {
              statusBadge = (
                <span className="bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>Approved • Deposit Pending</span>
                </span>
              );
            } else if (isPaid) {
              statusBadge = (
                <span className="bg-green-950/80 text-green-300 border border-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Deposit Paid • Locked</span>
                </span>
              );
            } else if (isCancelled) {
              statusBadge = (
                <span className="bg-red-950/80 text-red-300 border border-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  Declined
                </span>
              );
            }

            return (
              <div
                key={bk.id}
                className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-xl space-y-4 hover:border-tartan-accent/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-tartan-border/60 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-bold text-white font-serif">{bk.clientName}</h3>
                      {statusBadge}
                    </div>
                    <p className="text-xs text-tartan-gold font-serif">{bk.eventType}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-gray-400">Total Fee:</span>
                      <p className="text-base font-bold text-white">£{bk.estimatedPrice}.00</p>
                    </div>
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-gray-400">Deposit:</span>
                      <p className="text-base font-bold text-tartan-gold">£{bk.depositAmount}.00</p>
                    </div>
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-300 bg-tartan-dark/70 p-4 rounded-2xl border border-tartan-border/50">
                  <div>
                    <span className="text-gray-500 font-semibold block">Date & Slot:</span>
                    <strong className="text-white">{bk.date}</strong> ({bk.timeSlot})
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block">Venue & Postcode:</span>
                    <strong className="text-white">{bk.venueName}</strong> ({bk.venuePostcode})
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block">Highland Attire:</span>
                    <strong className="text-white">{bk.tartanChoice}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block">Contact:</span>
                    <span className="text-white">{bk.clientPhone} • {bk.clientEmail}</span>
                  </div>
                </div>

                {bk.notes && (
                  <p className="text-xs text-gray-300 italic bg-tartan-navy/40 p-3 rounded-xl border border-slate-800">
                    <strong className="text-tartan-gold not-italic">Notes: </strong>{bk.notes}
                  </p>
                )}

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                  
                  {/* Brevo Email Log Indicator */}
                  <div className="flex items-center gap-2 text-xs">
                    {bk.brevoEmailSent ? (
                      <button
                        onClick={() => openBrevoPreview(bk)}
                        className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Brevo Email Delivered (Click to Preview)</span>
                      </button>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Brevo Email Pending Approval</span>
                      </span>
                    )}
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => approveBooking(bk.id)}
                          className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs shadow hover:brightness-110 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Send Brevo Invoice</span>
                        </button>
                        <button
                          onClick={() => rejectBooking(bk.id)}
                          className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <>
                        <button
                          onClick={() => openPayPalModal(bk)}
                          className="px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#003087] text-white font-extrabold text-xs shadow flex items-center gap-1.5"
                        >
                          <CreditCard className="w-4 h-4 text-yellow-300" />
                          <span>Test PayPal Deposit Payment</span>
                        </button>
                        <button
                          onClick={() => openBrevoPreview(bk)}
                          className="px-3 py-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-200 text-xs font-semibold border border-tartan-border flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>View Email</span>
                        </button>
                      </>
                    )}

                    {isPaid && (
                      <button
                        onClick={() => openBrevoPreview(bk)}
                        className="px-3 py-2 rounded-xl bg-green-950 hover:bg-green-900 text-green-300 text-xs font-semibold border border-green-800 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>View Confirmed Receipt</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteBooking(bk.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
