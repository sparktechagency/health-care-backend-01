export function calculateRedemptionTime(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const timeDifference = (end.getTime() - start.getTime()) / 1000;

  const redemptionTime =
    timeDifference > 0
      ? Math.floor(end.getTime() / 1000)
      : Math.floor(start.getTime() / 1000) + 7 * 24 * 60 * 60;

  return redemptionTime;
}
