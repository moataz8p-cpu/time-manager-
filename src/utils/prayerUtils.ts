import { PrayerTimeItem } from '../types';

export interface CityInfo {
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  timezoneOffset: number; // in hours from UTC
}

export const SUPPORTED_CITIES: CityInfo[] = [
  { nameAr: 'القاهرة', nameEn: 'Cairo', latitude: 30.0444, longitude: 31.2357, timezoneOffset: 3 },
  { nameAr: 'مكة المكرمة', nameEn: 'Mecca', latitude: 21.3891, longitude: 39.8579, timezoneOffset: 3 },
  { nameAr: 'المدينة المنورة', nameEn: 'Medina', latitude: 24.5247, longitude: 39.5692, timezoneOffset: 3 },
  { nameAr: 'الرياض', nameEn: 'Riyadh', latitude: 24.7136, longitude: 46.6753, timezoneOffset: 3 },
  { nameAr: 'الإسكندرية', nameEn: 'Alexandria', latitude: 31.2001, longitude: 29.9187, timezoneOffset: 3 },
  { nameAr: 'دبي', nameEn: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezoneOffset: 4 },
  { nameAr: 'القدس', nameEn: 'Jerusalem', latitude: 31.7683, longitude: 35.2137, timezoneOffset: 3 },
  { nameAr: 'عمّان', nameEn: 'Amman', latitude: 31.9454, longitude: 35.9284, timezoneOffset: 3 },
  { nameAr: 'بغداد', nameEn: 'Baghdad', latitude: 33.3152, longitude: 44.3661, timezoneOffset: 3 },
  { nameAr: 'إسطنبول', nameEn: 'Istanbul', latitude: 41.0082, longitude: 28.9784, timezoneOffset: 3 },
  { nameAr: 'الدار البيضاء', nameEn: 'Casablanca', latitude: 33.5731, longitude: -7.5898, timezoneOffset: 1 },
];

/**
 * Astronomical solar calculation for prayer times
 */
function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezoneOffset: number,
  manualOverrides: Record<string, string> = {}
): PrayerTimeItem[] {
  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination & Equation of Time (approximation)
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const declination = 23.45 * Math.sin(toRadians((360 / 365) * (dayOfYear - 81))); // degrees

  // Solar noon (Dhuhr)
  const timeCorrection = 4 * longitude + eot; // minutes
  const solarNoonUtc = 12 * 60 - timeCorrection; // minutes from UTC midnight
  const dhuhrMinutes = solarNoonUtc + timezoneOffset * 60;

  // Function to calculate hour angle for a given sun angle
  const calcHourAngle = (angle: number): number => {
    const latRad = toRadians(latitude);
    const decRad = toRadians(declination);
    const angRad = toRadians(angle);
    const cosHA = (Math.sin(angRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA < -1 || cosHA > 1) return 0; // extreme latitudes
    return toDegrees(Math.acos(cosHA)) * 4; // minutes
  };

  // Sun angles:
  // Fajr: -18 degrees (Egyptian General Authority of Survey / Umm Al Qura ~18.5)
  // Sunrise: -0.833 degrees
  // Maghrib: -0.833 degrees
  // Isha: -17.5 degrees
  const fajrHA = calcHourAngle(-18.0);
  const sunriseHA = calcHourAngle(-0.833);
  const ishaHA = calcHourAngle(-17.5);

  // Asr (Shafi'i: shadow length = object + noon shadow)
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);
  const noonZenith = Math.abs(latRad - decRad);
  const asrAltRad = Math.atan(1 / (1 + Math.tan(noonZenith)));
  const asrAlt = toDegrees(asrAltRad);
  const asrHA = calcHourAngle(asrAlt);

  const formatMin = (mins: number): string => {
    const normalized = ((Math.round(mins) % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const rawPrayers = [
    { name: 'الفجر', defaultTime: formatMin(dhuhrMinutes - fajrHA) },
    { name: 'الشروق', defaultTime: formatMin(dhuhrMinutes - sunriseHA) },
    { name: 'الظهر', defaultTime: formatMin(dhuhrMinutes) },
    { name: 'العصر', defaultTime: formatMin(dhuhrMinutes + asrHA) },
    { name: 'المغرب', defaultTime: formatMin(dhuhrMinutes + sunriseHA) },
    { name: 'العشاء', defaultTime: formatMin(dhuhrMinutes + ishaHA) },
  ];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextFound = false;

  const prayerItems: PrayerTimeItem[] = rawPrayers.map((p) => {
    const timeStr = manualOverrides[p.name] || p.defaultTime;
    const [h, m] = timeStr.split(':').map(Number);
    const pMinutes = h * 60 + m;

    const pDate = new Date(date);
    pDate.setHours(h, m, 0, 0);

    const isPassed = pMinutes <= currentMinutes;
    let isNext = false;
    if (!isPassed && !nextFound) {
      isNext = true;
      nextFound = true;
    }

    return {
      name: p.name,
      time: timeStr,
      timestamp: pDate,
      isPassed,
      isNext,
    };
  });

  // If all prayers passed today, next is Fajr tomorrow
  if (!nextFound && prayerItems.length > 0) {
    prayerItems[0].isNext = true;
  }

  return prayerItems;
}

/**
 * Get remaining seconds to next prayer
 */
export function getCountdownToNextPrayer(prayers: PrayerTimeItem[]): {
  nextPrayerName: string;
  remainingSeconds: number;
} {
  const next = prayers.find((p) => p.isNext);
  if (!next) {
    return { nextPrayerName: 'الفجر', remainingSeconds: 0 };
  }

  const now = new Date();
  let diffMs = next.timestamp.getTime() - now.getTime();
  if (diffMs < 0) {
    // Tomorrow's Fajr
    diffMs += 24 * 60 * 60 * 1000;
  }

  return {
    nextPrayerName: next.name,
    remainingSeconds: Math.max(0, Math.floor(diffMs / 1000)),
  };
}
