import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import categoriesRouter from "./categories";
import inquiryRouter from "./inquiry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(listingsRouter);
router.use(categoriesRouter);
router.use(inquiryRouter);

export default router;
