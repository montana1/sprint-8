#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
EXPOSE 8000
EXPOSE 8001

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["BackendController.csproj", "."]
RUN dotnet restore "./BackendController.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "BackendController.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BackendController.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://*:8000
ENTRYPOINT ["dotnet", "BackendController.dll"]