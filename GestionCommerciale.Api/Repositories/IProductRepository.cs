using GestionCommerciale.Api.Models;

namespace GestionCommerciale.Api.Repositories;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<List<Product>> GetByIdsAsync(IEnumerable<int> ids);
    Task<bool> ReferenceExistsAsync(string reference, int? excludeId = null);
    Task<bool> IsUsedInOrdersAsync(int id);
    Task AddAsync(Product product);
    void Remove(Product product);
    Task SaveChangesAsync();
}