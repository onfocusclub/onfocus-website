async function seed() {
  console.log("No seed listings configured. Skipping.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});