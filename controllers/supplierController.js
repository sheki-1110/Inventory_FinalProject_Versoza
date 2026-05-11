const { Supplier, Item } = require('../models');

// GET /suppliers
const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

// GET /suppliers/:id
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: Item, as: 'items' }],
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found', message: `No supplier with id ${req.params.id}.` });
    }
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

// POST /suppliers
const createSupplier = async (req, res, next) => {
  try {
    const { name, contactEmail, phone, address } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'Field "name" is required.' });
    }
    if (!contactEmail || contactEmail.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'Field "contactEmail" is required.' });
    }
    const supplier = await Supplier.create({ name: name.trim(), contactEmail: contactEmail.trim(), phone, address });
    res.status(201).json(supplier);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'A supplier with that email already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.errors.map(e => e.message).join(', ') });
    }
    next(err);
  }
};

// PUT /suppliers/:id
const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found', message: `No supplier with id ${req.params.id}.` });
    }
    const { name, contactEmail, phone, address } = req.body;
    await supplier.update({
      name: name ?? supplier.name,
      contactEmail: contactEmail ?? supplier.contactEmail,
      phone: phone ?? supplier.phone,
      address: address ?? supplier.address,
    });
    res.json(supplier);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'A supplier with that email already exists.' });
    }
    next(err);
  }
};

// DELETE /suppliers/:id
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found', message: `No supplier with id ${req.params.id}.` });
    }
    await supplier.destroy();
    res.json({ message: `Supplier "${supplier.name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

// GET /suppliers/:id/items  — list all items from a supplier
const getSupplierItems = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: Item, as: 'items' }],
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found', message: `No supplier with id ${req.params.id}.` });
    }
    res.json(supplier.items);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, getSupplierItems };
