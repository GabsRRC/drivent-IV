import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBookingByUser(userId: number) {
  return prisma.user.findFirst({
    where: {
      id: userId
    },
    select: {
      Booking: {
        select: {
          id: true,
          Room: true
        }
      }
    }
  });
}

async function updateBookingById(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId: roomId
    }
  });
}

async function createBooking(booking: BookingParams) {
  return prisma.booking.create({
    data: {
      ...booking,
    } });
}

async function findBookingId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId
    },
    select: {
      id: true
    }
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId
    },
    include: {
      Booking: true
    }
  });
}

export type BookingParams = Omit<Booking, "id" | "createdAt" | "updatedAt">

const bookingRepository = {
  findBookingByUser,
  updateBookingById,
  createBooking,
  findBookingId,
  findRoomById
};

export default bookingRepository;
