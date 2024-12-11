using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policyBuilder => {
        policyBuilder.AllowAnyOrigin();
        policyBuilder.AllowAnyMethod();
        policyBuilder.AllowAnyHeader();
    });
});

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = "http://localhost:8080/realms/reports-realm";
        options.Audience = "reports-frontend";
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = false,
            SignatureValidator = delegate (string token, TokenValidationParameters parameters)
            {
                var jwt = new Microsoft.IdentityModel.JsonWebTokens.JsonWebToken(token);

                return jwt;
            },
        };

    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/reports", [Authorize(Roles = "prothetic_user")](ClaimsPrincipal principal) =>
    {
        var reports = Enumerable.Range(1, 5).Select(index =>
                new {
                    ReportDate = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    ChipType = "ESP32",
                    BatteryCharge = Random.Shared.Next(0, 100) + "%"
                })
            .ToArray();
        return reports;
    })
.WithName("GetReports")
.WithOpenApi();

app.Run();
