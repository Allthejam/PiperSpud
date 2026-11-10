import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/serverSeo';

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata('booking');
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
