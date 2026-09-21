# Captain acceptance feedback

## Goal
Make a newly booked ride visibly enter a live “waiting for captain” state instead of ending with only a toast.

## Changes
- Keep booking on the existing real dispatch queue and preserve all current DSA behavior.
- After confirmation, replace the booking controls with a prominent live status panel showing the ride ID, selected vehicle, queue position, and “Waiting for a captain to accept”.
- Add a subtle searching animation and clear actions to view the journey or book another ride.
- Update the rider journey and rides views so every queued ride consistently uses captain-facing status language.
- Resolve pickup and destination coordinates back to place names where possible, while retaining safe coordinate fallback.

## Technical details
- Store only the newly created ride ID in page state; all displayed status and queue position remain derived from the shared `SimulationStore` queue and `rideMap`.
- Do not add another queue, timer-based fake matching, or independent rider state.
- Verify the booking flow visually and confirm the project build remains clean.
