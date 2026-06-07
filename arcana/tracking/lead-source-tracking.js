/*
 * Arcana Brisbane lead-source tracking.
 *
 * Install site-wide after Google Tag Manager is loaded.
 * Captures first-touch and session last-touch attribution, appends hidden
 * fields to lead forms, and pushes dataLayer events for GTM/GA4/Meta.
 */
(function () {
  "use strict";

  var STORAGE_PREFIX = "arcana_lead_source_";
  var COOKIE_DAYS = 90;
  var SESSION_KEY = STORAGE_PREFIX + "last_touch_session";
  var FIRST_TOUCH_KEY = STORAGE_PREFIX + "first_touch";
  var LAST_TOUCH_KEY = STORAGE_PREFIX + "last_touch";
  var RECENT_EVENT_TTL_MS = 3000;
  var recentEvents = {};

  var TRACKED_FIELDS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
    "landing_page",
    "referrer",
    "first_seen_at",
    "lead_source",
    "lead_medium",
    "lead_campaign",
    "lead_term",
    "lead_content",
    "first_touch_source",
    "last_touch_source"
  ];

  function nowIso() {
    return new Date().toISOString();
  }

  function getParams() {
    return new URLSearchParams(window.location.search || "");
  }

  function getParam(name) {
    return getParams().get(name) || "";
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie =
      encodeURIComponent(name) +
      "=" +
      encodeURIComponent(value) +
      "; expires=" +
      expires +
      "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    var cookie = document.cookie
      .split("; ")
      .find(function (row) {
        return row.indexOf(encodeURIComponent(name) + "=") === 0;
      });
    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
  }

  function safeJsonParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function readStored(key) {
    return (
      safeJsonParse(window.localStorage.getItem(key)) ||
      safeJsonParse(getCookie(key)) ||
      null
    );
  }

  function writeStored(key, value) {
    var serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    setCookie(key, serialized, COOKIE_DAYS);
  }

  function normaliseHost(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (error) {
      return "";
    }
  }

  function classifySource(params) {
    var source = getParam("utm_source");
    var medium = getParam("utm_medium");
    var campaign = getParam("utm_campaign") || getParam("utm_id");
    var term = getParam("utm_term");
    var content = getParam("utm_content");
    var gclid = getParam("gclid");
    var fbclid = getParam("fbclid");
    var referrer = document.referrer || "";
    var refHost = normaliseHost(referrer);

    if (gclid && !source) {
      source = "google";
      medium = medium || "paid_search";
    }

    if (fbclid && !source) {
      source = "facebook";
      medium = medium || "paid_social";
    }

    if (!source && refHost) {
      if (/google\./i.test(refHost)) {
        source = "google";
        medium = "organic";
      } else if (/bing\.|yahoo\.|duckduckgo\./i.test(refHost)) {
        source = refHost.split(".")[0];
        medium = "organic";
      } else if (/facebook\.|instagram\.|l\.facebook\.com|m\.facebook\.com/i.test(refHost)) {
        source = refHost.indexOf("instagram") !== -1 ? "instagram" : "facebook";
        medium = "social_referral";
      } else {
        source = refHost;
        medium = "referral";
      }
    }

    if (!source) {
      source = "direct";
      medium = "none";
    }

    return {
      utm_source: getParam("utm_source"),
      utm_medium: getParam("utm_medium"),
      utm_campaign: getParam("utm_campaign") || getParam("utm_id"),
      utm_term: term,
      utm_content: content,
      gclid: gclid,
      fbclid: fbclid,
      source: source,
      medium: medium || "none",
      campaign: campaign || "",
      term: term || "",
      content: content || "",
      landing_page: window.location.href.split("#")[0],
      referrer: referrer,
      first_seen_at: nowIso()
    };
  }

  function getOrCreateTouches() {
    var current = classifySource();
    var firstTouch = readStored(FIRST_TOUCH_KEY);

    if (!firstTouch) {
      firstTouch = current;
      writeStored(FIRST_TOUCH_KEY, firstTouch);
    }

    var lastTouch = readStored(LAST_TOUCH_KEY);
    var hasSession = window.sessionStorage.getItem(SESSION_KEY);

    if (!hasSession || !lastTouch) {
      lastTouch = current;
      writeStored(LAST_TOUCH_KEY, lastTouch);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }

    return {
      first: firstTouch,
      last: lastTouch,
      current: current
    };
  }

  function buildFieldValues() {
    var touches = getOrCreateTouches();
    var first = touches.first;
    var last = touches.last;

    return {
      utm_source: first.utm_source || first.source || "",
      utm_medium: first.utm_medium || first.medium || "",
      utm_campaign: first.utm_campaign || first.campaign || "",
      utm_term: first.utm_term || first.term || "",
      utm_content: first.utm_content || first.content || "",
      gclid: first.gclid || "",
      fbclid: first.fbclid || "",
      landing_page: first.landing_page || "",
      referrer: first.referrer || "",
      first_seen_at: first.first_seen_at || "",
      lead_source: first.source || "",
      lead_medium: first.medium || "",
      lead_campaign: first.campaign || "",
      lead_term: first.term || "",
      lead_content: first.content || "",
      first_touch_source: [first.source, first.medium, first.campaign].filter(Boolean).join(" / "),
      last_touch_source: [last.source, last.medium, last.campaign].filter(Boolean).join(" / ")
    };
  }

  function isLeadForm(form) {
    if (!form || !form.matches) return false;

    if (
      form.matches(
        ".login-form, .lostpassword-form, #opalrgtRegisterForm, form[name='loginform'], form[name='lostpasswordform']"
      )
    ) {
      return false;
    }

    return (
      form.matches(".frm-fluent-form, .wpcf7-form") ||
      form.id === "fluentform_9" ||
      form.id === "fluentform_13" ||
      form.querySelector("[name='email'], [type='email']") !== null
    );
  }

  function ensureHiddenField(form, name) {
    var field = form.querySelector("input[name='" + name + "']");

    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      field.setAttribute("data-arcana-lead-source", "true");
      form.appendChild(field);
    }

    return field;
  }

  function populateForm(form) {
    if (!isLeadForm(form)) return;

    var values = buildFieldValues();

    TRACKED_FIELDS.forEach(function (name) {
      ensureHiddenField(form, name).value = values[name] || "";
    });
  }

  function populateAllForms() {
    document.querySelectorAll("form").forEach(populateForm);
  }

  function pushDataLayer(eventName, extra) {
    var values = buildFieldValues();

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(
      Object.assign(
        {
          event: eventName,
          lead_type: eventName === "generate_lead" ? "form_submission" : "click",
          lead_source: values.lead_source,
          lead_medium: values.lead_medium,
          lead_campaign: values.lead_campaign,
          lead_term: values.lead_term,
          lead_content: values.lead_content,
          landing_page: values.landing_page,
          referrer: values.referrer,
          gclid: values.gclid,
          fbclid: values.fbclid,
          first_touch_source: values.first_touch_source,
          last_touch_source: values.last_touch_source
        },
        extra || {}
      )
    );
  }

  function pushDataLayerOnce(eventName, uniqueKey, extra) {
    var key = eventName + ":" + (uniqueKey || window.location.pathname);
    var now = Date.now();

    if (recentEvents[key] && now - recentEvents[key] < RECENT_EVENT_TTL_MS) {
      return;
    }

    recentEvents[key] = now;
    pushDataLayer(eventName, extra);
  }

  function bindFormEvents() {
    document.addEventListener(
      "submit",
      function (event) {
        if (!isLeadForm(event.target)) return;
        populateForm(event.target);
      },
      true
    );

    document.addEventListener("fluentform_submission_success", function (event) {
      var formId = event && event.detail ? event.detail.form_id || "" : "";
      pushDataLayerOnce("generate_lead", "fluent_forms_" + formId, {
        form_plugin: "fluent_forms",
        form_id: formId
      });
    });

    document.addEventListener("wpcf7mailsent", function (event) {
      var formId = event && event.detail ? event.detail.contactFormId || "" : "";
      pushDataLayerOnce("generate_lead", "contact_form_7_" + formId, {
        form_plugin: "contact_form_7",
        form_id: formId
      });
    });

    if (window.jQuery) {
      window.jQuery(document).on("fluentform_submission_success", function (_, response) {
        var formId = response && response.form_id ? response.form_id : "";
        pushDataLayerOnce("generate_lead", "fluent_forms_" + formId, {
          form_plugin: "fluent_forms",
          form_id: formId
        });
      });
    }
  }

  function bindClickEvents() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (!link) return;

      var href = link.getAttribute("href") || "";
      var label = (link.textContent || "").trim();

      if (href.indexOf("tel:") === 0) {
        pushDataLayer("phone_click", {
          click_url: href,
          click_text: label
        });
      } else if (href.indexOf("mailto:") === 0) {
        pushDataLayer("email_click", {
          click_url: href,
          click_text: label
        });
      } else if (/tour|strategycall|book/i.test(href + " " + label)) {
        pushDataLayer("book_tour_click", {
          click_url: href,
          click_text: label
        });
      }
    });
  }

  function observeDynamicForms() {
    if (!("MutationObserver" in window)) return;

    var observer = new MutationObserver(function () {
      populateAllForms();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    getOrCreateTouches();
    populateAllForms();
    bindFormEvents();
    bindClickEvents();
    observeDynamicForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
