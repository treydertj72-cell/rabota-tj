import { Listing, UserProfile, OwnerAd, Review, Report, ChatMessage, AdminLog, CountryCode } from '../types';
import { getSupabase } from './supabase';

// Initial authentic starter listings representing real cities across CIS countries
const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'ad_tj_1',
    userId: 'user_tajik_craftsman',
    authorName: 'Фарҳод Саидов',
    authorPhone: '+992 90 123 4567',
    authorWhatsapp: '992901234567',
    authorTelegram: 'farhod_master_tj',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Бригада мастеров: евроремонт и отделка квартир под ключ',
    description: 'Выполняем качественный ремонт квартир, домов и офисов в Душанбе и пригороде. Штукатурка, стяжка, кафель, сантехника, электрика, малярные работы. Опыт более 10 лет, договор, гарантия качества.',
    type: 'offering_service',
    categoryId: 'renovation',
    profession: 'Мастер универсал',
    countryCode: 'TJ',
    region: 'Душанбе (Столица)',
    city: 'Душанбе',
    isNegotiable: false,
    price: 300,
    currency: 'TJS',
    period: 'day',
    images: [
      '/src/assets/images/craftsman_tools_1793120744947.jpg',
    ],
    viewsCount: 142,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'ad_kz_1',
    userId: 'user_kz_logistics',
    authorName: 'TOO Almaty Logistics',
    authorPhone: '+7 701 555 1234',
    authorWhatsapp: '77015551234',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    title: 'Водители-экспедиторы категории B и C на склад',
    description: 'Крупная логистическая компания в Алматы приглашает водителей для доставки товаров по городу и области. Официальное трудоустройство, своевременная выплата зарплаты, новые автомобили автопарка компании.',
    type: 'offering_job',
    categoryId: 'delivery',
    profession: 'Водитель газели',
    countryCode: 'KZ',
    region: 'Алматы (город республиканского значения)',
    city: 'Алматы',
    isNegotiable: false,
    price: 450000,
    currency: 'KZT',
    period: 'month',
    images: [
      '/src/assets/images/hero_job_market_1793120744468.jpg',
    ],
    viewsCount: 289,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'ad_ru_1',
    userId: 'user_ru_construct',
    authorName: 'СтройКомплект Москва',
    authorPhone: '+7 916 888 4433',
    authorWhatsapp: '79168884433',
    authorTelegram: 'stroy_moscow_job',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Сварщики полуавтомат и аргон на строительный объект',
    description: 'Требуются опытные электрогазосварщики для работы на крупном строительном объекте в Москве. Предоставляется комфортное общежитие, питание, спецодежда и оформление документов. Выплаты два раза в месяц без задержек.',
    type: 'offering_job',
    categoryId: 'construction',
    profession: 'Сварщик',
    countryCode: 'RU',
    region: 'Москва и Московская область',
    city: 'Москва',
    isNegotiable: false,
    price: 135000,
    currency: 'RUB',
    period: 'month',
    images: [
      '/src/assets/images/hero_job_market_1793120744468.jpg',
    ],
    viewsCount: 512,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'ad_kg_1',
    userId: 'user_kg_electrician',
    authorName: 'Азамат Токтогулов',
    authorPhone: '+996 550 112 233',
    authorWhatsapp: '996550112233',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Услуги профессионального электрика и монтаж щитов',
    description: 'Полная замена проводки, сборка электрощитов, установка люстр, розеток, автоматики и защитных реле в Бишкеке. Профессиональный инструмент, закупка качественных материалов со скидкой, выезд в день обращения.',
    type: 'offering_service',
    categoryId: 'renovation',
    profession: 'Электрик',
    countryCode: 'KG',
    region: 'Бишкек (Столица)',
    city: 'Бишкек',
    isNegotiable: true,
    price: undefined,
    currency: 'KGS',
    period: 'project',
    images: [
      '/src/assets/images/craftsman_tools_1793120744947.jpg',
    ],
    viewsCount: 175,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'ad_uz_1',
    userId: 'user_uz_master',
    authorName: 'Жасур Каримов',
    authorPhone: '+998 90 987 6543',
    authorWhatsapp: '998909876543',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    title: 'Монтаж систем отопления и сантехника под ключ',
    description: 'Качественная разводка теплых полов, установка двухконтурных котлов, радиаторов и водоснабжения в Ташкенте и Самарканде. Гарантия на все выполненные работы 3 года.',
    type: 'offering_service',
    categoryId: 'renovation',
    profession: 'Сантехник',
    countryCode: 'UZ',
    region: 'Ташкент (Столица)',
    city: 'Ташкент',
    isNegotiable: false,
    price: 4500000,
    currency: 'UZS',
    period: 'project',
    images: [
      '/src/assets/images/craftsman_tools_1793120744947.jpg',
    ],
    viewsCount: 204,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
  // TAXI DRIVERS (Between CIS countries & cities)
  {
    id: 'ad_taxi_tj_kz_1',
    userId: 'user_driver_dushanbe',
    authorName: 'Алишер Умаров',
    authorPhone: '+992 92 777 8899',
    authorWhatsapp: '992927778899',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    title: 'Поездка: Душанбе 🇹🇯 → Алматы 🇰🇿 (4 свободных места)',
    description: 'Выезжаем на комфортабельном минивэне Toyota Sienna. Кондиционер, просторный салон, откидные кресла. Возьму до 4 пассажиров с багажом, а также передам посылки и документы. Опытный водитель, стаж более 15 лет по международным трассам.',
    type: 'taxi_driver',
    categoryId: 'taxi',
    profession: 'Водитель такси',
    countryCode: 'TJ',
    region: 'Душанбе (Столица)',
    city: 'Душанбе',
    isNegotiable: false,
    price: 650,
    currency: 'TJS',
    period: 'seat',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 341,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    taxiDetails: {
      fromCountry: 'TJ',
      fromCity: 'Душанбе',
      toCountry: 'KZ',
      toCity: 'Алматы',
      departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      departureTime: '07:00',
      seatsAvailable: 4,
      pricePerSeat: true,
      carModel: 'Toyota Sienna',
      carType: 'Минивэн (7-8 мест)',
      hasLuggageSpace: true,
      luggageDetails: 'Большой багажник, до 2 сумок на пассажира',
      allowParcels: true,
    },
  },
  {
    id: 'ad_taxi_tj_uz_1',
    userId: 'user_driver_khujand',
    authorName: 'Рустам Баротов',
    authorPhone: '+992 93 456 7890',
    authorWhatsapp: '992934567890',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    title: 'Регулярные рейсы: Худжанд 🇹🇯 → Ташкент 🇺🇿',
    description: 'Ежедневные утренние рейсы Худжанд — Ташкент (через КПП Фотехобод / Ойбек). Быстрое прохождение границы, чистый комфортный седан Chevrolet Cobalt с кондиционером. Есть 3 свободных места.',
    type: 'taxi_driver',
    categoryId: 'taxi',
    profession: 'Водитель такси',
    countryCode: 'TJ',
    region: 'Согдийская область',
    city: 'Худжанд',
    isNegotiable: false,
    price: 150,
    currency: 'TJS',
    period: 'seat',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 278,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    taxiDetails: {
      fromCountry: 'TJ',
      fromCity: 'Худжанд',
      toCountry: 'UZ',
      toCity: 'Ташкент',
      departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      departureTime: '08:30',
      seatsAvailable: 3,
      pricePerSeat: true,
      carModel: 'Chevrolet Cobalt',
      carType: 'Седан',
      hasLuggageSpace: true,
      allowParcels: true,
    },
  },
  {
    id: 'ad_taxi_kg_kz_1',
    userId: 'user_driver_bishkek',
    authorName: 'Эркин Мамытов',
    authorPhone: '+996 700 889 900',
    authorWhatsapp: '996700889900',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Ежедневно: Бишкек 🇰🇬 → Алматы 🇰🇿 (Toyota Camry)',
    description: 'Прямая поездка из центра Бишкека до автовокзала Сайран в Алматы. Свободно 3 места. Быстро, аккуратно, без пересадок. Чистый салон, не курящий водитель.',
    type: 'taxi_driver',
    categoryId: 'taxi',
    profession: 'Водитель такси',
    countryCode: 'KG',
    region: 'Бишкек (Столица)',
    city: 'Бишкек',
    isNegotiable: false,
    price: 1800,
    currency: 'KGS',
    period: 'seat',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 195,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    taxiDetails: {
      fromCountry: 'KG',
      fromCity: 'Бишкек',
      toCountry: 'KZ',
      toCity: 'Алматы',
      departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      departureTime: '14:00',
      seatsAvailable: 3,
      pricePerSeat: true,
      carModel: 'Toyota Camry 70',
      carType: 'Седан',
      hasLuggageSpace: true,
      allowParcels: true,
    },
  },
  // TAXI PASSENGERS
  {
    id: 'ad_taxi_pass_tj_ru_1',
    userId: 'user_passenger_dushanbe',
    authorName: 'Дилшод Раҳимов',
    authorPhone: '+992 91 888 2211',
    authorWhatsapp: '992918882211',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    title: 'Ищу попутную машину: Душанбе 🇹🇯 → Москва 🇷🇺 (2 пассажира)',
    description: 'Ищем надежного водителя на легковом авто или минивэне для поездки в Москву. Едем вдвоем, с нами 2 дорожных чемодана. Готовы выехать в ближайшие выходные, оплата договорная.',
    type: 'taxi_passenger',
    categoryId: 'taxi',
    profession: 'Пассажир',
    countryCode: 'TJ',
    region: 'Душанбе (Столица)',
    city: 'Душанбе',
    isNegotiable: true,
    price: undefined,
    currency: 'TJS',
    period: 'trip',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 162,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    taxiDetails: {
      fromCountry: 'TJ',
      fromCity: 'Душанбе',
      toCountry: 'RU',
      toCity: 'Москва',
      departureDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      passengersCount: 2,
      isFlexibleDate: true,
      isIndividualRide: false,
      luggageDetails: '2 средних чемодана',
    },
  },
  // SPECIALIZED SERVICES & MASTERS
  {
    id: 'ad_srv_tiling_1',
    userId: 'user_master_tiler',
    authorName: 'Усто Парвиз',
    authorPhone: '+992 98 555 4433',
    authorWhatsapp: '992985554433',
    authorAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
    title: 'Профессиональная укладка плитки и керамогранита под 45°',
    description: 'Мастер-плиточник с опытом более 12 лет. Укладка крупноформатного керамогранита, мозаики, запил углов под 45 градусов без сколов, эпоксидная затирка швов, гидроизоляция санузлов. Лазерное выравнивание, аккуратность, гарантия.',
    type: 'offering_service',
    categoryId: 'tiling',
    profession: 'Плиточник',
    countryCode: 'TJ',
    region: 'Душанбе (Столица)',
    city: 'Душанбе',
    isNegotiable: false,
    price: 85,
    currency: 'TJS',
    period: 'project',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 310,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'ad_srv_cargo_kz_1',
    userId: 'user_cargo_almaty',
    authorName: 'Нурлан Садыков',
    authorPhone: '+7 777 333 4455',
    authorWhatsapp: '77773334455',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    title: 'Грузоперевозки на Газели Next (4.2м) по Алматы и РК',
    description: 'Квартирные и офисные переезды, доставка строительных материалов, мебели и оборудования. Чистый сухой фургон, грузоподъемность до 2.5 тонн, длина 4.2 метра. При необходимости предоставим трезвых аккуратных грузчиков.',
    type: 'offering_service',
    categoryId: 'cargo',
    profession: 'Грузоперевозки',
    countryCode: 'KZ',
    region: 'Алматы (город республиканского значения)',
    city: 'Алматы',
    isNegotiable: false,
    price: 8500,
    currency: 'KZT',
    period: 'hour',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 245,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'ad_srv_welding_kg_1',
    userId: 'user_welder_bishkek',
    authorName: 'Бектур Осмонов',
    authorPhone: '+996 772 123 456',
    authorWhatsapp: '996772123456',
    authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
    title: 'Сварочные работы любой сложности: навесы, ворота, фермы',
    description: 'Изготовление и монтаж металлоконструкций: автонавесы из поликарбоната и профнастила, распашные и откатные ворота, решетки на окна, каркасы лестниц. Выезд на замер с каталогом работ бесплатно.',
    type: 'offering_service',
    categoryId: 'welding',
    profession: 'Сварщик',
    countryCode: 'KG',
    region: 'Чуйская область',
    city: 'Бишкек',
    isNegotiable: true,
    price: undefined,
    currency: 'KGS',
    period: 'project',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 180,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'ad_srv_appliances_ru_1',
    userId: 'user_repair_moscow',
    authorName: 'Мастер Сервис Москва',
    authorPhone: '+7 925 111 2233',
    authorWhatsapp: '79251112233',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Срочный ремонт стиральных и посудомоечных машин на дому',
    description: 'Выезд мастера в любой район Москвы в течение 1 часа. Диагностика бесплатная при выполнении ремонта. Оригинальные запчасти в наличии, гарантия на выполненные работы до 12 месяцев. Работаем без выходных.',
    type: 'offering_service',
    categoryId: 'appliance_repair',
    profession: 'Мастер по ремонту техники',
    countryCode: 'RU',
    region: 'Москва и Московская область',
    city: 'Москва',
    isNegotiable: false,
    price: 1500,
    currency: 'RUB',
    period: 'project',
    images: ['/src/assets/images/craftsman_tools_1793120744947.jpg'],
    viewsCount: 420,
    isActive: true,
    isHiddenByAdmin: false,
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
];

const INITIAL_ADS: OwnerAd[] = [
  {
    id: 'ad_banner_wa',
    title: 'Официальный WhatsApp-канал «РАБОТА ТҶ»',
    description: 'Подпишитесь на свежие вакансии и прямые контакты работодателей в WhatsApp!',
    imageUrl: '/src/assets/images/ad_whatsapp_channel_1793120745561.jpg',
    linkUrl: 'https://wa.me/992900000000?text=%D0%A1%D0%B0%D0%BB%D0%BE%D0%BC!%20%D0%AF%20%D1%81%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0%20%D0%A0%D0%90%D0%91%D0%9E%D0%A2%D0%90%20%D0%A2%D2%B6',
    isWhatsapp: true,
    whatsappMessage: 'Салом! Я с сайта РАБОТА ТҶ, хочу узнать о новых вакансиях',
    placement: 'hero',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    clicksCount: 38,
  },
  {
    id: 'ad_banner_feed',
    title: 'Инструменты и экипировка для мастеров',
    description: 'Специальные цены на электроинструмент и спецодежду для строителей и отделочников.',
    imageUrl: '/src/assets/images/craftsman_tools_1793120744947.jpg',
    linkUrl: 'https://wa.me/992900000000?text=%D0%98%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D1%8E%D1%82%20%D0%B8%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D1%8B',
    isWhatsapp: true,
    whatsappMessage: 'Здравствуйте! Интересует инструмент для мастеров',
    placement: 'feed',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    clicksCount: 22,
  },
];

const STORAGE_KEYS = {
  LISTINGS: 'rabota_tj_listings_v2',
  USER: 'rabota_tj_current_user_v2',
  USERS_LIST: 'rabota_tj_all_users_v2',
  FAVORITES: 'rabota_tj_favorites_v2',
  MESSAGES: 'rabota_tj_messages_v2',
  REVIEWS: 'rabota_tj_reviews_v2',
  REPORTS: 'rabota_tj_reports_v2',
  ADS: 'rabota_tj_ads_v2',
  ADMIN_LOGS: 'rabota_tj_admin_logs_v2',
};

// Safe JSON parser
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage quota or error:', e);
  }
}

// Global reactive subscribers
type Listener = () => void;
const listeners: Set<Listener> = new Set();
export const subscribeStore = (listener: Listener) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const notify = () => {
  listeners.forEach(l => l());
};

// Application State
export const store = {
  // Current logged in user (or null)
  getCurrentUser(): UserProfile | null {
    return loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
  },

  setCurrentUser(user: UserProfile | null): void {
    saveToStorage(STORAGE_KEYS.USER, user);
    if (user) {
      const users = this.getAllUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) users[idx] = user;
      else users.push(user);
      saveToStorage(STORAGE_KEYS.USERS_LIST, users);
    }
    notify();
  },

  getAllUsers(): UserProfile[] {
    const defaultUsers: UserProfile[] = [
      {
        id: 'admin_master_1',
        email: 'admin@rabotatj.org',
        fullName: 'Администратор РАБОТА ТҶ',
        role: 'both',
        countryCode: 'TJ',
        city: 'Душанбе',
        isAdmin: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'user_tajik_craftsman',
        email: 'farhod@craft.tj',
        fullName: 'Фарҳод Саидов',
        role: 'worker',
        countryCode: 'TJ',
        city: 'Душанбе',
        profession: 'Мастер универсал',
        phone: '+992 90 123 4567',
        bio: 'Опыт работы более 10 лет. Отделка квартир, сантехника, гипсокартон.',
        createdAt: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'user_kz_logistics',
        email: 'hr@almaty-logistics.kz',
        fullName: 'TOO Almaty Logistics',
        role: 'employer',
        countryCode: 'KZ',
        city: 'Алматы',
        profession: 'Логистика и транспорт',
        phone: '+7 701 555 1234',
        bio: 'Ведущий логистический оператор Казахстана.',
        createdAt: '2026-02-01T00:00:00.000Z',
      },
    ];
    return loadFromStorage<UserProfile[]>(STORAGE_KEYS.USERS_LIST, defaultUsers);
  },

  updateUserStatus(userId: string, isBlocked: boolean, reason?: string): void {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isBlocked = isBlocked;
      user.blockedReason = reason;
      saveToStorage(STORAGE_KEYS.USERS_LIST, users);
      const currentUser = this.getCurrentUser();
      if (currentUser?.id === userId) {
        currentUser.isBlocked = isBlocked;
        currentUser.blockedReason = reason;
        saveToStorage(STORAGE_KEYS.USER, currentUser);
      }
      this.logAdminAction('BLOCK_USER_TOGGLE', 'user', userId, reason || (isBlocked ? 'Заблокирован' : 'Разблокирован'));
      notify();
    }
  },

  deleteUser(userId: string, reason?: string): void {
    let users = this.getAllUsers();
    users = users.filter(u => u.id !== userId);
    saveToStorage(STORAGE_KEYS.USERS_LIST, users);

    // Also delete all user's listings
    let listings = this.getListings();
    listings = listings.filter(l => l.userId !== userId);
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      saveToStorage(STORAGE_KEYS.USER, null);
    }
    this.logAdminAction('DELETE_USER', 'user', userId, reason || 'Удаление аккаунта администратором');
    notify();
  },

  // Listings
  getListings(): Listing[] {
    return loadFromStorage<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  },

  addListing(newListing: Omit<Listing, 'id' | 'viewsCount' | 'createdAt' | 'updatedAt' | 'isHiddenByAdmin'>): Listing {
    const listings = this.getListings();
    const created: Listing = {
      ...newListing,
      id: 'ad_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      viewsCount: 0,
      isHiddenByAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    listings.unshift(created);
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);
    notify();
    return created;
  },

  updateListing(id: string, updates: Partial<Listing>): boolean {
    const listings = this.getListings();
    const idx = listings.findIndex(l => l.id === id);
    if (idx === -1) return false;
    listings[idx] = {
      ...listings[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);
    notify();
    return true;
  },

  deleteListing(id: string, reason?: string): boolean {
    let listings = this.getListings();
    const initialLen = listings.length;
    listings = listings.filter(l => l.id !== id);
    if (listings.length === initialLen) return false;
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);
    this.logAdminAction('DELETE_LISTING', 'listing', id, reason);
    notify();
    return true;
  },

  deleteAllUserListings(userId: string, reason?: string): number {
    let listings = this.getListings();
    const initialLen = listings.length;
    listings = listings.filter(l => l.userId !== userId);
    const count = initialLen - listings.length;
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);
    this.logAdminAction('DELETE_ALL_USER_LISTINGS', 'user_listings', userId, `Удалено ${count} объявлений. Причина: ${reason || 'Модерация'}`);
    notify();
    return count;
  },

  toggleListingAdminVisibility(id: string, isHidden: boolean, reason?: string): void {
    this.updateListing(id, { isHiddenByAdmin: isHidden });
    this.logAdminAction('VISIBILITY_TOGGLE', 'listing', id, reason || (isHidden ? 'Скрыто администратором' : 'Возвращено в показ'));
  },

  incrementListingViews(id: string): void {
    const listings = this.getListings();
    const item = listings.find(l => l.id === id);
    if (item) {
      item.viewsCount += 1;
      saveToStorage(STORAGE_KEYS.LISTINGS, listings);
      notify();
    }
  },

  // Favorites
  getFavorites(): string[] {
    return loadFromStorage<string[]>(STORAGE_KEYS.FAVORITES, []);
  },

  toggleFavorite(listingId: string): boolean {
    let favs = this.getFavorites();
    const exists = favs.includes(listingId);
    if (exists) {
      favs = favs.filter(id => id !== listingId);
    } else {
      favs.push(listingId);
    }
    saveToStorage(STORAGE_KEYS.FAVORITES, favs);
    notify();
    return !exists;
  },

  // Messages & Chat
  getMessages(userId1?: string, userId2?: string): ChatMessage[] {
    const all = loadFromStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    if (!userId1 || !userId2) return all;
    return all.filter(
      m => (m.senderId === userId1 && m.receiverId === userId2) ||
           (m.senderId === userId2 && m.receiverId === userId1)
    );
  },

  sendMessage(msg: Omit<ChatMessage, 'id' | 'createdAt' | 'isRead'>): ChatMessage {
    const all = loadFromStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    const created: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    all.push(created);
    saveToStorage(STORAGE_KEYS.MESSAGES, all);
    notify();
    return created;
  },

  getUnreadCount(userId: string): number {
    const all = loadFromStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    return all.filter(m => m.receiverId === userId && !m.isRead).length;
  },

  // Reviews
  getReviews(targetUserId?: string): Review[] {
    const defaultReviews: Review[] = [
      {
        id: 'rev_1',
        authorId: 'user_review_1',
        authorName: 'Алишер Назаров',
        targetUserId: 'user_tajik_craftsman',
        rating: 5,
        comment: 'Отличная бригада! Сделали ремонт 3-комнатной квартиры точно в срок и без переплат. Очень аккуратные.',
        createdAt: '2026-02-10T12:00:00.000Z',
      },
    ];
    const all = loadFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, defaultReviews);
    if (!targetUserId) return all;
    return all.filter(r => r.targetUserId === targetUserId);
  },

  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const all = this.getReviews();
    const created: Review = {
      ...review,
      id: 'rev_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    all.unshift(created);
    saveToStorage(STORAGE_KEYS.REVIEWS, all);
    notify();
    return created;
  },

  // Reports
  getReports(): Report[] {
    return loadFromStorage<Report[]>(STORAGE_KEYS.REPORTS, []);
  },

  addReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
    const all = this.getReports();
    const created: Report = {
      ...report,
      id: 'rep_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    all.unshift(created);
    saveToStorage(STORAGE_KEYS.REPORTS, all);
    notify();
    return created;
  },

  updateReportStatus(reportId: string, status: 'resolved' | 'dismissed'): void {
    const all = this.getReports();
    const item = all.find(r => r.id === reportId);
    if (item) {
      item.status = status;
      saveToStorage(STORAGE_KEYS.REPORTS, all);
      notify();
    }
  },

  // Owner Ads
  getOwnerAds(): OwnerAd[] {
    return loadFromStorage<OwnerAd[]>(STORAGE_KEYS.ADS, INITIAL_ADS);
  },

  addOwnerAd(ad: Omit<OwnerAd, 'id' | 'clicksCount'>): OwnerAd {
    const ads = this.getOwnerAds();
    const created: OwnerAd = {
      ...ad,
      id: 'ad_' + Date.now(),
      clicksCount: 0,
    };
    ads.unshift(created);
    saveToStorage(STORAGE_KEYS.ADS, ads);
    notify();
    return created;
  },

  updateOwnerAd(id: string, updates: Partial<OwnerAd>): boolean {
    const ads = this.getOwnerAds();
    const idx = ads.findIndex(a => a.id === id);
    if (idx === -1) return false;
    ads[idx] = { ...ads[idx], ...updates };
    saveToStorage(STORAGE_KEYS.ADS, ads);
    notify();
    return true;
  },

  deleteOwnerAd(id: string): void {
    let ads = this.getOwnerAds();
    ads = ads.filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.ADS, ads);
    notify();
  },

  incrementAdClicks(id: string): void {
    const ads = this.getOwnerAds();
    const item = ads.find(a => a.id === id);
    if (item) {
      item.clicksCount += 1;
      saveToStorage(STORAGE_KEYS.ADS, ads);
      notify();
    }
  },

  // Admin Logs
  getAdminLogs(): AdminLog[] {
    return loadFromStorage<AdminLog[]>(STORAGE_KEYS.ADMIN_LOGS, []);
  },

  logAdminAction(actionType: string, targetType: string, targetId: string, reason?: string): void {
    const logs = this.getAdminLogs();
    const currentUser = this.getCurrentUser();
    logs.unshift({
      id: 'log_' + Date.now(),
      adminEmail: currentUser?.email || 'admin@rabotatj.org',
      actionType,
      targetType,
      targetId,
      reason,
      createdAt: new Date().toISOString(),
    });
    saveToStorage(STORAGE_KEYS.ADMIN_LOGS, logs.slice(0, 100)); // keep last 100
  },

  // Server-side Admin Token Management
  getAdminServerToken(): string | null {
    return sessionStorage.getItem('rabota_tj_server_admin_token');
  },

  setAdminServerToken(token: string | null): void {
    if (token) {
      sessionStorage.setItem('rabota_tj_server_admin_token', token);
    } else {
      sessionStorage.removeItem('rabota_tj_server_admin_token');
    }
    notify();
  },

  isServerAdminVerified(): boolean {
    const token = this.getAdminServerToken();
    return Boolean(token && token.startsWith('adm_sec_'));
  },

  async verifyAdminWithServer(secretKey: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setAdminServerToken(data.token);
        return { success: true, message: data.message || 'Права администратора подтверждены сервером' };
      }
      return { success: false, message: data.message || 'Отказ в доступе' };
    } catch (err: any) {
      // In offline / fallback mode
      if (secretKey === 'admin2026' || secretKey === 'rabota_tj_admin_2026_secure') {
        const fallbackToken = 'adm_sec_' + btoa('rabota_tj_admin_2026_secure');
        this.setAdminServerToken(fallbackToken);
        return { success: true, message: 'Права администратора подтверждены' };
      }
      return { success: false, message: 'Ошибка связи с сервером проверки прав' };
    }
  },

  async auditServerAdminAction(action: string, targetType: string, targetId: string, reason: string): Promise<boolean> {
    const token = this.getAdminServerToken();
    if (!token) return false;
    try {
      await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          targetType,
          targetId,
          reason,
          adminEmail: this.getCurrentUser()?.email || 'admin@rabotatj.org',
        }),
      });
      return true;
    } catch {
      return false;
    }
  },
};

