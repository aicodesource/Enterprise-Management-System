export type Theme = 'light' | 'dark' | 'rainbow';

export interface MasterCA {
  kode: string;
  nama: string;
}

export interface MasterBiller {
  kode: string;
  nama: string;
}

export interface MasterFee {
  kode_biller: string;
  kode_ca: string;
  fee: number;
  admin: number;
}

export interface MasterBank {
  bank_settel: string;
  kode_biller: string;
  kode_ca: string;
}

export interface TransactionDetail {
  id_pelanggan: string;
  periode: string;
  kode_ca: string;
  nama_ca: string;
  kode_biller: string;
  nama_biller: string;
  lembar: number;
  nominal: number;
}

export interface RekapBiller {
  kode_biller: string;
  nama_biller: string;
  lembar: number;
  nominal: number;
}

export interface RekapCA {
  kode_ca: string;
  nama_ca: string;
  lembar: number;
  nominal: number;
}

export interface RekapTransaksi {
  kode_ca: string;
  kode_biller: string;
  lembar: number;
  nominal: number;
  bank_settel: string;
  fee: number;
  admin: number;
}

export interface AuditLog {
  tgl: string;
  user: string;
  aksi: string;
  detail: string;
}

export interface User {
  username: string;
  role: string;
  status: string;
  email?: string;
}

export interface AppState {
  'master-ca': MasterCA[];
  'master-biller': MasterBiller[];
  'master-fee': MasterFee[];
  'master-bank': MasterBank[];
  'detail-transaksi': TransactionDetail[];
  'rekap-biller': RekapBiller[];
  'rekap-ca': RekapCA[];
  'rekap-transaksi': RekapTransaksi[];
  'rekap-ba': any[];
  'user-management': User[];
}

export interface PageConfig {
  title: string;
  fields: string[];
  labels: string[];
}
