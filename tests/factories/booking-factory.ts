import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: faker.datatype.number({ min: 1, max: 3 }),
      hotelId: hotelId
    },
  });
}

export async function createRoomCapacityOne(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 1,
      hotelId: hotelId
    },
  });
}

export async function createRoomCapacityTwo(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 2,
      hotelId: hotelId
    },
  });
}

export async function createRoomCapacityThree(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 3,
      hotelId: hotelId
    },
  });
}

