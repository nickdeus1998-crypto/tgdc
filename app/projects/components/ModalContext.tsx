// components/ModalContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { sanitizeHtml } from '@/app/lib/sanitize';

interface ModalContent {
  title: string;
  subtitle: string;
  body: string;
}

const modalContents: { [key: string]: ModalContent } = {
  ngozi: {
    title: 'Ngozi Pilot – Direct Use',
    subtitle: 'Preliminary opportunities and next steps',
    body: `
      <ul class="list-disc pl-5 space-y-2">
        <li>Greenhouse heating for high-altitude horticulture.</li>
        <li>Drying of grains aligned to local agricultural cycles.</li>
        <li>Fish farming (temperature-stable aquaculture) for year-round yield.</li>
      </ul>
      <div class="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
        <div class="font-semibold text-emerald-800 mb-1">Planned pre‑feasibility</div>
        <p class="text-emerald-900/80">Confirm resource temperatures, heat exchange options, and market off‑take potential.</p>
      </div>
    `
  },
  kisaki: {
    title: 'Kisaki Pilot – Direct Use',
    subtitle: 'Industrial & thermal services outlook',
    body: `
      <ul class="list-disc pl-5 space-y-2">
        <li>Industrial process heat for agro‑processing & light industry.</li>
        <li>Absorption cooling for storage and comfort cooling.</li>
        <li>Drying applications across multiple value chains.</li>
      </ul>
      <div class="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <div class="font-semibold text-amber-800 mb-1">Planned pre‑feasibility</div>
        <p class="text-amber-900/80">Match chemistry to materials, evaluate distribution networks, and assess scalability.</p>
      </div>
    `
  },
  engage: {
    title: 'Stakeholder Engagement',
    subtitle: 'Government • Research • Entrepreneurs • Private Sector',
    body: `
      <p class="mb-3">TGDC will convene dialogues to explore co‑development opportunities and partnerships for direct use.</p>
      <ul class="list-disc pl-5 space-y-2">
        <li>Identify anchor clients and local co‑investors.</li>
        <li>Define R&D priorities with universities and institutes.</li>
        <li>Outline incentives and regulatory pathways.</li>
      </ul>
    `
  },
  method: {
    title: 'Methodology – Pre‑Feasibility',
    subtitle: 'Technical • Market • E&S',
    body: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Resource characterization (temperature, flow, chemistry).</li>
        <li>Use‑case mapping by temperature band and local demand.</li>
        <li>Techno‑economic screening and sensitivity analysis.</li>
        <li>Environmental & social impacts with mitigation plans.</li>
        <li>Implementation roadmap and partnership model.</li>
      </ol>
    `
  }
};

interface ModalContextType {
  isOpen: boolean;
  modalTitle: string;
  modalSubtitle: string;
  modalBody: string;
  openModal: (key: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Details');
  const [modalSubtitle, setModalSubtitle] = useState('');
  const [modalBody, setModalBody] = useState('');

  const openModal = (key: string) => {
    const content = modalContents[key];
    if (content) {
      setModalTitle(content.title);
      setModalSubtitle(content.subtitle);
      setModalBody(content.body);
    } else {
      // For custom from diagram
      // But since diagram uses custom, handle via event listener or extend openModal to accept custom.
      // For now, assuming keys are predefined; for diagram, we can add to modalContents or handle separately.
    }
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // Handle custom modals from diagram
  React.useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      const { key, title, html } = event.detail;
      setModalTitle(title || 'Details');
      setModalSubtitle('');
      setModalBody(html);
      setIsOpen(true);
    };

    document.addEventListener('openModal', handleOpenModal as EventListener);
    return () => document.removeEventListener('openModal', handleOpenModal as EventListener);
  }, []);

  return (
    <ModalContext.Provider value={{ isOpen, modalTitle, modalSubtitle, modalBody, openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="modal-backdrop absolute inset-0" onClick={closeModal}></div>
          <div className="relative bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{modalTitle}</h4>
                <p className="text-sm text-gray-500 mt-1">{modalSubtitle}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(modalBody) }} />
            <div className="px-6 py-4 bg-gray-50 border-t text-right">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-green text-white hover:bg-secondary-green">Close</button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');
  return context;
};