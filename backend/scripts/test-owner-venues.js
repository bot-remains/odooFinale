import connectDB, { query } from '../src/config/database.js';
import Venue from '../src/models/Venue.js';
import Court from '../src/models/Court.js';
import dotenv from 'dotenv';

dotenv.config();

async function testOwnerVenuesAPI() {
  try {
    await connectDB();
    
    console.log('Testing owner venues API simulation...');
    const ownerId = 18;
    
    // Simulate the getVenues function
    const venues = await Venue.findByOwner(ownerId);
    
    console.log('Found venues:', venues.length);
    
    // Get courts count for each venue
    const venuesWithCourts = await Promise.all(
      venues.map(async (venue) => {
        const courts = await Court.findByVenue(venue.id);
        const venueJSON = venue.toJSON();
        return {
          ...venueJSON,
          courtsCount: courts.length,
          courts: courts.map((court) => court.toJSON()),
        };
      })
    );
    
    console.log('Venues with court counts:');
    venuesWithCourts.forEach(venue => {
      console.log(`- ${venue.name}: ${venue.courtsCount} courts, Approved: ${venue.isApproved}`);
      console.log(`  Contact: ${venue.contactPhone || 'N/A'} | ${venue.contactEmail || 'N/A'}`);
      console.log(`  Address: ${venue.address}`);
      console.log(`  Raw venue object:`, JSON.stringify(venue, null, 2));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testOwnerVenuesAPI();
