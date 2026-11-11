using System.ComponentModel.DataAnnotations;

namespace GestionCommerciale.Api.DTOs;

public class OrderLineCreateDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Produit invalide.")]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La quantité doit être supérieure à zéro.")]
    public int Quantity { get; set; }
}