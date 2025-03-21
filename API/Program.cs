using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var keycloakUrl = builder.Configuration["Keycloak:Url"];
var keycloakRealm = builder.Configuration["Keycloak:Realm"];
var keycloakClientId = builder.Configuration["Keycloak:ClientId"];
var keycloakClientSecret = builder.Configuration["Keycloak:ClientSecret"];

if (string.IsNullOrEmpty(keycloakUrl) || string.IsNullOrEmpty(keycloakRealm) || string.IsNullOrEmpty(keycloakClientId) || string.IsNullOrEmpty(keycloakClientSecret))
{
    throw new InvalidOperationException("Keycloak URL, Realm, Client ID, and Client Secret must be configured.");
}

var keycloakAuthority = $"{keycloakUrl}/realms/{keycloakRealm}";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = keycloakAuthority;  // URL Keycloak и realm
    options.MetadataAddress = $"{keycloakAuthority}/.well-known/openid-configuration";  // URL для получения метаданных
    options.RequireHttpsMetadata = false;  // Отключаем HTTPS для разработки

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,              // Проверка Issuer
        ValidateAudience = false,            // Проверка Audience
        ValidateLifetime = true,            // Проверка срока действия токена
        ValidateIssuerSigningKey = true,    // Проверка подписи токена
        ValidIssuer = keycloakAuthority,    // Ожидаемый Issuer
    };

    // Логирование для диагностики
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine("Authentication failed: " + context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated: " + context.SecurityToken);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin()  // Разрешаем запросы с любого источника
                   .AllowAnyMethod()  // Разрешаем все HTTP-методы (GET, POST, OPTIONS и т.д.)
                   .AllowAnyHeader(); // Разрешаем все заголовки
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();

app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run("http://*:80");