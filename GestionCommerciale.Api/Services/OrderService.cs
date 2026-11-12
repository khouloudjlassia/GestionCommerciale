using GestionCommerciale.Api.DTOs;
using GestionCommerciale.Api.Middleware;
using GestionCommerciale.Api.Models;
using GestionCommerciale.Api.Repositories;

namespace GestionCommerciale.Api.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orders;
    private readonly IClientRepository _clients;
    private readonly IProductRepository _products;

    public OrderService(IOrderRepository orders, IClientRepository clients, IProductRepository products)
    {
        _orders = orders;
        _clients = clients;
        _products = products;
    }

    public async Task<List<OrderDto>> GetAllAsync()
    {
        var orders = await _orders.GetAllAsync();
        return orders.Select(ToDto).ToList();
    }

    public async Task<OrderDto> GetByIdAsync(int id) =>
        ToDto(await GetOrThrowAsync(id));

    public async Task<OrderDto> CreateAsync(OrderCreateDto dto)
    {
        var client = await GetClientOrThrowAsync(dto.ClientId);

        var order = new Order
        {
            OrderNumber = await GenerateOrderNumberAsync(),
            Client = client,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.Draft
        };

        await FillLinesAsync(order, dto.Lines);
        RecalculateTotals(order);

        await _orders.AddAsync(order);
        await _orders.SaveChangesAsync();
        return ToDto(order);
    }

    public async Task<OrderDto> UpdateAsync(int id, OrderCreateDto dto)
    {
        var order = await GetOrThrowAsync(id);
        EnsureDraft(order, "modifiée");

        order.Client = await GetClientOrThrowAsync(dto.ClientId);

        order.Lines.Clear(); // les anciennes lignes sont supprimées
        await FillLinesAsync(order, dto.Lines);
        RecalculateTotals(order);

        await _orders.SaveChangesAsync();
        return ToDto(order);
    }

    public async Task<OrderDto> ValidateAsync(int id)
    {
        var order = await GetOrThrowAsync(id);
        EnsureDraft(order, "validée");

        // On revérifie le stock : il a pu changer depuis la création
        foreach (var line in order.Lines)
        {
            if (line.Quantity > line.Product.StockQuantity)
                throw new BusinessRuleException(
                    $"Stock insuffisant pour « {line.Product.Name} » (disponible : {line.Product.StockQuantity}).");
        }

        foreach (var line in order.Lines)
            line.Product.StockQuantity -= line.Quantity;

        order.Status = OrderStatus.Validated;

        // Un seul SaveChanges : stock et statut sont enregistrés ensemble (une transaction)
        await _orders.SaveChangesAsync();
        return ToDto(order);
    }

    public async Task DeleteAsync(int id)
    {
        var order = await GetOrThrowAsync(id);

        if (order.Status == OrderStatus.Validated)
            throw new BusinessRuleException("Une commande validée ne peut pas être supprimée.");

        _orders.Remove(order); // les lignes sont supprimées en cascade
        await _orders.SaveChangesAsync();
    }
    public async Task<OrderDto> CancelAsync(int id)
{
    var order = await GetOrThrowAsync(id);

    if (order.Status == OrderStatus.Cancelled)
        throw new BusinessRuleException("Cette commande est déjà annulée.");

    // Règle métier : Si la commande avait été validée, on réintègre les quantités dans le stock
    if (order.Status == OrderStatus.Validated)
    {
        foreach (var line in order.Lines)
            line.Product.StockQuantity += line.Quantity;
    }

    order.Status = OrderStatus.Cancelled;

    await _orders.SaveChangesAsync();
    return ToDto(order);
}

    // ---------- Méthodes privées ----------

    private async Task<Order> GetOrThrowAsync(int id) =>
        await _orders.GetByIdAsync(id)
        ?? throw new NotFoundException($"Commande {id} introuvable.");

    private async Task<Client> GetClientOrThrowAsync(int clientId) =>
        await _clients.GetByIdAsync(clientId)
        ?? throw new BusinessRuleException("Le client sélectionné n'existe pas.");

    private static void EnsureDraft(Order order, string action)
    {
        if (order.Status != OrderStatus.Draft)
            throw new BusinessRuleException($"Seule une commande en brouillon peut être {action}.");
    }

    private async Task FillLinesAsync(Order order, List<OrderLineCreateDto> lineDtos)
    {
        // Si le même produit apparaît deux fois, on additionne les quantités
        var quantities = lineDtos
            .GroupBy(l => l.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(l => l.Quantity));

        var products = await _products.GetByIdsAsync(quantities.Keys);

        if (products.Count != quantities.Count)
            throw new BusinessRuleException("Un ou plusieurs produits n'existent pas.");

        foreach (var product in products)
        {
            var quantity = quantities[product.Id];

            if (quantity > product.StockQuantity)
                throw new BusinessRuleException(
                    $"Quantité demandée supérieure au stock pour « {product.Name} » (disponible : {product.StockQuantity}).");

            order.Lines.Add(new OrderLine
            {
                Product = product,
                Quantity = quantity,
                UnitPrice = product.UnitPriceHT,            // prix lu en base, jamais envoyé par le client
                LineTotal = quantity * product.UnitPriceHT
            });
        }
    }

    private static void RecalculateTotals(Order order)
    {
        order.TotalHT = order.Lines.Sum(l => l.LineTotal);
        order.TotalTTC = Math.Round(order.TotalHT * (1 + BusinessConstants.VatRate), 2);
    }

    private async Task<string> GenerateOrderNumberAsync()
    {
        var today = DateTime.UtcNow;
        var sequence = await _orders.CountByDateAsync(today) + 1;
        return $"CMD-{today:yyyyMMdd}-{sequence:D3}";
    }

    private static OrderDto ToDto(Order o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        ClientId = o.ClientId,
        ClientName = $"{o.Client.FirstName} {o.Client.LastName}",
        OrderDate = o.OrderDate,
        Status = o.Status.ToString(),
        TotalHT = o.TotalHT,
        TotalTTC = o.TotalTTC,
        Lines = o.Lines.Select(l => new OrderLineDto
        {
            ProductId = l.ProductId,
            ProductReference = l.Product.Reference,
            ProductName = l.Product.Name,
            Quantity = l.Quantity,
            UnitPrice = l.UnitPrice,
            LineTotal = l.LineTotal
        }).ToList()
    };
}