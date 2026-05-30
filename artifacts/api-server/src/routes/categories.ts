import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, listingsTable } from "@workspace/db";
import { ListCategoriesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      type: listingsTable.type,
      category: listingsTable.category,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(listingsTable)
    .groupBy(listingsTable.type, listingsTable.category);

  const buildCategories = (type: string) =>
    rows
      .filter((r) => r.type === type)
      .map((r) => ({
        slug: r.category.toLowerCase().replace(/\s+/g, "-"),
        label: r.category,
        count: r.count,
      }));

  res.json(
    ListCategoriesResponse.parse({
      artists: buildCategories("artist"),
      vendors: buildCategories("vendor"),
      venues: buildCategories("venue"),
    })
  );
});

export default router;
