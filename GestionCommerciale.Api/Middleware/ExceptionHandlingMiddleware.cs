using Microsoft.AspNetCore.Mvc;

namespace GestionCommerciale.Api.Middleware;

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
            var (status, title) = ex switch
            {
                NotFoundException => (StatusCodes.Status404NotFound, "Ressource introuvable"),
                BusinessRuleException => (StatusCodes.Status400BadRequest, "Règle de gestion non respectée"),
                ConflictException => (StatusCodes.Status409Conflict, "Conflit"),
                _ => (StatusCodes.Status500InternalServerError, "Erreur interne du serveur")
            };

            if (status == StatusCodes.Status500InternalServerError)
                _logger.LogError(ex, "Erreur non gérée");

            // On ne divulgue pas le détail des erreurs 500
            var detail = ex.Message;

            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = detail
            });
        }
    }
}