using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using ReportApi.Authorization;
using ReportApi.Constants;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "http://localhost:8080/realms/reports-realm";
        options.Audience = "reports-frontend";
        options.RequireHttpsMetadata = false; 
    });

// Configure Authorization
builder.Services.AddScoped<IAuthorizationHandler, RealmAccessHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ReportsAccess", policy =>
        policy.Requirements.Add(new RealmAccessRequirement(Roles.ProtheticUser)));
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
.RequireAuthorization("ReportsAccess");

app.Run(); 