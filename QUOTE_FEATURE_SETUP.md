# Quote Feature Setup Guide

## What's New

Your TamilEelam Export House site now includes an enhanced quote request system with professional UI and email integration.

### Features Added:

✅ **Quote Modal Popup** - Professional quote request form on each product card
✅ **"Get Quote" Button** - New golden button on every product for quick access  
✅ **Bulk Order Support** - Request quotes for quantities up to unlimited kg
✅ **Email Integration** - Quotes automatically sent to `vikramvikass007@gmail.com`
✅ **Multi-Field Form** - Collects name, email, company, country, quantity, and special requirements
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
✅ **Fallback System** - If email API fails, opens email client with pre-filled details

---

## Email Configuration

### Option 1: Using Formspree (Recommended - Free)

The site is pre-configured with **Formspree** for email delivery.

**Setup Steps:**

1. Go to [formspree.io](https://formspree.io)
2. Sign up for a free account
3. Create a new form
4. Copy your form ID (looks like `f/xyzvojyb`)
5. Replace the form ID in `enhanced_site.html` line ~1040:
   ```javascript
   fetch('https://formspree.io/f/YOUR_FORM_ID', {
   ```
6. Test by submitting a quote form

### Option 2: Using Backend Email Service

If you have a backend server running, the form will POST to `/api/quotes` endpoint.

**Expected Endpoint:**

```
POST /api/quotes
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "ABC Corp",
  "country": "India",
  "productName": "Black Pepper",
  "quantity": "50",
  "message": "Custom requirements..."
}
```

### Option 3: Manual Email Fallback

If both above fail, the form automatically opens the user's email client with all quote details pre-filled and ready to send to `vikramvikass007@gmail.com`.

---

## How Users Can Access Quote Feature

### Method 1: Product Card Button

1. User browses products
2. Clicks **"📋 Get Quote"** button on any product card
3. Fills out the quote form modal
4. Clicks **"📤 Send Quote Request"**
5. Quote is sent to vikramvikass007@gmail.com

### Method 2: Navigation Link

Users can click **"Get Quote"** in the header navigation to access the full quote form section.

### Method 3: WhatsApp Integration

Users can click **"💬 Chat on WhatsApp"** within the quote modal to contact via WhatsApp instead.

---

## Customization

### Change Quote Email Recipient

To change the email address quotes are sent to, edit these lines in `enhanced_site.html`:

**Line 1058** (in submitQuoteForm function):

```javascript
window.location.href = `mailto:new-email@example.com?subject=...`;
```

### Change Form Fields

To add or remove fields, edit the form in the Quote Modal HTML section (around line 583-610).

### Change Email Subject/Body Format

The email template is in the submitQuoteForm function (around lines 1040-1055). Customize the `emailSubject` and `emailBody` variables.

---

## Testing

### Test the Quote Feature Locally:

1. **Open the site** in browser
2. **Find any product** and click "📋 Get Quote"
3. **Fill the form** with test data
4. **Click "Send Quote Request"**
5. **Expected result:**
   - If Formspree is configured: Email sent successfully ✅
   - If no API: Email client opens with pre-filled form 📧

### Test Email Receipt:

Check `vikramvikass007@gmail.com` inbox for the quote request.

---

## Design Improvements in This Update

✨ **Enhanced Product Cards**

- Added 4th action button with golden gradient
- Better spacing and hover effects
- Improved button visual hierarchy

✨ **Professional Quote Modal**

- Smooth animations on open/close
- Backdrop blur effect
- Clean, modern form design
- Rounded corners and subtle shadows

✨ **Typography & Colors**

- Golden accent gradient for quote button (#fbbf24 → #f59e0b)
- Consistent spacing and font sizes
- Professional form inputs with focus states

✨ **User Experience**

- Auto-fill product name in quote form
- WhatsApp chat option within quote modal
- Toast notifications for success/errors
- Mobile-responsive form design

---

## File Changes Made

### CSS Added:

- `.btn-quote` - Quote button styling with gradient
- `.quote-modal` - Modal container
- `.quote-form-content` - Form styling
- `.quote-form-group` - Form field styling
- `.quote-submit-btn` - Submit button styling
- `.quote-wa-btn-modal` - WhatsApp button in modal

### JavaScript Added:

- `currentQuoteProduct` - Track current product
- `openQuoteModal(id)` - Open quote modal for product
- `closeQuoteModal()` - Close quote modal
- `submitQuoteForm(e)` - Handle form submission with email

### HTML Added:

- Quote Modal (full form with all fields)
- "Get Quote" button on each product card

---

## Support & Troubleshooting

### Quote form not submitting?

1. Check browser console for errors (F12 → Console)
2. Verify Formspree ID is correct
3. Test email fallback by checking if email client opens

### Email not received?

1. Check spam/junk folder
2. Verify recipient email is correct
3. Test with a different email service (FormSubmit.co, Web3Forms)

### Need help?

Contact: vikramvikass007@gmail.com

---

## Next Steps for Full E-Commerce Setup

1. **Backend Integration** - Set up `/api/quotes` endpoint to store quotes in database
2. **Email Templates** - Create branded HTML email templates
3. **Admin Dashboard** - View, manage, and respond to quote requests
4. **SMS Notifications** - Get SMS alerts when quotes are submitted
5. **Payment Gateway** - Add payment options for direct checkout
6. **Analytics** - Track quote conversion rates and popular products
