using System.ComponentModel.DataAnnotations;

namespace GestionCommerciale.Api.DTOs;

public class OrderCreateDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Le client est obligatoire.")]
    public int ClientId { get; set; }

    [Required, MinLength(1, ErrorMessage = "Une commande doit contenir au moins une ligne.")]
    public List<OrderLineCreateDto> Lines { get; set; } = new();
}