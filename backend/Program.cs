using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

const string authPolicyName = "auth-policy";
const string corsPolicyName = "cors-policy";
const string issuingAuthority = @"http://localhost:8080/realms/reports-realm";
const string requiredRole = "prothetic_user";

builder.Services.AddAuthentication(defaultScheme: JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(jwtBearerOptions =>
{
    jwtBearerOptions.Authority = issuingAuthority;
    jwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = issuingAuthority,
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = false,
        ValidateIssuerSigningKey = true,
    };
    jwtBearerOptions.RequireHttpsMetadata = false;
});

builder.Services.AddAuthorization(authorizationOptions =>
{
    authorizationOptions.AddPolicy(authPolicyName, policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.RequireAuthenticatedUser();
        policy.RequireRole(requiredRole);
    });
});

builder.Services.AddControllers(mvcOptions =>
{
    mvcOptions.Filters.Add(new AuthorizeFilter(authPolicyName));
});
//builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options => options.AddPolicy(corsPolicyName, 
    policy =>
    {
        policy.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader();
    }));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseForwardedHeaders(new ForwardedHeadersOptions
//{
//    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
//});

//app.UseHttpsRedirection();

//app.UseMiddleware<AuthorizationValidator>();

app.UseCors(corsPolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
