import { Schema, model, models } from 'mongoose';
import { IConsultation, ConsultationModel } from './consultation.interface';
import { CONSULTATION_TYPE, STATUS } from '../../../../enums/consultation';

// Define schema for the EuropeConsultation
const europeConsultationSchema = new Schema<IConsultation, ConsultationModel>(
  {
    QNA: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    DinamicQNA: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: {
      type: Number,
      required: false,
    },
    withrawn: {
      type: Boolean,
      required: false,
      default: false,
    },
    withdrawnDate: {
      type: Date,
      required: false,
    },
    medicins: {
      type: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: 'Medicine',
            required: false,
          },

          count: {
            type: Number,
            required: false,
          },
          total: {
            type: String,
            required: false,
          },
        },
      ],
      required: false,
    },
    paid: { type: Boolean, required: false, default: false },
    status: {
      type: String,
      enum: Object.values(STATUS),
      required: false,
      default: STATUS.DRAFT,
    },

    orderDate: {
      type: Date,
      required: false,
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: false,
    },
    pdfFile: { type: String, required: false },
    link: { type: String, required: false },
    consultationType: {
      type: String,
      enum: Object.values(CONSULTATION_TYPE),
      required: false,
    },
    opinion: { type: String, required: false },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    paymentIntentID: {
      type: String,
      required: false,
    },
    suggestedMedicine: {
      type: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: 'Medicine',
            required: false,
          },
          dosage: {
            type: String,
            required: false,
          },
          count: {
            type: Number,
            required: true,
          },
          total: {
            type: String,
            required: false,
          },
        },
      ],
      required: false,
    },
    forwardToPartner: { type: Boolean, default: false, required: false },
    pharmecyAccepted: { type: Boolean, default: false, required: false },
    address: {
      type: {
        firstname: {
          type: String,
          required: true,
        },
        lastname: {
          type: String,
          required: true,
        },
        streetAndHouseNo: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        place: {
          type: String,
          required: true,
        },
      },
      required: false,
    },
    rejectedOpinion: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);


export const EuropeConsultation = models.Consultation || model<IConsultation, ConsultationModel>('Consultation', europeConsultationSchema);
