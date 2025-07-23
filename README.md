# A/B Testing Website for VWO Learning

A complete, ready-to-use website designed specifically for learning A/B testing and split URL testing with tools like VWO (Visual Website Optimizer). This site includes multiple page variants, comprehensive tracking, and VWO integration capabilities.

## 🎯 What's Included

### Page Variants for A/B Testing
- **Landing Page A** (`index.html`) - Feature-focused approach
- **Landing Page B** (`index-variant-b.html`) - Benefits-focused, high-urgency approach
- **Product Page A** (`product-a.html`) - Technical features presentation  
- **Product Page B** (`product-b.html`) - ROI and benefits focused

### Key Features
- ✅ VWO-ready HTML structure with `data-vwo-element` attributes
- ✅ Comprehensive conversion tracking system
- ✅ Multiple call-to-action variants for testing
- ✅ Different messaging approaches (features vs benefits)
- ✅ Visual design variations (colors, layouts, urgency elements)
- ✅ Interactive elements (calculator, forms, hover tracking)
- ✅ Mobile-responsive design
- ✅ Debug mode with visual indicators

## 🚀 Quick Start

1. **Open the site**: Start with `index.html` in your browser
2. **Explore variants**: Compare `index.html` vs `index-variant-b.html`
3. **Test product pages**: Check `product-a.html` vs `product-b.html`
4. **Open browser console**: See real-time event tracking
5. **Check debug indicators**: Top-right corner shows variant and event count

## 🔧 VWO Integration Setup

### Step 1: Add Your VWO Tracking Code
Replace the placeholder in each HTML file:

```html
<!-- Replace YOUR_VWO_ACCOUNT_ID with your actual VWO account ID -->
<script type='text/javascript'>
window._vwo_code || (function() {
    var account_id = 'YOUR_ACTUAL_VWO_ACCOUNT_ID';
    // ... rest of VWO code
})();
</script>
```

### Step 2: Configure JavaScript
In `script.js`, update the configuration:

```javascript
const CONFIG = {
    vwoAccountId: 'YOUR_ACTUAL_VWO_ACCOUNT_ID',
    gtmId: 'GTM-XXXXXXX', // Your GTM ID if using
    debug: false, // Set to false in production
    cookieDuration: 30
};
```

### Step 3: VWO Test Setup Examples

#### A/B Test: Landing Page Headlines
- **Control (A)**: "Boost Your Productivity with Smart Tools"
- **Variation (B)**: "Revolutionize Your Workflow in 24 Hours"
- **Goal**: Track `primary_cta_click` events

#### Split URL Test: Product Pages
- **URL A**: `/product-a.html` (features-focused)
- **URL B**: `/product-b.html` (benefits-focused)  
- **Goal**: Track form submissions and time on page

## 📊 Available Test Scenarios

### 1. Landing Page A/B Test
**What to Test:**
- Headlines and messaging
- CTA button colors and text
- Layout (two-column vs single-column)
- Social proof placement
- Pricing presentation

**Tracked Events:**
- `primary_cta_click` - Main CTA button clicks
- `secondary_cta_click` - Secondary CTA clicks
- `scroll_depth` - How far users scroll
- `time_on_page` - Engagement duration

### 2. Split URL Test: Product Pages
**What to Test:**
- Feature-focused vs benefit-focused content
- Technical specs vs ROI calculator
- Testimonials vs case studies
- Different pricing strategies

**Tracked Events:**
- `product_a_signup` vs `product_b_trial`
- `calculator_interest` - ROI calculator engagement
- `element_click` - Specific feature interactions

### 3. Conversion Funnel Test
**What to Test:**
- Complete user journey from landing to conversion
- Different page sequences
- Multi-step vs single-step forms

## 🎛️ Conversion Tracking

### Automatic Tracking
The site automatically tracks:
- **Page views** with variant information
- **Scroll depth** at 25%, 50%, 75%, 90%, 100%
- **Time on page** at 10s, 30s, 60s, 2min, 5min
- **Element clicks** on all `[data-vwo-element]` items
- **Form submissions** with variant context
- **Button hover duration** for engagement analysis

### Manual Tracking
Use the global function to track custom events:

```javascript
// Track custom conversion
trackConversion('custom_event_name', {
    customData: 'additional_info',
    value: 100
});
```

### Debug Console Commands
Access these in your browser console:

```javascript
// View all tracked events
ABTestDebug.getEvents()

// See current variant
ABTestDebug.getCurrentVariant()

// Export all data
ABTestDebug.exportData()

// Clear stored events
ABTestDebug.clearEvents()

// Track test event
ABTestDebug.trackTestEvent('test', {data: 'example'})
```

## 🎨 Customization Guide

### Adding New Test Elements
1. **Add data attributes** for VWO targeting:
```html
<button data-vwo-element="new-cta-button">Custom CTA</button>
```

2. **Add conversion tracking**:
```html
<button onclick="trackConversion('new_conversion_event')">Track Me</button>
```

### Creating New Variants
1. **Copy existing page** (e.g., `index.html`)
2. **Modify content** and styling
3. **Update page title** and footer version indicator
4. **Add variant-specific CSS classes**
5. **Update navigation links** if needed

### Styling Variants
- **Main styles**: `styles.css` (base styling)
- **Variant B styles**: `variant-b-styles.css` (overrides and additions)
- **Custom variants**: Create new CSS files and link them

## 📈 Analytics Integration

### Google Analytics 4
Events are automatically sent to GA4 if `gtag` is available:

```javascript
gtag('event', 'conversion_name', {
    event_category: 'A/B Testing',
    event_label: 'variant_a',
    custom_parameter_1: 'session_id'
});
```

### Google Tag Manager
Events pushed to `dataLayer` for GTM:

```javascript
dataLayer.push({
    event: 'ab_test_conversion',
    eventName: 'button_click',
    variant: 'A',
    sessionId: 'sess_abc123'
});
```

## 🧪 Testing Scenarios

### Beginner Tests
1. **Button Color Test**: Blue vs Green CTA buttons
2. **Headline Test**: Feature vs Benefit headlines
3. **Image Test**: Product screenshot vs team photo

### Intermediate Tests  
1. **Layout Test**: Sidebar vs centered layouts
2. **Pricing Test**: Monthly vs annual pricing prominence
3. **Social Proof Test**: Testimonials vs logos vs metrics

### Advanced Tests
1. **Complete Page Redesign**: Landing A vs Landing B
2. **User Journey Test**: Different page sequences
3. **Personalization Test**: Different content by traffic source

## 🔍 Troubleshooting

### VWO Not Loading
1. Check your account ID is correct
2. Verify domain is whitelisted in VWO
3. Check browser console for errors
4. Ensure VWO script loads before our tracking script

### Events Not Tracking
1. Open browser console to see debug messages
2. Check `ABTestDebug.getEvents()` for stored events
3. Verify VWO is loaded: `typeof window.VWO !== 'undefined'`
4. Check localStorage for `ab_test_events`

### Variant Detection Issues
1. Check URL parameters: `?variant=B`
2. Clear cookies and localStorage
3. Verify page structure and CSS classes
4. Check `ABTestDebug.getCurrentVariant()`

## 📱 Mobile Testing

The site is fully responsive and supports mobile A/B testing:
- Touch-friendly buttons and forms
- Mobile-optimized layouts
- Responsive design breakpoints
- Mobile-specific tracking events

## 🔒 Privacy & GDPR

- Uses first-party cookies only
- No personal data stored without consent
- Easy to implement cookie consent banners
- Clear data retention policies (30 days default)

## 🤝 Contributing

Feel free to extend this site with:
- Additional page variants
- New conversion tracking events
- Different design patterns
- Integration with other testing platforms

## 📚 Learning Resources

### VWO Documentation
- [VWO Knowledge Base](https://help.vwo.com/)
- [A/B Testing Best Practices](https://vwo.com/ab-testing/)
- [Conversion Rate Optimization](https://vwo.com/conversion-rate-optimization/)

### A/B Testing Guides
- Statistical significance calculators
- Test duration calculators
- Sample size determination guides

---

**Ready to start testing?** Open `index.html` in your browser and begin exploring the different variants. Check the browser console to see the tracking system in action!

**Need help?** All tracking events are logged to the console in debug mode, making it easy to understand what's being tracked and when. 