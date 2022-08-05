'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Raw_Data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Raw_Data.init({
    resultTime: DataTypes.DATE,
    enodebId: DataTypes.STRING,
    cellId: DataTypes.STRING,
    availDur: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Raw_Data',
  });
  return Raw_Data;
};