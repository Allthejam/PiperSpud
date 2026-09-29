import type { Metadata } from 'next';
import { generateTuneMetadata } from '@/lib/serverSeo';
import TunesPageClient from '@/components/TunesPageClient';

export async function generateMetadata({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const tuneQuery = typeof searchParams?.tune === 'string' ? searchParams.tune : undefined;
  return await generateTuneMetadata(tuneQuery);
}

export default function TunesPage() {
  return <TunesPageClient />;
}
