# 🛒 GestionCommerciale

Application web de **gestion commerciale** (clients, produits, commandes) développée dans le cadre d'un mini-projet universitaire.

---

## 🧰 Stack technique

| Couche | Technologie |
|--------|-------------|
| **Back-end** | ASP.NET Core 8 (Web API REST) |
| **Base de données** | SQL Server + Entity Framework Core 8 |
| **Front-end** | Angular 21 (Signals, Standalone Components) |
| **Style** | CSS personnalisé (aucun framework UI) |

---

## 📁 Structure du projet

```
GestionCommerciale/
├── GestionCommerciale.Api/      # API REST .NET 8
│   ├── Controllers/             # Endpoints HTTP
│   ├── DTOs/                    # Objets de transfert de données
│   ├── Models/                  # Entités EF Core
│   ├── Services/                # Logique métier
│   ├── Migrations/              # Migrations EF Core
│   └── Program.cs               # Configuration & démarrage
└── frontend/                    # Application Angular 21
    └── src/app/
        ├── pages/               # Composants de page
        ├── services/            # Services HTTP
        ├── models/              # Interfaces TypeScript
        └── core/                # Helpers partagés
```

---

## ⚙️ Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) et npm
- [Angular CLI](https://angular.io/cli) : `npm install -g @angular/cli`
- **SQL Server** (LocalDB ou SQL Server Express)
- [EF Core CLI](https://learn.microsoft.com/fr-fr/ef/core/cli/dotnet) : `dotnet tool install --global dotnet-ef`

---

## 🚀 Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/khouloudjlassia/GestionCommerciale.git
cd GestionCommerciale
```

### 2. Configurer la base de données

Ouvrez `GestionCommerciale.Api/appsettings.json` et vérifiez la chaîne de connexion :

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GestionCommerciale;Trusted_Connection=True;"
}
```

Modifiez-la si votre instance SQL Server est différente.

### 3. Appliquer les migrations (créer la base de données)

```bash
cd GestionCommerciale.Api
dotnet ef database update
```

### 4. Lancer l'API

```bash
# Dans le dossier GestionCommerciale.Api
dotnet run
```

L'API sera disponible sur : **http://localhost:5185**

### 5. Lancer le front-end Angular

```bash
# Dans un nouveau terminal
cd frontend
npm install
ng serve
```

L'application sera disponible sur : **http://localhost:4200**

---

## 🌐 Endpoints API principaux

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/clients` | Liste tous les clients |
| `POST` | `/api/clients` | Créer un client |
| `PUT` | `/api/clients/{id}` | Modifier un client |
| `DELETE` | `/api/clients/{id}` | Supprimer un client |
| `GET` | `/api/products` | Liste tous les produits |
| `POST` | `/api/products` | Créer un produit |
| `PUT` | `/api/products/{id}` | Modifier un produit |
| `DELETE` | `/api/products/{id}` | Supprimer un produit |
| `GET` | `/api/orders` | Liste toutes les commandes |
| `POST` | `/api/orders` | Créer une commande (brouillon) |
| `PUT` | `/api/orders/{id}` | Modifier une commande (brouillon uniquement) |
| `POST` | `/api/orders/{id}/validate` | Valider une commande |
| `POST` | `/api/orders/{id}/cancel` | Annuler une commande |
| `DELETE` | `/api/orders/{id}` | Supprimer une commande |

---

## 📋 Fonctionnalités

### Gestion des Clients
- ✅ Lister, rechercher, paginer les clients
- ✅ Créer / Modifier / Supprimer un client
- ✅ Fiche détail client

### Gestion des Produits
- ✅ Lister, rechercher les produits
- ✅ Créer / Modifier / Supprimer un produit
- ✅ Ajout d'une **photo produit** (import depuis l'ordinateur, stockage Base64)
- ✅ Affichage du stock disponible

### Gestion des Commandes
- ✅ Créer une commande en mode **Brouillon** (formulaire en 3 étapes)
- ✅ Modifier une commande (brouillon uniquement)
- ✅ **Valider** une commande → décrémente le stock automatiquement
- ✅ **Annuler** une commande
- ✅ Supprimer une commande
- ✅ Affichage du détail complet (lignes, totaux HT/TTC)

### Règles métier (cahier des charges)
- 💰 **TVA fixe à 19 %** appliquée sur toutes les commandes
- 🔒 Seule une commande en **Brouillon** peut être modifiée ou validée
- 📦 Le **stock** est contrôlé à la création et décrémenté à la validation
- 🔢 Numéro de commande auto-généré au format `CMD-AAAAMMJJ-NNN`

---

## 👩‍💻 Auteur

**Khouloud Jlassia**  
Mini-projet — Gestion Commerciale  
Année universitaire 2026
