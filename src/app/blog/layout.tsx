import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/serverSeo';

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata('blog');
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
