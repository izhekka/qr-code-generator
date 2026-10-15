'use client';
import dynamic from 'next/dynamic';

const BuilderClient = dynamic(
  () => import('@/components/BuilderClient').then((m) => m.BuilderClient),
  {
    ssr: false,
    loading: () => <div className="p-12 text-gray-500">Loading…</div>,
  },
);

export default function ConstructorPage() {
  return <BuilderClient />;
}