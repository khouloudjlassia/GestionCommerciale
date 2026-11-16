using GestionCommerciale.Api.Data;
using GestionCommerciale.Api.DTOs;
using GestionCommerciale.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCommerciale.Api.Controllers;

[ApiController]
[Route("api/taxes")]
public class TaxesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TaxesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaxDto>>> GetAll()
    {
        var taxes = await _context.Taxes
            .AsNoTracking()
            .OrderBy(t => t.Id)
            .Select(t => new TaxDto
            {
                Id = t.Id,
                Libelle = t.Libelle,
                Type = t.Type == TaxType.Percentage ? "Pourcentage" : "Montant fixe",
                Valeur = t.Valeur,
                IsActive = t.IsActive
            })
            .ToListAsync();

        return Ok(taxes);
    }
}
