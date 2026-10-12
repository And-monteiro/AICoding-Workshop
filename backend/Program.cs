using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors();

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("Missing ConnectionStrings:Default configuration.");

await EnsureDatabaseSeededAsync(connectionString);

app.MapGet("/api/messages", async () =>
{
    var messages = new List<MessageDto>();

    await using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();

    await using var command = new NpgsqlCommand("SELECT id, text FROM messages ORDER BY id", connection);
    await using var reader = await command.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        messages.Add(new MessageDto(reader.GetInt32(0), reader.GetString(1)));
    }

    return Results.Ok(messages);
});

app.MapGet("/health", () => Results.Ok("healthy"));

app.Run();

static async Task EnsureDatabaseSeededAsync(string connectionString)
{
    await using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();

    await using var createTable = new NpgsqlCommand(
        "CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, text TEXT NOT NULL)",
        connection);
    await createTable.ExecuteNonQueryAsync();

    await using var seed = new NpgsqlCommand(
        "INSERT INTO messages (text) SELECT 'Hello, World!' WHERE NOT EXISTS (SELECT 1 FROM messages)",
        connection);
    await seed.ExecuteNonQueryAsync();
}

record MessageDto(int Id, string Text);
