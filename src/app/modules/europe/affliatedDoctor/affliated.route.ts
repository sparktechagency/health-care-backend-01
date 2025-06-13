import { AffiliatedDoctorController } from "./affliated.controller";
import express from "express";
import { USER_ROLES } from "../../../../enums/user";
import auth from "../../../middlewares/auth";


const router = express.Router();
const rolesOfAccess = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.USER,
];
router.post(
  '/',
    AffiliatedDoctorController.createDoctor,
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN)
);
router.get(
  '/',
    AffiliatedDoctorController.getAllDoctors,
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN)
);
router.get(
  '/:id',
    AffiliatedDoctorController.getDoctorById,
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN)
);
router.patch(
  '/:id',
    AffiliatedDoctorController.updateDoctor,
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN)
);
router.delete(
  '/:id',
    AffiliatedDoctorController.deleteDoctor,
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN)
);
export const AffliatedRoutes = router;
