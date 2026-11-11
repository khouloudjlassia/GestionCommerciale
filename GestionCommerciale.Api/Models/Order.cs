namespace GestionCommerciale.Api.Models;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    public decimal TotalHT { get; set; }
    public decimal TotalTTC { get; set; }

    public ICollection<OrderLine> Lines { get; set; } = new List<OrderLine>();
}