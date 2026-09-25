'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { EditableElement } from './EditableElement';
import { 
  Heart, 
  Flame, 
  Castle, 
  Users, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Music,
  Clock,
  ExternalLink,
  PlusCircle,
  Settings,
  Star,
  Eye,
  Calendar
} from 'lucide-react';
import { ServicePackage } from '@/types/spud';

const getServiceIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Heart': return Heart;
    case 'Flame': return Flame;
    case 'Castle': return Castle;
    case 'GraduationCap': return GraduationCap;
    case 'Users': return Users;
    case 'Music': return Music;
    case 'Star': return Star;
    case 'Sparkles':
    default: return Sparkles;
  }
};

export const ServicesSection: React.FC = () => {
  const { services, isAdminLoggedIn } = useApp();

  return (
    <section id="services" className="py-20 bg-tartan-dark relative border-b border-tartan-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Castle className="w-4 h-4 shrink-0" />
            <EditableElement
              id="services-header-badge"
              tag="span"
              defaultContent="Professional Piping Packages"
              label="Services Header Badge"
              section="services"
            />
          </div>
          
          <EditableElement
            id="services-header-title"
            tag="h2"
            defaultContent="Bagpiping Services Tailored for Every Occasion"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
            label="Services Header Title"
            section="services"
          />
          
          <EditableElement
            id="services-header-desc"
            tag="p"
            defaultContent="From romantic castle weddings and interactive tourist experiences to memorial laments and corporate galas, discover the perfect musical package for your event. Transparent pricing, instant booking, and guaranteed excellence."
            className="text-base text-gray-300"
            label="Services Header Description"
            section="services"
          />

          {isAdminLoggedIn && (
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tartan-navy hover:bg-slate-800 text-tartan-gold border border-tartan-gold/50 text-xs font-bold shadow transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add / Manage Services in Back Office CRM</span>
              </Link>
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {services.map((service) => {
            const Icon = getServiceIcon(service.icon);
            const detailUrl = `/services/${service.slug || service.id}`;
            const bookingUrl = `/booking?service=${encodeURIComponent(service.title)}`;

            return (
              <div
                key={service.id}
                className={`bg-tartan-card rounded-3xl p-6 sm:p-8 border flex flex-col justify-between shadow-2xl transition-all relative overflow-hidden group hover:scale-[1.02] ${
                  service.popularBadge 
                    ? 'border-tartan-gold ring-1 ring-tartan-gold/40' 
                    : 'border-tartan-border/70 hover:border-tartan-accent/50'
                }`}
              >
                {/* Popular / New Pill */}
                {service.popularBadge && (
                  <div className="absolute top-0 right-0 bg-gold-gradient text-tartan-dark text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-md">
                    <EditableElement
                      id={`${service.id}-popular-badge`}
                      tag="span"
                      defaultContent={service.badgeText || "Most Requested"}
                      label={`${service.title} Badge`}
                      section="services"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-tartan-navy flex items-center justify-center text-tartan-gold border border-tartan-accent/30 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <Link href={detailUrl} className="group-hover:text-tartan-gold transition-colors">
                      <EditableElement
                        id={`${service.id}-title`}
                        tag="h3"
                        defaultContent={service.title}
                        className="text-xl font-bold text-white font-serif group-hover:text-tartan-gold transition-colors"
                        label={`${service.title} Title`}
                        section="services"
                      />
                    </Link>
                    <EditableElement
                      id={`${service.id}-tagline`}
                      tag="p"
                      defaultContent={service.tagline}
                      className="text-xs text-tartan-gold font-medium"
                      label={`${service.title} Tagline`}
                      section="services"
                    />
                  </div>

                  {/* Price Banner */}
                  <div className="bg-tartan-dark/80 p-3 rounded-xl border border-tartan-border/60 flex items-center justify-between gap-2">
                    <EditableElement
                      id={`${service.id}-price`}
                      tag="span"
                      defaultContent={service.priceEstimate}
                      className="text-sm font-extrabold text-white font-serif"
                      label={`${service.title} Price`}
                      section="services"
                    />
                    <div className="shrink-0">
                      <EditableElement
                        id={`${service.id}-deposit`}
                        tag="span"
                        defaultContent={service.deposit}
                        className="text-[11px] font-bold text-tartan-gold bg-tartan-accent/15 px-2.5 py-0.5 rounded-full border border-tartan-accent/30"
                        label={`${service.title} Deposit`}
                        section="services"
                      />
                    </div>
                  </div>

                  <EditableElement
                    id={`${service.id}-desc`}
                    tag="p"
                    defaultContent={service.description}
                    className="text-xs text-gray-300 leading-relaxed"
                    label={`${service.title} Description`}
                    section="services"
                  />

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-2">
                    <EditableElement
                      id={`${service.id}-inclusions-header`}
                      tag="p"
                      defaultContent="Package Inclusions:"
                      className="text-[11px] font-bold uppercase tracking-wider text-tartan-gold"
                      label={`${service.title} Inclusions Header`}
                      section="services"
                    />
                    {service.features.slice(0, 5).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-tartan-gold shrink-0 mt-0.5" />
                        <EditableElement
                          id={`${service.id}-feat-${idx}`}
                          tag="span"
                          defaultContent={feat}
                          label={`${service.title} Feature ${idx + 1}`}
                          section="services"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom CTAs: See Full Details + Book Now */}
                <div className="mt-8 pt-4 border-t border-tartan-border/60 space-y-2.5">
                  <Link
                    href={detailUrl}
                    className="w-full py-2.5 px-3 rounded-xl bg-tartan-navy hover:bg-slate-800 text-tartan-gold font-bold text-xs flex items-center justify-center gap-1.5 border border-tartan-border/80 hover:border-tartan-gold/60 transition-all shadow-sm group/btn"
                  >
                    <Eye className="w-3.5 h-3.5 text-tartan-gold group-hover/btn:scale-110 transition-transform" />
                    <span>Explore Full Package & Gallery</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={bookingUrl}
                    className="w-full py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all text-center"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Check Availability & Book</span>
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
