import React from 'react';
import BoardCommitteeSection from '../components/BoardCommittee';

export const metadata = {
  title: 'Board Committee | TGDC',
  description: 'Meet the Board Committee of the Tanzania Geothermal Development Company.',
};

export default function BoardCommitteePage() {
  return (
    <main className="min-h-screen bg-white pt-8">
      <BoardCommitteeSection />
    </main>
  );
}
