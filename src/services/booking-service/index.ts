import bookingRepository from "@/repositories/booking-repository";
import { requestError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";

// CHECK SE TICKET EXISTE E SE É VÁLIDO
async function checkTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  
  if (ticket.TicketType.includesHotel !== true || !enrollment || ticket.status !== "PAID") {
    throw requestError(403, "Forbidden");
  }
}

// CHECK SE USER JA TEM BOOKING ID
async function checkBooking(userId: number) {
  const bookingData = await bookingRepository.findBookingByUser(userId);
  return bookingData;
}

// CHECK SE ROOM ID EXISTE E SE EXISTIR SE TEM VAGA
async function checkRoom(roomId: number) {
  const roomData = await bookingRepository.findRoomById(roomId);
  if (!roomData) {
    throw requestError(404, "Not Found");
  }

  const roomCap = await bookingRepository.findRoomById(roomId);
  if (roomCap.capacity == roomCap.Booking.length) {
    throw requestError(403, "Forbidden");
  }
}

// GET BOOKING FUNCTION
async function getBookingById(userId: number) {
  await checkTicket(userId);
  const bookingData = await bookingRepository.findBookingByUser(userId);
  if (bookingData.Booking.length < 1) {
    throw requestError(404, "Not Found");
  }
  return bookingData.Booking[0];
}

// POST BOOKING FUNCTION
async function bookingProcess(userId: number, roomId: number) {
  await checkTicket(userId);
  const bookingId = await checkBooking(userId);
  if (bookingId.Booking.length > 0) {
    throw requestError(403, "Forbidden");
  }
  await checkRoom(roomId);
  const bookingBody = {
    userId: userId,
    roomId: roomId
  };

  await bookingRepository.createBooking(bookingBody);
  const bookingData = await bookingRepository.findBookingId(userId);
  return bookingData;
}

// PUT BOOKING FUNCTION
async function updateBooking(userId: number, roomId: number) {
  await checkTicket(userId);
  const bookingId2 = await checkBooking(userId);
  if (bookingId2.Booking.length < 1) {
    throw requestError(403, "Forbidden");
  }
  await checkRoom(roomId);
  const bookingId = await bookingRepository.findBookingId(userId);
  await bookingRepository.updateBookingById(bookingId.id, roomId);
  const bookingData = await bookingRepository.findBookingId(userId);
  return bookingData;
}

const bookingService = {
  getBookingById,
  bookingProcess,
  updateBooking
};

export default bookingService;
