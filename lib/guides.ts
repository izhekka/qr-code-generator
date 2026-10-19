export interface GuideSection {
  /** Section heading (h2). */
  heading: string;
  /** Body paragraphs; a walkthrough section may carry only `steps`. */
  paragraphs?: string[];
  /** Numbered how-to steps when the section is a walkthrough. */
  steps?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  /** ~150 chars; becomes the meta description. */
  description: string;
  /** The one search query this page targets. */
  keywords: string;
  intro: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
  /** ISO date the guide ships, e.g. '2026-10-19'. */
  publishedAt: string;
}

export const GUIDES: Guide[] = [
  {
    slug: 'link-qr-code-generator',
    title: 'QR code generator for a link',
    description:
      'Turn any web address into a printable QR code your visitors scan and open instantly. No sign-ups, no payments, no expiry.',
    keywords: 'qr code generator for a link',
    intro:
      'Paste a web address, download a QR code, print it. The address lives inside the code itself, so it keeps working for as long as the link does — with no account and nothing leaving your browser.',
    sections: [
      {
        heading: 'What is a link QR code?',
        paragraphs: [
          'When you scan a link QR code, the exact web address is stored inside the pattern. Your phone reads it and opens the browser directly — there is no redirect service in the middle, no analytics hop, and no company that could switch or switch off the destination.',
          'That is what makes a static link QR different from the "smart" codes most services sell: those store a shortcut to their own server and forward you onward. A static code is the destination. If the page still exists ten years from now, the code from your desk drawer still opens it.',
        ],
      },
      {
        heading: 'How to make one',
        steps: [
          'Open the QR builder and pick the URL type.',
          'Paste your link — the https:// prefix is added automatically if you leave it out.',
          'Style the pattern: colors, frames, a rounded or dotted dot style, your logo in the center if you want one.',
          'Download PNG for printing at any size, or SVG if you plan to scale it.',
        ],
      },
      {
        heading: 'Where a link QR earns its keep',
        paragraphs: [
          'Business cards: one code that opens a portfolio, booking page or store — instead of a URL nobody retypes. Flyers and posters: the code does the typing. Presentation slides: the audience can open the live demo while you talk.',
          'Product packaging is another common one: a code on the box can lead to manuals, warranty registration or how-to videos without printing any of it on the packaging.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: [
          'Long tracking URLs with parameters make the pattern visibly denser and can break if the tracking campaign changes. Print the plain destination instead — short, stable addresses scan better and age better.',
          'And the one mistake you cannot fix with a static code: a typo. Printed codes cannot be edited, so scan-test the exported image before it goes to the printer.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does the link ever expire?',
        a: 'No. The address is in the code itself, so the code works while the page exists — nothing can expire on the QR side.',
      },
      {
        q: 'Can I change the destination after printing?',
        a: 'Not with a static code — the address is baked into the pattern. Generate a fresh code and reprint for a different destination.',
      },
      {
        q: 'Does the minimum size matter?',
        a: 'Keep it at least 2 cm on paper or larger on posters. Bigger is safer, especially with a logo in the center.',
      },
    ],
    publishedAt: '2026-10-19',
  },
  {
    slug: 'wifi-qr-code-generator',
    title: 'Wi-Fi QR code generator',
    description:
      'Encode your network name and password so guests join your Wi-Fi with one scan. Generated in your browser, free, works forever.',
    keywords: 'wifi qr code generator',
    intro:
      'A Wi-Fi QR code encodes your network name, password and security type. Guests scan it once and their phone joins the network — nobody retypes a 24-character password with a capital letter and an exclamation mark in it.',
    sections: [
      {
        heading: 'What is a Wi-Fi QR code?',
        paragraphs: [
          'The pattern carries three facts: the network name (SSID), the password and the encryption type. Phones are built to read this — both iPhones and Android devices recognize the format natively and offer to join on the spot.',
          'Because it is static, the data lives inside the code. There is no service to renew, no account that lapses, and no dashboard where a hotel chain could change where it points.',
        ],
      },
      {
        heading: 'How to make one',
        steps: [
          'Open the QR builder and pick the Wi-Fi type.',
          'Enter the network name exactly as your router shows it, the password, and the security type (most modern networks are WPA/WPA2 or WPA3).',
          'Pick a network band or leave it as-is — for most setups the default encoding works on both 2.4 and 5 GHz.',
          'Style it to match your interior or menu brand and export PNG or SVG.',
        ],
      },
      {
        heading: 'Where a Wi-Fi QR earns its keep',
        paragraphs: [
          'Cafés and restaurants place it on menus and table tents. Hotels and B&Bs frame it by reception and in every room. Home households put it on the fridge for visitors. At events, the code goes on the stage banner or badge insert.',
          'One rule of thumb wherever it goes: the sign should be readable from where guests sit, and the QR itself at least 2 cm wide.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: [
          'Do not encode your main network password on a public counter — anyone in the room can decode it. Generate a guest network with its own password and print that.',
          'If you rotate guest passwords for security, remember the printed code can never change: either accept a reprint now and then, or pair the printed code with a guest network whose password is long-lived.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I change the Wi-Fi password after printing?',
        a: 'No — a static code carries the password inside the pattern. Generate and print a new one; consider a dedicated guest network with a stable password.',
      },
      {
        q: 'Is my password stored anywhere?',
        a: 'No. Everything renders in your browser and is gone when you close the tab. Only the exported image contains the data.',
      },
      {
        q: 'Does it work on both iPhone and Android?',
        a: 'Yes — the Wi-Fi QR format is supported natively by iOS and Android. Older Android versions may offer it in slightly different ways.',
      },
    ],
    publishedAt: '2026-10-19',
  },
  {
    slug: 'vcard-qr-code-generator',
    title: 'vCard QR code generator',
    description:
      'Put your whole contact card behind one scan — name, title, phone, email. vCard 3.0, encoded in your browser, free.',
    keywords: 'vcard qr code generator',
    intro:
      'A vCard QR code encodes a contact card. One scan on a standard phone camera and the recipient sees a save-to-contacts prompt — no app to install, no retyping a name you heard once at a conference.',
    sections: [
      {
        heading: 'What is a vCard QR code?',
        paragraphs: [
          'vCard (version 3.0) is the standard format phones use to move contact details around. The QR code carries the card itself: your name, job title, company, phone numbers, email, website and a short note if you want one.',
          'Static beats connected here, too: your paper business card does not depend on a subscription that auto-renews somewhere. It scans the same way ten years later.',
        ],
      },
      {
        heading: 'How to make one',
        steps: [
          'Open the QR builder and pick the vCard type.',
          'Fill in the fields — name and role, phone and email are what people actually need; more fields mean a denser pattern.',
          'Add a logo or brand colors if the card matches your printed materials.',
          'Export PNG for print or SVG for vector layouts, then scan-test before committing to print.',
        ],
      },
      {
        heading: 'Where a vCard QR earns its keep',
        paragraphs: [
          'Trade shows and conferences: print it on your lanyard so people can actually save you. Small businesses: the back of the business card, the receipt, the car door sign. Technicians and couriers: the manual and the van door — the customer saves the support contact in seconds.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: [
          'Every field you add grows the pattern. A card with six phone numbers, three addresses and a nine-line note scans worse than three essential fields. Put short essentials in the code, longer details on the page it complements.',
          'If your job may change soon, print fewer personal fields: a title that stops being true is baked in forever on a static code.',
        ],
      },
    ],
    faq: [
      {
        q: 'Which contact fields are included?',
        a: 'Name, title and company, phone, email and website — whatever you enter in the builder becomes part of the vCard the code encodes.',
      },
      {
        q: 'What does the other person need to open it?',
        a: 'Nothing to install. Modern iPhone and Android cameras offer a save-to-contacts prompt directly.',
      },
      {
        q: 'Can I update the card later?',
        a: 'Not on a code you already printed — the card is encoded in the pattern. Always scan-test before printing, and reprint if you change jobs.',
      },
    ],
    publishedAt: '2026-10-19',
  },
  {
    slug: 'event-qr-code-generator',
    title: 'Event QR code generator',
    description:
      'Encode an event into a QR code so guests add it to their calendar with one scan — title, venue, and the exact time window.',
    keywords: 'event qr code generator',
    intro:
      'An event QR code creates a calendar entry on the guest\'s phone — title, venue, start and end time — the moment they scan it. "Add to calendar" happens instead of "screenshot and hope".',
    sections: [
      {
        heading: 'What is an event QR code?',
        paragraphs: [
          'The code carries a standard calendar object. iPhones offer "Add to iOS Calendar", Android devices hand it to Google Calendar — either way the guest gets a real time-blocked entry with the venue attached for navigation.',
          'The phone applies the guest\'s own time zone, so a conference talk travels correctly across borders without you doing anything.',
        ],
      },
      {
        heading: 'How to make one',
        steps: [
          'Open the QR builder and pick the Event type.',
          'Enter the title, the venue, and the start and end window.',
          'Style the code to your invite or poster.',
          'Export PNG or SVG and scan-test on an iPhone and an Android before printing.',
        ],
      },
      {
        heading: 'Where an event QR earns its keep',
        paragraphs: [
          'Wedding invitations: save-the-date cards with the ceremony and reception pre-added. Conference posters and programs. Webinar confirmation emails and PDF handouts — attendees add the talk from the printed program.',
          'Community events benefit most: sports days, fairs, charity runs, where the audience is exactly the crowd that never types long addresses.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: [
          'A static event code is printed as it will stand forever — if the event might move, keep the printed detail to the minimum that will not change, or pair the poster with a live page link instead.',
          'Long venue names bloat the pattern; a short venue plus a "more info" link on the same poster does the heavy lifting.',
        ],
      },
    ],
    faq: [
      {
        q: 'Which calendar apps open it?',
        a: 'The phone\'s native calendar flow — iOS Calendar on iPhones, Google Calendar on Android. No separate app required.',
      },
      {
        q: 'Can I change the event after printing?',
        a: 'No — static means the event is baked in. If something changes, print a fresh code or keep the poster pointing to a page you control.',
      },
      {
        q: 'Does the guest need to be online to scan it?',
        a: 'Reading the code needs no connection; saving the event does not either in most calendar apps, but opening the venue map for navigation does.',
      },
    ],
    publishedAt: '2026-10-19',
  },
  {
    slug: 'sms-qr-code-generator',
    title: 'SMS QR code generator',
    description:
      'Encode a phone number and a pre-filled text so customers open a ready-to-send SMS with one scan. Free, browser-only.',
    keywords: 'sms qr code generator',
    intro:
      'An SMS QR code pre-fills a text message — recipient number and body — the moment it is scanned. The user only presses send. It is the lowest-friction "contact us" printed media can offer, and it works on every phone with a messaging app.',
    sections: [
      {
        heading: 'What is an SMS QR code?',
        paragraphs: [
          'The pattern carries the recipient number and the message body. Scanning opens the phone\'s messaging app with a composed draft, ready to send. Nothing is sent automatically — the human always confirms, which is why SMS QRs are used for requests rather than blasts.',
        ],
      },
      {
        heading: 'How to make one',
        steps: [
          'Open the QR builder and pick the SMS type.',
          'Enter the destination number in international format (starting with + and the country code).',
          'Write the short pre-filled body — a keyword such as START, HELP or a campaign code works well.',
          'Export PNG or SVG, scan-test, and place it where hands are free.',
        ],
      },
      {
        heading: 'Where an SMS QR earns its keep',
        paragraphs: [
          'Customer support: "Scan to text us" on invoices, packing slips and shop windows — people ask questions without calls or email forms. Request-by-text campaigns: vote, order or opt-in with a keyword. Charity hotlines: donation-by-text lines with the keyword printed on the card.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: [
          'Short codes are carrier-specific: a shortcode that works on one network can fail on another, so prefer a full international number. Keep the pre-filled text short — the reader still edits and sends it personally, and a long draft raises friction, not lowers it.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does scanning send the message immediately?',
        a: 'No — it opens a pre-filled draft. The user reviews it and presses send themselves, always.',
      },
      {
        q: 'Does it cost the scanner anything?',
        a: 'Whatever their mobile plan charges for a normal SMS. The QR itself is free and adds no fee of any kind.',
      },
      {
        q: 'Can the message include emojis or images?',
        a: 'Plain text only — SMS carries text. Keep the body to the essential keyword or question.',
      },
    ],
    publishedAt: '2026-10-19',
  },
  {
    slug: 'instagram-qr-code-generator',
    title: 'Instagram QR code generator',
    description:
      'Encode your Instagram profile into a custom printable QR code — scan it and the profile opens. Styled frames and colors, free.',
    keywords: 'instagram qr code generator',
    intro:
      'Print your Instagram profile behind a scan: "follow us" cards, window stickers, packaging inserts. The code carries your profile URL, so it works on every camera — not just inside Instagram\'s own scanner.',
    sections: [
      {
        heading: 'Why a print-ready Instagram QR code',
        paragraphs: [
          'Instagram\'s in-app code is fine when both phones have the app open. In the physical world — a café window, a market stall, a flyer — your visitor has any camera. A code with the profile URL inside opens instagram.com in the browser, and the phone\'s link handling takes over from there.',
          'Because you generate it yourself, you style it to your brand and print it at the size your shop window needs — no screenshot of a low-resolution in-app image stretched over an A4 printout.',
        ],
      },
      {
        heading: 'How to make one',
        steps: [
          'Copy your profile URL: instagram.com/your-handle (no spaces after the slash).',
          'Open the QR builder and pick the URL type, then paste the address.',
          'Style it — Instagram-friendly frames and colors work; keep contrast strong for scannability.',
          'Export PNG for stickers and posters; SVG if you are embedding it into larger print layouts.',
        ],
      },
      {
        heading: 'Where it earns its keep',
        paragraphs: [
          'Shop fronts and menus: "Follow @yourhandle — scan to see today\'s cakes". Packaging inserts for handmade goods. Business-card corners for photographers, florists, tattoo artists — Instagram is their portfolio, so the printed card opens it.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: [
          'Handles change — if you rename your account, every printed code silently dies. If a rename is foreseeable, print a branded link you own (yourdomain.com/instagram redirecting to the profile) and encode that instead.',
          'Scan for typos before print: one wrong letter in the handle sends customers to a stranger\'s profile, permanently — printed codes cannot be edited.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does scanning open the Instagram app directly?',
        a: 'The URL opens in the browser first; the phone\'s link handling usually continues into the app. Either way the profile appears.',
      },
      {
        q: 'Can I encode a specific post or story instead of the profile?',
        a: 'Yes — any Instagram URL works in the URL type. For printed assets, profile links age better than single posts.',
      },
      {
        q: 'Does Instagram learn that I printed this?',
        a: 'Not from this site. The code is generated entirely in your browser; only the exported image contains the address.',
      },
    ],
    publishedAt: '2026-10-19',
  },
  {
    slug: 'facebook-qr-code-generator',
    title: 'Facebook QR code generator',
    description:
      'Encode your Facebook page into a printable QR code — scan opens the page, ready to like or message. Browser-only, free.',
    keywords: 'facebook qr code generator',
    intro:
      'A Facebook QR code carries your page URL. On a counter card or community-board poster, a scan opens the page where "like" and "message" are one tap apart — no typing of a name your page shares with three other businesses.',
    sections: [
      {
        heading: 'Why a print-ready Facebook QR code',
        paragraphs: [
          'Page names are not unique: search for "Bella Bakery" and you find four of them plus a closed one. A scanner does not have to search at all — the code carries the exact page URL, with its photo albums and reviews one tap away.',
          'And it is static data — no service, no campaign, no renewal. The code on the community board works while the page exists.',
        ],
      },
      {
        heading: 'How to make one',
        steps: [
          'Open your Facebook page and copy the URL from the browser bar — the page URL (facebook.com/your-page), not a post URL.',
          'Open the QR builder, pick the URL type, and paste it.',
          'Style the code: bold contrast for outdoor board posters, softer colors for counter cards.',
          'Export PNG or SVG and scan-test before printing.',
        ],
      },
      {
        heading: 'Where it earns its keep',
        paragraphs: [
          'Counter cards: "Did we do right today? Scan to leave a review." Shop windows and market stalls so visitors browse photos of your work. Service vans and community boards for local clubs, sports teams and non-profits.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: [
          'Encode a page URL, never a personal profile — people cannot like or follow a personal profile, and the scan lands somewhere useless. If you change your vanity page address, printed codes break: for a foreseeable rename, encode a URL you own that redirects to the page.',
          'Keep the printed call to action next to the code. A scan without a reason is a scan without a like.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can people like my page directly from the scan?',
        a: 'The scan opens the page; from there liking or following is one tap. No extra app needed.',
      },
      {
        q: 'Should I encode my Messenger link instead?',
        a: 'A m.me/your-page link works the same way in the URL type and opens Messenger chat — useful for "ask us anything" cards.',
      },
      {
        q: 'Is the QR code really free?',
        a: 'Yes — no sign-up, no fee, and the page is generated in your browser without uploads.',
      },
    ],
    publishedAt: '2026-10-19',
  },
];