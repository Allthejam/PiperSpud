import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/serverSeo';

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata('pipes');
}

export default function PipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
