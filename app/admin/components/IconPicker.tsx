'use client';

import React, { useState, useRef, useEffect } from 'react';

// Curated list of popular Font Awesome 5 solid icons relevant to government/energy/services
const ICON_LIST: { class: string; label: string }[] = [
    // General
    { class: 'fas fa-home', label: 'Home' },
    { class: 'fas fa-building', label: 'Building' },
    { class: 'fas fa-city', label: 'City' },
    { class: 'fas fa-landmark', label: 'Landmark' },
    { class: 'fas fa-university', label: 'University' },
    { class: 'fas fa-flag', label: 'Flag' },
    { class: 'fas fa-globe', label: 'Globe' },
    { class: 'fas fa-globe-africa', label: 'Globe Africa' },
    { class: 'fas fa-map', label: 'Map' },
    { class: 'fas fa-map-marker-alt', label: 'Map Marker' },
    { class: 'fas fa-map-marked-alt', label: 'Map Marked' },
    { class: 'fas fa-compass', label: 'Compass' },
    { class: 'fas fa-directions', label: 'Directions' },
    { class: 'fas fa-route', label: 'Route' },
    // Energy & Environment
    { class: 'fas fa-bolt', label: 'Bolt' },
    { class: 'fas fa-fire', label: 'Fire' },
    { class: 'fas fa-fire-alt', label: 'Fire Alt' },
    { class: 'fas fa-burn', label: 'Burn' },
    { class: 'fas fa-plug', label: 'Plug' },
    { class: 'fas fa-solar-panel', label: 'Solar Panel' },
    { class: 'fas fa-wind', label: 'Wind' },
    { class: 'fas fa-water', label: 'Water' },
    { class: 'fas fa-tint', label: 'Tint/Drop' },
    { class: 'fas fa-leaf', label: 'Leaf' },
    { class: 'fas fa-seedling', label: 'Seedling' },
    { class: 'fas fa-tree', label: 'Tree' },
    { class: 'fas fa-mountain', label: 'Mountain' },
    { class: 'fas fa-temperature-high', label: 'Temperature High' },
    { class: 'fas fa-temperature-low', label: 'Temperature Low' },
    { class: 'fas fa-thermometer-half', label: 'Thermometer' },
    { class: 'fas fa-atom', label: 'Atom' },
    { class: 'fas fa-radiation', label: 'Radiation' },
    { class: 'fas fa-recycle', label: 'Recycle' },
    // Industry & Engineering
    { class: 'fas fa-industry', label: 'Industry' },
    { class: 'fas fa-tools', label: 'Tools' },
    { class: 'fas fa-wrench', label: 'Wrench' },
    { class: 'fas fa-cog', label: 'Cog' },
    { class: 'fas fa-cogs', label: 'Cogs' },
    { class: 'fas fa-hammer', label: 'Hammer' },
    { class: 'fas fa-hard-hat', label: 'Hard Hat' },
    { class: 'fas fa-drafting-compass', label: 'Drafting Compass' },
    { class: 'fas fa-ruler-combined', label: 'Ruler' },
    { class: 'fas fa-microscope', label: 'Microscope' },
    { class: 'fas fa-flask', label: 'Flask' },
    { class: 'fas fa-vial', label: 'Vial' },
    { class: 'fas fa-broadcast-tower', label: 'Broadcast Tower' },
    { class: 'fas fa-satellite-dish', label: 'Satellite Dish' },
    // Drilling & Geothermal
    { class: 'fas fa-oil-can', label: 'Oil Can' },
    { class: 'fas fa-gas-pump', label: 'Gas Pump' },
    // Business & Finance
    { class: 'fas fa-chart-line', label: 'Chart Line' },
    { class: 'fas fa-chart-bar', label: 'Chart Bar' },
    { class: 'fas fa-chart-pie', label: 'Chart Pie' },
    { class: 'fas fa-chart-area', label: 'Chart Area' },
    { class: 'fas fa-briefcase', label: 'Briefcase' },
    { class: 'fas fa-handshake', label: 'Handshake' },
    { class: 'fas fa-balance-scale', label: 'Balance Scale' },
    { class: 'fas fa-gavel', label: 'Gavel' },
    { class: 'fas fa-money-bill-wave', label: 'Money Bill' },
    { class: 'fas fa-coins', label: 'Coins' },
    { class: 'fas fa-percentage', label: 'Percentage' },
    // People & Teams
    { class: 'fas fa-users', label: 'Users' },
    { class: 'fas fa-user', label: 'User' },
    { class: 'fas fa-user-tie', label: 'User Tie' },
    { class: 'fas fa-user-shield', label: 'User Shield' },
    { class: 'fas fa-user-cog', label: 'User Cog' },
    { class: 'fas fa-people-carry', label: 'People Carry' },
    { class: 'fas fa-hands-helping', label: 'Hands Helping' },
    { class: 'fas fa-hand-holding-heart', label: 'Hand Holding Heart' },
    // Documents & Communication
    { class: 'fas fa-file-alt', label: 'File Alt' },
    { class: 'fas fa-file-contract', label: 'File Contract' },
    { class: 'fas fa-file-invoice', label: 'File Invoice' },
    { class: 'fas fa-file-pdf', label: 'File PDF' },
    { class: 'fas fa-clipboard-list', label: 'Clipboard List' },
    { class: 'fas fa-clipboard-check', label: 'Clipboard Check' },
    { class: 'fas fa-newspaper', label: 'Newspaper' },
    { class: 'fas fa-bullhorn', label: 'Bullhorn' },
    { class: 'fas fa-envelope', label: 'Envelope' },
    { class: 'fas fa-comments', label: 'Comments' },
    { class: 'fas fa-phone', label: 'Phone' },
    // Science & Research
    { class: 'fas fa-search', label: 'Search' },
    { class: 'fas fa-binoculars', label: 'Binoculars' },
    { class: 'fas fa-project-diagram', label: 'Project Diagram' },
    { class: 'fas fa-sitemap', label: 'Sitemap' },
    { class: 'fas fa-database', label: 'Database' },
    { class: 'fas fa-server', label: 'Server' },
    { class: 'fas fa-laptop', label: 'Laptop' },
    // Safety & Security
    { class: 'fas fa-shield-alt', label: 'Shield' },
    { class: 'fas fa-lock', label: 'Lock' },
    { class: 'fas fa-hard-hat', label: 'Safety Hat' },
    { class: 'fas fa-exclamation-triangle', label: 'Warning' },
    { class: 'fas fa-check-circle', label: 'Check Circle' },
    { class: 'fas fa-check', label: 'Check' },
    { class: 'fas fa-award', label: 'Award' },
    { class: 'fas fa-medal', label: 'Medal' },
    { class: 'fas fa-trophy', label: 'Trophy' },
    { class: 'fas fa-star', label: 'Star' },
    { class: 'fas fa-certificate', label: 'Certificate' },
    // Transport
    { class: 'fas fa-truck', label: 'Truck' },
    { class: 'fas fa-shipping-fast', label: 'Shipping Fast' },
    { class: 'fas fa-car', label: 'Car' },
    { class: 'fas fa-plane', label: 'Plane' },
    // Media
    { class: 'fas fa-camera', label: 'Camera' },
    { class: 'fas fa-video', label: 'Video' },
    { class: 'fas fa-photo-video', label: 'Photo Video' },
    { class: 'fas fa-images', label: 'Images' },
    { class: 'fas fa-image', label: 'Image' },
    // Misc
    { class: 'fas fa-lightbulb', label: 'Lightbulb' },
    { class: 'fas fa-puzzle-piece', label: 'Puzzle' },
    { class: 'fas fa-cubes', label: 'Cubes' },
    { class: 'fas fa-cube', label: 'Cube' },
    { class: 'fas fa-sync-alt', label: 'Sync' },
    { class: 'fas fa-rocket', label: 'Rocket' },
    { class: 'fas fa-magic', label: 'Magic' },
    { class: 'fas fa-bullseye', label: 'Bullseye' },
    { class: 'fas fa-crosshairs', label: 'Crosshairs' },
    { class: 'fas fa-eye', label: 'Eye' },
    { class: 'fas fa-heart', label: 'Heart' },
    { class: 'fas fa-info-circle', label: 'Info Circle' },
    { class: 'fas fa-question-circle', label: 'Question Circle' },
    { class: 'fas fa-life-ring', label: 'Life Ring' },
    { class: 'fas fa-download', label: 'Download' },
    { class: 'fas fa-upload', label: 'Upload' },
    { class: 'fas fa-link', label: 'Link' },
    { class: 'fas fa-share-alt', label: 'Share' },
    { class: 'fas fa-calendar-alt', label: 'Calendar' },
    { class: 'fas fa-clock', label: 'Clock' },
    { class: 'fas fa-hourglass-half', label: 'Hourglass' },
    { class: 'fas fa-tags', label: 'Tags' },
    { class: 'fas fa-tag', label: 'Tag' },
    { class: 'fas fa-folder', label: 'Folder' },
    { class: 'fas fa-folder-open', label: 'Folder Open' },
    { class: 'fas fa-archive', label: 'Archive' },
    { class: 'fas fa-box', label: 'Box' },
    { class: 'fas fa-th-large', label: 'Grid' },
    { class: 'fas fa-list', label: 'List' },
    { class: 'fas fa-tasks', label: 'Tasks' },
    { class: 'fas fa-sliders-h', label: 'Sliders' },
    { class: 'fas fa-filter', label: 'Filter' },
];

interface IconPickerProps {
    value: string;
    onChange: (iconClass: string) => void;
    placeholder?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, placeholder = 'Select an icon...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const filtered = ICON_LIST.filter(
        (icon) =>
            icon.label.toLowerCase().includes(search.toLowerCase()) ||
            icon.class.toLowerCase().includes(search.toLowerCase())
    );

    const selectedIcon = ICON_LIST.find((i) => i.class === value);

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2 border rounded-lg transition-all text-left ${isOpen
                        ? 'border-[#326101] ring-2 ring-[#326101]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    } bg-white`}
            >
                {value && selectedIcon ? (
                    <>
                        <span className="w-8 h-8 rounded-md bg-[#326101]/10 flex items-center justify-center flex-shrink-0">
                            <i className={`${value} text-[#326101]`} />
                        </span>
                        <span className="text-sm text-gray-800 font-medium truncate">{selectedIcon.label}</span>
                        <span className="ml-auto text-[10px] text-gray-400 font-mono truncate">{value}</span>
                    </>
                ) : value ? (
                    <>
                        <span className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <i className={`${value} text-gray-600`} />
                        </span>
                        <span className="text-sm text-gray-600 font-mono truncate">{value}</span>
                    </>
                ) : (
                    <span className="text-sm text-gray-400">{placeholder}</span>
                )}
                <svg
                    className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" style={{ maxHeight: '380px' }}>
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search icons..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] text-gray-900 bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Icon Grid */}
                    <div className="overflow-y-auto p-2" style={{ maxHeight: '310px' }}>
                        {filtered.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 py-6">No icons found</p>
                        ) : (
                            <div className="grid grid-cols-4 gap-1">
                                {filtered.map((icon) => (
                                    <button
                                        key={icon.class}
                                        type="button"
                                        onClick={() => {
                                            onChange(icon.class);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        title={`${icon.label} (${icon.class})`}
                                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-center transition-all ${value === icon.class
                                                ? 'bg-[#326101]/10 ring-1 ring-[#326101]/30 text-[#326101]'
                                                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <i className={`${icon.class} text-lg`} />
                                        <span className="text-[10px] leading-tight truncate w-full">{icon.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IconPicker;
