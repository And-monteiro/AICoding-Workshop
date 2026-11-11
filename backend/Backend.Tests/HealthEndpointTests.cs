using Microsoft.AspNetCore.Mvc.Testing;

namespace Backend.Tests;

public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        // Program.cs requires a connection string at startup. This points at a port nothing
        // listens on: /health must work without a database (the background seeding just retries).
        Environment.SetEnvironmentVariable(
            "ConnectionStrings__Default",
            "Host=127.0.0.1;Port=1;Database=unused;Username=unused;Password=unused;Timeout=1");

        _factory = factory;
    }

    [Fact]
    public async Task Health_endpoint_reports_healthy()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("healthy", await response.Content.ReadAsStringAsync());
    }
}
