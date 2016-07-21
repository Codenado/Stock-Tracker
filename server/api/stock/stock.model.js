'use strict';

import mongoose from 'mongoose';


var StockSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  name: String,
  updated: Number,
  values: Object
});



  export default mongoose.model('Stock', StockSchema);
