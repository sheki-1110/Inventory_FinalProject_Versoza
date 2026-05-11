const { Item, Category, Supplier, ItemSupplier } = require('../models');

// GET /items
const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.findAll({
      include: [{ model: Category, as: 'category' }],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /items/:id
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'suppliers', through: { attributes: ['supplyPrice', 'leadTimeDays'] } },
      ],
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found', message: `No item with id ${req.params.id}.` });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// POST /items
const createItem = async (req, res, next) => {
  try {
    const { name, description, sku, quantity, price, categoryId } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'Field "name" is required.' });
    }
    if (!sku || sku.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'Field "sku" is required.' });
    }
    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'Validation Error', message: 'Field "price" is required.' });
    }
    if (!categoryId) {
      return res.status(400).json({ error: 'Validation Error', message: 'Field "categoryId" is required.' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Validation Error', message: `Category with id ${categoryId} does not exist.` });
    }

    const item = await Item.create({ name: name.trim(), description, sku: sku.trim(), quantity: quantity ?? 0, price, categoryId });
    const result = await Item.findByPk(item.id, { include: [{ model: Category, as: 'category' }] });
    res.status(201).json(result);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'An item with that SKU already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.errors.map(e => e.message).join(', ') });
    }
    next(err);
  }
};

// PUT /items/:id
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found', message: `No item with id ${req.params.id}.` });
    }

    const { name, description, sku, quantity, price, categoryId } = req.body;

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Validation Error', message: `Category with id ${categoryId} does not exist.` });
      }
    }

    await item.update({
      name: name ?? item.name,
      description: description ?? item.description,
      sku: sku ?? item.sku,
      quantity: quantity ?? item.quantity,
      price: price ?? item.price,
      categoryId: categoryId ?? item.categoryId,
    });

    const result = await Item.findByPk(item.id, { include: [{ model: Category, as: 'category' }] });
    res.json(result);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'An item with that SKU already exists.' });
    }
    next(err);
  }
};

// DELETE /items/:id
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found', message: `No item with id ${req.params.id}.` });
    }
    await item.destroy();
    res.json({ message: `Item "${item.name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

// POST /items/:id/suppliers/:supplierId  — assign a supplier to an item
const assignSupplier = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found', message: `No item with id ${req.params.id}.` });
    }
    const supplier = await Supplier.findByPk(req.params.supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found', message: `No supplier with id ${req.params.supplierId}.` });
    }

    const existing = await ItemSupplier.findOne({ where: { itemId: item.id, supplierId: supplier.id } });
    if (existing) {
      return res.status(400).json({ error: 'Conflict', message: 'This supplier is already assigned to the item.' });
    }

    const { supplyPrice, leadTimeDays } = req.body;
    await ItemSupplier.create({ itemId: item.id, supplierId: supplier.id, supplyPrice, leadTimeDays });

    const result = await Item.findByPk(item.id, {
      include: [{ model: Supplier, as: 'suppliers', through: { attributes: ['supplyPrice', 'leadTimeDays'] } }],
    });
    res.status(201).json({ message: `Supplier "${supplier.name}" assigned to item "${item.name}".`, item: result });
  } catch (err) {
    next(err);
  }
};

// DELETE /items/:id/suppliers/:supplierId  — remove a supplier from an item
const removeSupplier = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found', message: `No item with id ${req.params.id}.` });
    }
    const supplier = await Supplier.findByPk(req.params.supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found', message: `No supplier with id ${req.params.supplierId}.` });
    }

    const link = await ItemSupplier.findOne({ where: { itemId: item.id, supplierId: supplier.id } });
    if (!link) {
      return res.status(404).json({ error: 'Not Found', message: 'This supplier is not assigned to the item.' });
    }

    await link.destroy();
    res.json({ message: `Supplier "${supplier.name}" removed from item "${item.name}".` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem, assignSupplier, removeSupplier };
