"use client";

import Script from "next/script";

// Ad-conversion tracking pixels. Each one only renders if its ID env var is set,
// so the store works fine with zero, one, or both configured.
//   NEXT_PUBLIC_META_PIXEL_ID   — Facebook/Instagram (Meta) Ads
//   NEXT_PUBLIC_TIKTOK_PIXEL_ID — TikTok Ads
const META = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const GADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function Pixels() {
  return (
    <>
      {META && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {GADS && (
        <Script
          id="google-ads"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GADS}`}
        />
      )}
      {GADS && (
        <Script id="google-ads-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GADS}');`}
        </Script>
      )}

      {TIKTOK && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${TIKTOK}');
  ttq.page();
}(window, document, 'ttq');`}
        </Script>
      )}
    </>
  );
}
