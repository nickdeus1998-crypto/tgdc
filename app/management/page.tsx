import React from 'react';
import OrgStructure from '../components/OrgStructure';

export const metadata = {
  title: 'Management | TGDC',
  description: 'Meet the Management Team of the Tanzania Geothermal Development Company.',
};

export default function ManagementPage() {
  return (
    <main className="min-h-screen bg-white pt-8">
      <OrgStructure />
    </main>
  );
}
