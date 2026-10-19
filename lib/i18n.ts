export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ru';
}

// First-visit default from the browser language: Russian systems get ru,
// everything else (Belarusian included) falls back to en.
export function systemLocale(browserLanguage?: string): Locale {
  return browserLanguage?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export type Copy = {
  header: { brand: string; nav: { howItWorks: string; features: string; qrTypes: string; faq: string }; createCta: string };
  footer: { tagline: string; faq: string; contribute: string; guides: string };
  hero: { title: string; subtitle: string; createCta: string };
  howItWorks: { title: string; steps: Array<{ lead: string; rest: string }> };
  features: { title: string; items: Array<{ title: string; text: string }> };
  useCases: { title: string; items: string[] };
  qrTypes: { title: string; items: Array<{ title: string; text: string }>; tryCta: string };
  faq: { title: string; items: Array<{ q: string; a: string }>; contribute: { q: string; pre: string; linkText: string; post: string } };
  cta: { title: string; subtitle: string; createCta: string };
  content: { types: { link: string; text: string; email: string; call: string; vcard: string; wifi: string; event: string; sms: string; social: string; pdf: string; appstore: string }; linkLabel: string; textLabel: string; to: string; subject: string; body: string; phoneLabel: string; vcard: { firstName: string; lastName: string; org: string; title: string; phone: string; email: string; website: string; address: string }; wifi: { ssid: string; password: string; security: string; showPassword: string; open: string; hidden: string }; event: { title: string; start: string; end: string; allDay: string; location: string; description: string }; sms: { phone: string; message: string }; presetHelp: { social: string; pdf: string; appstore: string } };
  steps: { one: string; two: string; three: string };
  tabs: { sticker: string; pattern: string; corners: string; logo: string };
  pattern: { caption: string; colorLabel: string; gradient: string; from: string; to: string; backgroundColor: string; transparent: string; backgroundGradient: string; backgroundFrom: string; backgroundTo: string };
  corners: { squareStyle: string; dotsType: string; squareColor: string; dotColor: string };
  sticker: { caption: string; color: string; textColor: string };
  logo: { upload: string; previewAlt: string; alt: string; size: string; warn40: string; remove: string; pickImage: string; readError: string };
  download: { format: string; size: string; cta: string; failed: string };
  validation: { enterUrl: string; invalidUrl: string; enterText: string; invalidEmail: string; enterPhone: string; tooLong: string; enterName: string; enterSsid: string; enterPassword: string; enterTitle: string; enterStart: string; endBeforeStart: string };
};

const en: Copy = {
  header: {
    brand: 'Generator',
    nav: { howItWorks: 'How it works', features: 'Features', qrTypes: 'QR types', faq: 'FAQ' },
    createCta: 'Create Static QR',
  },
  footer: { tagline: 'Free QR codes that never expire.', faq: 'FAQ', contribute: 'Contribute', guides: 'Guides' },
  hero: {
    title: 'No sign-ups. No payments. Just grab your working QR code.',
    subtitle: 'Pick a type, design it, download it. The whole thing takes under a minute.',
    createCta: 'Create Static QR',
  },
  howItWorks: {
    title: 'How it works',
    steps: [
      { lead: 'Choose the content.', rest: ' A link, plain text, an e-mail draft or a phone number.' },
      { lead: 'Design the code.', rest: ' Pattern, colors, corners, sticker frame and your logo.' },
      { lead: 'Download it.', rest: ' PNG, JPEG, SVG or WEBP — ready to print or embed.' },
    ],
  },
  features: {
    title: 'Why this generator',
    items: [
      { title: 'Works forever', text: 'Static codes carry your content inside the code itself. No redirect service that can expire, no re-encoding after you print.' },
      { title: 'Private by design', text: 'Everything — content, design, logo — is processed in your browser. No accounts, no uploads, no scan tracking.' },
      { title: 'Print-ready exports', text: 'PNG up to 2048 px for screens, SVG for crisp printing at any size. JPEG and WEBP too.' },
      { title: 'More than black and white', text: 'Dot patterns, gradients, custom corners, your logo and sticker frames make a code people actually want to scan.' },
    ],
  },
  useCases: {
    title: 'Where you can use it',
    items: ['Business cards', 'Flyers & posters', 'Restaurant menus', 'Product packaging', 'Event tickets', 'Shopfront windows'],
  },
  qrTypes: {
    title: 'Free QR code types',
    items: [
      { title: 'Link', text: 'Point scanners at any web page.' },
      { title: 'Text', text: 'Show a note, number or Wi-Fi password.' },
      { title: 'E-mail', text: 'Open a pre-filled e-mail draft.' },
      { title: 'Call', text: 'Dial a phone number with one tap.' },
    ],
    tryCta: 'Try it in the constructor →',
  },
  faq: {
    title: 'FAQ',
    items: [
      { q: 'What is a static QR code?', a: 'The data lives inside the code itself. It starts scanning instantly and never stops — but it cannot be edited after you print or share it.' },
      { q: 'Will it expire?', a: 'No. There is no service behind it: the code keeps working as long as your content does.' },
      { q: 'Do I need an account?', a: 'No. Nothing to sign up for, nothing to pay, and nothing is stored anywhere.' },
      { q: 'Can I track scans?', a: 'No — tracking requires a dynamic (redirect-based) code, and this site deliberately generates only static ones.' },
      { q: 'How small can I print it?', a: 'Keep it at least 2 × 2 cm and leave a quiet margin around the code. The more data inside, the denser the code — shorter links print cleaner.' },
    ],
    contribute: {
      q: 'How can I contribute?',
      pre: 'The generator is open source: report bugs, suggest ideas or improve the code directly on ',
      linkText: 'GitHub',
      post: '. Every contribution helps.',
    },
  },
  cta: {
    title: 'Ready in under a minute',
    subtitle: 'Design your code, download it, use it anywhere.',
    createCta: 'Create Static QR',
  },
  content: {
    types: { link: 'Link', text: 'Text', email: 'E-mail', call: 'Call', vcard: 'Contact', wifi: 'Wi-Fi', event: 'Event', sms: 'SMS', social: 'Social', pdf: 'PDF', appstore: 'App' },
    linkLabel: 'Enter your Website',
    textLabel: 'Enter your text',
    to: 'To',
    subject: 'Subject',
    body: 'Body',
    phoneLabel: 'Phone number',
    vcard: {
      firstName: 'First name', lastName: 'Last name', org: 'Company', title: 'Job title',
      phone: 'Phone', email: 'E-mail', website: 'Website', address: 'Address',
    },
    wifi: {
      ssid: 'Network name (SSID)', password: 'Password', security: 'Security',
      showPassword: 'WPA / WPA2 / WPA3', open: 'Open (no password)', hidden: 'Hidden network',
    },
    event: {
      title: 'Event title', start: 'Starts', end: 'Ends', allDay: 'All day',
      location: 'Location', description: 'Description',
    },
    sms: { phone: 'Phone number', message: 'Message (optional)' },
    presetHelp: {
      social: 'Paste your Linktree, Instagram or other profile page URL.',
      pdf: 'Paste the URL of a hosted PDF file.',
      appstore: 'Paste the Google Play or App Store URL.',
    },
  },
  steps: { one: '1 · Complete the content', two: '2 · Design your QR code', three: '3 · Preview & download' },
  tabs: { sticker: 'Sticker', pattern: 'Pattern', corners: 'Corners', logo: 'Logo' },
  pattern: {
    caption: 'QR code pattern',
    colorLabel: 'Pattern color',
    gradient: 'Use gradient pattern',
    from: 'Gradient from',
    to: 'Gradient to',
    backgroundColor: 'Background color',
    transparent: 'Use transparent background',
    backgroundGradient: 'Use gradient background',
    backgroundFrom: 'Background from',
    backgroundTo: 'Background to',
  },
  corners: { squareStyle: 'Frame around corner dots style', dotsType: 'Corner dots type', squareColor: 'Corner square color', dotColor: 'Corner dots color' },
  sticker: { caption: 'Sticker frame', color: 'Sticker color', textColor: 'Text color' },
  logo: {
    upload: 'Upload logo',
    previewAlt: 'Logo preview',
    alt: 'Logo',
    size: 'Logo size',
    warn40: 'From 40% up the cleared area may exceed what scanners can read — 30% or smaller scans reliably.',
    remove: 'Remove logo',
    pickImage: 'Pick a PNG, JPEG, WEBP or SVG image.',
    readError: 'Could not read that file.',
  },
  download: { format: 'Format', size: 'Size', cta: 'Download QR', failed: 'Download failed.' },
  validation: {
    enterUrl: 'Enter a URL to generate your QR code.',
    invalidUrl: 'Enter a valid link, like example.com.',
    enterText: 'Enter some text to encode.',
    invalidEmail: 'Enter a valid e-mail address.',
    enterPhone: 'Enter a phone number.',
    tooLong: 'Content is too long for a QR code.',
    enterName: 'Add at least a first or last name.',
    enterSsid: 'Enter the network name.',
    enterPassword: 'Enter the network password.',
    enterTitle: 'Enter the event title.',
    enterStart: 'Pick the start time.',
    endBeforeStart: 'The end cannot be before the start.',
  },
};

const ru: Copy = {
  header: {
    brand: 'Генератор',
    nav: { howItWorks: 'Как это работает', features: 'Возможности', qrTypes: 'Типы QR', faq: 'Вопросы и ответы' },
    createCta: 'Создать QR-код',
  },
  footer: { tagline: 'Бесплатные QR-коды, которые не устаревают.', faq: 'Вопросы и ответы', contribute: 'Участвовать', guides: 'Гайды' },
  hero: {
    title: 'Без регистрации. Без оплаты. Просто заберите свой рабочий QR-код.',
    subtitle: 'Выберите тип, оформите, скачайте. Всё меньше чем за минуту.',
    createCta: 'Создать QR-код',
  },
  howItWorks: {
    title: 'Как это работает',
    steps: [
      { lead: 'Выберите содержимое.', rest: ' Ссылка, текст, черновик письма или номер телефона.' },
      { lead: 'Оформите код.', rest: ' Узоры, цвета, углы, рамка-стикер и ваш логотип.' },
      { lead: 'Скачайте.', rest: ' PNG, JPEG, SVG или WEBP — готово к печати и вставке.' },
    ],
  },
  features: {
    title: 'Почему этот генератор',
    items: [
      { title: 'Работает вечно', text: 'Статичный код несёт ваше содержимое внутри себя. Никакого сервиса-посредника, который может закрыться, и никаких перекодировок после печати.' },
      { title: 'Приватно по умолчанию', text: 'Всё — содержимое, оформление, логотип — обрабатывается в вашем браузере. Без аккаунтов, загрузок и слежки за сканированиями.' },
      { title: 'Экспорт для печати', text: 'PNG до 2048 px для экранов, SVG для чёткой печати любого размера. Есть и JPEG с WEBP.' },
      { title: 'Не только чёрно-белый', text: 'Узоры, градиенты, оформление углов, логотип и рамки-стикеры — такой код действительно хочется отсканировать.' },
    ],
  },
  useCases: {
    title: 'Где использовать',
    items: ['Визитки', 'Флаеры и постеры', 'Меню ресторанов', 'Упаковка товаров', 'Билеты на события', 'Витрины магазинов'],
  },
  qrTypes: {
    title: 'Бесплатные типы QR-кодов',
    items: [
      { title: 'Ссылка', text: 'Ведёт сканер на любую страницу.' },
      { title: 'Текст', text: 'Заметка, число или пароль от Wi-Fi.' },
      { title: 'Почта', text: 'Открывает готовый черновик письма.' },
      { title: 'Звонок', text: 'Набирает номер одним касанием.' },
    ],
    tryCta: 'Попробуйте в конструкторе →',
  },
  faq: {
    title: 'Вопросы и ответы',
    items: [
      { q: 'Что такое статичный QR-код?', a: 'Данные хранятся внутри самого кода. Он сканируется сразу и никогда не устаревает — но его нельзя изменить после печати или публикации.' },
      { q: 'Он не устареет?', a: 'Нет. За кодом не стоит никакой сервис: он работает, пока существует ваше содержимое.' },
      { q: 'Нужен ли аккаунт?', a: 'Нет. Нечего регистрировать, не за что платить, и ничего никуда не сохраняется.' },
      { q: 'Можно ли отслеживать сканирования?', a: 'Нет — для этого нужна динамичная (переадресующая) ссылка внутри кода, а этот сайт намеренно делает только статичные.' },
      { q: 'Каким маленьким можно его печатать?', a: 'Держите размер не меньше 2 × 2 см и оставьте тихую зону вокруг кода. Чем больше данных, тем плотнее код — короткие ссылки печатаются чище.' },
    ],
    contribute: {
      q: 'Как можно поучаствовать?',
      pre: 'Генератор открыт как open source: сообщайте об ошибках, предлагайте идеи или улучшайте код прямо на ',
      linkText: 'GitHub',
      post: '. Каждое улучшение помогает.',
    },
  },
  cta: {
    title: 'Готово меньше чем за минуту',
    subtitle: 'Оформите код, скачайте и используйте где угодно.',
    createCta: 'Создать QR-код',
  },
  content: {
    types: { link: 'Ссылка', text: 'Текст', email: 'Почта', call: 'Звонок', vcard: 'Контакт', wifi: 'Wi-Fi', event: 'Событие', sms: 'SMS', social: 'Соцсети', pdf: 'PDF', appstore: 'Приложение' },
    linkLabel: 'Введите адрес сайта',
    textLabel: 'Введите текст',
    to: 'Кому',
    subject: 'Тема',
    body: 'Текст письма',
    phoneLabel: 'Номер телефона',
    vcard: {
      firstName: 'Имя', lastName: 'Фамилия', org: 'Организация', title: 'Должность',
      phone: 'Телефон', email: 'Эл. почта', website: 'Сайт', address: 'Адрес',
    },
    wifi: {
      ssid: 'Имя сети (SSID)', password: 'Пароль', security: 'Защита',
      showPassword: 'WPA / WPA2 / WPA3', open: 'Без пароля', hidden: 'Скрытая сеть',
    },
    event: {
      title: 'Название события', start: 'Начало', end: 'Окончание', allDay: 'Весь день',
      location: 'Место', description: 'Описание',
    },
    sms: { phone: 'Номер телефона', message: 'Сообщение (необязательно)' },
    presetHelp: {
      social: 'Вставьте ссылку на свою страницу в соцсети или агрегатор.',
      pdf: 'Вставьте ссылку на PDF-файл в интернете.',
      appstore: 'Вставьте ссылку Google Play или App Store.',
    },
  },
  steps: { one: '1 · Заполните содержимое', two: '2 · Оформите QR-код', three: '3 · Просмотр и скачивание' },
  tabs: { sticker: 'Стикер', pattern: 'Узор', corners: 'Углы', logo: 'Логотип' },
  pattern: {
    caption: 'Узор QR-кода',
    colorLabel: 'Цвет узора',
    gradient: 'Градиентный узор',
    from: 'Градиент от',
    to: 'Градиент до',
    backgroundColor: 'Цвет фона',
    transparent: 'Прозрачный фон',
    backgroundGradient: 'Градиентный фон',
    backgroundFrom: 'Фон от',
    backgroundTo: 'Фон до',
  },
  corners: { squareStyle: 'Стиль угловых рамок', dotsType: 'Тип угловых точек', squareColor: 'Цвет угловых рамок', dotColor: 'Цвет угловых точек' },
  sticker: { caption: 'Рамка-стикер', color: 'Цвет стикера', textColor: 'Цвет текста' },
  logo: {
    upload: 'Загрузить логотип',
    previewAlt: 'Предпросмотр логотипа',
    alt: 'Логотип',
    size: 'Размер логотипа',
    warn40: 'От 40% очищенная область может превысить возможности сканеров — надёжно читается 30% и меньше.',
    remove: 'Удалить логотип',
    pickImage: 'Выберите изображение PNG, JPEG, WEBP или SVG.',
    readError: 'Не удалось прочитать файл.',
  },
  download: { format: 'Формат', size: 'Размер', cta: 'Скачать QR-код', failed: 'Не удалось скачать.' },
  validation: {
    enterUrl: 'Введите ссылку, чтобы создать QR-код.',
    invalidUrl: 'Введите корректную ссылку, например example.com.',
    enterText: 'Введите текст для кодирования.',
    invalidEmail: 'Введите корректный адрес почты.',
    enterPhone: 'Введите номер телефона.',
    tooLong: 'Содержимое слишком длинное для QR-кода.',
    enterName: 'Укажите хотя бы имя или фамилию.',
    enterSsid: 'Укажите имя сети.',
    enterPassword: 'Укажите пароль сети.',
    enterTitle: 'Укажите название события.',
    enterStart: 'Укажите время начала.',
    endBeforeStart: 'Окончание не может быть раньше начала.',
  },
};

export const COPY: Record<Locale, Copy> = { en, ru };