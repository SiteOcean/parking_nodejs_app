const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  slots: [
    {
      slotNo: { type: Number, required: true },
      parkingStatus: { type: Boolean, default: false },
      vehicleNo: { type: String, default: "" },
      customerName: { type: String, default: "" },
      inTime: { type: String, default: 0 },
      outTime: { type: String, default: 0 },
      Totalfare: { type: Number, default: 0 },
    }
  ]
});

const ParkingSlot = mongoose.model('ParkingSlot', ParkingSlotSchema);

module.exports = ParkingSlot;
