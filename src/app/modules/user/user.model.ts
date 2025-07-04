import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { GENDER, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';

const userSchema = new Schema<IUser, UserModal>(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    signature: {
      type: String,
      required: false,
    },
    designation: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: false,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: false,
      default: GENDER.MALE,
    },
    regNo: {
      type: String,
      required: false,
    },
    contact: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    location: {
      type: String,
      required: false,
    },
    dateOfBirth: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    status: {
      type: String,
      enum: ['active', 'delete', 'lock'],
      default: 'active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    pharmecyName: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    postcode: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    accountInformation: {
      type: {
        bankAccountNumber: {
          type: String,
          default: null,
          required: false,
        },
        stripeAccountId: {
          type: String,
          default: null,
        },
        externalAccountId: {
          type: String,
          default: null,
        },
        status: {
          type: String,
          default: 'active',
        },
      },
      required: false,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
// userSchema.pre('save', async function (next) {
//   //check user
//   const isExist = await User.findOne({ email: this.email });
//   if (isExist) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
//   }


//   //password hash
//   this.password = await bcrypt.hash(
//     this.password,
//     Number(config.bcrypt_salt_rounds)
//   );
//   next();
// });
userSchema.pre('save', async function (next) {
  // Avoid checking the email if it's the same user that's updating their profile
  if (this.isModified('email')) {
    const isExist = await User.findOne({ email: this.email, _id: { $ne: this._id } });
    if (isExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists!');
    }
  }

  // Hash password before saving the user
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
  }

  next();
});


export const User = model<IUser, UserModal>('User', userSchema);
