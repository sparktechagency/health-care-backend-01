export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};
export type ISendEmailMessage = {
  name: string;
  phone: string;
  email: string;
  type: string;

  description: string;
};
