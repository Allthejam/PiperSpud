import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/serverSeo';

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata('experience');
}

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
