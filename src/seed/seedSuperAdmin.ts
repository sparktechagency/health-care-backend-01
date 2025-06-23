import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';

const superUser: any = {
  firstName: 'SUPER',
  lastName: 'ADMIN',
  role: USER_ROLES.ADMIN,
  email: config.admin.email as string,
  password: config.admin.password as string,
  verified: true,
};

const seedSuperAdmin = async () => {
  const isExistSuperAdmin = await User.findOne({ email: superUser.email });

  if (!isExistSuperAdmin) {
    await User.create(superUser);
    logger.info(colors.green('✔ Super admin created successfully!'));
  }
};

export default seedSuperAdmin;
