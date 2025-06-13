import {
  IMessage,
  INotification,
} from '../app/modules/message/message.interface';
import {
  ICreateAccount,
  IResetPassword,
  ISendEmailMessage,
} from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dulgs9eba/image/upload/v1735107378/02A09086-1999-46A0-9272-B40D12A9C8A5_2_cmxrp2.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #1240b4; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #1240b4; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dulgs9eba/image/upload/v1735107378/02A09086-1999-46A0-9272-B40D12A9C8A5_2_cmxrp2.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #1240b4; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};
const sendMessage = (values: IMessage) => {
  const data = {
    from: values.email,
    subject: `Message from ${values.name}`,
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dulgs9eba/image/upload/v1735107378/02A09086-1999-46A0-9272-B40D12A9C8A5_2_cmxrp2.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        
        <h1 style="text-align: center; color: #1240b4; margin-bottom: 30px;">Contact Information</h1>
        
        <div style="padding: 20px;">
            <div style="margin-bottom: 15px;">
                <strong style="color: #1240b4;">Name:</strong>
                <span style="margin-left: 10px;">${values.name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #1240b4;">Phone Number:</strong>
                <span style="margin-left: 10px;">${values.phone}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #1240b4;">Email:</strong>
                <span style="margin-left: 10px;">${values.email}</span>
            </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #1240b4;">Type:</strong>
                <div style="margin-top: 10px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    ${values.type}
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #1240b4;">Message:</strong>
                <div style="margin-top: 10px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    ${values.description}
                </div>
            </div>
        </div>
    </div>
</body>`,
  };

  return data;
};
const sendNotification = (values: INotification) => {
  const data = {
    from: values.email,
    subject: `Message from ${values.name}`,
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dulgs9eba/image/upload/v1735107378/02A09086-1999-46A0-9272-B40D12A9C8A5_2_cmxrp2.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="padding: 20px;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">${values.message}</p>
        </div>
    </div>
    </body>`,
  };

  return data;
};
export const emailTemplate = {
  createAccount,
  resetPassword,
  sendMessage,
  sendNotification,
};
