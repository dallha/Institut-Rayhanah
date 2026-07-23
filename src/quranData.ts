/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Surah } from "./types";

// The 114 Surahs of the Holy Quran with correct numbers, names, Arabic names, and verse counts
export const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", versesCount: 7, hizbStart: 1 },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", versesCount: 286, hizbStart: 1 },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", versesCount: 200, hizbStart: 4 },
  { number: 4, name: "An-Nisa'", arabicName: "النساء", versesCount: 176, hizbStart: 6 },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", versesCount: 120, hizbStart: 8 },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", versesCount: 165, hizbStart: 11 },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", versesCount: 206, hizbStart: 13 },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", versesCount: 75, hizbStart: 15 },
  { number: 9, name: "At-Tawbah", arabicName: "التوبة", versesCount: 129, hizbStart: 16 },
  { number: 10, name: "Yunus", arabicName: "يونس", versesCount: 109, hizbStart: 18 },
  { number: 11, name: "Hud", arabicName: "هود", versesCount: 123, hizbStart: 20 },
  { number: 12, name: "Yusuf", arabicName: "يوسف", versesCount: 111, hizbStart: 22 },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", versesCount: 43, hizbStart: 23 },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", versesCount: 52, hizbStart: 24 },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", versesCount: 99, hizbStart: 25 },
  { number: 16, name: "An-Nahl", arabicName: "النحل", versesCount: 128, hizbStart: 25 },
  { number: 17, name: "Al-Isra'", arabicName: "الإسراء", versesCount: 111, hizbStart: 27 },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", versesCount: 110, hizbStart: 28 },
  { number: 19, name: "Maryam", arabicName: "مريم", versesCount: 98, hizbStart: 29 },
  { number: 20, name: "Ta-Ha", arabicName: "طه", versesCount: 135, hizbStart: 30 },
  { number: 21, name: "Al-Anbiya'", arabicName: "الأنبياء", versesCount: 112, hizbStart: 31 },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", versesCount: 78, hizbStart: 32 },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", versesCount: 118, hizbStart: 33 },
  { number: 24, name: "An-Nur", arabicName: "النور", versesCount: 64, hizbStart: 34 },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", versesCount: 77, hizbStart: 35 },
  { number: 26, name: "Ash-Shu'ara'", arabicName: "الشعراء", versesCount: 227, hizbStart: 36 },
  { number: 27, name: "An-Naml", arabicName: "النمل", versesCount: 93, hizbStart: 37 },
  { number: 28, name: "Al-Qasas", arabicName: "القصص", versesCount: 88, hizbStart: 38 },
  { number: 29, name: "Al-'Ankabut", arabicName: "العنكبوت", versesCount: 69, hizbStart: 39 },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", versesCount: 60, hizbStart: 40 },
  { number: 31, name: "Luqman", arabicName: "لقمان", versesCount: 34, hizbStart: 41 },
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", versesCount: 30, hizbStart: 41 },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", versesCount: 73, hizbStart: 41 },
  { number: 34, name: "Saba'", arabicName: "سبأ", versesCount: 54, hizbStart: 42 },
  { number: 35, name: "Fatir", arabicName: "فاطر", versesCount: 45, hizbStart: 43 },
  { number: 36, name: "Ya-Sin", arabicName: "يس", versesCount: 83, hizbStart: 43 },
  { number: 37, name: "As-Saffat", arabicName: "الصافات", versesCount: 182, hizbStart: 44 },
  { number: 38, name: "Sad", arabicName: "ص", versesCount: 88, hizbStart: 45 },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", versesCount: 75, hizbStart: 45 },
  { number: 40, name: "Ghafir", arabicName: "غافر", versesCount: 85, hizbStart: 46 },
  { number: 41, name: "Fussilat", arabicName: "فصلت", versesCount: 54, hizbStart: 47 },
  { number: 42, name: "Ash-Shura", arabicName: "الشورى", versesCount: 53, hizbStart: 48 },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", versesCount: 89, hizbStart: 49 },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", versesCount: 59, hizbStart: 49 },
  { number: 45, name: "Al-Jathiyah", arabicName: "الجاثية", versesCount: 37, hizbStart: 50 },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", versesCount: 35, hizbStart: 50 },
  { number: 47, name: "Muhammad", arabicName: "محمد", versesCount: 38, hizbStart: 51 },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", versesCount: 29, hizbStart: 51 },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", versesCount: 18, hizbStart: 51 },
  { number: 50, name: "Qaf", arabicName: "ق", versesCount: 45, hizbStart: 51 },
  { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", versesCount: 60, hizbStart: 52 },
  { number: 52, name: "At-Tur", arabicName: "الطور", versesCount: 49, hizbStart: 52 },
  { number: 53, name: "An-Najm", arabicName: "النجم", versesCount: 62, hizbStart: 52 },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", versesCount: 55, hizbStart: 52 },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", versesCount: 78, hizbStart: 53 },
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", versesCount: 96, hizbStart: 53 },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", versesCount: 29, hizbStart: 53 },
  { number: 58, name: "Al-Mujadilah", arabicName: "المجادلة", versesCount: 22, hizbStart: 54 },
  { number: 59, name: "Al-Hashr", arabicName: "الحشر", versesCount: 24, hizbStart: 54 },
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", versesCount: 13, hizbStart: 54 },
  { number: 61, name: "As-Saff", arabicName: "الصف", versesCount: 14, hizbStart: 54 },
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", versesCount: 11, hizbStart: 54 },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", versesCount: 11, hizbStart: 54 },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", versesCount: 18, hizbStart: 54 },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", versesCount: 12, hizbStart: 55 },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", versesCount: 12, hizbStart: 55 },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", versesCount: 30, hizbStart: 55 },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", versesCount: 52, hizbStart: 55 },
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", versesCount: 52, hizbStart: 55 },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", versesCount: 44, hizbStart: 55 },
  { number: 71, name: "Nuh", arabicName: "نوح", versesCount: 28, hizbStart: 56 },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", versesCount: 28, hizbStart: 56 },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", versesCount: 20, hizbStart: 56 },
  { number: 74, name: "Al-Muddaththir", arabicName: "المدثر", versesCount: 56, hizbStart: 56 },
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", versesCount: 40, hizbStart: 56 },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", versesCount: 31, hizbStart: 56 },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", versesCount: 50, hizbStart: 56 },
  { number: 78, name: "An-Naba'", arabicName: "النبأ", versesCount: 40, hizbStart: 57 },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", versesCount: 46, hizbStart: 57 },
  { number: 80, name: "'Abasa", arabicName: "عبس", versesCount: 42, hizbStart: 57 },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", versesCount: 29, hizbStart: 57 },
  { number: 82, name: "Al-Infitar", arabicName: "الانفطار", versesCount: 19, hizbStart: 57 },
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", versesCount: 36, hizbStart: 57 },
  { number: 84, name: "Al-Inshiqaq", arabicName: "الانشقاق", versesCount: 25, hizbStart: 57 },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", versesCount: 22, hizbStart: 58 },
  { number: 86, name: "At-Tariq", arabicName: "الطارق", versesCount: 17, hizbStart: 58 },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", versesCount: 19, hizbStart: 58 },
  { number: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", versesCount: 26, hizbStart: 58 },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", versesCount: 30, hizbStart: 58 },
  { number: 90, name: "Al-Balad", arabicName: "البلد", versesCount: 20, hizbStart: 58 },
  { number: 91, name: "Ash-Shams", arabicName: "الشمس", versesCount: 15, hizbStart: 59 },
  { number: 92, name: "Al-Layl", arabicName: "الليل", versesCount: 21, hizbStart: 59 },
  { number: 93, name: "Ad-Duha", arabicName: "الضحى", versesCount: 11, hizbStart: 59 },
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", versesCount: 8, hizbStart: 59 },
  { number: 95, name: "At-Tin", arabicName: "التين", versesCount: 8, hizbStart: 59 },
  { number: 96, name: "Al-'Alaq", arabicName: "العلق", versesCount: 19, hizbStart: 59 },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", versesCount: 5, hizbStart: 59 },
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", versesCount: 8, hizbStart: 59 },
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", versesCount: 8, hizbStart: 59 },
  { number: 100, name: "Al-'Adiyat", arabicName: "العاديات", versesCount: 11, hizbStart: 59 },
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", versesCount: 11, hizbStart: 60 },
  { number: 102, name: "At-Takathur", arabicName: "التكاثر", versesCount: 8, hizbStart: 60 },
  { number: 103, name: "Al-'Asr", arabicName: "العصر", versesCount: 3, hizbStart: 60 },
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", versesCount: 9, hizbStart: 60 },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", versesCount: 5, hizbStart: 60 },
  { number: 106, name: "Quraysh", arabicName: "قريش", versesCount: 4, hizbStart: 60 },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", versesCount: 7, hizbStart: 60 },
  { number: 108, name: "Al-Kauthar", arabicName: "الكوثر", versesCount: 3, hizbStart: 60 },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", versesCount: 6, hizbStart: 60 },
  { number: 110, name: "An-Nasr", arabicName: "النصر", versesCount: 3, hizbStart: 60 },
  { number: 111, name: "Al-Masad", arabicName: "المسد", versesCount: 5, hizbStart: 60 },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", versesCount: 4, hizbStart: 60 },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", versesCount: 5, hizbStart: 60 },
  { number: 114, name: "An-Nas", arabicName: "الناس", versesCount: 6, hizbStart: 60 }
];

export function getSurahByNum(num: number): Surah | undefined {
  return SURAHS.find((s) => s.number === num);
}

/**
 * Calculates Hifz progress percentage based on the West African tradition.
 * Progression starts at Hizb 60 (0%) and advances backwards to Hizb 1 (100%).
 */
export function calculateWestAfricanProgress(hizbNum?: number, fraction?: number): number {
  if (!hizbNum) return 0;
  const currentFraction = fraction || 0;
  
  // An pupil at Hizb H with fraction F has completed (60 - (H - F)) Hizbs.
  // Example: Hizb 60 with 0.0 fraction completed = 0 Hizbs -> 0%
  // Hizb 30 with 0.5 fraction completed = 30.5 Hizbs completed -> 50.83%
  // Hizb 1 with 1.0 fraction completed = 60 Hizbs completed -> 100%
  const completedHizbs = 60 - (hizbNum - currentFraction);
  const percentage = (completedHizbs / 60) * 100;
  
  return Math.min(100, Math.max(0, Math.round(percentage * 100) / 100));
}

export function formatHizbFraction(fraction: number): string {
  if (fraction === 0.25) return "ربع (0.25)";
  if (fraction === 0.50) return "نصف (0.50)";
  if (fraction === 0.75) return "ثلاثة أرباع (0.75)";
  if (fraction === 1.00) return "كامل (1.00)";
  return "1.00";
}

export function formatHizbFractionArabic(fraction: number): string {
  if (fraction === 0.25) return "ربع";
  if (fraction === 0.50) return "نصف";
  if (fraction === 0.75) return "ثلاثة أرباع";
  if (fraction === 1.00) return "حزب كامل";
  return "جديد";
}

// Calculates the exact number of verses recited, supporting both forward and West African (backward) Surah progression
export function calculateVersesCount(startS?: number, startV?: number, endS?: number, endV?: number): number {
  if (!startS || !startV || !endS || !endV) return 0;
  
  const sStart = getSurahByNum(startS);
  const sEnd = getSurahByNum(endS);
  if (!sStart || !sEnd) return 0;

  if (startS === endS) {
    return Math.max(0, endV - startV + 1);
  }

  let total = 0;
  
  if (startS > endS) {
    // West African progression (backwards Surah order, e.g. 114 -> 113)
    total += Math.max(0, sStart.versesCount - startV + 1);
    for (let i = startS - 1; i > endS; i--) {
      const s = getSurahByNum(i);
      if (s) total += s.versesCount;
    }
    total += Math.max(0, endV);
  } else {
    // Standard progression (forward Surah order, e.g. 2 -> 3)
    total += Math.max(0, sStart.versesCount - startV + 1);
    for (let i = startS + 1; i < endS; i++) {
      const s = getSurahByNum(i);
      if (s) total += s.versesCount;
    }
    total += Math.max(0, endV);
  }
  
  return total;
}

// Convert a Lesson's Surah range into a readable string
export function getSurahRangeString(startS?: number, startV?: number, endS?: number, endV?: number): string {
  if (!startS || !endS) return "-";
  const startSurah = getSurahByNum(startS);
  const endSurah = getSurahByNum(endS);
  
  if (!startSurah || !endSurah) return "-";
  
  return `${startSurah.name} v.${startV || 1} ➔ ${endSurah.name} v.${endV || 1}`;
}

// Translate a Lesson's Hizb range into a readable string
export function getHizbRangeString(startH?: number, startHF?: number, endH?: number, endHF?: number): string {
  if (!startH || !endH) return "-";
  const startFracText = startHF ? ` (${formatHizbFractionArabic(startHF)})` : "";
  const endFracText = endHF ? ` (${formatHizbFractionArabic(endHF)})` : "";
  
  return `Hizb ${startH}${startFracText} ➔ Hizb ${endH}${endFracText}`;
}

export const HIZBS = [
  { number: 1, name: "الم ذلك — البقرة" },
  { number: 2, name: "وإذا لقوا — البقرة" },
  { number: 3, name: "سيقول السفهاء — البقرة" },
  { number: 4, name: "واذكروا الله — البقرة" },
  { number: 5, name: "تلك الرسل — آل عمران" },
  { number: 6, name: "قل أؤنبئكم — آل عمران" },
  { number: 7, name: "لن تنالوا البر — آل عمران" },
  { number: 8, name: "يستبشرون — النساء" },
  { number: 9, name: "والمحصنات — النساء" },
  { number: 10, name: "الله لا إله إلا هو — النساء" },
  { number: 11, name: "لا يحب الله — المائدة" },
  { number: 12, name: "قال رجلان — المائدة" },
  { number: 13, name: "لتجدن أشد الناس — الأنعام" },
  { number: 14, name: "إنما يستجيب — الأنعام" },
  { number: 15, name: "ولو أننا نزلنا — الأنعام" },
  { number: 16, name: "المص كتاب — الأعراف" },
  { number: 17, name: "قال الملأ — الأعراف" },
  { number: 18, name: "وإذ نتقنا الجبل — الأنفال" },
  { number: 19, name: "واعلموا — التوبة" },
  { number: 20, name: "إن كثيراً — التوبة" },
  { number: 21, name: "إنما السبيل — يونس" },
  { number: 22, name: "للذين أحسنوا — هود" },
  { number: 23, name: "وما من دابة — هود" },
  { number: 24, name: "وإلى مدين — يوسف" },
  { number: 25, name: "وما أبرئ نفسي — الرعد" },
  { number: 26, name: "أفمن يعلم — إبراهيم" },
  { number: 27, name: "ربما — النحل" },
  { number: 28, name: "وقال الله لا تتخذوا — النحل" },
  { number: 29, name: "سبحان الذي — الإسراء" },
  { number: 30, name: "أولم يروا — الكهف" },
  { number: 31, name: "قال ألم أقل لك — مريم" },
  { number: 32, name: "طه — طه" },
  { number: 33, name: "اقترب للناس — الأنبياء" },
  { number: 34, name: "يا أيها الناس — الحج" },
  { number: 35, name: "قد أفلح — المؤمنون" },
  { number: 36, name: "لا تتبعوا — الفرقان" },
  { number: 37, name: "وقال الذين لا يرجون — الشعراء" },
  { number: 38, name: "قالوا أنؤمن لك — النمل" },
  { number: 39, name: "فما كان جواب قومه — القصص" },
  { number: 40, name: "ولقد وصلنا — العنكبوت" },
  { number: 41, name: "ولا تجادلوا — الروم" },
  { number: 42, name: "ومن يسلم — الأحزاب" },
  { number: 43, name: "ومن يقنت — سبأ" },
  { number: 44, name: "قل من يرزقكم — فاطر" },
  { number: 45, name: "وما أنزلنا على قومه — الصافات" },
  { number: 46, name: "فنبذناه بالعراء — ص" },
  { number: 47, name: "فمن أظلم — غافر" },
  { number: 48, name: "ويا قوم ما لي — فصلت" },
  { number: 49, name: "إليه يرد — الشورى" },
  { number: 50, name: "قل أولو جئتكم — الدخان" },
  { number: 51, name: "حم ما خلقنا — محمد" },
  { number: 52, name: "لقد رضي الله — الحجرات" },
  { number: 53, name: "قال فما خطبكم — الطور" },
  { number: 54, name: "الرحمن — الرحمن" },
  { number: 55, name: "قد سمع الله — المجادلة" },
  { number: 56, name: "يسبح لله — الجمعة" },
  { number: 57, name: "تبارك الذي — الملك" },
  { number: 58, name: "قل أوحي — الجن" },
  { number: 59, name: "عم يتساءلون — النبأ" },
  { number: 60, name: "سبح اسم ربك — الأعلى" }
];
