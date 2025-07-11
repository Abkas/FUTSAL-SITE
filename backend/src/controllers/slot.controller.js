import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { Slot } from '../models/slot.model.js'
import { Game } from '../models/game.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Futsal } from '../models/futsal.model.js'
import { SLOT_STATUS } from '../constants.js'
import { createNotification } from './notification.controller.js'

const createSlot = asyncHandler(async (req, res) => {
    const { date, time, price, maxPlayers } = req.body
    const { futsalId } = req.params

    if (!futsalId || !date || !time || !price || !maxPlayers) {
        throw new ApiError(400, 'All fields are required')
    }

    const newSlot = await Slot.create({
        futsal: futsalId,
        date,
        time,
        price,
        maxPlayers,
        teamA: [],
        teamB: []
    })

    const newGame = await Game.create({
        futsal: futsalId,
        slot: newSlot._id,
        players: [],
        time
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, { slot: newSlot, game: newGame }, 'Slot and game created successfully')
    )
})

const updateSlot = asyncHandler(async (req, res) => {
    const { futsalId, slotId } = req.params
    const { time, maxPlayers, price, status } = req.body

    const futsal = await Futsal.findById(futsalId)
    if (!futsal) {
        throw new ApiError(404, "Futsal not found")
    }

    const slot = await Slot.findOne({ _id: slotId, futsal: futsalId })
    if (!slot) {
        throw new ApiError(404, "Slot not found")
    }

    // Update slot fields
    if (time) slot.time = time
    if (maxPlayers) slot.maxPlayers = maxPlayers
    if (price) slot.price = price
    if (status) slot.status = status

    await slot.save()

    return res
    .status(200)
    .json(new ApiResponse(200, slot, 'Slot updated successfully'))
})

const getSlotsByFutsal = asyncHandler(async (req, res) => {
    const { futsalId } = req.params;
    const { date } = req.query;

    try {
        let query = { futsal: futsalId };
        
        if (date) {
            query.date = date;
        }

        const slots = await Slot.find(query)
            .sort({ date: 1, time: 1 })
            .populate('players', 'username fullName avatar')
            .populate('teamA', 'username fullName avatar')
            .populate('teamB', 'username fullName avatar')
            .populate('futsal') // populate all futsal fields
            .lean();

        // Add futsalId as a separate property (string)
        const slotsWithFutsalId = slots.map(slot => ({
            ...slot,
            futsalId: (typeof slot.futsal === 'object' && slot.futsal?._id) ? slot.futsal._id.toString() : slot.futsal?.toString?.() || futsalId
        }));
        console.log('Slots with futsalId:', slotsWithFutsalId); // Debug log

        return res.status(200).json(
            new ApiResponse(200, slotsWithFutsalId, 'Slots fetched successfully')
        );
    } catch (error) {
        console.error('Error fetching slots:', error);
        throw new ApiError(500, 'Error fetching slots');
    }
})

const joinSlot = asyncHandler(async (req, res) => {
    const { futsalId, slotId } = req.params;
    const { seats, teamChoice } = req.body; // teamChoice: 'A' or 'B'
    const playerId = req.user._id;
    
    // Validate seats parameter
    if (!seats || seats < 1 || !Number.isInteger(seats)) {
        throw new ApiError(400, 'Invalid number of seats. Must be a positive integer.');
    }

    const slot = await Slot.findOne({ _id: slotId, futsal: futsalId });
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }

    // Check if slot is available
    if (!slot.isAvailable()) {
        throw new ApiError(400, 'Slot is not available for booking');
    }

    // Check if there are enough available slots
    const availableSlots = slot.maxPlayers - slot.players.length;
    if (seats > availableSlots) {
        throw new ApiError(400, `Only ${availableSlots} slots available`);
    }

    // Add the player multiple times based on seats (use new count param)
    await slot.addPlayer(playerId, teamChoice, seats);
    console.log(`[joinSlot] playerId: ${playerId}, team: ${teamChoice}, seats: ${seats}`);

    // Reload slot to get updated currentPlayers and players
    const updatedSlot = await Slot.findById(slot._id)
        .populate('players', 'username fullName avatar')
        .populate('teamA', 'username fullName avatar')
        .populate('teamB', 'username fullName avatar');

    // Update slot status if full
    if (updatedSlot.isFull()) {
        updatedSlot.status = SLOT_STATUS.FULL;
        await updatedSlot.save();
        // Update associated game status
        const game = await Game.findOne({ slot: slotId });
        if (game) {
            game.status = 'ready_to_play';
            await game.save();
        }

        // Send notification to futsal owner that slot is full
        try {
            const futsal = await Futsal.findById(futsalId).populate('owner');
            if (futsal && futsal.owner) {
                const slotDate = new Date(updatedSlot.date).toLocaleDateString();
                await createNotification(
                    futsal.owner._id,
                    'slot_full',
                    'Slot is now full',
                    `Your futsal slot on ${slotDate} at ${updatedSlot.time} is now fully booked.`,
                    `/organizer-slots`
                );
            }
        } catch (err) {
            console.log("Error sending slot full notification:", err);
        }
    }

    // Send notification to player that they joined the slot
    try {
        const futsal = await Futsal.findById(futsalId);
        const slotDate = new Date(updatedSlot.date).toLocaleDateString();
        const notif = await createNotification(
            playerId,
            'match_joined',
            'Slot Booked Successfully',
            `You've booked ${seats} seat(s) at ${futsal.name} on ${slotDate} at ${updatedSlot.time}.`,
            `/player-upcomingmatches`,
            playerId // recipientId
        );
        console.log('Notification created for slot booking:', notif);
    } catch (err) {
        console.log("Error sending join slot notification:", err);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSlot, 'Player added to slot successfully'))
})

const deleteSlot = asyncHandler(async (req, res) => {
    const { futsalId, slotId } = req.params

    const slot = await Slot.findOne({ _id: slotId, futsal: futsalId })
    if (!slot) {
        throw new ApiError(404, "Slot not found")
    }

    // Check if slot has any players
    if (slot.players.length > 0) {
        throw new ApiError(400, "Cannot delete slot with players")
    }

    await Slot.findByIdAndDelete(slotId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Slot deleted successfully")
    )
})

// Get slots for a specific date
const getSlotsByDate = asyncHandler(async (req, res) => {
    const { futsalId } = req.params
    const { date } = req.query

    if (!date) {
        throw new ApiError(400, "Date is required")
    }

    const futsal = await Futsal.findById(futsalId)
    if (!futsal) {
        throw new ApiError(404, "Futsal not found")
    }

    // Use the Slot model to find slots for the futsal and date
    const slots = await Slot.find({
        futsal: futsalId,
        date: date
    })
    .populate('players', 'username fullName avatar')
    .populate('teamA', 'username fullName avatar')
    .populate('teamB', 'username fullName avatar')

    return res.status(200).json(
        new ApiResponse(200, slots, "Slots fetched successfully")
    )
})

// Add a new slot
const addSlot = asyncHandler(async (req, res) => {
    const { futsalId } = req.params
    const { date, time, maxPlayers, price } = req.body

    if (!date || !time || !maxPlayers || !price) {
        throw new ApiError(400, "All fields are required")
    }

    const futsal = await Futsal.findById(futsalId)
    if (!futsal) {
        throw new ApiError(404, "Futsal not found")
    }

    const newSlot = await Slot.create({
        futsal: futsalId,
        date,
        time,
        maxPlayers,
        price,
        status: SLOT_STATUS.AVAILABLE,
        players: [],
        paymentStatus: [],
        teamA: [],
        teamB: []
    })

    return res.status(201).json(
        new ApiResponse(201, newSlot, "Slot added successfully")
    )
})

const resetSlots = asyncHandler(async (req, res) => {
    const { futsalId } = req.params;
    const { date } = req.body;

    if (!date) {
        throw new ApiError(400, "Date is required");
    }

    const futsal = await Futsal.findById(futsalId);
    if (!futsal) {
        throw new ApiError(404, "Futsal not found");
    }

    // Delete all existing slots for the date
    await Slot.deleteMany({ futsal: futsalId, date });

    // Create default slots
    const defaultSlots = [
        { time: "06:00-07:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "07:00-08:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "08:00-09:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "09:00-10:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "10:00-11:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "11:00-12:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "12:00-13:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "13:00-14:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "14:00-15:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "15:00-16:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "16:00-17:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "17:00-18:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "18:00-19:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "19:00-20:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "20:00-21:00", maxPlayers: 10, price: futsal.price || 2000 },
        { time: "21:00-22:00", maxPlayers: 10, price: futsal.price || 2000 }
    ];

    const createdSlots = await Promise.all(
        defaultSlots.map(slot => 
            Slot.create({
                futsal: futsalId,
                date,
                time: slot.time,
                maxPlayers: slot.maxPlayers,
                price: slot.price,
                status: SLOT_STATUS.AVAILABLE,
                players: [],
                paymentStatus: [],
                teamA: [],
                teamB: []
            })
        )
    );

    return res.status(200).json(
        new ApiResponse(200, createdSlots, "Slots reset successfully")
    );
});

const getPlayerJoinedSlots = asyncHandler(async (req, res) => {
    const playerId = req.user._id;

    try {
        // Find all slots where the player is in the players array
        const slots = await Slot.find({ players: playerId })
            .populate({
                path: 'futsal',
                select: 'name location futsalPhoto'
            })
            .sort({ date: 1, time: 1 });

        if (!slots || slots.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], 'No slots found for this player')
            );
        }

        return res.status(200).json(
            new ApiResponse(200, slots, 'Player slots fetched successfully')
        );
    } catch (error) {
        console.error('Error fetching player slots:', error);
        throw new ApiError(500, 'Error fetching player slots');
    }
});

const cancelSlotBooking = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    const playerId = req.user._id;

    try {
        const slot = await Slot.findById(slotId);
        if (!slot) {
            throw new ApiError(404, 'Slot not found');
        }

        // Check if player is in the slot
        if (!slot.players.includes(playerId)) {
            throw new ApiError(400, 'You are not booked in this slot');
        }

        // Remove player from the slot
        slot.players = slot.players.filter(id => id.toString() !== playerId.toString());
        slot.currentPlayers = slot.players.length;

        // Remove player from teamA and teamB as well
        slot.teamA = (slot.teamA || []).filter(id => id.toString() !== playerId.toString());
        slot.teamB = (slot.teamB || []).filter(id => id.toString() !== playerId.toString());

        // Update slot status if it was full
        if (slot.status === SLOT_STATUS.FULL) {
            slot.status = SLOT_STATUS.AVAILABLE;
        }

        // Remove payment status for this player
        slot.paymentStatus = slot.paymentStatus.filter(
            status => status.playerId.toString() !== playerId.toString()
        );

        await slot.save();

        // Update associated game if it exists
        const game = await Game.findOne({ slot: slotId });
        if (game) {
            game.players = game.players.filter(id => id.toString() !== playerId.toString());
            await game.save();
        }

        // Send notification to player for cancellation
        try {
            const futsal = await Futsal.findById(slot.futsal);
            const slotDate = new Date(slot.date).toLocaleDateString();
            await createNotification(
                playerId,
                'match_cancelled',
                'Slot Booking Cancelled',
                `You cancelled your booking at ${futsal?.name || 'Futsal'} on ${slotDate} at ${slot.time}.`,
                '/player-upcomingmatches',
                playerId
            );
        } catch (err) {
            console.log('Error sending cancellation notification:', err);
        }

        return res.status(200).json(
            new ApiResponse(200, slot, 'Booking cancelled successfully')
        );
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw new ApiError(error.statusCode || 500, error.message || 'Error cancelling booking');
    }
});

const updateSlotsPrice = asyncHandler(async (req, res) => {
    const { futsalId } = req.params;
    const { date, price } = req.body;

    console.log('Update price request:', {
        futsalId,
        date,
        price,
        body: req.body
    });

    if (!date || !price) {
        console.error('Missing required fields:', { date, price });
        throw new ApiError(400, "Date and price are required");
    }

    const futsal = await Futsal.findById(futsalId);
    if (!futsal) {
        console.error('Futsal not found:', futsalId);
        throw new ApiError(404, "Futsal not found");
    }

    console.log('Found futsal:', futsal._id);

    try {
        // Update all slots for the given date
        const result = await Slot.updateMany(
            { futsal: futsalId, date },
            { $set: { price: price } }
        );

        console.log('Update result:', result);

        if (result.modifiedCount === 0) {
            console.log('No slots found to update');
            return res.status(200).json(
                new ApiResponse(200, [], "No slots found to update")
            );
        }

        // Get updated slots
        const updatedSlots = await Slot.find({ futsal: futsalId, date });
        console.log('Updated slots count:', updatedSlots.length);

        return res.status(200).json(
            new ApiResponse(200, updatedSlots, "Slots price updated successfully")
        );
    } catch (error) {
        console.error('Error updating slots price:', error);
        throw new ApiError(500, error.message || "Error updating slots price");
    }
});

// Function to generate slots for a specific date
const generateSlotsForDate = async (futsalId, date) => {
    const futsal = await Futsal.findById(futsalId);
    if (!futsal) {
        throw new ApiError(404, "Futsal not found");
    }

    // Format date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];

    // Check if slots already exist for this date
    const existingSlots = await Slot.find({
        futsal: futsalId,
        date: formattedDate
    });

    if (existingSlots.length > 0) {
        return existingSlots;
    }

    const slots = [];
    const defaultPrice = futsal.price || 2000;
    const defaultMaxPlayers = 10;

    // Generate slots from 5 AM to 11 PM
    for (let hour = 5; hour < 23; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        slots.push({
            futsal: futsalId,
            date,
            time: `${startTime}-${endTime}`,
            maxPlayers: defaultMaxPlayers,
            price: defaultPrice,
            status: SLOT_STATUS.AVAILABLE,
            players: [],
            paymentStatus: [],
            teamA: [],
            teamB: []
        });
    }

    // Create all slots in bulk
    const createdSlots = await Slot.insertMany(slots);
    return createdSlots;
};

// Middleware to check and generate slots for next day
const checkAndGenerateNextDaySlots = asyncHandler(async (req, res, next) => {
    const { futsalId } = req.params;
    const { date } = req.query;

    if (!date) {
        return next();
    }

    try {
        // Format the date to ensure consistency
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Check if slots exist for the requested date
        const existingSlots = await Slot.find({
            futsal: futsalId,
            date: formattedDate
        });

        // If no slots exist for this date, generate them
        if (existingSlots.length === 0) {
            await generateSlotsForDate(futsalId, formattedDate);
        }

        next();
    } catch (error) {
        console.error('Error in checkAndGenerateNextDaySlots:', error);
        next(error);
    }
});

// Update only the status of a slot (for frontend sync)
const updateSlotStatus = asyncHandler(async (req, res) => {
    const { futsalId, slotId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status) {
        throw new ApiError(400, 'Status is required');
    }
    if (!Object.values(SLOT_STATUS).includes(status)) {
        throw new ApiError(400, `Invalid status value: ${status}`);
    }

    const slot = await Slot.findOne({ _id: slotId, futsal: futsalId });
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }

    slot.status = status;
    await slot.save();

    // Optional: Add logging here
    console.log(`[Slot PATCH] Updated slot ${slotId} (futsal ${futsalId}) to status: ${status}`);

    return res.status(200).json(new ApiResponse(200, 'Slot status updated', slot));
});

export {
    createSlot,
    updateSlot,
    getSlotsByFutsal,
    joinSlot,
    deleteSlot,
    getSlotsByDate,
    addSlot,
    resetSlots,
    getPlayerJoinedSlots,
    cancelSlotBooking,
    updateSlotsPrice,
    checkAndGenerateNextDaySlots,
    updateSlotStatus
}