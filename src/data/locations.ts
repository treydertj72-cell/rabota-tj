import { CountryCode, CountryInfo, CityInfo } from '../types';

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  TJ: {
    code: 'TJ',
    nameRu: 'Таджикистан',
    nameNative: 'Тоҷикистон',
    flag: '🇹🇯',
    currency: 'TJS',
    currencySymbol: 'TJS',
    phonePrefix: '+992',
    regions: [
      'Душанбе (Столица)',
      'Согдийская область',
      'Хатлонская область',
      'РРП (Районы республиканского подчинения)',
      'ГБАО (Горно-Бадахшанская АО)',
    ],
  },
  KZ: {
    code: 'KZ',
    nameRu: 'Казахстан',
    nameNative: 'Қазақстан',
    flag: '🇰🇿',
    currency: 'KZT',
    currencySymbol: '₸',
    phonePrefix: '+7',
    regions: [
      'Алматы (город республиканского значения)',
      'Астана (Столица)',
      'Шымкент (город республиканского значения)',
      'Карагандинская область',
      'Актюбинская область',
      'Атырауская область',
      'Мангистауская область',
      'Восточно-Казахстанская область',
      'Павлодарская область',
      'Костанайская область',
      'Жамбылская область',
      'Кызылординская область',
      'Западно-Казахстанская область',
    ],
  },
  RU: {
    code: 'RU',
    nameRu: 'Россия',
    nameNative: 'Россия',
    flag: '🇷🇺',
    currency: 'RUB',
    currencySymbol: '₽',
    phonePrefix: '+7',
    regions: [
      'Москва и Московская область',
      'Санкт-Петербург и Ленинградская область',
      'Новосибирская область',
      'Свердловская область',
      'Республика Татарстан',
      'Нижегородская область',
      'Самарская область',
      'Краснодарский край',
      'Красноярский край',
      'Тюменская область',
      'Челябинская область',
      'Республика Башкортостан',
      'Ростовская область',
      'Приморский край',
    ],
  },
  KG: {
    code: 'KG',
    nameRu: 'Кыргызстан',
    nameNative: 'Кыргызстан',
    flag: '🇰🇬',
    currency: 'KGS',
    currencySymbol: 'сом',
    phonePrefix: '+996',
    regions: [
      'Бишкек (Столица)',
      'Ошская область',
      'Чуйская область',
      'Джалал-Абадская область',
      'Иссык-Кульская область',
      'Нарынская область',
      'Таласская область',
      'Баткенская область',
    ],
  },
  UZ: {
    code: 'UZ',
    nameRu: 'Узбекистан',
    nameNative: 'Oʻzbekiston',
    flag: '🇺🇿',
    currency: 'UZS',
    currencySymbol: 'сум',
    phonePrefix: '+998',
    regions: [
      'Ташкент (Столица)',
      'Самаркандская область',
      'Бухарская область',
      'Ферганская область',
      'Андижанская область',
      'Наманганская область',
      'Ташкентская область',
      'Кашкадарьинская область',
      'Хорезмская область',
      'Республика Каракалпакстан',
    ],
  },
  BY: {
    code: 'BY',
    nameRu: 'Беларусь',
    nameNative: 'Беларусь',
    flag: '🇧🇾',
    currency: 'BYN',
    currencySymbol: 'Br',
    phonePrefix: '+375',
    regions: [
      'Минск (Столица)',
      'Минская область',
      'Брестская область',
      'Гродненская область',
      'Гомельская область',
      'Витебская область',
      'Могилевская область',
    ],
  },
  AZ: {
    code: 'AZ',
    nameRu: 'Азербайджан',
    nameNative: 'Azərbaycan',
    flag: '🇦🇿',
    currency: 'AZN',
    currencySymbol: '₼',
    phonePrefix: '+994',
    regions: [
      'Баку (Столица)',
      'Апшеронский экономический район',
      'Гянджа-Дашкесанский район',
      'Ленкоранский район',
      'Шеки-Загатальский район',
      'Нахчыванская АР',
    ],
  },
  AM: {
    code: 'AM',
    nameRu: 'Армения',
    nameNative: 'Հայաստան',
    flag: '🇦🇲',
    currency: 'AMD',
    currencySymbol: '֏',
    phonePrefix: '+374',
    regions: [
      'Ереван (Столица)',
      'Котайкская область',
      'Ширакская область',
      'Лори',
      'Араратская область',
      'Армавирская область',
      'Сюникская область',
    ],
  },
  MD: {
    code: 'MD',
    nameRu: 'Молдова',
    nameNative: 'Moldova',
    flag: '🇲🇩',
    currency: 'MDL',
    currencySymbol: 'L',
    phonePrefix: '+373',
    regions: [
      'Кишинёв (Муниципий)',
      'Бельцы (Муниципий)',
      'Северный регион',
      'Центральный регион',
      'Южный регион',
      'Гагаузия (АТО)',
    ],
  },
  TM: {
    code: 'TM',
    nameRu: 'Туркменистан',
    nameNative: 'Türkmenistan',
    flag: '🇹🇲',
    currency: 'TMT',
    currencySymbol: 'TMT',
    phonePrefix: '+993',
    regions: [
      'Ашхабад (Столица)',
      'Ахалский велаят',
      'Балканский велаят',
      'Дашогузский велаят',
      'Лебапский велаят',
      'Марыйский велаят',
    ],
  },
};

export const CITIES: CityInfo[] = [
  // --- Таджикистан ---
  { id: 'tj_dushanbe', nameRu: 'Душанбе', nameNative: 'Душанбе', countryCode: 'TJ', region: 'Душанбе (Столица)', isPopular: true },
  { id: 'tj_khujand', nameRu: 'Худжанд', nameNative: 'Хуҷанд', countryCode: 'TJ', region: 'Согдийская область', isPopular: true },
  { id: 'tj_bokhtar', nameRu: 'Бохтар (Курган-Тюбе)', nameNative: 'Бохтар', countryCode: 'TJ', region: 'Хатлонская область', isPopular: true },
  { id: 'tj_kulob', nameRu: 'Куляб', nameNative: 'Кӯлоб', countryCode: 'TJ', region: 'Хатлонская область', isPopular: true },
  { id: 'tj_istaravshan', nameRu: 'Истаравшан', nameNative: 'Истаравшан', countryCode: 'TJ', region: 'Согдийская область' },
  { id: 'tj_tursunzade', nameRu: 'Турсунзаде', nameNative: 'Турсунзода', countryCode: 'TJ', region: 'РРП (Районы республиканского подчинения)' },
  { id: 'tj_panjakent', nameRu: 'Пенджикент', nameNative: 'Панҷакент', countryCode: 'TJ', region: 'Согдийская область' },
  { id: 'tj_khorog', nameRu: 'Хорог', nameNative: 'Хоруғ', countryCode: 'TJ', region: 'ГБАО (Горно-Бадахшанская АО)' },
  { id: 'tj_isfara', nameRu: 'Исфара', nameNative: 'Исфара', countryCode: 'TJ', region: 'Согдийская область' },
  { id: 'tj_vahdat', nameRu: 'Вахдат', nameNative: 'Ваҳдат', countryCode: 'TJ', region: 'РРП (Районы республиканского подчинения)' },
  { id: 'tj_hissar', nameRu: 'Гиссар', nameNative: 'Ҳисор', countryCode: 'TJ', region: 'РРП (Районы республиканского подчинения)' },
  { id: 'tj_yavan', nameRu: 'Яван', nameNative: 'Ёвон', countryCode: 'TJ', region: 'Хатлонская область' },
  { id: 'tj_konibodom', nameRu: 'Канибадам', nameNative: 'Конибодом', countryCode: 'TJ', region: 'Согдийская область' },
  { id: 'tj_buston', nameRu: 'Бустон (Чкаловск)', nameNative: 'Бӯстон', countryCode: 'TJ', region: 'Согдийская область' },

  // --- Казахстан ---
  { id: 'kz_almaty', nameRu: 'Алматы', nameNative: 'Алматы', countryCode: 'KZ', region: 'Алматы (город республиканского значения)', isPopular: true },
  { id: 'kz_astana', nameRu: 'Астана', nameNative: 'Астана', countryCode: 'KZ', region: 'Астана (Столица)', isPopular: true },
  { id: 'kz_shymkent', nameRu: 'Шымкент', nameNative: 'Шымкент', countryCode: 'KZ', region: 'Шымкент (город республиканского значения)', isPopular: true },
  { id: 'kz_karaganda', nameRu: 'Караганда', nameNative: 'Қарағанды', countryCode: 'KZ', region: 'Карагандинская область', isPopular: true },
  { id: 'kz_aktobe', nameRu: 'Актобе', nameNative: 'Ақтөбе', countryCode: 'KZ', region: 'Актюбинская область' },
  { id: 'kz_taraz', nameRu: 'Тараз', nameNative: 'Тараз', countryCode: 'KZ', region: 'Жамбылская область' },
  { id: 'kz_pavlodar', nameRu: 'Павлодар', nameNative: 'Павлодар', countryCode: 'KZ', region: 'Павлодарская область' },
  { id: 'kz_oskemen', nameRu: 'Усть-Каменогорск', nameNative: 'Өскемен', countryCode: 'KZ', region: 'Восточно-Казахстанская область' },
  { id: 'kz_semey', nameRu: 'Семей', nameNative: 'Семей', countryCode: 'KZ', region: 'Восточно-Казахстанская область' },
  { id: 'kz_atyrau', nameRu: 'Атырау', nameNative: 'Атырау', countryCode: 'KZ', region: 'Атырауская область' },
  { id: 'kz_kostanay', nameRu: 'Костанай', nameNative: 'Қостанай', countryCode: 'KZ', region: 'Костанайская область' },
  { id: 'kz_kyzylorda', nameRu: 'Кызылорда', nameNative: 'Қызылорда', countryCode: 'KZ', region: 'Кызылординская область' },
  { id: 'kz_uralsk', nameRu: 'Уральск', nameNative: 'Орал', countryCode: 'KZ', region: 'Западно-Казахстанская область' },
  { id: 'kz_aktau', nameRu: 'Актау', nameNative: 'Ақтау', countryCode: 'KZ', region: 'Мангистауская область' },

  // --- Россия ---
  { id: 'ru_moscow', nameRu: 'Москва', nameNative: 'Москва', countryCode: 'RU', region: 'Москва и Московская область', isPopular: true },
  { id: 'ru_spb', nameRu: 'Санкт-Петербург', nameNative: 'Санкт-Петербург', countryCode: 'RU', region: 'Санкт-Петербург и Ленинградская область', isPopular: true },
  { id: 'ru_novosibirsk', nameRu: 'Новосибирск', nameNative: 'Новосибирск', countryCode: 'RU', region: 'Новосибирская область', isPopular: true },
  { id: 'ru_ekaterinburg', nameRu: 'Екатеринбург', nameNative: 'Екатеринбург', countryCode: 'RU', region: 'Свердловская область', isPopular: true },
  { id: 'ru_kazan', nameRu: 'Казань', nameNative: 'Казань', countryCode: 'RU', region: 'Республика Татарстан', isPopular: true },
  { id: 'ru_nizhny', nameRu: 'Нижний Новгород', nameNative: 'Нижний Новгород', countryCode: 'RU', region: 'Нижегородская область' },
  { id: 'ru_chelyabinsk', nameRu: 'Челябинск', nameNative: 'Челябинск', countryCode: 'RU', region: 'Челябинская область' },
  { id: 'ru_samara', nameRu: 'Самара', nameNative: 'Самара', countryCode: 'RU', region: 'Самарская область' },
  { id: 'ru_ufa', nameRu: 'Уфа', nameNative: 'Уфа', countryCode: 'RU', region: 'Республика Башкортостан' },
  { id: 'ru_rostov', nameRu: 'Ростов-на-Дону', nameNative: 'Ростов-на-Дону', countryCode: 'RU', region: 'Ростовская область' },
  { id: 'ru_krasnodar', nameRu: 'Краснодар', nameNative: 'Краснодар', countryCode: 'RU', region: 'Краснодарский край' },
  { id: 'ru_krasnoyarsk', nameRu: 'Красноярск', nameNative: 'Красноярск', countryCode: 'RU', region: 'Красноярский край' },
  { id: 'ru_tyumen', nameRu: 'Тюмень', nameNative: 'Тюмень', countryCode: 'RU', region: 'Тюменская область' },
  { id: 'ru_vladivostok', nameRu: 'Владивосток', nameNative: 'Владивосток', countryCode: 'RU', region: 'Приморский край' },

  // --- Кыргызстан ---
  { id: 'kg_bishkek', nameRu: 'Бишкек', nameNative: 'Бишкек', countryCode: 'KG', region: 'Бишкек (Столица)', isPopular: true },
  { id: 'kg_osh', nameRu: 'Ош', nameNative: 'Ош', countryCode: 'KG', region: 'Ошская область', isPopular: true },
  { id: 'kg_jalalabad', nameRu: 'Джалал-Абад', nameNative: 'Жалал-Абад', countryCode: 'KG', region: 'Джалал-Абадская область', isPopular: true },
  { id: 'kg_karakol', nameRu: 'Каракол', nameNative: 'Каракол', countryCode: 'KG', region: 'Иссык-Кульская область' },
  { id: 'kg_tokmok', nameRu: 'Токмок', nameNative: 'Токмок', countryCode: 'KG', region: 'Чуйская область' },
  { id: 'kg_uzgen', nameRu: 'Узген', nameNative: 'Өзгөн', countryCode: 'KG', region: 'Ошская область' },
  { id: 'kg_balykchy', nameRu: 'Балыкчы', nameNative: 'Балыкчы', countryCode: 'KG', region: 'Иссык-Кульская область' },
  { id: 'kg_naryn', nameRu: 'Нарын', nameNative: 'Нарын', countryCode: 'KG', region: 'Нарынская область' },
  { id: 'kg_talas', nameRu: 'Талас', nameNative: 'Талас', countryCode: 'KG', region: 'Таласская область' },
  { id: 'kg_batken', nameRu: 'Баткен', nameNative: 'Баткен', countryCode: 'KG', region: 'Баткенская область' },
  { id: 'kg_kant', nameRu: 'Кант', nameNative: 'Кант', countryCode: 'KG', region: 'Чуйская область' },

  // --- Узбекистан ---
  { id: 'uz_tashkent', nameRu: 'Ташкент', nameNative: 'Toshkent', countryCode: 'UZ', region: 'Ташкент (Столица)', isPopular: true },
  { id: 'uz_samarkand', nameRu: 'Самарканд', nameNative: 'Samarqand', countryCode: 'UZ', region: 'Самаркандская область', isPopular: true },
  { id: 'uz_bukhara', nameRu: 'Бухара', nameNative: 'Buxoro', countryCode: 'UZ', region: 'Бухарская область', isPopular: true },
  { id: 'uz_namangan', nameRu: 'Наманган', nameNative: 'Namangan', countryCode: 'UZ', region: 'Наманганская область', isPopular: true },
  { id: 'uz_andijan', nameRu: 'Андижан', nameNative: 'Andijon', countryCode: 'UZ', region: 'Андижанская область', isPopular: true },
  { id: 'uz_fergana', nameRu: 'Фергана', nameNative: 'Fargʻona', countryCode: 'UZ', region: 'Ферганская область', isPopular: true },
  { id: 'uz_nukus', nameRu: 'Нукус', nameNative: 'Nókis', countryCode: 'UZ', region: 'Республика Каракалпакстан' },
  { id: 'uz_qarshi', nameRu: 'Карши', nameNative: 'Qarshi', countryCode: 'UZ', region: 'Кашкадарьинская область' },
  { id: 'uz_urgench', nameRu: 'Ургенч', nameNative: 'Urganch', countryCode: 'UZ', region: 'Хорезмская область' },

  // --- Беларусь ---
  { id: 'by_minsk', nameRu: 'Минск', nameNative: 'Мінск', countryCode: 'BY', region: 'Минск (Столица)', isPopular: true },
  { id: 'by_gomel', nameRu: 'Гомель', nameNative: 'Гомель', countryCode: 'BY', region: 'Гомельская область', isPopular: true },
  { id: 'by_vitebsk', nameRu: 'Витебск', nameNative: 'Віцебск', countryCode: 'BY', region: 'Витебская область' },
  { id: 'by_grodno', nameRu: 'Гродно', nameNative: 'Гродна', countryCode: 'BY', region: 'Гродненская область', isPopular: true },
  { id: 'by_brest', nameRu: 'Брест', nameNative: 'Брэст', countryCode: 'BY', region: 'Брестская область', isPopular: true },
  { id: 'by_mogilev', nameRu: 'Могилев', nameNative: 'Магілёў', countryCode: 'BY', region: 'Могилевская область' },

  // --- Азербайджан ---
  { id: 'az_baku', nameRu: 'Баку', nameNative: 'Bakı', countryCode: 'AZ', region: 'Баку (Столица)', isPopular: true },
  { id: 'az_ganja', nameRu: 'Гянджа', nameNative: 'Gəncə', countryCode: 'AZ', region: 'Гянджа-Дашкесанский район', isPopular: true },
  { id: 'az_sumqayit', nameRu: 'Сумгаит', nameNative: 'Sumqayıt', countryCode: 'AZ', region: 'Апшеронский экономический район', isPopular: true },
  { id: 'az_lankaran', nameRu: 'Ленкорань', nameNative: 'Lənkəran', countryCode: 'AZ', region: 'Ленкоранский район' },
  { id: 'az_nakhchivan', nameRu: 'Нахчыван', nameNative: 'Naxçıvan', countryCode: 'AZ', region: 'Нахчыванская АР' },

  // --- Армения ---
  { id: 'am_yerevan', nameRu: 'Ереван', nameNative: 'Երևան', countryCode: 'AM', region: 'Ереван (Столица)', isPopular: true },
  { id: 'am_gyumri', nameRu: 'Гюмри', nameNative: 'Գյումրի', countryCode: 'AM', region: 'Ширакская область', isPopular: true },
  { id: 'am_vanadzor', nameRu: 'Ванадзор', nameNative: 'Վանաձոր', countryCode: 'AM', region: 'Лори' },
  { id: 'am_abovyan', nameRu: 'Абовян', nameNative: 'Աբովյան', countryCode: 'AM', region: 'Котайкская область' },

  // --- Молдова ---
  { id: 'md_chisinau', nameRu: 'Кишинёв', nameNative: 'Chișinău', countryCode: 'MD', region: 'Кишинёв (Муниципий)', isPopular: true },
  { id: 'md_balti', nameRu: 'Бельцы', nameNative: 'Bălți', countryCode: 'MD', region: 'Бельцы (Муниципий)', isPopular: true },
  { id: 'md_tiraspol', nameRu: 'Тирасполь', nameNative: 'Tiraspol', countryCode: 'MD', region: 'Центральный регион' },
  { id: 'md_comrat', nameRu: 'Комрат', nameNative: 'Comrat', countryCode: 'MD', region: 'Гагаузия (АТО)' },

  // --- Туркменистан ---
  { id: 'tm_ashgabat', nameRu: 'Ашхабад', nameNative: 'Aşgabat', countryCode: 'TM', region: 'Ашхабад (Столица)', isPopular: true },
  { id: 'tm_turkmenabat', nameRu: 'Туркменабад', nameNative: 'Türkmenabat', countryCode: 'TM', region: 'Лебапский велаят', isPopular: true },
  { id: 'tm_mary', nameRu: 'Мары', nameNative: 'Mary', countryCode: 'TM', region: 'Марыйский велаят' },
  { id: 'tm_dashoguz', nameRu: 'Дашогуз', nameNative: 'Daşoguz', countryCode: 'TM', region: 'Дашогузский велаят' },
  { id: 'tm_turkmenbashi', nameRu: 'Туркменбаши', nameNative: 'Türkmenbaşy', countryCode: 'TM', region: 'Балканский велаят' },
];

export function getRegionsByCountry(countryCode?: CountryCode): string[] {
  if (!countryCode) {
    const set = new Set<string>();
    Object.values(COUNTRIES).forEach(c => c.regions.forEach(r => set.add(r)));
    return Array.from(set);
  }
  return COUNTRIES[countryCode]?.regions || [];
}

export function getCitiesByCountry(countryCode?: CountryCode, region?: string): CityInfo[] {
  let list = CITIES;
  if (countryCode) {
    list = list.filter(city => city.countryCode === countryCode);
  }
  if (region) {
    list = list.filter(city => city.region === region);
  }
  return list;
}

export function getCurrencyForCountry(countryCode: CountryCode): { code: string; symbol: string } {
  const c = COUNTRIES[countryCode] || COUNTRIES.TJ;
  return { code: c.currency, symbol: c.currencySymbol };
}

export const COMMON_PROFESSIONS = [
  'Строитель',
  'Маляр-штукатур',
  'Плиточник',
  'Электрик',
  'Сантехник',
  'Сварщик',
  'Водитель категории B/C',
  'Курьер пеший / авто',
  'Грузчик на склад',
  'Комплектовщик заказов',
  'Повар / Шашлычник',
  'Официант',
  'Продавец-кассир',
  'Швея / Портной',
  'Разнорабочий',
  'Бухгалтер',
  'Менеджер по продажам',
  'IT-специалист / Программист',
  'Мастер по ремонту бытовой техники',
  'Охранник',
];
