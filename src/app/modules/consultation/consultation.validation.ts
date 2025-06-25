import { z } from 'zod';

const createConsultationZodSchema = z.object({
  body: z.object({
    QNA: z.array(
      z.object({
        question: z.string({
          required_error: 'question is required',
          invalid_type_error: 'question should be type string',
        }),
        answer: z.string({
          required_error: 'answer is required',
          invalid_type_error: 'answer should be type string',
        }),
      })
    ),
    DinamicQNA: z.array(
      z.object({
        question: z.string({
          required_error: 'question is required',
          invalid_type_error: 'question should be type string',
        }),
        answer: z.string({
          required_error: 'answer is required',
          invalid_type_error: 'answer should be type string',
        }),
      })
    ),

    // medicins: z
    //   .array(
    //     z
    //       .object({
    //         _id: z
    //           .string({
    //             invalid_type_error: '_id must be a string',
    //           })
    //           .optional()
    //           .optional(),
    //         count: z
    //           .number({
    //             invalid_type_error: 'Count must be a number',
    //           })
    //           .optional(),

    //         total: z
    //           .string({
    //             invalid_type_error: 'Total must be a string',
    //           })
    //           .optional(),
    //       })
    //       .optional()
    //   )
    //   .optional(),

medicins: z
  .array(
    z.object({
      _id: z.string().optional(),
      dosage: z.string().optional(),
      unitPerBox: z.string().optional(),
      count: z.number().optional(),
      total: z.string().optional(),
    })
  )
  .optional(),



    // suggestedMedicine: z
    //   .array(
    //     z.object({
    //       _id: z
    //         .string({
    //           required_error: '_id is required',
    //           invalid_type_error: '_id must be a string',
    //         })
    //         .optional(),
    //       count: z.number({
    //         required_error: 'Count is required',
    //         invalid_type_error: 'Count must be a number',
    //       }),
    //       dosage: z.string({
    //         required_error: 'Dosage is required',
    //         invalid_type_error: 'Dosage must be a string',
    //       }),
    //       total: z.string({
    //         required_error: 'Total is required',
    //         invalid_type_error: 'Total must be a string',
    //       }),
    //     })
    //   )
    //   .optional(),
suggestedMedicine: z
  .array(
    z.object({
      medicineId: z.string({
        required_error: 'medicineId is required',
        invalid_type_error: 'medicineId must be a string',
      }),
      dosage: z.string({
        required_error: 'Dosage is required',
        invalid_type_error: 'Dosage must be a string',
      }),
      unitPerBox: z.string({
        required_error: 'unitPerBox is required',
        invalid_type_error: 'unitPerBox must be a string',
      }),
      count: z.number({
        required_error: 'Count is required',
        invalid_type_error: 'Count must be a number',
      }),
      total: z
        .string({
          invalid_type_error: 'Total must be a string',
        })
        .optional(),
    })
  )
  .optional(),

    doctorId: z
      .string({
        required_error: 'doctorId is required',
        invalid_type_error: 'doctorId should be type string',
      })
      .optional(),
    category: z.string({
      required_error: 'category is required',
      invalid_type_error: 'category should be type string',
    }),
    opinion: z
      .string({
        invalid_type_error: 'opinion should be type string',
      })
      .optional(),
    subCategory: z.string({
      required_error: 'subCategory is required',
      invalid_type_error: 'subCategory should be type string',
    }),
    consultationType: z.string({
      required_error: 'consultationType is required',
      invalid_type_error: 'consultationType should be type string',
    }),
    forwardToPartner: z.boolean({
      required_error: 'forwardToPartner is required',
      invalid_type_error: 'forwardToPartner should be type boolean',
    }),
    pharmecyAccepted: z
      .boolean({
        invalid_type_error: 'pharmecyAccepted should be type boolean',
      })
      .optional(),
    scheduledDate: z.string({ invalid_type_error: 'scheduledDate' }).optional(),
    address: z
      .object({
        firstname: z.string({
          required_error: 'Firstname is required',
          invalid_type_error: 'Firstname should be a string',
        }),
        lastname: z.string({
          required_error: 'Lastname is required',
          invalid_type_error: 'Lastname should be a string',
        }),
        streetAndHouseNo: z.string({
          required_error: 'Street and house number are required',
          invalid_type_error: 'Street and house number should be a string',
        }),
        postalCode: z.string({
          required_error: 'Postal code is required',
          invalid_type_error: 'Postal code should be a string',
        }),
        country: z.string({
          required_error: 'Country is required',
          invalid_type_error: 'Country should be a string',
        }),
        place: z.string({
          required_error: 'Place is required',
          invalid_type_error: 'Place should be a string',
        }),
      })
      .optional(),
  }),
});

export const ConsultationValidation = {
  createConsultationZodSchema,
};
