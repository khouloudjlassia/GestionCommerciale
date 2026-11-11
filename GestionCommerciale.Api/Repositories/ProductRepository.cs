using GestionCommerciale.Api.Data;
using GestionCommerciale.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionCommerciale.Api.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<List<Product>> GetAllAsync() =>
        _context.Products.AsNoTracking().OrderBy(p => p.Name).ToListAsync();

    public Task<Product?> GetByIdAsync(int id) =>
        _context.Products.FirstOrDefaultAsync(p => p.Id == id);

    public Task<List<Product>> GetByIdsAsync(IEnumerable<int> ids) =>
        _context.Products.Where(p => ids.Contains(p.Id)).ToListAsync();

    public Task<bool> ReferenceExistsAsync(string reference, int? excludeId = null) =>
        _context.Products.AnyAsync(p => p.Reference == reference && p.Id != excludeId);

    public Task<bool> IsUsedInOrdersAsync(int id) =>
        _context.OrderLines.AnyAsync(l => l.ProductId == id);

    public async Task AddAsync(Product product) => await _context.Products.AddAsync(product);

    public void Remove(Product product) => _context.Products.Remove(product);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}