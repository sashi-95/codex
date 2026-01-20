/**
 * Mock Data for Fixed Asset Management (FI-AA)
 * Using actual SAP ABAP field names
 */

export interface FixedAsset {
  // Key fields
  bukrs: string;      // Company Code
  anln1: string;      // Main Asset Number
  anln2: string;      // Asset Sub-number

  // Master Data
  txt50: string;      // Asset Description
  anlkl: string;      // Asset Class
  kostl: string;      // Cost Center
  werks: string;      // Plant
  raumn: string;      // Room

  // Valuation
  knsal: number;      // Book Value (APC)
  kansw: number;      // Accumulated Depreciation
  answl: number;      // Current Year Depreciation
  invnr: string;      // Inventory Number

  // Time-dependent
  aktiv: string;      // Capitalization Date (YYYYMMDD)
  deakt: string;      // Deactivation Date (YYYYMMDD)
  ord41: string;      // Investment Order

  // Status
  status: 'Active' | 'Inactive' | 'In Transfer' | 'Retired';
}

export const mockAssets: FixedAsset[] = [
  {
    bukrs: '1000',
    anln1: '100001',
    anln2: '0',
    txt50: 'Production Machine - CNC Lathe A1',
    anlkl: '3100',
    kostl: 'PR-100',
    werks: 'P001',
    raumn: 'SHOP-01',
    knsal: 450000,
    kansw: 180000,
    answl: 45000,
    invnr: 'INV-2023-001',
    aktiv: '20200115',
    deakt: '',
    ord41: 'IO-2020-001',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100002',
    anln2: '0',
    txt50: 'Office Building - Headquarters',
    anlkl: '1000',
    kostl: 'AD-100',
    werks: 'P001',
    raumn: '',
    knsal: 2500000,
    kansw: 625000,
    answl: 62500,
    invnr: 'INV-2018-050',
    aktiv: '20180301',
    deakt: '',
    ord41: 'IO-2018-010',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100003',
    anln2: '0',
    txt50: 'Forklift - Electric Model FL-200',
    anlkl: '3200',
    kostl: 'WH-100',
    werks: 'P001',
    raumn: 'WH-AREA-2',
    knsal: 35000,
    kansw: 28000,
    answl: 3500,
    invnr: 'INV-2019-125',
    aktiv: '20190710',
    deakt: '',
    ord41: '',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100004',
    anln2: '0',
    txt50: 'Server Infrastructure - Data Center A',
    anlkl: '4000',
    kostl: 'IT-100',
    werks: 'P001',
    raumn: 'DC-001',
    knsal: 180000,
    kansw: 90000,
    answl: 36000,
    invnr: 'INV-2021-078',
    aktiv: '20210401',
    deakt: '',
    ord41: 'IO-2021-005',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100005',
    anln2: '0',
    txt50: 'Company Vehicle - Toyota Camry',
    anlkl: '2100',
    kostl: 'SA-100',
    werks: 'P001',
    raumn: '',
    knsal: 32000,
    kansw: 20000,
    answl: 6400,
    invnr: 'INV-2020-089',
    aktiv: '20200615',
    deakt: '',
    ord41: '',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100006',
    anln2: '0',
    txt50: 'Warehouse Shelving System',
    anlkl: '1500',
    kostl: 'WH-100',
    werks: 'P001',
    raumn: 'WH-MAIN',
    knsal: 85000,
    kansw: 42500,
    answl: 8500,
    invnr: 'INV-2019-234',
    aktiv: '20191120',
    deakt: '',
    ord41: 'IO-2019-015',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100007',
    anln2: '0',
    txt50: 'HVAC System - Building 1',
    anlkl: '1200',
    kostl: 'FM-100',
    werks: 'P001',
    raumn: '',
    knsal: 120000,
    kansw: 72000,
    answl: 12000,
    invnr: 'INV-2018-156',
    aktiv: '20180815',
    deakt: '',
    ord41: 'IO-2018-020',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100008',
    anln2: '0',
    txt50: 'Conference Room Equipment',
    anlkl: '4500',
    kostl: 'AD-100',
    werks: 'P001',
    raumn: 'CONF-A',
    knsal: 25000,
    kansw: 15000,
    answl: 5000,
    invnr: 'INV-2021-167',
    aktiv: '20210920',
    deakt: '',
    ord41: '',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100009',
    anln2: '0',
    txt50: 'Production Line Conveyor Belt',
    anlkl: '3150',
    kostl: 'PR-100',
    werks: 'P001',
    raumn: 'SHOP-02',
    knsal: 95000,
    kansw: 47500,
    answl: 9500,
    invnr: 'INV-2019-298',
    aktiv: '20191015',
    deakt: '',
    ord41: 'IO-2019-030',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100010',
    anln2: '0',
    txt50: 'Legacy Printing Equipment',
    anlkl: '3300',
    kostl: 'PR-200',
    werks: 'P002',
    raumn: 'PRINT-01',
    knsal: 65000,
    kansw: 65000,
    answl: 0,
    invnr: 'INV-2015-042',
    aktiv: '20150312',
    deakt: '20231231',
    ord41: '',
    status: 'Retired',
  },
  {
    bukrs: '1000',
    anln1: '100011',
    anln2: '0',
    txt50: 'Quality Control Lab Equipment',
    anlkl: '4200',
    kostl: 'QC-100',
    werks: 'P001',
    raumn: 'LAB-01',
    knsal: 75000,
    kansw: 30000,
    answl: 15000,
    invnr: 'INV-2022-091',
    aktiv: '20220215',
    deakt: '',
    ord41: 'IO-2022-003',
    status: 'Active',
  },
  {
    bukrs: '1000',
    anln1: '100012',
    anln2: '0',
    txt50: 'Security Camera System',
    anlkl: '4600',
    kostl: 'SE-100',
    werks: 'P001',
    raumn: '',
    knsal: 42000,
    kansw: 21000,
    answl: 8400,
    invnr: 'INV-2020-203',
    aktiv: '20201110',
    deakt: '',
    ord41: 'IO-2020-025',
    status: 'Active',
  },
];

// Helper functions
export const getAssetByNumber = (anln1: string): FixedAsset | undefined => {
  return mockAssets.find((asset) => asset.anln1 === anln1);
};

export const getActiveAssets = (): FixedAsset[] => {
  return mockAssets.filter((asset) => asset.status === 'Active');
};

export const getTotalBookValue = (): number => {
  return mockAssets.reduce((sum, asset) => sum + asset.knsal, 0);
};

export const getTotalDepreciation = (): number => {
  return mockAssets.reduce((sum, asset) => sum + asset.kansw, 0);
};

export const getAssetsByClass = (anlkl: string): FixedAsset[] => {
  return mockAssets.filter((asset) => asset.anlkl === anlkl);
};

export const getAssetsByCostCenter = (kostl: string): FixedAsset[] => {
  return mockAssets.filter((asset) => asset.kostl === kostl);
};
