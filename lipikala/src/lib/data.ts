import type { Era, EraKind, Lang, LangId, Surface } from './types'

export interface SurfaceStyle {
  bg: string
  ink: string
  inkOpacity: number
  mode: 'stone' | 'copper' | 'palm'
  shadow: string
  wrapBg: string
}

// ---------------------------------------------------------------------------
// LANGS / ERAS content below is historical research, ported unchanged from
// the original design (see ../../../Historically/Lipikala.dc.html). Each
// era is marked 'authentic' (its own script has a Unicode encoding, so the
// name is set in that script letter for letter) or 'approx' (the actual
// script of the period has no Unicode encoding, so the closest living
// descendant stands in — always disclosed via `approx`, never presented as
// the real thing). See the app's "How faithful is this?" panel.
// ---------------------------------------------------------------------------
export const LANGS: Lang[] = [
  { id: 'Tamil', name: 'Tamil', modern: 'Tamil' }, { id: 'Kannada', name: 'Kannada', modern: 'Kannada' }, { id: 'Telugu', name: 'Telugu', modern: 'Telugu' }, { id: 'Malayalam', name: 'Malayalam', modern: 'Malayalam' }, { id: 'Tulu', name: 'Tulu', modern: 'Kannada' },
  { id: 'Sanskrit', name: 'Sanskrit / Hindi', modern: 'Devanagari' }, { id: 'Marathi', name: 'Marathi', modern: 'Devanagari' }, { id: 'Punjabi', name: 'Punjabi', modern: 'Gurmukhi' }, { id: 'Kashmiri', name: 'Kashmiri', modern: 'Devanagari' }, { id: 'Maithili', name: 'Maithili / Bhojpuri', modern: 'Devanagari' }, { id: 'Gujarati', name: 'Gujarati', modern: 'Gujarati' },
  { id: 'Bengali', name: 'Bengali', modern: 'Bengali' }, { id: 'Assamese', name: 'Assamese', modern: 'Assamese' }, { id: 'Odia', name: 'Odia', modern: 'Oriya' }, { id: 'Sylheti', name: 'Sylheti', modern: 'Bengali' }, { id: 'Manipuri', name: 'Manipuri (Meitei)', modern: 'meeteiMayek' },
];
const A: EraKind = 'authentic'
const P: EraKind = 'approx'
export const ERAS: Record<LangId, Era[]> = {
  Tamil: [
    { id: 'tamil-brahmi', name: 'Tamil-Brahmi', years: '300 BCE – 300 CE', script: 'tamilBrahmi', kind: A, note: 'The oldest Tamil writing: short donative records cut into cave beds at Mangulam and scratched onto potsherds at Kodumanal and Keeladi. Traders and Jain monks adapted Ashokan Brahmi, adding four letters — ḻ, ḷ, ṟ, ṉ — for sounds Prakrit did not have.', approx: 'Set in the Unicode Brahmi script, which carries the four Tamil letters. Old Tamil scribes also marked short e and o with their own puḷḷi mark — a dot, distinct from the horizontal virama used elsewhere in Brahmi — so those are set here with the dedicated Old Tamil letters Unicode encodes for exactly this.' },
    { id: 'pallava', name: 'Pallava Grantha', years: '600 – 900 CE', script: 'grantha', kind: A, note: 'The chancery script of the Pallavas of Kanchipuram, seen on the shore temple and cave inscriptions of Mamallapuram. Grantha served chiefly for Sanskrit, but the rounded Tamil letters used today grew directly out of it. Everyday Tamil of the period was mostly written in Vatteluttu, which has no digital font yet.', approx: 'Set in the Unicode Grantha script. Grantha writes only long e and o. This is the same script — and the same encoding — as Malayalam’s Chera Grantha era: Grantha was one shared script for Sanskrit across the Tamil- and Malayalam-speaking regions, before either region’s own vernacular letters diverged from it.' },
    { id: 'chola', name: 'Chola Tamil', years: '900 – 1300 CE', script: 'Tamil', kind: P, note: 'The script of the great Chola temple walls — Thanjavur, Gangaikonda Cholapuram — recording land grants and gifts of lamps in long running lines. The letters are recognisably the modern ones, before the dots, loops and printing-era regularisation.', approx: 'Approximation: shown with modern Tamil letterforms. Chola forms differ in detail but not in structure; no Chola-era font exists.' },
  ],
  Kannada: [
    { id: 'ashokan', name: 'Ashokan Brahmi', years: '250 BCE – 300 CE', script: 'brahmi', kind: A, note: 'Ashoka’s minor rock edicts at Brahmagiri, Maski and Sannati are the earliest writing in Karnataka. Brahmi is the common ancestor of every Indian script; the Kannada letters descend from it through the Kadamba stage.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'kadamba', name: 'Kadamba · Halegannada', years: '450 – 900 CE', script: 'Telugu', kind: P, note: 'The Halmidi inscription (c. 450 CE) is the first text in Kannada, cut in the Kadamba script under the Kadambas of Banavasi. Kannada and Telugu shared one script until about 1300; the boxy Kadamba letters later rounded into the Telugu–Kannada forms of the Chalukyas and Rashtrakutas.', approx: 'Approximation: shown with modern Telugu letterforms, the sister branch of the shared Telugu–Kannada script. No Kadamba font exists.' },
    { id: 'hoysala', name: 'Hoysala Kannada', years: '1000 – 1300 CE', script: 'Kannada', kind: P, note: 'The Hoysalas of Belur and Halebidu covered their star-shaped temples with Kannada inscriptions in a rounded, cursive hand; the poets of the age — Ranna, Nagavarma, Nagachandra — wrote in Halegannada.', approx: 'Approximation: shown with modern Kannada letterforms. The medieval hand is rounder and lacks the later headstroke reforms.' },
  ],
  Telugu: [
    { id: 'bhattiprolu', name: 'Bhattiprolu Brahmi', years: '200 BCE – 300 CE', script: 'brahmi', kind: A, note: 'The relic caskets of the Bhattiprolu stupa in Guntur district carry a variant of Brahmi with unusual vowel signs — the earliest writing in the Telugu country, followed by the Satavahana and Ikshvaku records at Amaravati and Nagarjunakonda.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'vengi', name: 'Vengi Chalukya', years: '600 – 1000 CE', script: 'Kannada', kind: P, note: 'Under the Eastern Chalukyas of Vengi the Telugu–Kannada script took its rounded medieval form. The first full sentence in Telugu is on the Kalamalla inscription of c. 575 CE, and Nannaya’s Mahabharata (c. 1050) was written in this hand.', approx: 'Approximation: shown with modern Kannada letterforms, the sister branch of the shared Telugu–Kannada script. No Vengi-era font exists.' },
    { id: 'kakatiya', name: 'Kakatiya Telugu', years: '1100 – 1300 CE', script: 'Telugu', kind: P, note: 'The Kakatiyas of Warangal left thousands of stone records. By now Telugu stood apart from Kannada, with its own sweeping headstrokes and the check-mark talakattu.', approx: 'Approximation: shown with modern Telugu letterforms.' },
  ],
  Malayalam: [
    { id: 'edakkal', name: 'Tamil-Brahmi', years: '300 BCE – 300 CE', script: 'tamilBrahmi', kind: A, note: 'The Edakkal cave inscriptions in Wayanad and the Pattanam potsherds are Kerala’s earliest writing, in the same Tamil-Brahmi used across the Tamil country.', approx: 'Set in the Unicode Brahmi script, which carries the Dravidian letters ḻ, ḷ, ṟ and ṉ, plus the dedicated Old Tamil puḷḷi and short e/o this tradition also used.' },
    { id: 'chera-grantha', name: 'Chera Grantha', years: '800 – 1300 CE', script: 'grantha', kind: A, note: 'Grantha was the script of Sanskrit learning in Kerala’s temples and Brahmin settlements. Today’s Malayalam letters are its direct descendants — the ārya-eḻuttu — which absorbed Vatteluttu, the script of the 849 CE Tharisappalli plates, by the 1600s.', approx: 'Set in the Unicode Grantha script. Grantha writes only long e and o. This is the same script — and the same encoding — as Tamil’s Pallava Grantha era: Grantha was one shared script for Sanskrit across the Tamil- and Malayalam-speaking regions, before either region’s own vernacular letters diverged from it.' },
    { id: 'arya', name: 'Early Malayalam', years: '1300 – 1600 CE', script: 'Malayalam', kind: P, note: 'Ārya-eḻuttu, the Grantha-derived script used for Malayalam in palm-leaf manuscripts such as the Ramacharitam and Cherusseri’s Krishnagatha.', approx: 'Approximation: shown with modern Malayalam letterforms, in the traditional orthography before the 1971 reform.' },
  ],
  Sanskrit: [
    { id: 'ashokan', name: 'Ashokan Brahmi', years: '250 BCE – 300 CE', script: 'brahmi', kind: A, note: 'The script of Ashoka’s edicts from Kandahar to Odisha, deciphered by James Prinsep in 1837. Every script of India — and of Tibet and Southeast Asia — descends from it.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'siddham', name: 'Siddhamātṛkā', years: '600 – 1200 CE', script: 'siddham', kind: A, note: 'The Gupta script’s successor across north India, with sharp triangular heads on every letter. Buddhist monks carried it to China and Japan, where Siddhaṃ is still written by Shingon priests. Devanagari grew out of it.', approx: 'Set in the Unicode Siddhaṃ script.' },
    { id: 'sharada', name: 'Śāradā', years: '800 – 1200 CE', script: 'sharada', kind: A, note: 'Kashmir’s script of learning, in which the Nilamata Purana and Kalhana’s Rajatarangini were copied; Gurmukhi descends from it.', approx: 'Set in the Unicode Śāradā script.' },
    { id: 'nandinagari', name: 'Nandinagari', years: '1100 – 1600 CE', script: 'nandinagari', kind: A, note: 'The southern cousin of Devanagari, used for Sanskrit in Karnataka and Andhra — the script of the Vijayanagara copper plates and of Madhva’s manuscripts.', approx: 'Set in the Unicode Nandinagari script.' },
    { id: 'kaithi', name: 'Kaithi', years: '1500 – 1900 CE', script: 'kaithi', kind: A, note: 'While Devanagari stayed the script of Sanskrit learning, everyday Hindi across Bihar and the eastern Gangetic plain — letters, deeds, account books — was written in Kaithi, the scribes’ (kāyastha) hand. The British made it the official script of Bihar’s courts in 1880; Devanagari replaced it only in the twentieth century.', approx: 'Set in the Unicode Kaithi script, which writes only long e and o.' },
  ],
  Marathi: [
    { id: 'naneghat', name: 'Brahmi · Satavahana', years: '200 BCE – 300 CE', script: 'brahmi', kind: A, note: 'The oldest writing in Maharashtra: the Naneghat cave record of the Satavahana queen Naganika (1st c. BCE) and the donative inscriptions of the Buddhist caves at Bhaja, Karle and Nasik, all Prakrit in Brahmi.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'old-nagari', name: 'Old Nāgarī · Yadava', years: '1000 – 1300 CE', script: 'Devanagari', kind: P, note: 'The first Marathi sentences — the Akshi stone of 1012 and the Dive Agar copper plate of 1060 — are cut in the Nāgarī of the Shilaharas and Yadavas; the Dnyaneshwari (1290) was composed under the Yadavas of Devgiri.', approx: 'Approximation: shown with modern Devanagari letterforms. The medieval Nāgarī hand has no font of its own.' },
    { id: 'modi', name: 'Modi', years: '1300 – 1950 CE', script: 'modi', kind: A, note: 'Modi — “twisted”, for its unbroken cursive line — is the script of Marathi administration from the Yadavas through Shivaji and the Peshwas. Tradition credits it to Hemadpant, the Yadava minister; the Pune archives hold millions of Modi letters, deeds and revenue rolls. Balbodh Devanagari replaced it in schools and offices in the 1950s.', approx: 'Set in the Unicode Modi script.' },
  ],
  Punjabi: [
    { id: 'topra', name: 'Ashokan Brahmi', years: '250 BCE – 300 CE', script: 'brahmi', kind: A, note: 'Ashoka’s pillar from Topra, now in Delhi, carries his edicts in Brahmi; around Taxila the same edicts were cut in Kharoshthi, the right-to-left script of the north-west that died out by the fourth century.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'sharada', name: 'Śāradā', years: '800 – 1200 CE', script: 'sharada', kind: A, note: 'The script of Kashmir spread across the whole north-west, Punjab included; the Gurmukhi letters descend from it, by way of the fast Laṇḍā hands of the plains.', approx: 'Set in the Unicode Śāradā script.' },
    { id: 'mahajani', name: 'Laṇḍā · Mahajani', years: '1200 – 1900 CE', script: 'mahajani', kind: A, note: 'Laṇḍā (“tail-less”) is the family of clipped trading hands used across Punjab and Sindh before Gurmukhi. Mahajani, the bookkeeping script of Punjabi and Marwari merchants, is the one Unicode has encoded: no vowel signs, no virama — a shorthand for the bahi-khata, notoriously hard to read outside the family that wrote it.', approx: 'Set in the Unicode Mahajani script. It has no vowel signs: a vowel after a consonant is written with the independent letter, and long vowels merge with short.' },
    { id: 'takri', name: 'Takri · hill states', years: '1500 – 1900 CE', script: 'takri', kind: A, note: 'In the Punjab hills — Chamba, Kangra, Jammu — Śāradā’s other descendant, Takri, served the courts for Dogri and Pahari: royal grants, temple records and the inscriptions on Pahari miniatures.', approx: 'Set in the Unicode Takri script, which writes only long e and o.' },
    { id: 'gurmukhi', name: 'Gurmukhi · Adi Granth', years: '1540 – 1800 CE', script: 'Gurmukhi', kind: P, note: 'Guru Angad standardised the Laṇḍā letters into Gurmukhi — “from the Guru’s mouth” — in the 1540s, and the Adi Granth compiled by Guru Arjan in 1604 fixed the script for good.', approx: 'Approximation: shown with modern Gurmukhi letterforms; the sixteenth-century hand differs in detail.' },
  ],
  Kashmiri: [
    { id: 'kushan', name: 'Brahmi · Kushan', years: '100 – 600 CE', script: 'brahmi', kind: A, note: 'Kashmir’s earliest records — Kushan and Gupta-era stone and terracotta inscriptions — are in the north-western Brahmi from which Śāradā would grow.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'sharada', name: 'Śāradā', years: '800 – 1500 CE', script: 'sharada', kind: A, note: 'Kashmir’s own script, named for the goddess of learning whose shrine stood in the valley: Kalhana’s Rajatarangini (1148), the Nilamata Purana and the whole Sanskrit literature of Kashmir were written in it, and Kashmiri Pandits kept it for horoscopes and ritual into the twentieth century.', approx: 'Set in the Unicode Śāradā script.' },
    { id: 'devanagari', name: 'Devanagari', years: '1900 CE – today', script: 'Devanagari', kind: P, note: 'From the Sultanate onward Persian was the script of the court, and Kashmiri came to be written in Perso-Arabic letters; Kashmiri Pandits adopted Devanagari, with extra marks for the vowels Kashmiri has and Hindi does not.', approx: 'Approximation: shown with modern Devanagari letterforms, without the Kashmiri-specific vowel marks.' },
  ],
  Maithili: [
    { id: 'lauriya', name: 'Ashokan Brahmi', years: '250 BCE – 300 CE', script: 'brahmi', kind: A, note: 'Ashoka’s pillars at Lauriya Nandangarh, Lauriya Araraj and Rampurva stand in the Mithila country, and Vaishali, the Licchavi capital, has Brahmi records of its own — the oldest writing in Bihar.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'tirhuta', name: 'Tirhuta · Mithilākṣar', years: '1300 – 1950 CE', script: 'tirhuta', kind: A, note: 'Mithila’s own script, a sibling of Bengali: Vidyapati’s songs (c. 1400), the pañjī genealogies of the Maithil Brahmins and the correspondence of the Darbhanga Raj were all written in Tirhuta. It is one of the few scripts with signs for Maithili’s short e and o.', approx: 'Set in the Unicode Tirhuta script.' },
    { id: 'kaithi', name: 'Kaithi', years: '1500 – 1950 CE', script: 'kaithi', kind: A, note: 'Alongside Tirhuta, the everyday script of the whole Bihar plain — Bhojpuri, Magahi and Maithili alike — was Kaithi, the scribes’ hand: deeds, letters, account books, and the official script of Bihar’s courts from 1880.', approx: 'Set in the Unicode Kaithi script, which writes only long e and o.' },
  ],
  Tulu: [
    { id: 'grantha', name: 'Grantha', years: '700 – 1300 CE', script: 'grantha', kind: A, note: 'Tulu Nadu’s own script, Tigalari, grew out of Grantha, carried up the coast by the Brahmin settlements of Malabar; the Alupa kings’ stone records, meanwhile, were cut in the Kadamba-derived Kannada of the day.', approx: 'Set in the Unicode Grantha script, the ancestor of Tigalari. Grantha writes only long e and o.' },
    { id: 'tigalari', name: 'Tigalari', years: '1300 – 1900 CE', script: 'Malayalam', kind: P, note: 'The Tulu script proper: Madhva’s works at Udupi, Arunabja’s Tulu Mahabharato (15th c.) and the Devi Mahatme were all written on palm leaf in Tigalari, and the Basel Mission’s first Tulu books of the 1840s abandoned it for Kannada.', approx: 'Approximation: Unicode encoded Tulu-Tigalari in 2024, but no web font ships yet, so its closest sister — Malayalam, from the same Grantha stem — stands in.' },
    { id: 'kannada', name: 'Kannada', years: '1900 CE – today', script: 'Kannada', kind: P, note: 'Printing and schooling fixed Kannada as Tulu’s everyday script from the late nineteenth century; Tigalari survives in temple manuscripts and a growing revival.', approx: 'Approximation: shown with modern Kannada letterforms.' },
  ],
  Assamese: [
    { id: 'umachal', name: 'Brahmi · Kamarupa', years: '400 – 650 CE', script: 'brahmi', kind: A, note: 'The Umachal rock inscription on Nilachal hill and the Nagajari-Khanikargaon rock in Golaghat, both fifth-century, are Assam’s earliest writing — Sanskrit in the late Brahmi of the Gupta age.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'kamarupi', name: 'Siddhamātṛkā · Kamarupi', years: '650 – 1200 CE', script: 'siddham', kind: A, note: 'The copper plates of the Varman, Mlechchha and Pala kings of Kamarupa — Bhaskaravarman’s Nidhanpur grant among them — are in the eastern Siddhamātṛkā from which the Assamese letters descend.', approx: 'Set in the Unicode Siddhaṃ script.' },
    { id: 'old-assamese', name: 'Old Assamese', years: '1300 – 1850 CE', script: 'Assamese', kind: P, note: 'Three hands grew from the medieval script: Bamuniya for Sanskrit, Garhgaya for the Ahom court’s Buranji chronicles, and Kaitheli (Lakhari) for Sankardeva’s plays and the Charit Puthis. The Ahom kings’ own Tai script, Ahom, was used beside them until the eighteenth century.', approx: 'Approximation: shown with modern Assamese letterforms, with the Assamese ৰ. Ahom has a Unicode encoding but no web font yet.' },
  ],
  Sylheti: [
    { id: 'paschimbhag', name: 'Siddhamātṛkā · Pala', years: '750 – 1100 CE', script: 'siddham', kind: A, note: 'The Paschimbhag copper plate of Srichandra (c. 930), found in Sylhet, records a grant to Brahmin settlements in the late Siddhamātṛkā of the Pala and Chandra kings.', approx: 'Set in the Unicode Siddhaṃ script.' },
    { id: 'gaudi', name: 'Proto-Bengali · Gauḍī', years: '1100 – 1400 CE', script: 'Bengali', kind: P, note: 'Under the Senas and the first Sultans of Bengal the Gauḍī script gave the Bengali letters their shape; Sylhet came under the Sultanate with Shah Jalal in 1303.', approx: 'Approximation: shown with modern Bengali letterforms.' },
    { id: 'syloti-nagri', name: 'Syloti Nagri', years: '1400 – 1970 CE', script: 'sylotiNagri', kind: A, note: 'Sylhet’s own script, a simplified Nāgarī probably carried east by Sufi settlers: the puthi literature — Sadeq Ali’s Halat-un-Nabi above all — was written and, from 1870, printed in it at the Islamia Press in Sylhet, until the press closed in the 1970s.', approx: 'Set in the Unicode Syloti Nagri script. Like Bengali, the inherent vowel is o; there is no long ā letter, so ā is spelled with the a-letter and its sign, and long vowels merge with short.' },
  ],
  Manipuri: [
    { id: 'puya', name: 'Meitei Mayek · Puya', years: '1100 – 1700 CE', script: 'meeteiMayek', kind: A, note: 'Manipur’s own script, on the copper plates of the Meitei kings and in the Puya manuscripts — chronicles, ritual and genealogy — kept by the maichou scholars. Each letter is named for a part of the body: kok (head), sam (hair), lai (forehead), mit (eye).', approx: 'Set in the Unicode Meitei Mayek script, including the letters of the older, fuller alphabet.' },
    { id: 'bengali', name: 'Bengali script', years: '1700 – 1980 CE', script: 'Bengali', kind: A, note: 'After King Pamheiba (Garib Niwaz) adopted Vaishnavism in the early eighteenth century, the Bengali script replaced Meitei Mayek and the old Puyas were burnt; Manipuri was written in Bengali letters for two and a half centuries.', approx: 'Set in the Unicode Bengali script, as Manipuri was actually written in this period.' },
    { id: 'revival', name: 'Meitei Mayek · revived', years: '1980 CE – today', script: 'meeteiMayek', kind: A, note: 'A revival movement restored the script from the 1980s; Manipur’s schools have taught it since 2005, and it now appears on signboards, newspapers and the state’s official documents.', approx: 'Set in the Unicode Meitei Mayek script, in the revived 27-letter orthography.' },
  ],
  Bengali: [
    { id: 'mahasthan', name: 'Brahmi', years: '300 BCE – 300 CE', script: 'brahmi', kind: A, note: 'The Mahasthangarh stone from Bogra is Bengal’s oldest inscription, in a Brahmi close to Ashoka’s own.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'pala', name: 'Siddhamātṛkā · Pala', years: '750 – 1100 CE', script: 'siddham', kind: A, note: 'The Palas of Bengal and Bihar wrote in late Siddhamātṛkā. The Bengali letters — with their headline and hooked tails — began to emerge from it in the eleventh century.', approx: 'Set in the Unicode Siddhaṃ script.' },
    { id: 'bhaiksuki', name: 'Bhaiksuki', years: '1000 – 1200 CE', script: 'bhaiksuki', kind: A, note: 'The “arrow-headed” script of Buddhist monks in eastern India, known from a handful of manuscripts such as the Candrālaṃkāra and a few inscriptions around Bengal.', approx: 'Set in the Unicode Bhaiksuki script.' },
    { id: 'gaudi', name: 'Proto-Bengali · Gauḍī', years: '1200 – 1500 CE', script: 'Bengali', kind: P, note: 'Under the Senas and the early Sultans the Gauḍī script set the pattern for Bengali, Assamese and Maithili; Chandidas and Krittibas were copied in it.', approx: 'Approximation: shown with modern Bengali letterforms.' },
  ],
  Gujarati: [
    { id: 'girnar', name: 'Ashokan Brahmi', years: '250 BCE – 300 CE', script: 'brahmi', kind: A, note: 'The Girnar rock at Junagadh carries all fourteen of Ashoka’s major edicts — Gujarat’s first writing — beside the later records of Rudradaman and Skandagupta.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'valabhi', name: 'Gupta · Siddhamātṛkā', years: '500 – 1000 CE', script: 'siddham', kind: A, note: 'Under the Maitrakas of Valabhi and the Gurjara-Pratiharas, Gujarat wrote in the Gupta script and its Siddhamātṛkā successor.', approx: 'Set in the Unicode Siddhaṃ script.' },
    { id: 'nagari', name: 'Old Nāgarī', years: '1000 – 1400 CE', script: 'Devanagari', kind: P, note: 'The Solanki kings of Patan and the Jain libraries wrote in Nāgarī. Gujarati emerged as a merchant’s fast hand that dropped the headline in the 1500s.', approx: 'Approximation: shown with modern Devanagari letterforms.' },
  ],
  Odia: [
    { id: 'hathigumpha', name: 'Brahmi · Hathigumpha', years: '100 BCE – 300 CE', script: 'brahmi', kind: A, note: 'King Kharavela’s Hathigumpha inscription at Udayagiri, above Bhubaneswar, is Odisha’s founding document, in Brahmi; Ashoka’s Dhauli and Jaugada edicts are older still.', approx: 'Set in the Unicode Brahmi script.' },
    { id: 'bhauma', name: 'Siddhamātṛkā', years: '700 – 1100 CE', script: 'siddham', kind: A, note: 'The Bhauma-Kara and Somavamsi kings wrote their copper plates in Siddhamātṛkā, from which the Kalinga script grew.', approx: 'Set in the Unicode Siddhaṃ script.' },
    { id: 'kalinga', name: 'Kalinga · Proto-Odia', years: '1100 – 1500 CE', script: 'Oriya', kind: P, note: 'The Eastern Gangas, builders of Puri and Konark, developed the Kalinga script whose letters curved into rounded hoods — said to suit the palm leaf, where straight strokes tear the fibre.', approx: 'Approximation: shown with modern Odia letterforms.' },
  ],
};
export const SURF: Record<Surface, SurfaceStyle> = {
  stone: {
    bg: `radial-gradient(circle at 18% 12%, rgba(0,0,0,.55) 0 3%, transparent 4%),
      radial-gradient(circle at 62% 8%, rgba(0,0,0,.5) 0 2.5%, transparent 3.5%),
      radial-gradient(circle at 84% 38%, rgba(0,0,0,.5) 0 3%, transparent 4%),
      radial-gradient(circle at 30% 62%, rgba(0,0,0,.45) 0 2%, transparent 3%),
      radial-gradient(circle at 70% 78%, rgba(0,0,0,.5) 0 2.5%, transparent 3.5%),
      repeating-radial-gradient(circle at 10% 10%, rgba(255,255,255,.05) 0 1px, transparent 1px 5px),
      repeating-radial-gradient(circle at 80% 60%, rgba(0,0,0,.12) 0 1px, transparent 1px 6px),
      radial-gradient(ellipse at 30% 20%, #6b6862 0%, #504c46 45%, #3a3733 75%, #2c2a26 100%)`,
    ink: '#e9e2d2', inkOpacity: .82, mode: 'stone',
    shadow: '0 1px 1px rgba(0,0,0,.75), 0 -1px 0 rgba(255,248,230,.12)', wrapBg: '#1e1c19',
  },
  copper: {
    bg: `repeating-linear-gradient(100deg, rgba(0,0,0,.08) 0 2px, transparent 2px 26px),
      radial-gradient(circle at 15% 20%, rgba(70,110,80,.35) 0 12%, transparent 45%),
      radial-gradient(circle at 80% 70%, rgba(60,95,70,.3) 0 15%, transparent 50%),
      radial-gradient(circle at 60% 15%, rgba(120,150,110,.22) 0 10%, transparent 40%),
      linear-gradient(135deg, #6f7a52 0%, #97835a 30%, #8b9468 48%, #6a6540 65%, #4f5c3e 100%)`,
    ink: '#241a0d', inkOpacity: .88, mode: 'copper',
    shadow: '0 1px 0 rgba(220,230,190,.35), 0 -1px 0 rgba(20,15,5,.55)', wrapBg: '#2b2a1d',
  },
  palm: {
    bg: `repeating-linear-gradient(180deg, rgba(90,65,25,.15) 0 1px, transparent 1px 7px),
      repeating-linear-gradient(178deg, rgba(255,245,210,.12) 0 1px, transparent 1px 14px),
      radial-gradient(ellipse at 20% 30%, rgba(140,100,40,.18), transparent 55%),
      radial-gradient(ellipse at 80% 75%, rgba(90,60,20,.2), transparent 55%),
      linear-gradient(90deg, #b99a5e, #d4b978 45%, #cdae6d 70%, #a9884f)`,
    ink: '#2c2013', inkOpacity: .85, mode: 'palm',
    shadow: '0 0 1px rgba(50,35,10,.4)', wrapBg: '#8a723f',
  },
};

