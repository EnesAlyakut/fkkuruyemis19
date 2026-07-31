const TURKISH_CITIES = new Set([
  "adana",
  "adiyaman",
  "afyonkarahisar",
  "agri",
  "amasya",
  "ankara",
  "antalya",
  "artvin",
  "aydin",
  "balikesir",
  "bilecik",
  "bingol",
  "bitlis",
  "bolu",
  "burdur",
  "bursa",
  "canakkale",
  "cankiri",
  "corum",
  "denizli",
  "diyarbakir",
  "edirne",
  "elazig",
  "erzincan",
  "erzurum",
  "eskisehir",
  "gaziantep",
  "giresun",
  "gumushane",
  "hakkari",
  "hatay",
  "isparta",
  "mersin",
  "istanbul",
  "izmir",
  "kars",
  "kastamonu",
  "kayseri",
  "kirklareli",
  "kirsehir",
  "kocaeli",
  "konya",
  "kutahya",
  "malatya",
  "manisa",
  "kahramanmaras",
  "mardin",
  "mugla",
  "mus",
  "nevsehir",
  "nigde",
  "ordu",
  "rize",
  "sakarya",
  "samsun",
  "siirt",
  "sinop",
  "sivas",
  "tekirdag",
  "tokat",
  "trabzon",
  "tunceli",
  "sanliurfa",
  "usak",
  "van",
  "yozgat",
  "zonguldak",
  "aksaray",
  "bayburt",
  "karaman",
  "kirikkale",
  "batman",
  "sirnak",
  "bartin",
  "ardahan",
  "igdir",
  "yalova",
  "karabuk",
  "kilis",
  "osmaniye",
  "duzce",
]);

const ADDRESS_KEYWORDS = [
  "mah",
  "mahalle",
  "mahallesi",
  "sok",
  "sokak",
  "sk",
  "cad",
  "cadde",
  "caddesi",
  "bulvar",
  "bulvari",
  "apt",
  "apartman",
  "apartmani",
  "site",
  "sitesi",
  "no",
  "numara",
  "daire",
  "kat",
  "koy",
  "koyu",
  "mevkii",
];

const COMMON_FAKE_WORDS = new Set([
  "asdf",
  "asdasd",
  "deneme",
  "fake",
  "qwerty",
  "random",
  "sallama",
  "test",
  "testing",
  "xxx",
]);

export type OrderContactValidationInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string | null;
};

type NormalizedOrderContact = Omit<OrderContactValidationInput, "postalCode"> & {
  customerPhone: string;
  city: string;
  postalCode?: string;
};

export type OrderContactValidationResult =
  | { ok: true; normalized: NormalizedOrderContact }
  | { ok: false; message: string };

export function validateOrderContactFields(
  input: OrderContactValidationInput
): OrderContactValidationResult {
  const customerName = normalizeSpaces(input.customerName);
  const customerEmail = input.customerEmail.trim().toLowerCase();
  const phone = normalizePhone(input.customerPhone);
  const city = normalizeSpaces(input.city);
  const district = normalizeSpaces(input.district);
  const address = normalizeSpaces(input.address);
  const postalCode = input.postalCode?.trim() || "";

  if (!isValidFullName(customerName)) {
    return { ok: false, message: "L\u00fctfen ger\u00e7ek ad ve soyad\u0131n\u0131z\u0131 yaz\u0131n\u0131z." };
  }

  if (!isValidTurkishPhone(phone)) {
    return { ok: false, message: "L\u00fctfen ge\u00e7erli bir cep telefonu numaras\u0131 giriniz." };
  }

  if (looksSuspiciousEmailLocalPart(customerEmail)) {
    return { ok: false, message: "L\u00fctfen ger\u00e7ek e-posta adresinizi giriniz." };
  }

  if (!isKnownTurkishCity(city)) {
    return { ok: false, message: "L\u00fctfen ge\u00e7erli bir \u015fehir se\u00e7iniz veya yaz\u0131n\u0131z." };
  }

  if (!isValidDistrict(district)) {
    return { ok: false, message: "L\u00fctfen ge\u00e7erli bir il\u00e7e ad\u0131 giriniz." };
  }

  if (!isValidAddress(address)) {
    return {
      ok: false,
      message: "L\u00fctfen mahalle, sokak/cadde, bina no ve daire bilgisi i\u00e7eren ger\u00e7ek bir adres giriniz.",
    };
  }

  if (postalCode && !/^\d{5}$/.test(postalCode)) {
    return { ok: false, message: "Posta kodu 5 haneli rakam olmal\u0131d\u0131r." };
  }

  return {
    ok: true,
    normalized: {
      customerName,
      customerEmail,
      customerPhone: phone,
      city,
      district,
      address,
      postalCode,
    },
  };
}

function normalizeSpaces(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) return `0${digits.slice(2)}`;
  if (digits.length === 10 && digits.startsWith("5")) return `0${digits}`;
  return digits;
}

function isValidTurkishPhone(phone: string) {
  if (!/^05\d{9}$/.test(phone)) return false;
  if (/^(\d)\1+$/.test(phone)) return false;
  if (/^0500|^0555555|^0505050/.test(phone)) return false;
  return true;
}

function isValidFullName(name: string) {
  if (name.length < 5 || name.length > 80) return false;
  if (hasForbiddenNameChars(name)) return false;

  const words = name.split(" ").filter(Boolean);
  if (words.length < 2) return false;

  return words.every((word) => word.replace(/['-]/g, "").length >= 2 && !looksLikeRandomText(word));
}

function isKnownTurkishCity(city: string) {
  return TURKISH_CITIES.has(toAsciiLower(city));
}

function isValidDistrict(district: string) {
  if (district.length < 2 || district.length > 60) return false;
  if (hasForbiddenNameChars(district)) return false;
  return !looksLikeRandomText(district);
}

function hasForbiddenNameChars(value: string) {
  return /[0-9@#$%^&*_=+[\]{}<>/\\|~`]/.test(value);
}

function isValidAddress(address: string) {
  if (address.length < 25 || address.length > 500) return false;

  const words = address.split(/\s+/).filter(Boolean);
  if (words.length < 5) return false;
  if (!/\d/.test(address)) return false;

  const normalized = toAsciiLower(address);
  const hasAddressKeyword = ADDRESS_KEYWORDS.some((keyword) =>
    new RegExp(`(^|\\s|\\.|,)${keyword}(\\s|\\.|,|$)`).test(normalized)
  );
  if (!hasAddressKeyword) return false;

  const letterGroups = normalized.match(/[a-z]+/g) || [];
  const suspiciousGroups = letterGroups.filter((group) => group.length >= 6 && looksLikeRandomText(group));
  return suspiciousGroups.length <= 1;
}

export function looksSuspiciousEmailLocalPart(email: string) {
  const [localPart] = email.trim().toLowerCase().split("@");
  if (!localPart || localPart.length < 2) return true;

  const compact = localPart.replace(/[._+-]/g, "");
  if (COMMON_FAKE_WORDS.has(compact)) return true;
  if (/^(.)\1{4,}$/.test(compact)) return true;
  if (/^\d+$/.test(compact)) return true;
  if (compact.length >= 8 && looksLikeRandomText(compact)) return true;

  return false;
}

function looksLikeRandomText(value: string) {
  const compact = toAsciiLower(value).replace(/[^a-z]/g, "");
  if (compact.length < 5) return false;
  if (COMMON_FAKE_WORDS.has(compact)) return true;
  if (/^(.)\1{3,}$/.test(compact)) return true;

  const vowels = compact.match(/[aeiou]/g)?.length || 0;
  const vowelRatio = vowels / compact.length;
  const uniqueRatio = new Set(compact).size / compact.length;

  if (compact.length >= 7 && vowels === 0) return true;
  if (compact.length >= 8 && vowelRatio < 0.16) return true;
  if (compact.length >= 8 && uniqueRatio < 0.32) return true;
  if (/[bcdfghjklmnpqrstvwxyz]{6,}/.test(compact)) return true;
  if (/(asdf|qwer|zxcv|sdfg|dfgh|fgbf|gbsf|sfbs|bsfg)/.test(compact)) return true;

  return false;
}

function toAsciiLower(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\u00e7/g, "c")
    .replace(/\u011f/g, "g")
    .replace(/\u0131/g, "i")
    .replace(/i\u0307/g, "i")
    .replace(/\u00f6/g, "o")
    .replace(/\u015f/g, "s")
    .replace(/\u00fc/g, "u");
}
