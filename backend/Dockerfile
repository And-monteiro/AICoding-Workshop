FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Backend.csproj ./
COPY Backend.Tests/Backend.Tests.csproj Backend.Tests/
RUN dotnet restore Backend.Tests/Backend.Tests.csproj
COPY . .
RUN dotnet publish Backend.csproj -c Release -o /app --no-restore

# Test runner: `docker compose ... run --rm backend-tests` builds this stage.
# It is never part of the production image (the last stage below is).
FROM build AS test
WORKDIR /src/Backend.Tests
CMD ["dotnet", "test", "--no-restore"]

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Backend.dll"]
