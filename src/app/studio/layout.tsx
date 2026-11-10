import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/serverSeo';

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata('studio');
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
