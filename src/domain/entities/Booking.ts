export interface Booking {
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: "pending" | "approved" | "declined";
}
