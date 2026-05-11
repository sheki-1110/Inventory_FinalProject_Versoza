const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Junction table for Item <-> Supplier many-to-many relationship
const ItemSupplier = sequelize.define('ItemSupplier', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  supplyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  leadTimeDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'item_suppliers',
  timestamps: true,
});

module.exports = ItemSupplier;
