import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

// GET na tabela booking
export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBookingById(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.status === 403) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

// POST na tabela booking
export async function bookingProcess(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const booking = await bookingService.bookingProcess(userId, roomId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.status === 404) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

//PUT na tabela booking
export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try{
    const booking = await bookingService.updateBooking(userId, roomId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.status === 404) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
