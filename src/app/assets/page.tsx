'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, RefreshCw, Edit, Eye } from 'lucide-react';
import {
  SemanticPage,
  ObjectStatus,
  ObjectNumber,
  ObjectIdentifier,
} from '@/components/fiori';
import { mockAssets, getTotalBookValue, getTotalDepreciation, getActiveAssets } from '@/data/mockAssetData';
import type { FixedAsset } from '@/data/mockAssetData';

/**
 * Fixed Asset Management - List Page
 * Demonstrates SAP Fiori SemanticPage pattern in React/Next.js
 */
export default function AssetsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assets, setAssets] = useState(mockAssets);

  // Calculate KPIs
  const totalBookValue = useMemo(() => getTotalBookValue(), []);
  const totalDepreciation = useMemo(() => getTotalDepreciation(), []);
  const activeAssetsCount = useMemo(() => getActiveAssets().length, []);

  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    const query = searchQuery.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.anln1.toLowerCase().includes(query) ||
        asset.txt50.toLowerCase().includes(query) ||
        asset.kostl.toLowerCase().includes(query)
    );
  }, [assets, searchQuery]);

  const handleAssetClick = (anln1: string) => {
    router.push(`/assets/${anln1}`);
  };

  const handleCreateAsset = () => {
    console.log('Create new asset');
    alert('Create Asset dialog would open here');
  };

  const handleDeleteAsset = () => {
    if (selectedAssets.length === 0) return;
    const confirmed = confirm(`Delete ${selectedAssets.length} asset(s)?`);
    if (confirmed) {
      setAssets(assets.filter((a) => !selectedAssets.includes(a.anln1)));
      setSelectedAssets([]);
    }
  };

  const handleRefresh = () => {
    setAssets([...mockAssets]);
    setSelectedAssets([]);
  };

  const handleExport = () => {
    console.log('Export to Excel');
    alert('Export functionality would download Excel file');
  };

  const toggleSelection = (anln1: string) => {
    setSelectedAssets((prev) =>
      prev.includes(anln1)
        ? prev.filter((id) => id !== anln1)
        : [...prev, anln1]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map((a) => a.anln1));
    }
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

  return (
    <SemanticPage
      titleHeading={
        <h1 className="text-2xl font-semibold text-[#32363A]">
          Manage Fixed Assets
        </h1>
      }
      titleBreadcrumbs={
        <div className="flex items-center gap-2 text-sm">
          <a href="/" className="text-[#0070F2] hover:underline">
            Home
          </a>
          <span className="text-[#6A6D70]">/</span>
          <a href="/finance" className="text-[#0070F2] hover:underline">
            Finance
          </a>
          <span className="text-[#6A6D70]">/</span>
          <span className="text-[#6A6D70]">Fixed Assets</span>
        </div>
      }
      headerContent={
        <>
          <ObjectNumber
            number={activeAssetsCount}
            unit="Active Assets"
            state="information"
            emphasized
          />
          <ObjectNumber
            number={totalBookValue}
            format="currency"
            state="none"
            emphasized
          />
          <ObjectNumber
            number={totalDepreciation}
            unit="Total Depreciation"
            format="currency"
            state="warning"
          />
        </>
      }
      headerPinnable
      toggleHeaderOnTitleClick
      positiveAction={{
        text: 'Create',
        onClick: handleCreateAsset,
      }}
      negativeAction={{
        text: 'Delete',
        onClick: handleDeleteAsset,
        enabled: selectedAssets.length > 0,
      }}
      customHeaderActions={[
        <button
          key="refresh"
          onClick={handleRefresh}
          className="p-2 hover:bg-[#F7F7F7] rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-[#6A6D70]" />
        </button>,
      ]}
      showFooter
      footerCustomActions={[
        <button
          key="export"
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#0070F2] hover:bg-[#EBF5FF] rounded transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>,
      ]}
    >
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-[#D9D9D9] p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D70]" />
            <input
              type="text"
              placeholder="Search by Asset Number, Description, Cost Center..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#D9D9D9] rounded focus:outline-none focus:border-[#0070F2] focus:ring-1 focus:ring-[#0070F2]"
            />
          </div>
          <span className="text-sm text-[#6A6D70]">
            {filteredAssets.length} of {assets.length} assets
          </span>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#D9D9D9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-[#D9D9D9]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedAssets.length === filteredAssets.length &&
                      filteredAssets.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[#0070F2] border-[#D9D9D9] rounded focus:ring-[#0070F2]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6A6D70] uppercase">
                  Asset Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6A6D70] uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6A6D70] uppercase">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6A6D70] uppercase">
                  Cost Center
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6A6D70] uppercase">
                  Book Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6A6D70] uppercase">
                  Depreciation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6A6D70] uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6A6D70] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.anln1}
                  className="hover:bg-[#F7F7F7] transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.anln1)}
                      onChange={() => toggleSelection(asset.anln1)}
                      className="w-4 h-4 text-[#0070F2] border-[#D9D9D9] rounded focus:ring-[#0070F2]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ObjectIdentifier
                      title={asset.anln1}
                      text={asset.bukrs}
                      titleActive
                      onTitleClick={() => handleAssetClick(asset.anln1)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#32363A]">{asset.txt50}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-[#6A6D70]">
                      {asset.anlkl}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-[#6A6D70]">
                      {asset.kostl}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ObjectNumber
                      number={asset.knsal}
                      format="currency"
                      decimals={0}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ObjectNumber
                      number={asset.kansw}
                      format="currency"
                      decimals={0}
                      state="warning"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ObjectStatus
                      text={asset.status}
                      state={getStatusState(asset.status)}
                      icon
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAssetClick(asset.anln1)}
                        className="p-1 hover:bg-[#EBF5FF] text-[#0070F2] rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 hover:bg-[#EBF5FF] text-[#0070F2] rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-[#6A6D70]">No assets found</p>
          </div>
        )}
      </div>
    </SemanticPage>
  );
}
