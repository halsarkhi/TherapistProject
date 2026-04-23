using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using TherapistCenter.API.Middleware;
using TherapistCenter.Application;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Infrastructure;
using TherapistCenter.Infrastructure.Data;
using TherapistCenter.Infrastructure.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "Therapist Center API", Version = "v1" });

    // JWT Bearer auth in Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by your token"
    });
    options.AddSecurityRequirement(doc =>
    {
        var requirement = new OpenApiSecurityRequirement();
        var scheme = new OpenApiSecuritySchemeReference("Bearer");
        requirement.Add(scheme, new List<string>());
        return requirement;
    });
});

// CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Application layer DI (MediatR, FluentValidation)
builder.Services.AddApplication(builder.Configuration);

// Infrastructure layer DI (DbContext, Identity, JWT, Repositories)
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Database migration and seeding
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    // Create roles
    string[] roles = ["Admin", "Therapist", "Parent"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    // Create default admin
    if (await userManager.FindByEmailAsync("admin@therapistcenter.com") == null)
    {
        var admin = new ApplicationUser
        {
            UserName = "admin@therapistcenter.com",
            Email = "admin@therapistcenter.com",
            FullName = "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0638\u0627\u0645",
            Role = UserRole.Admin,
            EmailConfirmed = true
        };
        await userManager.CreateAsync(admin, "Admin@123");
        await userManager.AddToRoleAsync(admin, "Admin");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowAngular");
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
