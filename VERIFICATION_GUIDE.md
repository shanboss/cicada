# 🎫 Ticket Verification Guide

## Quick Start

### For Event Staff:

1. **Go to**: `https://yoursite.com/admin`
2. **Log in** with admin credentials
3. **Click** "🎫 Verify Tickets" button
4. **Click** "Start Camera Scanner"
4. **Point camera** at ticket QR code
5. **Review** ticket details
6. **Click** "Check In (Mark as Used)"
7. **Done!** Ticket is verified and can't be reused

## Device Requirements

### Works on:
- ✅ iPhone (Safari, Chrome)
- ✅ Android (Chrome, Firefox)
- ✅ iPad/Tablet
- ✅ Laptop with webcam
- ✅ Desktop with webcam

### Permissions Needed:
- 📷 Camera access (browser will prompt)
- 🌐 Internet connection (to verify tickets)

## Scanner Interface

### Main Screen

```
┌─────────────────────────────────┐
│  🎫 Ticket Verification         │
│  Scan QR codes to verify tickets│
├─────────────────────────────────┤
│                                 │
│  📷 Start Camera Scanner        │
│  [Button]                       │
│                                 │
│  ─────── Manual Entry ─────── │
│  Enter ticket number: [______]  │
│  [Verify]                       │
│                                 │
│  ───── Email Lookup ───────── │
│  Enter email: [______________]  │
│  [Search]                       │
│                                 │
└─────────────────────────────────┘
```

### After Scanning

**✅ Valid Ticket:**
```
┌─────────────────────────────────┐
│  ✅ Valid Ticket                │
│  Ready for check-in             │
├─────────────────────────────────┤
│  Ticket: CICADA-L8X9F-A2B3C     │
│                                 │
│  Event: Spring Concert 2026     │
│  📅 2026-03-15                  │
│  🕐 19:00                       │
│  📍 Dallas                      │
│                                 │
│  Customer: John Doe             │
│  Email: john@example.com        │
│                                 │
│  [✓ Check In (Mark as Used)]    │
└─────────────────────────────────┘
```

**⚠️ Already Used:**
```
┌─────────────────────────────────┐
│  ⚠️ Already Used                │
│  This ticket has been checked in│
├─────────────────────────────────┤
│  Ticket: CICADA-L8X9F-A2B3C     │
│                                 │
│  Used on: Jan 15, 2026 7:30 PM │
│                                 │
│  [Scan Another Ticket]          │
└─────────────────────────────────┘
```

**❌ Invalid:**
```
┌─────────────────────────────────┐
│  ❌ Invalid Ticket              │
│  Ticket not found               │
├─────────────────────────────────┤
│  [Scan Another Ticket]          │
└─────────────────────────────────┘
```

## Common Scenarios

### Scenario 1: Normal Check-In
1. Attendee shows QR code
2. Staff scans with camera
3. ✅ Valid ticket appears
4. Staff clicks "Check In"
5. Attendee enters event

### Scenario 2: Already Used
1. Someone tries to reuse ticket
2. Staff scans QR code
3. ⚠️ "Already Used" appears with timestamp
4. Staff denies entry
5. Security alerted if needed

### Scenario 3: Fake/Invalid Ticket
1. Invalid QR code scanned
2. ❌ "Invalid Ticket" appears
3. Staff denies entry
4. Security alerted

### Scenario 4: Camera Not Working
1. Use "Manual Entry" option
2. Type/paste ticket number
3. Click "Verify"
4. Same validation process

### Scenario 5: Poor Lighting
1. Ask attendee to increase phone brightness
2. Move to better-lit area
3. Try manual entry as backup

### Scenario 6: Lost/Forgotten Phone
1. Ask for email address
2. Enter in "Email Lookup" section
3. All tickets for that email appear
4. Verify event details with attendee
5. Click "Verify" on correct ticket
6. ✓ Button changes to "Verified" - attendee is checked in!

### Scenario 7: Multiple Tickets per Person
1. Use email lookup
2. All tickets for that email display
3. Each ticket shows event name and date
4. Verify which event they're attending
5. Click "Verify" on correct ticket
6. ✓ Shows "Verified" - other tickets remain untouched

## Tips for Staff

### Best Practices:
- 📱 **Test camera** before event starts
- 🔋 **Keep device charged** (bring power bank)
- 💡 **Good lighting** helps scanning
- 🔄 **Scan history** shows recent entries (catch duplicates)
- ⌨️ **Manual entry** is backup - always works
- 📧 **Email lookup** helps if phone is dead/lost
- ✅ **Check event name** when using email lookup (person may have multiple tickets)

### Speed Tips:
- Scanner is very fast (< 1 second)
- QR Code: Scan → Review → Check In
- Email Lookup: Search → Click "Verify" → Done! (fastest for lost phones)
- Green = Go, Yellow/Red = Stop
- "Verified" badge = Already checked in
- Scan history prevents double-entry

### Troubleshooting:
- **Camera won't start?** Check browser permissions
- **Slow scanning?** Move phone closer/further
- **Won't scan?** Use manual entry
- **Internet down?** System won't work (need connection)

## Security Features

### Fraud Prevention:
- ✅ Each ticket can only be used once
- ✅ Timestamp recorded for auditing
- ✅ Duplicate detection in scan history
- ✅ Format validation prevents fake tickets
- ✅ All scans logged in database

### Audit Trail:
Every check-in records:
- Ticket number
- Customer email
- Event ID
- Check-in timestamp
- Staff member (via login)

### Access Control:
- ❌ Public cannot access `/verify`
- ✅ Requires admin login
- ✅ Session-based authentication

## Event Day Checklist

### Before Event:
- [ ] Test scanner on your device
- [ ] Ensure camera permission granted
- [ ] Check internet connection
- [ ] Log in to `/verify` page
- [ ] Have backup device ready
- [ ] Charge devices fully

### During Event:
- [ ] Keep scanner open
- [ ] Check each ticket
- [ ] Watch for duplicate scans
- [ ] Use manual entry if needed
- [ ] Keep device charged

### After Event:
- [ ] Log out of scanner
- [ ] Check scan history
- [ ] Report any issues
- [ ] Note attendance count

## Statistics & Reporting

### During Event:
- Scan history shows last 10 tickets
- Visual status indicators (Green/Yellow/Red)
- Real-time validation

### After Event (Database):
```sql
-- Total checked in
SELECT COUNT(*) 
FROM tickets 
WHERE used = true 
AND event_id = YOUR_EVENT_ID;

-- Check-in timeline
SELECT used_date, customer_email
FROM tickets 
WHERE event_id = YOUR_EVENT_ID 
AND used = true
ORDER BY used_date;
```

## Troubleshooting Guide

### Issue: Camera Won't Start
**Solution:**
1. Check browser permissions (Settings → Camera)
2. Try different browser (Chrome recommended)
3. Reload page
4. Use manual entry as backup

### Issue: QR Code Won't Scan
**Solution:**
1. Adjust distance (6-12 inches ideal)
2. Ensure good lighting
3. Clean camera lens
4. Ask attendee to increase brightness
5. Use manual entry

### Issue: "Invalid Ticket" for Valid Purchase
**Solution:**
1. Check ticket number matches format
2. Verify in database manually
3. Contact admin to check webhook logs
4. May need to mark manually in database

### Issue: Internet Connection Lost
**Solution:**
1. Scanner requires internet - cannot work offline
2. Use backup device with connection
3. Manual entry also needs internet
4. Note tickets manually if absolutely necessary

## Support

### Common Questions:

**Q: Can I use my phone?**  
A: Yes! Works on any device with camera and internet.

**Q: What if internet goes down?**  
A: System requires internet. Have backup device ready.

**Q: Can staff see customer information?**  
A: Yes, name and email are shown for verification.

**Q: What happens if we scan the same ticket twice?**  
A: System shows "Already Used" with timestamp.

**Q: Can we un-check-in someone?**  
A: Would need database access - contact admin.

---

**System Status: ✅ Ready for Production**

Built for Cicada Music Society event management.

