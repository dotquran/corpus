# dotquran/corpus

Processes the [Tanzil](https://tanzil.net) Quran Uthmani text and produces structured output files in **JSON**, **YAML**, and **XML** formats — ready to consume in any application.

---

## Processed files (ready to use)

The `processed/` folder is committed to this repository. You can use the files directly via GitHub's raw URLs without cloning or running anything:

| Format | URL |
|--------|-----|
| JSON   | `https://raw.githubusercontent.com/dotquran/corpus/main/processed/quran-uthmani.json` |
| YAML   | `https://raw.githubusercontent.com/dotquran/corpus/main/processed/quran-uthmani.yaml` |
| XML    | `https://raw.githubusercontent.com/dotquran/corpus/main/processed/quran-uthmani.xml` |

---

## Output structure

Each file contains a top-level object with two fields: `metadata` and `surahs`.

### `metadata`

```json
{
  "source": "Tanzil Project",
  "version": "Uthmani, Version 1.1",
  "repository": "dotquran/corpus",
  "website": "https://tanzil.net",
  "license": "Creative Commons Attribution 3.0",
  "termsOfUse": "...",
  "processedBy": "github.com/dotquran/corpus",
  "processedAt": "Sat, 11 Apr 2026 14:19:46 GMT"
}
```

### `surahs`

An array of surah objects:

```json
{
  "number": 2,
  "name": "البقرة",
  "loc": "مدنية",
  "ayahs": [...]
}
```

- `loc` is either `مكية` (Makki) or `مدنية` (Madani).

### `ayahs`

Each surah contains an array of ayah objects:

```json
{ "number": 1, "text": "الٓمٓ" }
{ "number": 23, "text": "...", "marks": ["sajda"] }
{ "number": 26, "text": "...", "marks": ["rub' hizb"] }
```

- `marks` is optional and may contain `"sajda"` and/or `"rub' hizb"`.

### Basmalah handling

- **Surah 1 (Al-Fatihah):** the Basmalah is ayah **1** as it is counted as an actual verse.
- **Surah 9 (At-Tawbah):** no Basmalah.
- **All other surahs:** the Basmalah is separated from the first ayah and given ayah number **0**, keeping the original ayah numbering intact.

```json
{ "number": 0, "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ" },
{ "number": 1, "text": "الٓمٓ" }
```

---

## Running the generator

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run generate
```

Output files are written to `processed/`.

---

## Source

The Quran text is sourced from the [Tanzil Project](https://tanzil.net) (`source/quran-uthmani_all.txt`) and is used under the **Creative Commons Attribution 3.0** license. The text may not be modified. Any redistribution must credit Tanzil Project and link back to [tanzil.net](https://tanzil.net).
