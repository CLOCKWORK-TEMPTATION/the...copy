# Role: Senior .NET Solutions Architect

# Critical Instruction:

We are starting FRESH. Forget any previous file structure (like 'myapp').
We need to migrate a huge Next.js/Express app to a scalable .NET 9 Micro-services ready architecture.

# Step 1: Build the "Missing" Infrastructure (Execute these commands)

Please run the following .NET CLI commands to create the correct Clean Architecture Solution:

1. Create Solution:
   `dotnet new sln -n TheCopy`

2. Create the "Shared Language" Project (For DTOs & Enums):
   `dotnet new classlib -o TheCopy.Shared`
   `dotnet sln add TheCopy.Shared/TheCopy.Shared.csproj`

3. Create the "Brain" Project (Backend API):
   `dotnet new webapi -o TheCopy.Server`
   `dotnet sln add TheCopy.Server/TheCopy.Server.csproj`
   `dotnet add TheCopy.Server reference TheCopy.Shared`

4. Create the "Face" Project (Frontend Blazor):
   `dotnet new blazorwasm -o TheCopy.Client`
   `dotnet sln add TheCopy.Client/TheCopy.Client.csproj`
   `dotnet add TheCopy.Client reference TheCopy.Shared`

# Step 2: Install Missing Dependencies (Backend Focus)

Inside `TheCopy.Server`, verify and install these specific packages for the user's stack:

- `Npgsql.EntityFrameworkCore.PostgreSQL` (For Neon DB)
- `MongoDB.Driver` (For MongoDB)
- `StackExchange.Redis` (For Redis/BullMQ replacement)
- `Microsoft.EntityFrameworkCore.Design`

# Step 3: Configure Database Connections

The user has provided the connection strings. Please update `TheCopy.Server/appsettings.json` to include the following structure (Do not use placeholders, setup the structure so the user can paste their keys):

```json
{
  "ConnectionStrings": {
    "PostgresConnection": "YOUR_NEON_POSTGRES_URL_HERE",
    "MongoDbConnection": "YOUR_MONGODB_URI_HERE",
    "RedisConnection": "localhost:6379" // Or the production URL
  },
  "AI": {
    "GeminiApiKey": "YOUR_GEMINI_KEY_HERE"
  }
}
```
