import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createTicketTypeIncludeHotel,
  createHotel,
  createRoom,
  createBooking,
  createRoomCapacityOne,
  createRoomCapacityThree
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

// GET "/boking" with invalid token

// should respond with status 401 if no token is given [OK]

// should respond with status 401 if given token is not valid [OK]

// should respond with status 401 if there is no session for given token [OK]

// GET "/boking" with valid token

// should respond with status 403 if no ticket/enrollment/PAID 

// should respond with status 404 when there are no booking created yet

// should respond with status 200 and with booking data

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    beforeEach(async () => {
      await cleanDb();
    });
    it("should respond with status 403 if no valid ticket found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if no booking created yet", async () => {
      const user = await createUser(); 
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        {
          id: booking.id,
          Room: {
            id: room.id,
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: hotel.id,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        },
      );
    });
  });
});

// POST '/booking' with invalid token

// should respond with status 401 if no token is given [OK]

// should respond with status 401 if given token is not valid [OK]

// should respond with status 401 if there is no session for given token [OK]

// POST '/booking' with valid token { "roomId" : Number }

// should respond with status 404 if no roomId found

// should respond with status 403 if no valid ticket

// should respond with status 403 if no capacity [1, 2, 3]

// should responde with status 403 if user already got booking

// should respond with status 200 and with bookingId

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    beforeEach(async () => {
      await cleanDb();
    });

    it("should respond with status 403 if no valid ticket found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if no roomId found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 0 });
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if no capacity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createRoomCapacityOne(hotel.id);

      const anotherUser = await createUser();
      await generateValidToken(anotherUser);
      const anotherEnrollment = await createEnrollmentWithAddress(anotherUser);
      await createTicket(anotherEnrollment.id, ticketType.id, TicketStatus.PAID);
      await createBooking(anotherUser.id, room.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user already got booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      await createBooking(user.id, room.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    
    it("should respond with status 200 and with bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
    
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        {
          id: expect.any(Number),
        },
      );
    });
  });
});

// PUT "/boking/:bookingId" with invalid token

// should respond with status 401 if no token is given [OK]

// should respond with status 401 if given token is not valid [OK]

// should respond with status 401 if there is no session for given token [OK]

// PUT "/boking/:bookingId" with valid token { "roomId" : Number }

// should respond with status 403 if no valid ticket

// should respond with status 403 if no previous booking found

// should respond with status 404 if no roomId found

// should respond with status 403 if no capacity [1, 2, 3]

// should respond with status 200 and with new bookingId

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    beforeEach(async () => {
      await cleanDb();
    });

    it("should respond with status 403 if no valid ticket found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if no previous booking found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if no roomId found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomCapacityOne(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: 0 });
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if no capacity", async () => {
      const hotel = await createHotel();
      const room = await createRoomCapacityOne(hotel.id);
      const room2 = await createRoomCapacityOne(hotel.id);
      const ticketType = await createTicketTypeIncludeHotel();

      const anotherUser = await createUser();
      await generateValidToken(anotherUser);
      const anotherEnrollment = await createEnrollmentWithAddress(anotherUser);
      await createTicket(anotherEnrollment.id, ticketType.id, TicketStatus.PAID);
      await createBooking(anotherUser.id, room2.id);

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const booking = await createBooking(user.id, room.id);

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: room2.id });
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    
    it("should respond with status 200 and with new bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeIncludeHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomCapacityThree(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const newRoom = await createRoomCapacityThree(hotel.id);

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: newRoom.id });
    
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        {
          id: expect.any(Number),
        },
      );
    });
  });
});
