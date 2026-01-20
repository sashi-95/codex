'use client';

import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye } from 'lucide-react';
import {
  FlexibleColumnLayout,
  ObjectStatus,
  ObjectNumber,
  ObjectIdentifier,
} from '@/components/fiori';
import type { LayoutType } from '@/components/fiori';
import { mockAssets } from '@/data/mockAssetData';
import type { FixedAsset } from '@/data/mockAssetData';

/**
 * Fixed Asset Management - Flexible Column Layout
 * Demonstrates SAP Fiori FCL pattern (Master-Detail) in React/Next.js
 */
export default function AssetsFCLPage() {
  const [layout, setLayout] = useState<LayoutType>('OneColumn');
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = mockAssets.filter(
    (asset) =>
      asset.anln1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.txt50.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssetClick = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setLayout('TwoColumnsMidExpanded');
  };

  const getStatusState = (
    status: string
  ): 'error' | 'warning' | 'success' | 'information' | 'none' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      case 'Retired':
        return 'error';
      case 'In Transfer':
        return 'information';
      default:
        return 'none';
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${month}/${day}/${year}`;
  };

  // Begin Column: Asset List
  const beginColumn = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#D9D9D9] p-6">
        <h1 className="text-2xl font-semibold text-[#32363A] mb-4">
          Fixed Assets
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D70]" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D9D9D9] rounded focus:outline-none focus:border-[#0070F2] focus:ring-1 focus:ring-[#0070F2]"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-[#6A6D70]">
            {filteredAssets.length} assets
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#0070F2] text-white rounded text-sm hover:bg-[#0854A0] transition-colors">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-auto">
        {filteredAssets.map((asset) => (
          <div
            key={asset.anln1}
            onClick={() => handleAssetClick(asset)}
            className={`
              p-4 border-b border-[#E5E5E5] cursor-pointer transition-colors
              hover:bg-[#F7F7F7]
              ${selectedAsset?.anln1 === asset.anln1 ? 'bg-[#EBF5FF] border-l-4 border-l-[#0070F2]' : ''}
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <ObjectIdentifier
                title={asset.anln1}
                text={asset.txt50}
                titleActive={false}
              />
              <ObjectStatus
                text={asset.status}
                state={getStatusState(asset.status)}
              />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-[#6A6D70]">
                Class: {asset.anlkl}
              </span>
              <span className="text-xs text-[#6A6D70]">
                Cost Center: {asset.kostl}
              </span>
            </div>
            <div className="mt-2">
              <ObjectNumber
                number={asset.knsal}
                format="currency"
                decimals={0}
                textAlign="begin"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Mid Column: Asset Detail
  const midColumn = selectedAsset ? (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#D9D9D9] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#32363A] mb-1">
              {selectedAsset.txt50}
            </h2>
            <p className="text-sm text-[#6A6D70]">
              Asset #{selectedAsset.anln1}
            </p>
          </div>
          <ObjectStatus
            text={selectedAsset.status}
            state={getStatusState(selectedAsset.status)}
            icon
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-[#F7F7F7] rounded">
          <div>
            <span className="text-xs text-[#6A6D70] uppercase block mb-1">
              Book Value
            </span>
            <ObjectNumber
              number={selectedAsset.knsal}
              format="currency"
              emphasized
              decimals={0}
            />
          </div>
          <div>
            <span className="text-xs text-[#6A6D70] uppercase block mb-1">
              Depreciation
            </span>
            <ObjectNumber
              number={selectedAsset.kansw}
              format="currency"
              emphasized
              decimals={0}
              state="warning"
            />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-auto bg-[#EDEFF0] p-6">
        {/* General Information */}
        <div className="bg-white rounded-lg shadow-sm border border-[#D9D9D9] p-6 mb-4">
          <h3 className="text-lg font-semibold text-[#32363A] mb-4">
            General Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Company Code" value={selectedAsset.bukrs} />
            <DetailField label="Asset Number" value={selectedAsset.anln1} />
            <DetailField label="Asset Class" value={selectedAsset.anlkl} />
            <DetailField label="Inventory Number" value={selectedAsset.invnr} />
          </div>
        </div>

        {/* Organizational Assignment */}
        <div className="bg-white rounded-lg shadow-sm border border-[#D9D9D9] p-6 mb-4">
          <h3 className="text-lg font-semibold text-[#32363A] mb-4">
            Organizational Assignment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Cost Center" value={selectedAsset.kostl} />
            <DetailField label="Plant" value={selectedAsset.werks} />
            <DetailField label="Room" value={selectedAsset.raumn || 'N/A'} />
            <DetailField
              label="Investment Order"
              value={selectedAsset.ord41 || 'N/A'}
            />
          </div>
        </div>

        {/* Valuation */}
        <div className="bg-white rounded-lg shadow-sm border border-[#D9D9D9] p-6 mb-4">
          <h3 className="text-lg font-semibold text-[#32363A] mb-4">
            Valuation
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField
              label="Acquisition Value"
              value={
                <ObjectNumber
                  number={selectedAsset.knsal}
                  format="currency"
                  decimals={2}
                />
              }
            />
            <DetailField
              label="Accumulated Depreciation"
              value={
                <ObjectNumber
                  number={selectedAsset.kansw}
                  format="currency"
                  decimals={2}
                  state="warning"
                />
              }
            />
            <DetailField
              label="Current Year Depreciation"
              value={
                <ObjectNumber
                  number={selectedAsset.answl}
                  format="currency"
                  decimals={2}
                />
              }
            />
            <DetailField
              label="Net Book Value"
              value={
                <ObjectNumber
                  number={selectedAsset.knsal - selectedAsset.kansw}
                  format="currency"
                  decimals={2}
                  state="success"
                />
              }
            />
          </div>
        </div>

        {/* Time Data */}
        <div className="bg-white rounded-lg shadow-sm border border-[#D9D9D9] p-6">
          <h3 className="text-lg font-semibold text-[#32363A] mb-4">
            Time-Dependent Data
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField
              label="Capitalization Date"
              value={formatDate(selectedAsset.aktiv)}
            />
            <DetailField
              label="Deactivation Date"
              value={
                selectedAsset.deakt
                  ? formatDate(selectedAsset.deakt)
                  : 'N/A'
              }
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="h-screen">
      <FlexibleColumnLayout
        beginColumnPages={beginColumn}
        midColumnPages={midColumn}
        layout={layout}
        onLayoutChange={setLayout}
        backgroundDesign="Solid"
      />
    </div>
  );
}

// Helper component for detail fields
function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#6A6D70] uppercase">
        {label}
      </label>
      <div className="text-sm text-[#32363A]">
        {typeof value === 'string' ? (
          <span className="font-medium">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
