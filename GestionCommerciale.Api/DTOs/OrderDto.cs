namespace GestionCommerciale.Api.DTOs;

public class OrderLineDto
{
    public int ProductId { get; set; }
    public string ProductReference { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalHT { get; set; }
    public decimal TotalTTC { get; set; }
    public List<OrderLineDto> Lines { get; set; } = new();
}