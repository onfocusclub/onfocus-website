import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import partnerApplicationsRouter from "./routes/partnerApplications";
import { logger } from "./lib/logger";
import uploadsRouter from "./routes/uploads";
import eventsRouter from "./routes/events";
import adminRouter from "./routes/admin";
import eventCategoriesRouter from "./routes/eventCategories";
import paymentsRouter from "./routes/payments";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/partner-applications", partnerApplicationsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/event-categories", eventCategoriesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api", router);
export default app;
