import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { Consultation } from '../../consultation/consultation.model';
const getPharmecyStatus = async (id: string) => {
  const totalResolved = await Consultation.countDocuments({
    forwardToPartner: true,
    status: 'accepted',
  });
  const totalRemaining = await Consultation.countDocuments({
    forwardToPartner: true,
    status: { $ne: 'accepted' },
  });
  const totalEarning =
    (
      await Consultation.aggregate([
        {
          $match: { paid: true },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ])
    )[0]?.total || 0;
  const totalDailyEarning =
    (
      await Consultation.aggregate([
        {
          $match: {
            paid: true,
            orderDate: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ])
    )[0]?.total || 1;
  return {
    totalRemaining,
    totalResolved,
    totalDailyEarning: totalDailyEarning.length,
    totalEarning,
  };
};
const getPharmecyWorkload = async (year: number) => {
  const currentYear = year || new Date().getFullYear();
  const result = await Consultation.aggregate([
    {
      $match: {
        paid: true,
        orderDate: {
          $gte: new Date(currentYear, 0, 1),
          $lte: new Date(currentYear, 11, 31),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$orderDate' },
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        total: 1,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const data = months.map((month, index) => {
    const found = result.find(item => item.month === index + 1);
    return {
      month,
      total: found ? found.total : 0,
    };
  });
  return data;
};
const getPharmecyEarnings = async (year: number) => {
  const currentYear = year || new Date().getFullYear();
  const result = await Consultation.aggregate([
    {
      $match: {
        paid: true,
        orderDate: {
          $gte: new Date(currentYear, 0, 1),
          $lte: new Date(currentYear, 11, 31),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$orderDate' },
        total: { $sum: '$totalAmount' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        total: 1,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const data = months.map((month, index) => {
    const found = result.find(item => item.month === index + 1);
    return {
      month,
      total: found ? found.total : 0,
    };
  });
  return data;
};

export const PharmecyService = {
  getPharmecyStatus,
  getPharmecyWorkload,
  getPharmecyEarnings,
};
