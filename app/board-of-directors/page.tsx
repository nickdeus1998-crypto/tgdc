import React from 'react';
import BoardCommitteeSection from '../components/BoardCommittee';

export const metadata = {
  title: 'Board of Directors | TGDC',
  description: 'Meet the Board of Directors of the Tanzania Geothermal Development Company.',
};

export default function BoardOfDirectorsPage() {
  return (
    <main className="min-h-screen bg-white pt-8">
      <BoardCommitteeSection />
    </main>
  );
}
