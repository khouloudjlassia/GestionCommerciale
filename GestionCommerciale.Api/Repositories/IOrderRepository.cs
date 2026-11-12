using GestionCommerciale.Api.Models;

namespace GestionCommerciale.Api.Repositories;

public interface IOrderRepository
{
    Task<List<Order>> GetAllAsync();
    Task<Order?> GetByIdAsync(int id);
    Task<int> CountByDateAsync(DateTime date);
    Task<string?> GetLastOrderNumberByPrefixAsync(string prefix);
    Task AddAsync(Order order);
    void Remove(Order order);
    Task SaveChangesAsync();
}