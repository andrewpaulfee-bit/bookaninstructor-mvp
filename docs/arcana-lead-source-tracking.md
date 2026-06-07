# Arcana Lead Source Tracking

## Goal

Track whether Arcana Brisbane enquiries come from Google Organic, Google Ads, Meta Ads, Direct, Referral, Email or other campaigns.

## Audit Findings

Checked live HTML for:

- `https://arcanabrisbane.com/`
- `https://arcanabrisbane.com/inquiry/`
- `https://arcanabrisbane.com/contact/`
- `https://arcanabrisbane.com/weddings/`
- `https://arcanabrisbane.com/sitemap_index.xml`

Current tracking found:

- GA4 is currently installed directly via `G-GM337HQJPK`.
- Meta Pixel is currently installed directly with Pixel ID `2843924862380414`.
- No `GTM-` container was found in the sampled HTML.
- Rank Math sitemap exists at `https://arcanabrisbane.com/sitemap_index.xml`.

Lead capture found:

- General enquiry page: `https://arcanabrisbane.com/inquiry/`
  - Fluent Forms form ID `9`
  - Form title: `Arcana General Inquire Form`
- Weddings page: `https://arcanabrisbane.com/weddings/`
  - Fluent Forms form ID `13`
  - Form title: `Arcana Weddings`
- Contact page: `https://arcanabrisbane.com/contact/`
  - Phone link: `tel:+0414418239`
  - Email links:
    - `mailto:arcanabrisbane@gmail.com`
    - `mailto:events@arcanabrisbane.com`
- Footer/contact areas also include:
  - `mailto:info@arcanabrisbane.com`
  - `mailto:events@arcanabrisbane.com`

Thank-you pages currently listed in the sitemap:

- `https://arcanabrisbane.com/thankyou/`
- `https://arcanabrisbane.com/eventsthankyou/`
- `https://arcanabrisbane.com/weddingthankyou/`
- `https://arcanabrisbane.com/xmasthankyou/`
- `https://arcanabrisbane.com/depositpaid/`

## Files Added

- `arcana/tracking/lead-source-tracking.js`

## What the Script Does

On first visit, it captures and stores:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `gclid`
- `fbclid`
- `landing_page`
- `referrer`
- `first_seen_at`

Storage:

- First-party cookie
- `localStorage`

Attribution logic:

- First-touch is only stored once and not overwritten.
- Last-touch is stored once per browser session.
- `gclid` is classified as Google paid search if no UTM source exists.
- `fbclid` is classified as Facebook paid social if no UTM source exists.
- Google/Bing/Yahoo/DuckDuckGo referrers are classified as organic.
- Facebook/Instagram referrers are classified as social referral.
- No referrer or tracking params is classified as direct.

Hidden fields added dynamically to lead forms:

- `lead_source`
- `lead_medium`
- `lead_campaign`
- `lead_term`
- `lead_content`
- `gclid`
- `fbclid`
- `landing_page`
- `referrer`
- `first_touch_source`
- `last_touch_source`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `first_seen_at`

Events pushed to `window.dataLayer`:

- `generate_lead`
- `phone_click`
- `email_click`
- `book_tour_click`

The script targets:

- Fluent Forms
- Contact Form 7
- Other forms with email fields

It excludes:

- Login forms
- Lost password forms
- Theme registration forms

It also de-duplicates successful form events for a short window so Fluent Forms cannot accidentally send the same `generate_lead` event twice if both its browser event and jQuery event fire.

## Recommended Install

1. Upload `arcana/tracking/lead-source-tracking.js` to WordPress Media Library or the active theme/child-theme assets folder.
2. Add it site-wide using one of:
   - GTM Custom HTML tag
   - WPCode plugin
   - Child theme enqueue
3. If using GTM Custom HTML, paste the whole script inside:

```html
<script>
  // Paste lead-source-tracking.js contents here
</script>
```

4. Fire the script on `All Pages`.

If Fluent Forms does not save dynamically appended hidden fields into entries or notification emails, add matching hidden fields inside the Fluent Forms builder for forms `9` and `13` using the same field names. The JavaScript will still populate them before submission.

## GTM Setup Required

Use one existing GTM container. Do not create duplicate GA4 or Meta snippets.

If GTM is not yet installed:

- Add the GTM head snippet site-wide.
- Add the GTM body noscript snippet site-wide.
- Then move GA4 and Meta firing into GTM, or disable the direct site snippets once GTM is verified.

### GA4 Tags

GA4 measurement ID:

- `G-GM337HQJPK`

Create one GA4 Configuration / Google Tag in GTM.

Create GA4 Event tags:

- Event name: `generate_lead`
  - Trigger: Custom Event `generate_lead`
  - Parameters:
    - `lead_type`
    - `lead_source`
    - `lead_medium`
    - `lead_campaign`
    - `lead_term`
    - `lead_content`
    - `landing_page`
    - `referrer`
    - `gclid`
    - `fbclid`
    - `first_touch_source`
    - `last_touch_source`
- Event name: `phone_click`
  - Trigger: Custom Event `phone_click`
- Event name: `email_click`
  - Trigger: Custom Event `email_click`
- Event name: `book_tour_click`
  - Trigger: Custom Event `book_tour_click`

Mark `generate_lead`, `phone_click`, `email_click` and `book_tour_click` as key events/conversions in GA4 if you want them optimised and reported as conversions.

### Meta Pixel Tags

Meta Pixel ID:

- `2843924862380414`

Create Meta Pixel tags in GTM:

- Base/PageView tag on All Pages.
- `Lead` event on Custom Event `generate_lead`.
- `Contact` event on Custom Event `phone_click`.
- `Contact` event on Custom Event `email_click`.

Disable direct Meta Pixel output on the WordPress site only after the GTM Meta Pixel has been verified, otherwise duplicate PageView/Lead events may fire.

## Campaign URL Rules

Google Ads:

- Keep auto-tagging enabled.
- Do not manually strip `gclid`.

Meta Ads:

Use UTMs:

```text
utm_source=facebook
utm_medium=paid_social
utm_campaign={{campaign.name}}
utm_content={{ad.name}}
```

For Instagram-specific campaigns:

```text
utm_source=instagram
utm_medium=paid_social
utm_campaign={{campaign.name}}
utm_content={{ad.name}}
```

Other paid links:

- Always use `utm_source`
- Always use `utm_medium`
- Always use `utm_campaign`

## Test Plan

1. Open:

```text
https://arcanabrisbane.com/inquiry/?utm_source=facebook&utm_medium=paid_social&utm_campaign=test
```

2. In the browser console, run:

```js
localStorage.getItem("arcana_lead_source_first_touch")
localStorage.getItem("arcana_lead_source_last_touch")
window.dataLayer
```

3. Submit a test form.
4. Confirm the Fluent Forms entry contains hidden fields.
5. Confirm `window.dataLayer` includes:

```js
{
  event: "generate_lead",
  lead_type: "form_submission",
  lead_source: "facebook",
  lead_medium: "paid_social",
  lead_campaign: "test"
}
```

6. In GA4 DebugView, confirm `generate_lead`.
7. In Meta Pixel Helper, confirm `Lead`.
8. Click a `tel:` link and confirm:
   - `phone_click` in dataLayer
   - GA4 `phone_click`
   - Meta `Contact`
9. Click a `mailto:` link and confirm:
   - `email_click` in dataLayer
   - GA4 `email_click`
   - Meta `Contact`
10. Check that duplicate `PageView`, `Lead` or `Contact` events are not firing.

## Manual Setup Still Required

- Confirm whether Arcana already has a GTM container in WordPress admin. The sampled live HTML did not show one.
- If GTM exists, provide the GTM ID and install it site-wide.
- If no GTM exists, create one GTM web container for `arcanabrisbane.com`.
- Move GA4 and Meta Pixel into GTM, then disable direct WordPress/plugin snippets to avoid duplicates.
- Add the script site-wide.
- Add the GTM custom event triggers and tags listed above.
- Test in GTM Preview, GA4 DebugView and Meta Pixel Helper.

Useful references:

- GA4 setup: `https://support.google.com/analytics/answer/9304153?hl=en`
- GTM dataLayer events: `https://developers.google.com/tag-platform/tag-manager/datalayer`
- Meta Pixel via GTM: `https://www.analyticsmania.com/post/facebook-pixel-with-google-tag-manager/`
