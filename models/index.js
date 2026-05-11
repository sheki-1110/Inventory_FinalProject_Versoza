const Category = require('./Category');
const Supplier = require('./Supplier');
const Item = require('./Item');
const ItemSupplier = require('./ItemSupplier');

// One-to-Many: Category has many Items; Item belongs to one Category
Category.hasMany(Item, { foreignKey: 'categoryId', as: 'items', onDelete: 'RESTRICT' });
Item.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Many-to-Many: Item <-> Supplier through ItemSupplier junction
Item.belongsToMany(Supplier, { through: ItemSupplier, foreignKey: 'itemId', as: 'suppliers' });
Supplier.belongsToMany(Item, { through: ItemSupplier, foreignKey: 'supplierId', as: 'items' });

module.exports = { Category, Supplier, Item, ItemSupplier };
