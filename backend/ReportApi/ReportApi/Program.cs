using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using ReportApi.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IClaimsTransformation, KeycloakRolesClaimsTransformer>();


builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = "http://localhost:8080/realms/reports-realm"; 
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateLifetime = false, 
            ValidateIssuer = false
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ProtheticUserOnly", policy =>
        policy.RequireRole("prothetic_user")); // это роль из realm_access.roles
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add authentication & authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/whoami", (ClaimsPrincipal user) =>
{
    return Results.Ok(user.Claims.Select(c => new { c.Type, c.Value }));
});

app.MapGet("/reports", () =>
    {
        var reports = new[]
        {
            new { Data1 = "Value 1", Data2 = "Value 2", Data3 = "Value 3" },
            new { Data1 = "Value 4", Data2 = "Value 5", Data3 = "Value 6" },
            new { Data1 = "Value 7", Data2 = "Value 8", Data3 = "Value 9" }
        };

        return Results.Ok(reports);
    })
    .WithName("GetReports")
    .WithOpenApi()
    .RequireAuthorization("ProtheticUserOnly");

app.Run(); 