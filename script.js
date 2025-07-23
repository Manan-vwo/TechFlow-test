// A/B Testing & VWO Integration Script
// This script provides conversion tracking, user interactions, and VWO integration capabilities

// Configuration
const CONFIG = {
    vwoAccountId: 'YOUR_VWO_ACCOUNT_ID', // Replace with actual VWO account ID
    gtmId: 'GTM-XXXXXXX', // Replace with actual GTM ID if using
    debug: true, // Set to false in production
    cookieDuration: 30, // Days to store user preferences
};

// Utility Functions
const Utils = {
    // Log messages (only in debug mode)
    log: function(message, data = null) {
        if (CONFIG.debug) {
            console.log(`[A/B Test Site] ${message}`, data);
        }
    },

    // Set cookie with expiration
    setCookie: function(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },

    // Get cookie value
    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    // Generate unique session ID
    generateSessionId: function() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    // Get user agent info for analytics
    getUserInfo: function() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };
    }
};

// Session Management
const Session = {
    sessionId: null,
    startTime: null,

    init: function() {
        this.sessionId = Utils.getCookie('ab_session_id') || Utils.generateSessionId();
        this.startTime = Date.now();
        Utils.setCookie('ab_session_id', this.sessionId, CONFIG.cookieDuration);
        Utils.log('Session initialized', { sessionId: this.sessionId });
    },

    getSessionData: function() {
        return {
            sessionId: this.sessionId,
            duration: Date.now() - this.startTime,
            pageViews: parseInt(Utils.getCookie('page_views') || '0') + 1
        };
    }
};

// Conversion Tracking System
const ConversionTracker = {
    events: [],

    // Track conversion event
    track: function(eventName, eventData = {}) {
        const event = {
            eventName: eventName,
            eventData: eventData,
            timestamp: new Date().toISOString(),
            sessionId: Session.sessionId,
            pageUrl: window.location.href,
            pageTitle: document.title,
            userInfo: Utils.getUserInfo()
        };

        this.events.push(event);
        Utils.log('Conversion tracked', event);

        // Send to VWO if available
        this.sendToVWO(event);

        // Send to Google Analytics/GTM if available
        this.sendToGA(event);

        // Store in localStorage for debugging
        this.storeEvent(event);

        // Trigger custom event for other integrations
        this.dispatchCustomEvent(event);
    },

    // Send event to VWO
    sendToVWO: function(event) {
        if (typeof window._vwo_exp !== 'undefined' && window._vwo_exp.track) {
            try {
                window._vwo_exp.track(event.eventName, event.eventData);
                Utils.log('Event sent to VWO', event.eventName);
            } catch (error) {
                Utils.log('VWO tracking error', error);
            }
        } else if (typeof window.VWO !== 'undefined' && window.VWO.event) {
            try {
                window.VWO.event(event.eventName, event.eventData);
                Utils.log('Event sent to VWO (v2)', event.eventName);
            } catch (error) {
                Utils.log('VWO v2 tracking error', error);
            }
        } else {
            Utils.log('VWO not detected, event stored locally', event.eventName);
        }
    },

    // Send event to Google Analytics
    sendToGA: function(event) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', event.eventName, {
                event_category: 'A/B Testing',
                event_label: event.eventData.variant || 'default',
                custom_parameter_1: event.sessionId
            });
            Utils.log('Event sent to GA4', event.eventName);
        }

        // Google Tag Manager
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: 'ab_test_conversion',
                eventName: event.eventName,
                eventData: event.eventData,
                sessionId: event.sessionId
            });
            Utils.log('Event sent to GTM', event.eventName);
        }
    },

    // Store event in localStorage
    storeEvent: function(event) {
        try {
            const storedEvents = JSON.parse(localStorage.getItem('ab_test_events') || '[]');
            storedEvents.push(event);
            // Keep only last 100 events
            if (storedEvents.length > 100) {
                storedEvents.splice(0, storedEvents.length - 100);
            }
            localStorage.setItem('ab_test_events', JSON.stringify(storedEvents));
        } catch (error) {
            Utils.log('LocalStorage error', error);
        }
    },

    // Dispatch custom event
    dispatchCustomEvent: function(event) {
        const customEvent = new CustomEvent('abTestConversion', {
            detail: event
        });
        document.dispatchEvent(customEvent);
    },

    // Get all tracked events
    getEvents: function() {
        return this.events;
    },

    // Get events from localStorage
    getStoredEvents: function() {
        try {
            return JSON.parse(localStorage.getItem('ab_test_events') || '[]');
        } catch (error) {
            Utils.log('Error reading stored events', error);
            return [];
        }
    }
};

// A/B Test Variant Detection
const VariantDetector = {
    currentVariant: null,

    detect: function() {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const urlVariant = urlParams.get('variant');
        
        if (urlVariant) {
            this.currentVariant = urlVariant;
            Utils.setCookie('ab_variant', urlVariant, CONFIG.cookieDuration);
            Utils.log('Variant set from URL', urlVariant);
            return urlVariant;
        }

        // Check cookie
        const cookieVariant = Utils.getCookie('ab_variant');
        if (cookieVariant) {
            this.currentVariant = cookieVariant;
            Utils.log('Variant from cookie', cookieVariant);
            return cookieVariant;
        }

        // Detect from page structure
        if (document.body.classList.contains('variant-b')) {
            this.currentVariant = 'B';
        } else if (window.location.pathname.includes('variant-b') || 
                   window.location.pathname.includes('product-b')) {
            this.currentVariant = 'B';
        } else {
            this.currentVariant = 'A';
        }

        Utils.setCookie('ab_variant', this.currentVariant, CONFIG.cookieDuration);
        Utils.log('Variant detected from page', this.currentVariant);
        return this.currentVariant;
    },

    getCurrentVariant: function() {
        return this.currentVariant || this.detect();
    }
};

// Page-specific functionality
const PageFunctions = {
    // Initialize page-specific features
    init: function() {
        this.setupFormHandlers();
        this.setupScrollTracking();
        this.setupTimeOnPage();
        this.setupHeatmapTracking();
        this.addConversionElements();
    },

    // Setup form submission handlers
    setupFormHandlers: function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const formId = form.id || 'unknown_form';
                ConversionTracker.track('form_submission', {
                    formId: formId,
                    variant: VariantDetector.getCurrentVariant(),
                    page: window.location.pathname
                });
            });
        });
    },

    // Track scroll depth
    setupScrollTracking: function() {
        let maxScroll = 0;
        const scrollMilestones = [25, 50, 75, 90, 100];
        let trackedMilestones = [];

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            maxScroll = Math.max(maxScroll, scrollPercent);

            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                    trackedMilestones.push(milestone);
                    ConversionTracker.track('scroll_depth', {
                        percentage: milestone,
                        variant: VariantDetector.getCurrentVariant(),
                        page: window.location.pathname
                    });
                }
            });
        });

        // Track final scroll on page unload
        window.addEventListener('beforeunload', () => {
            ConversionTracker.track('final_scroll_depth', {
                percentage: maxScroll,
                variant: VariantDetector.getCurrentVariant(),
                page: window.location.pathname
            });
        });
    },

    // Track time on page
    setupTimeOnPage: function() {
        const startTime = Date.now();
        const timeCheckpoints = [10, 30, 60, 120, 300]; // seconds
        let trackedTimes = [];

        const checkTime = () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            
            timeCheckpoints.forEach(checkpoint => {
                if (timeOnPage >= checkpoint && !trackedTimes.includes(checkpoint)) {
                    trackedTimes.push(checkpoint);
                    ConversionTracker.track('time_on_page', {
                        seconds: checkpoint,
                        variant: VariantDetector.getCurrentVariant(),
                        page: window.location.pathname
                    });
                }
            });
        };

        setInterval(checkTime, 5000); // Check every 5 seconds

        // Track total time on page unload
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            ConversionTracker.track('total_time_on_page', {
                seconds: totalTime,
                variant: VariantDetector.getCurrentVariant(),
                page: window.location.pathname
            });
        });
    },

    // Setup element interaction tracking (for heatmaps)
    setupHeatmapTracking: function() {
        // Track clicks on important elements
        const trackedElements = document.querySelectorAll('[data-vwo-element]');
        trackedElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const elementId = element.getAttribute('data-vwo-element');
                ConversionTracker.track('element_click', {
                    elementId: elementId,
                    elementType: element.tagName.toLowerCase(),
                    variant: VariantDetector.getCurrentVariant(),
                    page: window.location.pathname,
                    coordinates: {
                        x: e.clientX,
                        y: e.clientY
                    }
                });
            });
        });

        // Track hover events on CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
        ctaButtons.forEach(button => {
            let hoverStartTime;
            
            button.addEventListener('mouseenter', () => {
                hoverStartTime = Date.now();
            });

            button.addEventListener('mouseleave', () => {
                if (hoverStartTime) {
                    const hoverDuration = Date.now() - hoverStartTime;
                    ConversionTracker.track('button_hover', {
                        duration: hoverDuration,
                        buttonText: button.textContent.trim(),
                        variant: VariantDetector.getCurrentVariant(),
                        page: window.location.pathname
                    });
                }
            });
        });
    },

    // Add visual indicators for testing
    addConversionElements: function() {
        if (!CONFIG.debug) return;

        // Add variant indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #2563eb;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            font-family: monospace;
        `;
        indicator.textContent = `Variant: ${VariantDetector.getCurrentVariant()}`;
        document.body.appendChild(indicator);

        // Add event counter
        const counter = document.createElement('div');
        counter.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            background: #059669;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            font-family: monospace;
        `;
        counter.textContent = 'Events: 0';
        document.body.appendChild(counter);

        // Update counter when events are tracked
        document.addEventListener('abTestConversion', () => {
            counter.textContent = `Events: ${ConversionTracker.getEvents().length}`;
        });
    }
};

// Global conversion tracking functions (called from HTML)
function trackConversion(eventName, additionalData = {}) {
    ConversionTracker.track(eventName, {
        ...additionalData,
        variant: VariantDetector.getCurrentVariant()
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    ConversionTracker.track('email_signup', {
        variant: VariantDetector.getCurrentVariant(),
        page: window.location.pathname,
        formType: 'contact'
    });

    // Show success message
    const form = event.target;
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        text-align: center;
        font-weight: 600;
    `;
    successMessage.textContent = 'Thank you! We\'ll be in touch soon.';
    
    form.style.display = 'none';
    form.parentNode.appendChild(successMessage);

    return false;
}

// Debug functions (available in console)
window.ABTestDebug = {
    getEvents: () => ConversionTracker.getEvents(),
    getStoredEvents: () => ConversionTracker.getStoredEvents(),
    getCurrentVariant: () => VariantDetector.getCurrentVariant(),
    getSessionData: () => Session.getSessionData(),
    clearEvents: () => {
        localStorage.removeItem('ab_test_events');
        ConversionTracker.events = [];
        console.log('Events cleared');
    },
    trackTestEvent: (name, data) => ConversionTracker.track(name, data),
    exportData: () => {
        const data = {
            events: ConversionTracker.getStoredEvents(),
            variant: VariantDetector.getCurrentVariant(),
            session: Session.getSessionData(),
            userInfo: Utils.getUserInfo()
        };
        console.log('A/B Test Data:', data);
        return data;
    }
};

// VWO Integration Helper
const VWOIntegration = {
    // Check if VWO is loaded
    isLoaded: function() {
        return typeof window._vwo_exp !== 'undefined' || typeof window.VWO !== 'undefined';
    },

    // Wait for VWO to load
    waitForVWO: function(callback, timeout = 5000) {
        const startTime = Date.now();
        const checkVWO = () => {
            if (this.isLoaded()) {
                callback(true);
            } else if (Date.now() - startTime > timeout) {
                callback(false);
            } else {
                setTimeout(checkVWO, 100);
            }
        };
        checkVWO();
    },

    // Initialize VWO-specific tracking
    init: function() {
        this.waitForVWO((loaded) => {
            if (loaded) {
                Utils.log('VWO detected and loaded');
                this.setupVWOCallbacks();
            } else {
                Utils.log('VWO not detected within timeout period');
            }
        });
    },

    // Setup VWO callbacks
    setupVWOCallbacks: function() {
        if (typeof window._vwo_exp !== 'undefined') {
            // VWO v1 callbacks
            window._vwo_exp.push(['callback', (data) => {
                Utils.log('VWO callback triggered', data);
                ConversionTracker.track('vwo_callback', data);
            }]);
        }

        if (typeof window.VWO !== 'undefined' && window.VWO.push) {
            // VWO v2 callbacks
            window.VWO.push(['onVariationApplied', (data) => {
                Utils.log('VWO variation applied', data);
                ConversionTracker.track('vwo_variation_applied', data);
            }]);
        }
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('Initializing A/B testing framework');
    
    Session.init();
    VariantDetector.detect();
    PageFunctions.init();
    VWOIntegration.init();

    // Track page view
    ConversionTracker.track('page_view', {
        variant: VariantDetector.getCurrentVariant(),
        page: window.location.pathname,
        referrer: document.referrer
    });

    Utils.log('A/B testing framework initialized', {
        variant: VariantDetector.getCurrentVariant(),
        sessionId: Session.sessionId
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ConversionTracker,
        VariantDetector,
        Utils,
        Session
    };
} 