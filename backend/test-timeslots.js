import prisma from './src/config/prisma.js';
import TimeSlot from './src/models/TimeSlot.js';

async function testTimeSlotFunctionality() {
  console.log('🧪 Testing Time Slot Functionality...\n');

  try {
    // Test 1: Create sample time slots for court 1
    console.log('1. Creating sample time slots...');

    const sampleTimeSlots = [
      {
        venueId: 6,
        courtId: 1,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '10:00',
        isAvailable: true,
      },
      {
        venueId: 6,
        courtId: 1,
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
      },
      {
        venueId: 6,
        courtId: 1,
        dayOfWeek: 1, // Monday
        startTime: '11:00',
        endTime: '12:00',
        isAvailable: false, // Blocked slot
      },
      {
        venueId: 6,
        courtId: 1,
        dayOfWeek: 2, // Tuesday
        startTime: '14:00',
        endTime: '15:00',
        isAvailable: true,
      },
      {
        venueId: 6,
        courtId: 1,
        dayOfWeek: 2, // Tuesday
        startTime: '15:00',
        endTime: '16:00',
        isAvailable: true,
      },
    ];

    const createResult = await TimeSlot.createMultiple(sampleTimeSlots);
    console.log(`✅ Created ${createResult.count} time slots`);

    // Test 2: Find time slots by court
    console.log('\n2. Finding time slots by court...');
    const courtSlots = await TimeSlot.findByCourt(1);
    console.log(`✅ Found ${courtSlots.length} time slots for court 1`);

    courtSlots.forEach((slot) => {
      console.log(
        `   - ${slot.getDayName()}: ${slot.getFormattedStartTime()} - ${slot.getFormattedEndTime()} (${slot.isAvailable ? 'Available' : 'Blocked'})`
      );
    });

    // Test 3: Find time slots for a specific day
    console.log('\n3. Finding Monday time slots...');
    const mondaySlots = await TimeSlot.findByCourt(1, 1);
    console.log(`✅ Found ${mondaySlots.length} Monday time slots`);

    // Test 4: Get available slots for a specific date
    console.log('\n4. Getting available slots for today...');
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const availableSlots = await TimeSlot.getAvailableSlots(1, dateString);
    console.log(`✅ Found ${availableSlots.length} available slots for ${dateString}`);

    // Test 5: Update a time slot
    console.log('\n5. Testing time slot update...');
    if (courtSlots.length > 0) {
      const firstSlot = courtSlots[0];
      const updatedSlot = await firstSlot.update({ isAvailable: false });
      console.log(
        `✅ Updated slot ${firstSlot.id} - now ${updatedSlot.isAvailable ? 'available' : 'blocked'}`
      );
    }

    // Test 6: Get slots grouped by day
    console.log('\n6. Getting slots grouped by day...');
    const slotsByDay = await TimeSlot.getSlotsByDay(1);
    console.log(`✅ Slots grouped by ${Object.keys(slotsByDay).length} days`);

    Object.entries(slotsByDay).forEach(([day, slots]) => {
      const dayName = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ][parseInt(day)];
      console.log(`   - ${dayName}: ${slots.length} slots`);
    });

    // Test 7: Get court statistics
    console.log('\n7. Getting court statistics...');
    const stats = await TimeSlot.getCourtStats(1);
    console.log('✅ Court statistics:');
    Object.entries(stats).forEach(([day, stat]) => {
      console.log(
        `   - ${day}: ${stat.total} total (${stat.available} available, ${stat.blocked} blocked)`
      );
    });

    // Test 8: Get upcoming slots
    console.log('\n8. Getting upcoming available slots...');
    const upcomingSlots = await TimeSlot.getUpcomingSlots(1, 3);
    console.log(`✅ Found upcoming slots for ${upcomingSlots.length} days`);
    upcomingSlots.forEach((daySlots) => {
      console.log(`   - ${daySlots.dayName} (${daySlots.date}): ${daySlots.slots.length} slots`);
    });

    console.log('\n🎉 All time slot tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTimeSlotFunctionality();
