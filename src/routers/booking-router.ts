import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { updateBooking, bookingProcess, getBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", bookingProcess)
  .put("/:bookingId", updateBooking);

export { bookingRouter };
