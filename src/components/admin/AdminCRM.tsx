'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Download, 
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BookingEvent } from '@/types/spud';

export const AdminCRM: React.FC = () => {
  const { bookings, openBrevoPreview } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<BookingEvent | null>(bookings[0] || null);

  const filteredClients = bookings.filter(b =>
    b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.clientPhone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Client Relationship Management (CRM)</h2>
          <p className="text-xs text-gray-400">Searchable client directory, contact history, venue notes, and invoices</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-tartan-gold bg-tartan-card px-3.5 py-1.5 rounded-xl border border-tartan-border font-bold">
            {bookings.length} Total Client Accounts
          </span>
        </div>
      </div>

      {/* CRM Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Search & Client List */}
        <div className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-2xl space-y-4">
          
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients by name, phone, or venue..."
              className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
            {filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              const isPaid = client.status === 'deposit_paid';

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-tartan-navy border-tartan-gold ring-1 ring-tartan-gold/40 shadow-md'
                      : 'bg-tartan-dark/70 border-tartan-border/60 hover:bg-tartan-navy/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold text-sm">
                      {client.clientName.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{client.clientName}</h4>
                      <p className="text-[11px] text-gray-400">{client.venueName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isPaid ? 'bg-green-950 text-green-300 border-green-800' : 'bg-amber-950 text-yellow-300 border-yellow-800'
                    }`}>
                      {client.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">{client.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Client Detailed Dossier */}
        <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
          {selectedClient ? (
            <div className="space-y-6">
              
              {/* Client Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tartan-border/60 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tartan-accent to-amber-600 flex items-center justify-center text-tartan-dark font-serif font-extrabold text-xl shadow-lg">
                    {selectedClient.clientName.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-serif">{selectedClient.clientName}</h3>
                    <p className="text-xs text-tartan-gold">{selectedClient.eventType}</p>
                  </div>
                </div>

                <button
                  onClick={() => openBrevoPreview(selectedClient)}
                  className="px-4 py-2 bg-tartan-navy hover:bg-slate-700 text-white rounded-xl border border-tartan-border flex items-center gap-2 text-xs font-bold"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>View Brevo Email & Invoice</span>
                </button>
              </div>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-tartan-dark p-3.5 rounded-2xl border border-tartan-border space-y-1">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-green-400" /> Phone
                  </span>
                  <a href={`tel:${selectedClient.clientPhone}`} className="text-white font-bold hover:underline block">
                    {selectedClient.clientPhone}
                  </a>
                </div>

                <div className="bg-tartan-dark p-3.5 rounded-2xl border border-tartan-border space-y-1">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> Email
                  </span>
                  <a href={`mailto:${selectedClient.clientEmail}`} className="text-white font-bold hover:underline block truncate">
                    {selectedClient.clientEmail}
                  </a>
                </div>

                <div className="bg-tartan-dark p-3.5 rounded-2xl border border-tartan-border space-y-1">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> Postcode
                  </span>
                  <p className="text-white font-bold">{selectedClient.venuePostcode}</p>
                </div>
              </div>

              {/* Event Logistics */}
              <div className="bg-tartan-dark/80 rounded-2xl p-5 border border-tartan-border space-y-3 text-xs text-gray-300">
                <h4 className="text-sm font-bold text-white font-serif border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>Event & Performance Parameters</span>
                  <span className="text-tartan-gold">ID: {selectedClient.id}</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-gray-500">Date:</span> <strong>{selectedClient.date}</strong></div>
                  <div><span className="text-gray-500">Time Slot:</span> <strong>{selectedClient.timeSlot}</strong></div>
                  <div><span className="text-gray-500">Venue:</span> <strong>{selectedClient.venueName}</strong></div>
                  <div><span className="text-gray-500">Attire Choice:</span> <strong>{selectedClient.tartanChoice}</strong></div>
                  <div><span className="text-gray-500">Total Agreed Price:</span> <strong>£{selectedClient.estimatedPrice}.00</strong></div>
                  <div><span className="text-gray-500">Deposit Amount:</span> <strong>£{selectedClient.depositAmount}.00</strong></div>
                </div>

                {selectedClient.specialTunes && selectedClient.specialTunes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-gray-500 font-semibold block mb-1">Requested Bagpipe Tunes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClient.specialTunes.map((t, idx) => (
                        <span key={idx} className="bg-tartan-navy text-tartan-gold px-2.5 py-0.5 rounded-md border border-tartan-accent/30 text-[11px] font-medium">
                          🎵 {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial & Brevo History */}
              <div className="bg-tartan-navy/60 rounded-2xl p-5 border border-tartan-border space-y-3 text-xs text-gray-300">
                <h4 className="text-sm font-bold text-white font-serif border-b border-slate-800 pb-2">
                  Transaction & Communication Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Initial Web Inquiry Submitted:</span>
                    <span className="font-mono text-gray-400">{selectedClient.createdAt?.slice(0, 10)}</span>
                  </div>
                  {selectedClient.approvedAt && (
                    <div className="flex items-center justify-between text-blue-300">
                      <span>Brevo Email with PayPal Invoice Dispatched:</span>
                      <span className="font-mono">{selectedClient.approvedAt?.slice(0, 10)}</span>
                    </div>
                  )}
                  {selectedClient.depositPaidAt && (
                    <div className="flex items-center justify-between text-green-300">
                      <span>PayPal Deposit Captured ({selectedClient.paypalOrderId}):</span>
                      <span className="font-mono">{selectedClient.depositPaidAt?.slice(0, 10)}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              Select a client account to inspect full dossier.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
