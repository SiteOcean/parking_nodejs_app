const express = require("express");
const ParkingSlot = require("../models/parkingSlot");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const parkingPlaces = await ParkingSlot.find();
        if (!parkingPlaces) {
            return res.status(402).json({ message: "Oops, no parking places found." });
        }

        const findIfAllSlotsAreBooked = async (slots, placeId) => {
            // Filter slots to find if there's any free slot (parkingStatus: false)
            const findFreeSlots = slots.filter((v) => !v.parkingStatus);
            // If no free slots, update the place's status to false (i.e., all slots booked)
            if (findFreeSlots.length === 0) {
                await ParkingSlot.findByIdAndUpdate(placeId, { status: false });
            }
        };

        // Iterate over all parking places and check their slots
        for (const place of parkingPlaces) {
            await findIfAllSlotsAreBooked(place.slots, place._id);
        }
        const UpdatedParkingPlaces = await ParkingSlot.find();
        if(UpdatedParkingPlaces){
            res.json(UpdatedParkingPlaces);
        }
        
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});


router.post("/getById", async (req, res) => {
  const { id } = req.body;  

  try {
   
    const parkingPlace = await ParkingSlot.findById(id);
    if (!parkingPlace) {
      return res.status(404).json({ message: "Parking place not found" });
    }
   
    res.json(parkingPlace);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});


router.post('/bookSlot', async (req, res) => {
    const { slotId, vehicleNo, customerName, inTime, parkingStatus } = req.body;
    try {
      // Find the parking place that contains the slot
      const parkingPlace = await ParkingSlot.findOne({ 'slots._id': slotId });
      if (!parkingPlace) {
        return res.status(404).json({ message: 'Parking place not found' });
      }
  
      // Find the particular slot by its ID
      const slot = parkingPlace.slots.id(slotId);
  
      // If the slot is already booked, return an error
      if (slot.parkingStatus) {
        return res.status(400).json({ message: 'Slot is already booked' });
      }
  
      // Update the slot with booking details
      slot.parkingStatus = parkingStatus;
      slot.vehicleNo = vehicleNo;
      slot.customerName = customerName;
      slot.inTime = inTime;
  
      await parkingPlace.save();

      const findIfAllSlotsAreBooked = async () => {
        const findFreeSlots = parkingPlace.slots.filter((v) => v.parkingStatus);
        if (findFreeSlots.length == 9) {
            await ParkingSlot.findByIdAndUpdate(parkingPlace._id, { status: false });
        }
    };

  
        await findIfAllSlotsAreBooked();
   
      // Return success response
      res.status(200).json({ message: 'Slot booked successfully', slot });
    } catch (err) {
      console.error("Error during booking:", err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  router.post('/closeParking', async (req, res) => {
    const { _id, slotId, outTime, parkingStatus, TotalFare } = req.body;

    try {
        const parkingPlace = await ParkingSlot.findById(_id);

        if (!parkingPlace) {
            return res.status(404).json({ message: 'Parking place not found' });
        }

        const slot = parkingPlace.slots.id(slotId);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        slot.parkingStatus = parkingStatus;  // Update slot parking status
        slot.outTime = outTime;              // Set the outTime
        slot.Totalfare = TotalFare;          // Set the total fare

        // Function to check if any slot is available
        const findIfAllSlotsAreBooked = async () => {
            const findFreeSlots = parkingPlace.slots.filter((v) => !v.parkingStatus);  
            if (findFreeSlots.length > 0) {
                await ParkingSlot.findByIdAndUpdate(parkingPlace._id, { status: true });
            } else {
                await ParkingSlot.findByIdAndUpdate(parkingPlace._id, { status: false });
            }
        };

        await findIfAllSlotsAreBooked();  
        await parkingPlace.save(); 

        res.status(200).json({ message: 'Parking slot updated successfully', slot });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

  

module.exports = router;
