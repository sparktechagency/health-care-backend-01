import { Types, Model, Schema } from 'mongoose';
type IQNA = { question: string; answer: string };
export type IMedicineItem = {
  _id: Types.ObjectId;
  dosage?: string;
  count: number;
  total: string;
};


export interface ISelectedMedicine {
  medicineId: Schema.Types.ObjectId;
  variationId: Schema.Types.ObjectId; // Reference to specific variation
  unitId: Schema.Types.ObjectId; // Reference to specific unit within variation
  count: number;
  total: number;
}


export type IConsultation = {
  _id?: Types.ObjectId;
  QNA: Array<IQNA>;
  DinamicQNA: Array<IQNA>;
  userId: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  // medicins?: [IMedicineItem];
  selectedMedicines: ISelectedMedicine[];
    medicins?: Array<{
    _id: Schema.Types.ObjectId;
    count: number;
    total: string;
  }>;
   originalAmount?: number;
  discountAmount?: number;
  appliedDiscount?: {
    discountId: string;
    discountCode: string;
    discountPercentage: number;
    discountAmount: number;
  };
  consultationType?: string;
  totalAmount?: number;
  pdfFile: string;
  link?: string;
  forwardToPartner?: boolean;
  paymentIntentID?: string;
  status?: string;
  pharmecyAccepted: boolean;
  doctorId?: Types.ObjectId;
  trackingNo?: string;
  orderDate?: Date;
  // suggestedMedicine?: [IMedicineItem];
    suggestedMedicine?: Array<{
    _id: Schema.Types.ObjectId;
    dosage:Schema.Types.ObjectId;
    count: number;
    total: Schema.Types.ObjectId;
  }>;
  rejectedOpinion?: string;
  opinion?: string;
  paid?: boolean;
  withrawn?: boolean;
  withdrawnDate?: Date;
  paymentIntent?: string;
  scheduledDate?: Date;
  address?: {
    firstname: string;
    lastname: string;
    streetAndHouseNo: string;
    postalCode: string;
    country: string;
    place: string;
  };
  createdAt: Date;
  updatedAt:Date;
};
export type ConsultationModel = Model<IConsultation>;
