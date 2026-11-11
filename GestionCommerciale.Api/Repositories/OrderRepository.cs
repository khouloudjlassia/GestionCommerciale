using GestionCommerciale.Api.Data;
using GestionCommerciale.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionCommerciale.Api.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    // Requête de base : commande + client + lignes + produits
    private IQueryable<Order> OrdersWithDetails() =>
        _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Lines).ThenInclude(l => l.Product);

    public Task<List<Order>> GetAllAsync() =>
        OrdersWithDetails().AsNoTracking().OrderByDescending(o => o.OrderDate).ToListAsync();

    public Task<Order?> GetByIdAsync(int id) =>
        OrdersWithDetails().FirstOrDefaultAsync(o => o.Id == id);

    public Task<int> CountByDateAsync(DateTime date) =>
        _context.Orders.CountAsync(o => o.OrderDate.Date == date.Date);

    public async Task AddAsync(Order order) => await _context.Orders.AddAsync(order);

    public void Remove(Order order) => _context.Orders.Remove(order);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}