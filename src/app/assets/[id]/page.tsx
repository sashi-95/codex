'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Calendar, DollarSign, MapPin, FileText } from 'lucide-react';
import {
  ObjectPage,
  ObjectNumber,
  ObjectStatus,
  ObjectIdentifier,
} from '@/components/fiori';
import { getAssetByNumber } from '@/data/mockAssetData';

/**
 * Fixed Asset Detail Page
 * Demonstrates SAP Fiori ObjectPage pattern in React/Next.js
 */
export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const asset = getAssetByNumber(assetId);

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#32363A] mb-2">
            Asset Not Found
          </h2>
          <p className="text-[#6A6D70] mb-4">
            Asset {assetId} does not exist
          </p>
          <button
            onClick={() => router.push('/assets')}
            className="px-4 py-2 bg-[#0070F2] text-white rounded hover:bg-[#0854A0] transition-colors"
          >
            Back to Asset List
          </button>
        </div>
      </div>
    );
  }

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
    // Convert YYYYMMDD to MM/DD/YYYY
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${month}/${day}/${year}`;
  };

  const currentBookValue = asset.knsal - asset.kansw;

  return (
    <ObjectPage
      heading={
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#32363A]">{asset.txt50}</h1>
          <p className="text-sm text-[#6A6D70]">Asset #{asset.anln1}</p>
        </div>
      }
      snappedHeading={
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#32363A]">
            {asset.anln1}
          </h2>
          <ObjectStatus
            text={asset.status}
            state={getStatusState(asset.status)}
          />
        </div>
      }
      headerContent={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI Cards */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#6A6D70]">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold">Acquisition Value</span>
            </div>
            <ObjectNumber
              number={asset.knsal}
              format="currency"
              emphasized
              decimals={0}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#6A6D70]">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold">
                Accumulated Depreciation
              </span>
            </div>
            <ObjectNumber
              number={asset.kansw}
              format="currency"
              emphasized
              decimals={0}
              state="warning"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#6A6D70]">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold">Current Book Value</span>
            </div>
            <ObjectNumber
              number={currentBookValue}
              format="currency"
              emphasized
              decimals={0}
              state="success"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#6A6D70]">
              <Calendar className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold">
                Capitalization Date
              </span>
            </div>
            <span className="text-lg font-semibold text-[#32363A]">
              {formatDate(asset.aktiv)}
            </span>
          </div>
        </div>
      }
      showTitleInHeaderContent
      upperCaseAnchorBar={false}
      onClose={() => router.push('/assets')}
      sections={[
        {
          id: 'general',
          title: 'General Information',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Company Code" value={asset.bukrs} />
              <FormField label="Asset Number" value={asset.anln1} />
              <FormField label="Sub-number" value={asset.anln2 || 'N/A'} />
              <FormField label="Description" value={asset.txt50} />
              <FormField label="Asset Class" value={asset.anlkl} />
              <FormField label="Inventory Number" value={asset.invnr} />
              <FormField
                label="Status"
                value={
                  <ObjectStatus
                    text={asset.status}
                    state={getStatusState(asset.status)}
                    icon
                  />
                }
              />
            </div>
          ),
        },
        {
          id: 'assignment',
          title: 'Organizational Assignment',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Cost Center" value={asset.kostl} />
              <FormField label="Plant" value={asset.werks} />
              <FormField label="Room" value={asset.raumn || 'N/A'} />
              <FormField label="Investment Order" value={asset.ord41 || 'N/A'} />
            </div>
          ),
        },
        {
          id: 'valuation',
          title: 'Valuation',
          content: (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Acquisition & Production Costs (APC)"
                  value={
                    <ObjectNumber
                      number={asset.knsal}
                      format="currency"
                      decimals={2}
                      emphasized
                    />
                  }
                />
                <FormField
                  label="Accumulated Depreciation"
                  value={
                    <ObjectNumber
                      number={asset.kansw}
                      format="currency"
                      decimals={2}
                      state="warning"
                      emphasized
                    />
                  }
                />
                <FormField
                  label="Current Year Depreciation"
                  value={
                    <ObjectNumber
                      number={asset.answl}
                      format="currency"
                      decimals={2}
                    />
                  }
                />
                <FormField
                  label="Net Book Value"
                  value={
                    <ObjectNumber
                      number={currentBookValue}
                      format="currency"
                      decimals={2}
                      state="success"
                      emphasized
                    />
                  }
                />
              </div>

              {/* Depreciation Chart Placeholder */}
              <div className="mt-8 p-6 bg-[#F7F7F7] rounded border border-[#D9D9D9]">
                <h3 className="text-sm font-semibold text-[#32363A] mb-4">
                  Depreciation Trend
                </h3>
                <div className="h-48 flex items-center justify-center text-[#6A6D70]">
                  <p>Chart showing depreciation over time would appear here</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: 'time',
          title: 'Time-Dependent Data',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Capitalization Date"
                value={formatDate(asset.aktiv)}
              />
              <FormField
                label="Deactivation Date"
                value={asset.deakt ? formatDate(asset.deakt) : 'N/A'}
              />
            </div>
          ),
        },
        {
          id: 'documents',
          title: 'Documents & Attachments',
          content: (
            <div className="p-6 bg-[#F7F7F7] rounded border border-[#D9D9D9]">
              <div className="text-center text-[#6A6D70]">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No documents attached</p>
                <button className="mt-3 text-sm text-[#0070F2] hover:underline">
                  Upload Document
                </button>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}

// Helper component for form fields
function FormField({
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
