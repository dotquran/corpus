import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { create } from 'xmlbuilder2';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Ayah {
  number: number;
  text: string;
  marks?: string[];
}

interface Surah {
  number: number;
  name: string;
  loc: 'مكية' | 'مدنية';
  ayahs: Ayah[];
}

interface Metadata {
  source: string;
  version: string;
  repository: string;
  website: string;
  license: string;
  termsOfUse: string;
  processedBy: string;
  processedAt: string;
}

interface Corpus {
  metadata: Metadata;
  surahs: Surah[];
}

// ---------------------------------------------------------------------------
// Surah metadata (name + revelation type)
// Index is surah number (1-based, index 0 unused)
// ---------------------------------------------------------------------------

const SURAH_META: Array<{ name: string; loc: 'مكية' | 'مدنية' }> = [
  { name: '', loc: 'مكية' }, // placeholder – index 0 unused
  { name: 'الفاتحة', loc: 'مكية' },
  { name: 'البقرة', loc: 'مدنية' },
  { name: 'آل عمران', loc: 'مدنية' },
  { name: 'النساء', loc: 'مدنية' },
  { name: 'المائدة', loc: 'مدنية' },
  { name: 'الأنعام', loc: 'مكية' },
  { name: 'الأعراف', loc: 'مكية' },
  { name: 'الأنفال', loc: 'مدنية' },
  { name: 'التوبة', loc: 'مدنية' },
  { name: 'يونس', loc: 'مكية' },
  { name: 'هود', loc: 'مكية' },
  { name: 'يوسف', loc: 'مكية' },
  { name: 'الرعد', loc: 'مدنية' },
  { name: 'إبراهيم', loc: 'مكية' },
  { name: 'الحجر', loc: 'مكية' },
  { name: 'النحل', loc: 'مكية' },
  { name: 'الإسراء', loc: 'مكية' },
  { name: 'الكهف', loc: 'مكية' },
  { name: 'مريم', loc: 'مكية' },
  { name: 'طه', loc: 'مكية' },
  { name: 'الأنبياء', loc: 'مكية' },
  { name: 'الحج', loc: 'مدنية' },
  { name: 'المؤمنون', loc: 'مكية' },
  { name: 'النور', loc: 'مدنية' },
  { name: 'الفرقان', loc: 'مكية' },
  { name: 'الشعراء', loc: 'مكية' },
  { name: 'النمل', loc: 'مكية' },
  { name: 'القصص', loc: 'مكية' },
  { name: 'العنكبوت', loc: 'مكية' },
  { name: 'الروم', loc: 'مكية' },
  { name: 'لقمان', loc: 'مكية' },
  { name: 'السجدة', loc: 'مكية' },
  { name: 'الأحزاب', loc: 'مدنية' },
  { name: 'سبأ', loc: 'مكية' },
  { name: 'فاطر', loc: 'مكية' },
  { name: 'يس', loc: 'مكية' },
  { name: 'الصافات', loc: 'مكية' },
  { name: 'ص', loc: 'مكية' },
  { name: 'الزمر', loc: 'مكية' },
  { name: 'غافر', loc: 'مكية' },
  { name: 'فصلت', loc: 'مكية' },
  { name: 'الشورى', loc: 'مكية' },
  { name: 'الزخرف', loc: 'مكية' },
  { name: 'الدخان', loc: 'مكية' },
  { name: 'الجاثية', loc: 'مكية' },
  { name: 'الأحقاف', loc: 'مكية' },
  { name: 'محمد', loc: 'مدنية' },
  { name: 'الفتح', loc: 'مدنية' },
  { name: 'الحجرات', loc: 'مدنية' },
  { name: 'ق', loc: 'مكية' },
  { name: 'الذاريات', loc: 'مكية' },
  { name: 'الطور', loc: 'مكية' },
  { name: 'النجم', loc: 'مكية' },
  { name: 'القمر', loc: 'مكية' },
  { name: 'الرحمن', loc: 'مدنية' },
  { name: 'الواقعة', loc: 'مكية' },
  { name: 'الحديد', loc: 'مدنية' },
  { name: 'المجادلة', loc: 'مدنية' },
  { name: 'الحشر', loc: 'مدنية' },
  { name: 'الممتحنة', loc: 'مدنية' },
  { name: 'الصف', loc: 'مدنية' },
  { name: 'الجمعة', loc: 'مدنية' },
  { name: 'المنافقون', loc: 'مدنية' },
  { name: 'التغابن', loc: 'مدنية' },
  { name: 'الطلاق', loc: 'مدنية' },
  { name: 'التحريم', loc: 'مدنية' },
  { name: 'الملك', loc: 'مكية' },
  { name: 'القلم', loc: 'مكية' },
  { name: 'الحاقة', loc: 'مكية' },
  { name: 'المعارج', loc: 'مكية' },
  { name: 'نوح', loc: 'مكية' },
  { name: 'الجن', loc: 'مكية' },
  { name: 'المزمل', loc: 'مكية' },
  { name: 'المدثر', loc: 'مكية' },
  { name: 'القيامة', loc: 'مكية' },
  { name: 'الإنسان', loc: 'مدنية' },
  { name: 'المرسلات', loc: 'مكية' },
  { name: 'النبأ', loc: 'مكية' },
  { name: 'النازعات', loc: 'مكية' },
  { name: 'عبس', loc: 'مكية' },
  { name: 'التكوير', loc: 'مكية' },
  { name: 'الانفطار', loc: 'مكية' },
  { name: 'المطففين', loc: 'مكية' },
  { name: 'الانشقاق', loc: 'مكية' },
  { name: 'البروج', loc: 'مكية' },
  { name: 'الطارق', loc: 'مكية' },
  { name: 'الأعلى', loc: 'مكية' },
  { name: 'الغاشية', loc: 'مكية' },
  { name: 'الفجر', loc: 'مكية' },
  { name: 'البلد', loc: 'مكية' },
  { name: 'الشمس', loc: 'مكية' },
  { name: 'الليل', loc: 'مكية' },
  { name: 'الضحى', loc: 'مكية' },
  { name: 'الشرح', loc: 'مكية' },
  { name: 'التين', loc: 'مكية' },
  { name: 'العلق', loc: 'مكية' },
  { name: 'القدر', loc: 'مكية' },
  { name: 'البينة', loc: 'مدنية' },
  { name: 'الزلزلة', loc: 'مدنية' },
  { name: 'العاديات', loc: 'مكية' },
  { name: 'القارعة', loc: 'مكية' },
  { name: 'التكاثر', loc: 'مكية' },
  { name: 'العصر', loc: 'مكية' },
  { name: 'الهمزة', loc: 'مكية' },
  { name: 'الفيل', loc: 'مكية' },
  { name: 'قريش', loc: 'مكية' },
  { name: 'الماعون', loc: 'مكية' },
  { name: 'الكوثر', loc: 'مكية' },
  { name: 'الكافرون', loc: 'مكية' },
  { name: 'النصر', loc: 'مدنية' },
  { name: 'المسد', loc: 'مكية' },
  { name: 'الإخلاص', loc: 'مكية' },
  { name: 'الفلق', loc: 'مكية' },
  { name: 'الناس', loc: 'مكية' },
];

// ---------------------------------------------------------------------------
// Unicode marks embedded in the Tanzil text
// ---------------------------------------------------------------------------

const RUB_HIZB_CHAR = '\u06DE'; // ۞  quarter of hizb (rub' hizb) marker
const SAJDA_CHAR    = '\u06E9'; // ۩  sajda (prostration) marker

// ---------------------------------------------------------------------------
// Parse and strip marks from raw ayah text
// ---------------------------------------------------------------------------

function extractMarks(rawText: string): { text: string; marks: string[] } {
  const marks: string[] = [];
  let text = rawText;

  if (text.includes(RUB_HIZB_CHAR)) {
    marks.push("rub' hizb");
    text = text.replace(RUB_HIZB_CHAR, '').trim();
  }

  if (text.includes(SAJDA_CHAR)) {
    marks.push('sajda');
    text = text.replace(SAJDA_CHAR, '').trim();
  }

  return { text, marks };
}

// ---------------------------------------------------------------------------
// Parse source file into raw map: surahNumber → [{ayahNum, rawText}]
// ---------------------------------------------------------------------------

function parseSource(filePath: string): Map<number, Array<{ ayahNum: number; rawText: string }>> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const map = new Map<number, Array<{ ayahNum: number; rawText: string }>>();

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const pipeIdx1 = trimmed.indexOf('|');
    const pipeIdx2 = trimmed.indexOf('|', pipeIdx1 + 1);
    if (pipeIdx1 === -1 || pipeIdx2 === -1) continue;

    const surahNum = parseInt(trimmed.slice(0, pipeIdx1), 10);
    const ayahNum  = parseInt(trimmed.slice(pipeIdx1 + 1, pipeIdx2), 10);
    const rawText  = trimmed.slice(pipeIdx2 + 1).trim();

    if (!map.has(surahNum)) map.set(surahNum, []);
    map.get(surahNum)!.push({ ayahNum, rawText });
  }

  return map;
}

// ---------------------------------------------------------------------------
// Build corpus
// ---------------------------------------------------------------------------

function buildCorpus(
  rawMap: Map<number, Array<{ ayahNum: number; rawText: string }>>,
  basmalah: string,
): Surah[] {
  const surahs: Surah[] = [];

  for (let surahNum = 1; surahNum <= 114; surahNum++) {
    const rawList = rawMap.get(surahNum) ?? [];
    const meta    = SURAH_META[surahNum];
    const ayahs: Ayah[] = [];

    for (const { ayahNum, rawText } of rawList) {
      const isFatihah = surahNum === 1;
      const isTawbah  = surahNum === 9;
      const isFirstAyah = ayahNum === 1;

      if (isFirstAyah && !isFatihah && !isTawbah && rawText.startsWith(basmalah)) {
        // Separate basmalah (ayah 0) from the rest of ayah 1
        const remaining = rawText.slice(basmalah.length).trim();

        ayahs.push({ number: 0, text: basmalah });

        if (remaining) {
          const { text, marks } = extractMarks(remaining);
          const ayah: Ayah = { number: 1, text };
          if (marks.length) ayah.marks = marks;
          ayahs.push(ayah);
        }
      } else {
        const { text, marks } = extractMarks(rawText);
        const ayah: Ayah = { number: ayahNum, text };
        if (marks.length) ayah.marks = marks;
        ayahs.push(ayah);
      }
    }

    surahs.push({ number: surahNum, name: meta.name, loc: meta.loc, ayahs });
  }

  return surahs;
}

// ---------------------------------------------------------------------------
// XML serialisation
// ---------------------------------------------------------------------------

function buildXml(corpus: Corpus): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele('quran');

  // metadata element
  const meta = doc.ele('metadata');
  meta.ele('source').txt(corpus.metadata.source);
  meta.ele('version').txt(corpus.metadata.version);
  meta.ele('repository').txt(corpus.metadata.repository);
  meta.ele('website').txt(corpus.metadata.website);
  meta.ele('license').txt(corpus.metadata.license);
  meta.ele('termsOfUse').txt(corpus.metadata.termsOfUse);

  // surahs element
  const surahsEl = doc.ele('surahs');

  for (const surah of corpus.surahs) {
    const surahEl = surahsEl
      .ele('surah')
      .att('number', String(surah.number))
      .att('name', surah.name)
      .att('loc', surah.loc);

    for (const ayah of surah.ayahs) {
      const ayahEl = surahEl
        .ele('ayah')
        .att('number', String(ayah.number))
        .att('text', ayah.text);

      if (ayah.marks && ayah.marks.length) {
        const marksEl = ayahEl.ele('marks');
        for (const mark of ayah.marks) {
          marksEl.ele('mark').txt(mark);
        }
      }
    }
  }

  return doc.end({ prettyPrint: true });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const sourceFile = path.resolve(__dirname, 'quran-uthmani_all.txt');
  const destDir    = path.resolve(__dirname, '..', 'processed');

  if (!fs.existsSync(sourceFile)) {
    console.error(`Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  fs.mkdirSync(destDir, { recursive: true });

  console.log('Parsing source file…');
  const rawMap = parseSource(sourceFile);

  // Extract basmalah from surah 1 ayah 1 (it is the entire text of that ayah)
  const fatihahAyahs = rawMap.get(1);
  if (!fatihahAyahs?.length) {
    console.error('Could not find Al-Fatihah in source file');
    process.exit(1);
  }
  const basmalah = fatihahAyahs[0].rawText; // "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"

  console.log('Building corpus…');
  const surahs = buildCorpus(rawMap, basmalah);

  const metadata: Metadata = {
    source: 'Tanzil Project',
    version: 'Uthmani, Version 1.1',
    repository: 'dotquran/corpus',
    website: 'https://tanzil.net',
    license: 'Creative Commons Attribution 3.0',
    termsOfUse:
      'Permission is granted to copy and distribute verbatim copies of this text, ' +
      'but CHANGING IT IS NOT ALLOWED. ' +
      'This Quran text can be used in any website or application, provided that its ' +
      'source (Tanzil Project) is clearly indicated, and a link is made to tanzil.net ' +
      'to enable users to keep track of changes. ' +
      'This copyright notice shall be included in all verbatim copies of the text, ' +
      'and shall be reproduced appropriately in all files derived from or containing ' +
      'a substantial portion of this text.',
    processedBy: 'github.com/dotquran/corpus',
    processedAt: new Date().toUTCString(),
  };

  const corpus: Corpus = { metadata, surahs };

  // JSON
  const jsonPath = path.join(destDir, 'quran-uthmani.json');
  fs.writeFileSync(jsonPath, JSON.stringify(corpus, null, 2), 'utf-8');
  console.log(`Written: ${jsonPath}`);

  // YAML
  const yamlPath = path.join(destDir, 'quran-uthmani.yaml');
  fs.writeFileSync(
    yamlPath,
    yaml.dump(corpus, { lineWidth: -1 }),
    'utf-8',
  );
  console.log(`Written: ${yamlPath}`);

  // XML
  const xmlPath = path.join(destDir, 'quran-uthmani.xml');
  fs.writeFileSync(xmlPath, buildXml(corpus), 'utf-8');
  console.log(`Written: ${xmlPath}`);

  console.log('Done.');
}

main();
