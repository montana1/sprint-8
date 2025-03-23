# syntax=docker/dockerfile:1.4
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем конфиг и локальный NuGet кэш
COPY nuget.config ./
COPY ReportApi/local-packages /root/.nuget/packages
ENV NUGET_PACKAGES=/root/.nuget/packages

# Копируем проект
COPY ReportApi/ReportApi.csproj ./ReportApi/
RUN dotnet restore ./ReportApi/ReportApi.csproj --configfile nuget.config

# Копируем исходники
COPY ReportApi/. ./ReportApi/
RUN dotnet publish ./ReportApi/ReportApi.csproj -c Release -o /app/publish /p:UseAppHost=false

# Финальный образ
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "ReportApi.dll"]
