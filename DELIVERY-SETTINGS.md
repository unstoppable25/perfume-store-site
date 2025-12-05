# Delivery Fee Management System

## Overview
Your perfume store now has a flexible delivery fee management system that allows you to:
- Set a default delivery fee for all orders
- Run free delivery promotions based on cart value
- Create custom delivery zones with different fees for specific locations

## How to Use

### Accessing Delivery Settings
1. Log into your admin panel at `/admin`
2. Click on the **"Delivery Settings"** tab

### Setting Default Delivery Fee
- Enter the standard delivery fee (in NGN) that applies to all orders
- Default is set to ₦2,000
- This fee applies unless overridden by a zone or free delivery promotion

### Free Delivery Promotion
- Set a minimum order amount to trigger free delivery
- Example: Set to 50000 for free delivery on orders above ₦50,000
- Set to 0 to disable free delivery promotions
- When active, customers see a progress banner on the cart page

### Delivery Zones
Create custom zones for specific locations with different delivery fees:

**Example Zones:**
- **Lagos Island**: ₦3,500 delivery - Applies to: Lagos, VI, Lekki
- **Abuja Premium**: ₦4,000 delivery - Applies to: Abuja, FCT
- **Port Harcourt**: ₦3,000 delivery - Applies to: Port Harcourt, Rivers
- **Regional Cities**: ₦2,500 delivery - Applies to: Ibadan, Kaduna, Kano

**How Zones Work:**
1. When a customer enters their state/city at checkout, the system checks for matching zones
2. If their location matches a zone, that zone's fee applies
3. If no zone matches, the default fee applies
4. Free delivery promotion overrides all fees when the threshold is met

### Adding a Zone
1. Enter the zone name (e.g., "Lagos Island")
2. Enter the delivery fee for that zone (e.g., 3500)
3. Enter states or cities (comma-separated, e.g., "Lagos, VI, Lekki, Ikoyi")
4. Click **"+ Add Zone"**

### Editing a Zone
1. Click **"Edit"** on any zone
2. Update the details
3. Click **"Update Zone"**

### Deleting a Zone
1. Click **"Delete"** on any zone
2. Confirm the deletion

### Saving Changes
After making all your changes, click **"💾 Save All Delivery Settings"** at the bottom of the page.

## Customer Experience

### On Cart Page
- If free delivery promotion is active, customers see:
  - Progress banner showing how much more to add for free delivery
  - OR "Congratulations! You qualify for FREE DELIVERY!" if threshold met
- Delivery shows as "Calculated at checkout"

### On Checkout Page
- Delivery fee is calculated automatically based on:
  1. Cart total (checks free delivery threshold)
  2. Customer's state/city (checks zones)
  3. Falls back to default fee if no match
- Fee updates dynamically as customer enters their address
- Shows delivery message (e.g., "Lagos Island delivery" or "🎉 FREE DELIVERY")

## Examples

### Example 1: Basic Setup
```
Default Fee: ₦2,000
Free Delivery: ₦0 (disabled)
Zones: None
```
Result: All customers pay ₦2,000 delivery

### Example 2: Free Delivery Promotion
```
Default Fee: ₦2,000
Free Delivery: ₦50,000
Zones: None
```
Result: 
- Orders below ₦50,000 pay ₦2,000
- Orders ₦50,000+ get FREE delivery

### Example 3: Full Setup with Zones
```
Default Fee: ₦2,000
Free Delivery: ₦75,000
Zones:
  - Lagos Metro: ₦3,500 (Lagos, Lekki, VI, Ikoyi)
  - Abuja Premium: ₦4,000 (Abuja, FCT)
  - Other Cities: ₦2,500 (Ibadan, Kano, PH)
```
Result:
- Lagos customer with ₦30,000 cart: ₦3,500 delivery
- Abuja customer with ₦40,000 cart: ₦4,000 delivery
- Enugu customer with ₦25,000 cart: ₦2,000 delivery (default)
- Any customer with ₦80,000 cart: FREE delivery (overrides all zones)

## Tips
- Keep zone names descriptive (e.g., "Lagos Premium" not just "Lagos")
- Use free delivery promotions strategically to increase average order value
- Review and update zones based on actual delivery costs
- Test checkout with different addresses to verify zone matching
- Consider seasonal promotions (e.g., free delivery during holidays)

## Technical Notes
- Delivery fees are stored in the database and apply immediately
- Zone matching is case-insensitive
- Multiple states/cities can be assigned to a single zone
- Free delivery promotion always takes priority over all other fees
