describe("Test environment", () => {
  test("should have antalyse_GLOBAL_DIR env var set to .antalyse-test", () => {
    expect(process.env.antalyse_GLOBAL_DIR).toBeDefined();
    expect(process.env.antalyse_GLOBAL_DIR)?.toMatch(/\.antalyse-test$/);
  });
});
