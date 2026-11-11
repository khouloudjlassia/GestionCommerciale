using GestionCommerciale.Api.DTOs;

namespace GestionCommerciale.Api.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(ProductCreateDto dto);
    Task<ProductDto> UpdateAsync(int id, ProductCreateDto dto);
    Task DeleteAsync(int id);
}