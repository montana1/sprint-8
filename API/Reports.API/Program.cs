using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace Reports.API;

public class Program
{
    public const string CORS_ALL = "ENABLE_ALL";

    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddTransient<IClaimsTransformation, ClaimsTransformer>();

        var path = Environment.GetEnvironmentVariable("KEYCLOAK_PATH");
        IList<SecurityKey> keys = Array.Empty<SecurityKey>();
        using (var client = new HttpClient())
        {
            // получаем ключи из JWKS 
            var url = $"{path}/realms/reports-realm/protocol/openid-connect/certs";
            try
            {
                var json = await client.GetStringAsync(url);
                keys = new JsonWebKeySet(json).GetSigningKeys();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Не удалось получить ключи из {url}");
                throw;
            }
        }

        builder.Services.AddAuthentication("Bearer")
            .AddJwtBearer("Bearer", options =>
            {

                options.Authority = $"{path}/realms/reports-realm";
                options.RequireHttpsMetadata = false; // Установите в true, если сервер поддерживает HTTPS
                options.Audience = "reports-api";

                options.BackchannelHttpHandler = new HttpClientHandler()
                {
                    MaxConnectionsPerServer = 10 // Увеличьте число одновременных соединений
                };


                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    // валидируем подпись
                    IssuerSigningKeys = keys,
                    ValidateLifetime = true,
                    ValidateAudience = false,
                    ValidateIssuer = false,
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("Token validated successfully");
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(CORS_ALL, policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });


        builder.Services.AddControllers();
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseCors(CORS_ALL);

        app.MapControllers();

        app.Run();
    }
}

// маппинг ролей
public class ClaimsTransformer : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        ClaimsIdentity claimsIdentity = (ClaimsIdentity)principal.Identity;

        if (claimsIdentity.IsAuthenticated && claimsIdentity.HasClaim((claim) => claim.Type == "realm_access"))
        {
            var realmAccessClaim = claimsIdentity.FindFirst((claim) => claim.Type == "realm_access");
            var realmAccessAsDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string[]>>(realmAccessClaim.Value);
            if (realmAccessAsDict["roles"] != null)
            {
                foreach (var role in realmAccessAsDict["roles"])
                {
                    claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, role));
                }
            }
        }

        return Task.FromResult(principal);
    }
}