import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import categoriesRouter from "./categories";
import inquiryRouter from "./inquiry";
import eventsRouter from "./events";
import adminRouter from "./admin";
import eventCategoriesRouter from "./eventCategories";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(listingsRouter);
router.use(categoriesRouter);
router.use(inquiryRouter);
router.use("/events", eventsRouter);
router.use("/event-categories", eventCategoriesRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);

export default router;
