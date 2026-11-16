namespace GestionCommerciale.Api.DTOs;

public class TaxDto
{
    public int Id { get; set; }
    public string Libelle { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Valeur { get; set; }
    public bool IsActive { get; set; }
}
