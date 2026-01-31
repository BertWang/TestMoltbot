/**
 * MCP API Tests
 *
 * Basic checks for marketplace and install endpoints.
 */

describe("MCP API", () => {
  const baseUrl = "http://0.0.0.0:3001/api/mcp";

  it("should return marketplace services", async () => {
    const response = await fetch(`${baseUrl}/marketplace`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.marketplace)).toBe(true);
  });

  it("should return installed services", async () => {
    const response = await fetch(`${baseUrl}/marketplace?action=installed`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.installed)).toBe(true);
  });

  it("should validate install payload", async () => {
    const response = await fetch(`${baseUrl}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Missing registryId");
  });
});
