using GestionCommerciale.Api.DTOs;
using GestionCommerciale.Api.Middleware;
using GestionCommerciale.Api.Models;
using GestionCommerciale.Api.Repositories;

namespace GestionCommerciale.Api.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        var products = await _repository.GetAllAsync();
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto> GetByIdAsync(int id) =>
        ToDto(await GetOrThrowAsync(id));

    public async Task<ProductDto> CreateAsync(ProductCreateDto dto)
    {
        if (await _repository.ReferenceExistsAsync(dto.Reference.Trim()))
            throw new ConflictException("Un produit avec cette référence existe déjà.");

        var product = new Product();
        ApplyDto(product, dto);

        await _repository.AddAsync(product);
        await _repository.SaveChangesAsync();
        return ToDto(product);
    }

    public async Task<ProductDto> UpdateAsync(int id, ProductCreateDto dto)
    {
        var product = await GetOrThrowAsync(id);

        if (await _repository.ReferenceExistsAsync(dto.Reference.Trim(), id))
            throw new ConflictException("Un autre produit utilise déjà cette référence.");

        ApplyDto(product, dto);
        await _repository.SaveChangesAsync();
        return ToDto(product);
    }

    public async Task DeleteAsync(int id)
    {
        var product = await GetOrThrowAsync(id);

        if (await _repository.IsUsedInOrdersAsync(id))
            throw new BusinessRuleException("Impossible de supprimer un produit présent dans des commandes.");

        _repository.Remove(product);
        await _repository.SaveChangesAsync();
    }

    private async Task<Product> GetOrThrowAsync(int id) =>
        await _repository.GetByIdAsync(id)
        ?? throw new NotFoundException($"Produit {id} introuvable.");

    private static void ApplyDto(Product product, ProductCreateDto dto)
    {
        product.Reference = dto.Reference.Trim();
        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim();
        product.UnitPriceHT = dto.UnitPriceHT;
        product.StockQuantity = dto.StockQuantity;
    }

    private static ProductDto ToDto(Product p) => new()
    {
        Id = p.Id,
        Reference = p.Reference,
        Name = p.Name,
        Description = p.Description,
        UnitPriceHT = p.UnitPriceHT,
        StockQuantity = p.StockQuantity,
        CreatedAt = p.CreatedAt
    };
}