export type CountryCode = 
  | 'TJ' // Таджикистан
  | 'KZ' // Казахстан
  | 'RU' // Россия
  | 'KG' // Кыргызстан
  | 'UZ' // Узбекистан
  | 'BY' // Беларусь
  | 'AZ' // Азербайджан
  | 'AM' // Армения
  | 'MD' // Молдова
  | 'TM'; // Туркменистан

export interface CountryInfo {
  code: CountryCode;
  nameRu: string;
  nameNative: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  regions: string[];
}

export interface CityInfo {
  id: string;
  nameRu: string;
  nameNative: string;
  countryCode: CountryCode;
  region: string;
  isPopular?: boolean;
}

export type ListingType = 
  | 'offering_job'        // Предлагаю работу (вакансия)
  | 'looking_for_job'     // Ищу работу (резюме)
  | 'offering_service'    // Оказываю услуги (мастер / специалист)
  | 'looking_for_service' // Ищу мастера / исполнителя
  | 'taxi_driver'         // Такси: Водитель ищет пассажиров
  | 'taxi_passenger';     // Такси: Пассажир ищет поездку

export type MainSectionType = 'all' | 'vacancies' | 'masters' | 'resumes' | 'taxi' | 'services';

export type PaymentPeriod = 'month' | 'day' | 'hour' | 'project' | 'trip' | 'seat';

export interface TaxiDetails {
  fromCountry: CountryCode;
  fromCity: string;
  toCountry: CountryCode;
  toCity: string;
  departureDate: string;
  departureTime?: string;
  seatsAvailable?: number;    // for driver
  passengersCount?: number;   // for passenger
  pricePerSeat?: boolean;     // true: за пассажира, false: за весь салон/авто
  carModel?: string;          // e.g. "Toyota Camry", "Hyundai Starex"
  carType?: string;           // Седан, Минивэн, Внедорожник, Микроавтобус
  hasLuggageSpace?: boolean;
  luggageDetails?: string;    // e.g. "До 2 больших чемоданов"
  isFlexibleDate?: boolean;   // passenger can travel +- 1-2 days
  isIndividualRide?: boolean; // passenger needs individual car
  allowParcels?: boolean;     // водитель берет посылки / документы
}

export interface Listing {
  id: string;
  userId: string;
  authorName: string;
  authorPhone?: string;
  authorWhatsapp?: string;
  authorTelegram?: string;
  authorAvatar?: string;
  title: string;
  description: string;
  type: ListingType;
  categoryId: string;
  profession: string;
  countryCode: CountryCode;
  region: string;
  city: string;
  isNegotiable: boolean;
  price?: number;
  currency: string;
  period?: PaymentPeriod;
  images: string[];
  viewsCount: number;
  isActive: boolean;
  isHiddenByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  taxiDetails?: TaxiDetails;
}

export type UserRole = 'worker' | 'employer' | 'both';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  countryCode?: CountryCode;
  region?: string;
  city?: string;
  profession?: string;
  bio?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  targetUserId: string;
  listingId?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetListingId?: string;
  targetUserId?: string;
  targetTitle?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  listingId?: string;
  listingTitle?: string;
  text?: string;
  imageUrl?: string;
  contactShared?: {
    phone?: string;
    whatsapp?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface OwnerAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isWhatsapp: boolean;
  whatsappMessage?: string;
  placement: 'hero' | 'feed' | 'banner';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  clicksCount: number;
}

export interface AdminLog {
  id: string;
  adminEmail: string;
  actionType: string;
  targetType: string;
  targetId: string;
  reason?: string;
  createdAt: string;
}

export type SupportedLanguage = 'ru' | 'tg' | 'kk';
