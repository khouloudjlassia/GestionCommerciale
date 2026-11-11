using System.ComponentModel.DataAnnotations;

namespace GestionCommerciale.Api.DTOs;

public class ProductCreateDto
{
    [Required, StringLength(50)]
    public string Reference { get; set; } = string.Empty;

    [Required, StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(typeof(decimal), "0", "999999999")]
    public decimal UnitPriceHT { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }
}