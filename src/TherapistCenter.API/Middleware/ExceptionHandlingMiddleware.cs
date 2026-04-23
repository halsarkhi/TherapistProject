using System.Net;
using System.Text.Json;
using FluentValidation;
using TherapistCenter.Application.Common;

namespace TherapistCenter.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var errors = new List<string>();
        var message = "An unexpected error occurred.";

        switch (exception)
        {
            case ValidationException validationException:
                statusCode = HttpStatusCode.BadRequest;
                message = "One or more validation errors occurred.";
                errors = validationException.Errors
                    .Select(e => e.ErrorMessage)
                    .ToList();
                _logger.LogWarning(exception, "Validation failed: {Errors}", string.Join("; ", errors));
                break;

            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                message = "You are not authorized to perform this action.";
                _logger.LogWarning(exception, "Unauthorized access attempt.");
                break;

            case KeyNotFoundException:
                statusCode = HttpStatusCode.NotFound;
                message = exception.Message;
                _logger.LogWarning(exception, "Resource not found: {Message}", exception.Message);
                break;

            default:
                _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

                var env = context.RequestServices.GetRequiredService<IHostEnvironment>();
                if (env.IsDevelopment())
                {
                    message = exception.Message;
                    errors.Add(exception.StackTrace ?? string.Empty);
                }
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.FailureResponse(message, errors);

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(json);
    }
}
