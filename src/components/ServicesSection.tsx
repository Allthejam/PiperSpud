'use client';

import React from 'react';
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
  Clock
} from 'lucide-react';

interface ServicePackage {
  id: string;
  icon: any;
  title: string;
  tagline: string;
  priceEstimate: string;
  deposit: string;
  description: string;
  features: string[];
  popularBadge?: boolean;
}

export const ServicesSection: React.FC = () => {
  const services: ServicePackage[] = [
    {
      id: 'srv-weddings',
      icon: Heart,
      title: 'Scottish Castle & Highland Weddings',
      tagline: 'The complete romantic ceremony & reception musical experience',
      priceEstimate: 'From £320 - £480',
      deposit: '£100 Deposit',
      popularBadge: true,
      description: 'Create spine-tingling wedding memories with the iconic sound of the Highland pipes. Spud welcomes your arriving guests, pipes the bridal party down the aisle, plays during photography, and triumphantly pipes the newlyweds into dinner.',
      features: [
        'Greeting arriving wedding guests with traditional welcoming tunes',
        'Piping the Bride down the aisle with Highland Cathedral',
        'Lively exit march for the newly married couple',
        'Atmospheric piping during photo sessions & drinks reception',
        'Official pipe-in of the Top Table into the wedding breakfast'
      ]
    },
    {
      id: 'srv-funerals',
      icon: Flame,
      title: 'Funerals, Memorials & Graveside Laments',
      tagline: 'A respectful, heartfelt tribute to honour your loved one',
      priceEstimate: 'From £220',
      deposit: '£50 Deposit',
      description: 'The mournful resonance of the Highland bagpipe provides a deeply moving and dignified farewell. Spud can lead the cortege, play before and after the service, and perform soulful laments at the graveside or crematorium.',
      features: [
        'Solemn greeting as family and mourners arrive at the chapel',
        'Leading the hearse and cortege with respectful ceremony',
        'Soulful rendition of "Flowers of the Forest" or "Going Home"',
        'Graveside final salute with "Amazing Grace"',
        'Discreet, dignified, and compassionate presence throughout'
      ]
    },
    {
      id: 'srv-burns',
      icon: Sparkles,
      title: 'Burns Suppers & Hogmanay Celebrations',
      tagline: 'Rousing Scottish energy, piping in the Haggis & Auld Lang Syne',
      priceEstimate: 'From £450',
      deposit: '£100 Deposit',
      description: 'Celebrate the Bard in true Highland style! Spud provides the dramatic musical entrance for the Haggis, traditional reels for the dinner, and high-energy anthems to ring in the New Year.',
      features: [
        'Grand entrance piping in the Haggis with "A Man\'s a Man for A\' That"',
        'Entertaining musical interludes between speeches and toasts',
        'Rousing reels and jigs to get the party dancing',
        'Midnight chimes & stirring rendition of "Auld Lang Syne"'
      ]
    },
    {
      id: 'srv-corporate',
      icon: Castle,
      title: 'Corporate Banquets & Castle VIP Galas',
      tagline: 'State-level Highland grandeur for international guests & brands',
      priceEstimate: 'From £550',
      deposit: '£150 Deposit',
      description: 'Impress international delegates, royalty, and VIP clients with authentic Scottish majesty. Spud adds unmistakable grandeur to award galas, product launches, castle dinners, and corporate summits.',
      features: [
        'VIP red carpet greeting with Full Number 1 Highland Dress',
        'Banquet pipe-in and solo concert performance',
        'Highland salute atop castle ramparts or main stage',
        'Photo opportunities with delegates and guests'
      ]
    },
    {
      id: 'srv-tuition',
      icon: GraduationCap,
      title: 'Private Bagpipe Tuition & Masterclasses',
      tagline: 'Learn the ancient art of the Great Highland Bagpipe',
      priceEstimate: '£60 / Hour',
      deposit: '£20 Deposit',
      description: 'Learn chanter technique, embellishments (doublings, birls, strikes), drone maintenance, and tune repertoire from an award-winning master piper. Available in-person or via high-definition video call.',
      features: [
        'Beginner practice chanter fundamentals to advanced piobaireachd',
        'Blowing technique and bagpipe air pressure control',
        'Reed calibration and instrument care',
        'Custom sheet music and audio practice stems provided'
      ]
    },
    {
      id: 'srv-private',
      icon: Users,
      title: 'Anniversaries, Birthdays & Surprise Gigs',
      tagline: 'Highland surprise performances for milestones and celebrations',
      priceEstimate: 'From £350',
      deposit: '£80 Deposit',
      description: 'Surprise your family or friends with a dramatic entrance from Spud the Piper! Perfect for milestone birthdays (40th, 50th, 60th), golden anniversaries, graduations, and private garden ceilidhs.',
      features: [
        'Unannounced surprise dramatic bagpipe entrance',
        'Happy Birthday in Highland bagpipe harmony',
        'Special tune requests and personal dedication',
        'Photos with the guest of honor in full Scottish kilt regalia'
      ]
    }
  ];

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
            defaultContent="From intimate mountain elopements to 500-guest castle galas, discover the perfect musical package for your event. Transparent pricing, instant booking, and guaranteed excellence."
            className="text-base text-gray-300"
            label="Services Header Description"
            section="services"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className={`bg-tartan-card rounded-3xl p-6 sm:p-8 border flex flex-col justify-between shadow-2xl transition-all relative overflow-hidden group hover:scale-[1.02] ${
                  service.popularBadge 
                    ? 'border-tartan-gold ring-1 ring-tartan-gold/40' 
                    : 'border-tartan-border/70 hover:border-tartan-accent/50'
                }`}
              >
                {/* Popular Pill */}
                {service.popularBadge && (
                  <div className="absolute top-0 right-0 bg-gold-gradient text-tartan-dark text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-md">
                    <EditableElement
                      id={`${service.id}-popular-badge`}
                      tag="span"
                      defaultContent="Most Requested"
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
                    <EditableElement
                      id={`${service.id}-title`}
                      tag="h3"
                      defaultContent={service.title}
                      className="text-xl font-bold text-white font-serif group-hover:text-tartan-gold transition-colors"
                      label={`${service.title} Title`}
                      section="services"
                    />
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
                    {service.features.map((feat, idx) => (
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

                {/* Card Bottom CTA */}
                <div className="mt-8 pt-4 border-t border-tartan-border/60">
                  <EditableElement
                    id={`${service.id}-btn`}
                    tag="a"
                    defaultContent="Check Availability & Book"
                    defaultLinkUrl="#booking"
                    className="w-full py-3 rounded-xl bg-tartan-navy hover:bg-gold-gradient hover:text-tartan-dark text-white font-bold text-xs flex items-center justify-center gap-2 border border-tartan-border transition-all shadow-md text-center"
                    label={`${service.title} Button`}
                    section="services"
                  />
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
