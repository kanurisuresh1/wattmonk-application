export type Root = allSserListmodalClass[];

export interface allSserListmodalClass {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  company: any;
  logo: any;
  userimage: any;
  couponsapplieds: any[];
  transactions: Transaction[];
}

export interface Transaction {
  id: number;
  paymenttype: string;
  addsubtract: any;
  amount: number;
  paymentstatus: string;
  transactionid: string;
  user: number;
  created_at: string;
  updated_at: string;
  couponamount: any;
  coupon: any;
  slabdiscount: number;
  design: number;
  servicetype: string;
  pestamp: any;
  transactiontype: string;
  created_by: any;
  updated_by: any;
}
