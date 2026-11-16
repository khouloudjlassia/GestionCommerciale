namespace GestionCommerciale.Api.Models;

// 1. Le Type : Pourcentage (%) ou Montant fixe (TND)
public enum TaxType
{
    Percentage = 0,   // ex: 19%
    FixedAmount = 1   // ex: 1.000 TND fixe
}

// 2. La classe Tax avec les 4 champs demandés
public class Tax
{
    public int Id { get; set; }

    // Champ 1 : Libellé
    public string Libelle { get; set; } = string.Empty;

    // Champ 2 : Type
    public TaxType Type { get; set; } = TaxType.Percentage;

    // Champ 3 : Valeur
    public decimal Valeur { get; set; }

    // Champ 4 : État (active ou inactive)
    public bool IsActive { get; set; } = true;

    // Relation : les produits associés à cette taxe
    public ICollection<Product> Products { get; set; } = new List<Product>();
}