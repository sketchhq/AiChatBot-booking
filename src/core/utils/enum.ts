




export enum Day {
  MONDAY = 0,
  TUESDAY = 1,
  WEDNESDAY = 2,
  THURSDAY = 3,
  FRIDAY = 4,
  SATURDAY = 5,
  SUNDAY = 6,
}

export enum FreelancerSlot {
  MORNING = 1,
  AFTERNOON = 2,
  EVENING = 3,
}
export const FreelancerBookingSlots = ['Morning', 'AfterNoon', 'Evening'];

export enum PaygPaymentStatus {
  'created',
  'paid',
  'unpaid',
  'partial',
  'pending',
  'cancelled_by_user',
  'cancelled_by_merchant',
  'expired',
}

export const RazorpayPaymentStatus = {
  CAPTURED: 'captured',
  FAILED: 'failed'
};

