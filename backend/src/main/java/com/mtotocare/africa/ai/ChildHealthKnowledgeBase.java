package com.mtotocare.africa.ai;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A compact, WHO / Tanzania Ministry of Health-aligned child-health
 * knowledge base, organized by topic and language. Two jobs:
 *
 *  1. Grounding for the real AI: relevant excerpts get injected into the
 *     system prompt for the detected topic, so the model answers with
 *     MtotoCare/Tanzania-specific facts (EPI schedule, WHO danger signs,
 *     etc.) instead of generic global advice.
 *  2. A much better OFFLINE fallback than a handful of one-paragraph
 *     canned replies — used when no AI provider is configured or a call
 *     fails, so a bad network day doesn't mean a useless answer.
 *
 * Content deliberately stays at the level of general public-health
 * guidance — WHO-published cutoffs, recognized danger signs, standard
 * feeding/vaccination guidance — and never includes specific drug names,
 * dosages, or diagnoses. Every topic ends by pointing to a health
 * worker for anything beyond general guidance; the medical disclaimer is
 * still appended separately by the caller.
 */
public final class ChildHealthKnowledgeBase {

    private ChildHealthKnowledgeBase() {}

    /** topic -> { "en": "...", "sw": "..." } */
    private static final Map<String, Map<String, String>> TOPICS = new LinkedHashMap<>();

    private static void topic(String key, String en, String sw) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("en", en);
        m.put("sw", sw);
        TOPICS.put(key, m);
    }

    static {
        topic("VACCINATION",
            "Tanzania's EPI (Expanded Programme on Immunization) schedule covers 13 antigens from birth to 18 months: " +
            "BCG and OPV0 at birth; OPV1/Penta1/PCV1/Rota1 at 6 weeks; OPV2/Penta2/PCV2/Rota2 at 10 weeks; " +
            "OPV3/Penta3/PCV3/IPV at 14 weeks; Measles-Rubella 1 and Yellow Fever at 9 months; Measles-Rubella 2 at 18 months. " +
            "Vaccines are free at all government health facilities. Mild fever or soreness at the injection site for a day or two is " +
            "normal; high fever, unusual drowsiness, or a rash that doesn't fade needs medical attention. " +
            "A missed dose does not mean starting over — bring the child's card to any facility to catch up.",

            "Ratiba ya chanjo Tanzania (EPI) inajumuisha chanjo 13 kutoka kuzaliwa hadi miezi 18: " +
            "BCG na OPV0 wakati wa kuzaliwa; OPV1/Penta1/PCV1/Rota1 wiki 6; OPV2/Penta2/PCV2/Rota2 wiki 10; " +
            "OPV3/Penta3/PCV3/IPV wiki 14; Surua-Rubella 1 na Homa ya Manjano miezi 9; Surua-Rubella 2 miezi 18. " +
            "Chanjo ni bure katika vituo vyote vya afya vya serikali. Homa kidogo au maumivu mahali pa sindano kwa siku moja au mbili ni kawaida; " +
            "homa kali, usingizi usio wa kawaida, au vipele visivyoisha vinahitaji uangalizi wa haraka. " +
            "Kukosa dozi moja hakumaanishi kuanza upya — leta kadi ya mtoto kituo chochote cha afya kuendelea.");

        topic("NUTRITION",
            "0-6 months: exclusive breastfeeding only — no water, porridge, or other foods. " +
            "6-8 months: start soft, mashed complementary foods (porridge, mashed vegetables/fruit) 2-3 times/day alongside continued breastfeeding. " +
            "9-11 months: 3-4 times/day plus a snack, thicker textures, introduce protein (egg, fish, beans, groundnut paste). " +
            "12-23 months: 3 family meals plus 1-2 snacks/day, continue breastfeeding, family foods cut small. " +
            "A varied diet with a protein source, a vegetable/fruit, and a staple (rice/ugali/potato) at each meal supports healthy growth. " +
            "Avoid added sugar, salt, and honey (risk of botulism) before 12 months.",

            "Miezi 0-6: kunyonyesha maziwa ya mama pekee — bila maji, uji, au vyakula vingine. " +
            "Miezi 6-8: anzisha vyakula laini vilivyopondwa (uji, mboga/matunda yaliyopondwa) mara 2-3 kwa siku pamoja na kuendelea kunyonyesha. " +
            "Miezi 9-11: mara 3-4 kwa siku pamoja na vitafunwa, muundo mzito zaidi, anzisha protini (yai, samaki, maharage, karanga). " +
            "Miezi 12-23: milo 3 ya familia pamoja na vitafunwa 1-2 kwa siku, endelea kunyonyesha, vyakula vya familia vikatwe vidogo. " +
            "Chakula chenye aina mbalimbali chenye chanzo cha protini, mboga/tunda, na wanga (mchele/ugali/viazi) kwa kila mlo kinasaidia ukuaji mzuri. " +
            "Epuka sukari iliyoongezwa, chumvi, na asali kabla ya mwaka 1 (hatari ya botulism).");

        topic("FEVER",
            "A fever is a temperature at or above 38°C (100.4°F). For most children, fever itself is the body fighting infection, not " +
            "an illness on its own. Home care: keep the child hydrated, dress lightly, keep the room cool, and monitor closely. " +
            "Seek care URGENTLY if fever is in a baby under 3 months, lasts more than 2-3 days, is above 39°C, or comes with: " +
            "stiff neck, repeated vomiting, difficulty breathing, unusual drowsiness or irritability, a rash that doesn't fade when pressed, " +
            "or convulsions.",

            "Homa ni joto la mwili 38°C (100.4°F) au zaidi. Kwa watoto wengi, homa yenyewe ni mwili ukipambana na maambukizi, siyo ugonjwa wenyewe. " +
            "Huduma nyumbani: mpe maji ya kutosha, mvalishe nguo nyepesi, weka chumba baridi, na mfuatilie kwa karibu. " +
            "Tafuta huduma HARAKA kama homa ipo kwa mtoto chini ya miezi 3, imedumu zaidi ya siku 2-3, ni zaidi ya 39°C, au ipo pamoja na: " +
            "shingo ngumu, kutapika mara kwa mara, kushindwa kupumua vizuri, usingizi/kero isiyo ya kawaida, vipele visivyofifia ukibonyeza, au kifafa.");

        topic("DIARRHEA",
            "Diarrhea is dangerous mainly because of dehydration, not the stools themselves. Continue breastfeeding/feeding — do not " +
            "withhold food. Give extra fluids and, if available, Oral Rehydration Solution (ORS) after every loose stool. " +
            "Danger signs needing urgent care: blood in stool, more than 3 days of diarrhea, signs of dehydration (sunken eyes, very little " +
            "urine, no tears when crying, lethargy, drinking poorly or unable to drink), high fever, or repeated vomiting. " +
            "Zinc supplementation alongside ORS is standard WHO guidance for children with diarrhea — ask at your health facility.",

            "Kuhara ni hatari zaidi kwa sababu ya upungufu wa maji mwilini, siyo choo chenyewe. Endelea kunyonyesha/kulisha — usimzuie chakula. " +
            "Mpe maji ya ziada na, kama yapo, maji ya ORS (Oral Rehydration Solution) baada ya kila choo cha kuhara. " +
            "Dalili za hatari zinazohitaji huduma ya haraka: damu kwenye choo, kuhara kwa zaidi ya siku 3, dalili za upungufu wa maji " +
            "(macho yaliyozama, mkojo kidogo sana, hakuna machozi akilia, uchovu, kunywa vibaya au kushindwa kunywa), homa kali, au kutapika mara kwa mara. " +
            "Kuongeza zinki pamoja na ORS ni mwongozo wa kawaida wa WHO kwa watoto wenye kuhara — uliza kituo chako cha afya.");

        topic("COUGH_COLD",
            "Most coughs and colds in children are viral and resolve in 7-10 days without medication. Home care: extra fluids, saline " +
            "nose drops for congestion in infants, rest, and continued feeding. Honey (over 12 months only) can soothe a cough. " +
            "Seek care if: breathing is fast or labored, there's chest indrawing (skin pulling in between/below ribs with each breath), " +
            "wheezing, bluish lips, fever over 3 days, ear pain, or the child is under 3 months with any fever.",

            "Vikohozi na mafua mengi kwa watoto ni ya virusi na huisha ndani ya siku 7-10 bila dawa. Huduma nyumbani: maji ya ziada, matone " +
            "ya chumvi puani kwa msongamano kwa watoto wachanga, mapumziko, na kuendelea kulisha. Asali (kwa zaidi ya mwaka 1 tu) inaweza kupunguza kikohozi. " +
            "Tafuta huduma kama: kupumua ni haraka au kwa shida, kifua kinajibonyeza (ngozi inavutwa kati/chini ya mbavu kila pumzi), " +
            "sauti ya filimbi anapopumua, midomo ya buluu, homa zaidi ya siku 3, maumivu ya sikio, au mtoto ni chini ya miezi 3 na ana homa yoyote.");

        topic("GROWTH",
            "Growth is tracked against WHO Child Growth Standards using weight-for-age, height-for-age, weight-for-height, and BMI-for-age. " +
            "Steady growth along a child's own curve matters more than any single measurement. Warning signs: flat or falling weight over " +
            "two visits, very low weight-for-height (wasting), or short stature for age (stunting) — these need a full assessment by a " +
            "health worker, who can check for underlying causes and give a feeding plan. Regular growth monitoring visits (monthly under 1 " +
            "year, then quarterly) catch problems early, when they're easiest to treat.",

            "Ukuaji unafuatiliwa kwa Kiwango cha WHO cha Ukuaji wa Mtoto kwa kutumia uzito-kwa-umri, urefu-kwa-umri, uzito-kwa-urefu, na BMI-kwa-umri. " +
            "Ukuaji thabiti kwenye mkondo wa mtoto mwenyewe ni muhimu zaidi kuliko kipimo kimoja. Dalili za tahadhari: uzito uliosimama au kushuka " +
            "kwa vipimo viwili mfululizo, uzito mdogo sana kulingana na urefu (kudhoofika), au urefu mfupi kulingana na umri (kudumaa) — hizi " +
            "zinahitaji tathmini kamili na mtoa huduma wa afya, anayeweza kuangalia chanzo na kutoa mpango wa lishe. Ziara za mara kwa mara za " +
            "kufuatilia ukuaji (kila mwezi chini ya mwaka 1, kisha kila robo mwaka) hubaini matatizo mapema, wakati ni rahisi zaidi kutibu.");

        topic("PREGNANCY",
            "WHO recommends at least 8 antenatal care (ANC) contacts during pregnancy for a healthy outcome for both mother and baby. " +
            "Key things covered at ANC visits: blood pressure, weight, urine tests, iron/folic acid supplementation, tetanus vaccination, " +
            "malaria prevention, and HIV testing/counseling where relevant. Danger signs requiring immediate care at any stage: vaginal " +
            "bleeding, severe headache with blurred vision, severe abdominal pain, reduced fetal movement, fever, or convulsions.",

            "WHO inapendekeza mawasiliano angalau 8 ya kliniki ya wajawazito (ANC) wakati wa ujauzito kwa matokeo mazuri kwa mama na mtoto. " +
            "Mambo makuu yanayofanywa kliniki ya ANC: shinikizo la damu, uzito, vipimo vya mkojo, virutubisho vya madini ya chuma/folic acid, " +
            "chanjo ya pepopunda, kinga dhidi ya malaria, na kipimo/ushauri wa VVU inapohitajika. Dalili za hatari zinazohitaji huduma ya haraka " +
            "wakati wowote: kutokwa damu ukeni, maumivu makali ya kichwa yenye kuona hafifu, maumivu makali ya tumbo, kupungua kwa mchezo wa mtoto tumboni, homa, au kifafa.");

        topic("MALNUTRITION",
            "Warning signs of acute malnutrition: visible severe wasting (very thin arms/legs, loose skin folds), bilateral pitting oedema " +
            "(swelling in both feet that leaves a dent when pressed — always an emergency sign), or a mid-upper arm circumference (MUAC) " +
            "under 11.5cm in children 6-59 months. Any of these needs urgent assessment at a health facility — acute malnutrition is " +
            "treatable, especially when caught early, but oedema and severe wasting can be life-threatening if untreated.",

            "Dalili za tahadhari za utapiamlo mkali: kudhoofika kunakoonekana wazi (mikono/miguu myembamba sana, ngozi iliyolegea), " +
            "uvimbe wa miguu yote miwili unaobaki na tundu ukibonyeza (daima ni dalili ya dharura), au kipimo cha mkono wa juu (MUAC) chini " +
            "ya sentimeta 11.5 kwa watoto wa miezi 6-59. Yoyote kati ya hizi inahitaji tathmini ya haraka kituo cha afya — utapiamlo mkali " +
            "unatibika, hasa ukibainika mapema, lakini uvimbe na kudhoofika sana vinaweza kuhatarisha maisha bila matibabu.");

        topic("DEVELOPMENT",
            "Rough developmental milestones (every child varies): by 6 months — sits with support, babbles, reaches for objects; " +
            "by 12 months — pulls to stand, says 1-2 words, responds to name; by 18 months — walks alone, says several words, points to " +
            "wanted objects; by 24 months — runs, 2-word phrases, follows simple instructions; by 36 months — short sentences, plays " +
            "alongside other children. A delay in one area alone is often not concerning, but losing a skill the child previously had, " +
            "or delays across multiple areas, should be checked by a health worker.",

            "Alama za ukuaji (kila mtoto hutofautiana): kufikia miezi 6 — anakaa akisaidiwa, anabweta, anafikia vitu; " +
            "kufikia mwaka 1 — anajivuta kusimama, anasema neno 1-2, anaitikia jina lake; kufikia miezi 18 — anatembea peke yake, anasema " +
            "maneno kadhaa, anaonyesha kidole kwa kitu anachotaka; kufikia miaka 2 — anakimbia, sentensi za maneno 2, anafuata maelekezo rahisi; " +
            "kufikia miaka 3 — sentensi fupi, anacheza pamoja na watoto wengine. Kuchelewa eneo moja tu mara nyingi si tatizo kubwa, lakini " +
            "kupoteza uwezo alionao mtoto awali, au kuchelewa maeneo mengi, kunapaswa kuangaliwa na mtoa huduma wa afya.");

        topic("BREASTFEEDING",
            "Exclusive breastfeeding for the first 6 months (no water, formula, or other foods/liquids) gives a baby everything they need " +
            "and protects against infection. Feed on demand — typically 8-12 times per day for a newborn. Signs baby is feeding well: " +
            "6+ wet nappies/day by day 5, steady weight gain, audible swallowing. If breastfeeding is painful, the baby seems constantly " +
            "unsatisfied, or weight gain is slow, a health worker or lactation counselor can help — most breastfeeding problems are fixable.",

            "Kunyonyesha maziwa ya mama pekee kwa miezi 6 ya kwanza (bila maji, formula, au vyakula/vimiminika vingine) humpa mtoto kila " +
            "kitu anachohitaji na kumkinga dhidi ya maambukizi. Mnyonyeshe anapohitaji — kwa kawaida mara 8-12 kwa siku kwa mtoto mchanga. " +
            "Dalili za kunyonya vizuri: nepi 6+ zenye unyevu kwa siku ifikapo siku ya 5, kuongezeka uzito thabiti, sauti ya kumeza. " +
            "Kama kunyonyesha kunauma, mtoto anaonekana hajaridhika daima, au kuongezeka uzito ni pole pole, mtoa huduma wa afya anaweza kusaidia " +
            "— matatizo mengi ya kunyonyesha yanatatulika.");

        topic("SKIN_RASH",
            "Most childhood rashes are mild (heat rash, mild eczema, insect bites) and clear on their own with gentle skin care — keep the " +
            "area clean and dry, avoid harsh soaps. Seek care if a rash: doesn't fade when you press a glass against it (a possible sign of " +
            "meningococcal disease), spreads rapidly, blisters, comes with high fever, or the child seems unwell overall — not just the skin.",

            "Vipele vingi vya utotoni ni vidogo (upele wa joto, eczema kidogo, kuumwa na wadudu) na hupona vyenyewe kwa uangalizi mzuri wa ngozi " +
            "— weka eneo safi na kavu, epuka sabuni kali. Tafuta huduma kama vipele: havififii ukibonyeza kioo dhidi yake (dalili inayowezekana " +
            "ya ugonjwa wa meningococcal), vinaenea haraka, vina malengelenge, vina homa kali, au mtoto anaonekana mgonjwa kwa ujumla — siyo ngozi tu.");

        topic("SLEEP",
            "Typical sleep needs: newborns 14-17 hours/day (in short stretches), infants 12-15 hours (including naps), toddlers 11-14 hours, " +
            "preschoolers 10-13 hours. A consistent bedtime routine (calm activities, same time each night) helps most children settle. " +
            "Always place infants on their back to sleep, on a firm surface, with no loose bedding, pillows, or soft toys in the cot — this " +
            "is the single most effective step to reduce sleep-related infant deaths.",

            "Mahitaji ya kawaida ya usingizi: watoto wachanga masaa 14-17 kwa siku (kwa vipindi vifupi), watoto wachanga (infants) masaa 12-15 " +
            "(pamoja na usingizi wa mchana), watoto wadogo masaa 11-14, watoto wa shule ya awali masaa 10-13. Mpangilio thabiti wa muda wa " +
            "kulala (shughuli za utulivu, muda uleule kila usiku) husaidia watoto wengi kutulia. Daima mlaze mtoto mchanga chali kulala, " +
            "juu ya uso mgumu, bila matandiko yaliyolegea, mito, au vitu laini kwenye kitanda — hii ndiyo hatua yenye ufanisi zaidi " +
            "kupunguza vifo vya watoto wachanga vinavyohusiana na usingizi.");

        topic("INJURY_FIRST_AID",
            "For minor cuts/scrapes: clean with clean water, apply gentle pressure with a clean cloth to stop bleeding, cover with a clean " +
            "dressing. For burns: cool the area with cool (not ice) running water for 10-20 minutes, do not apply oil, butter, or toothpaste, " +
            "cover loosely. Seek IMMEDIATE care for: any burn larger than the child's palm, burns on the face/hands/genitals, deep cuts, " +
            "suspected broken bones, head injury with vomiting or loss of consciousness, or swallowing a foreign object or poison.",

            "Kwa mikato/michubuko midogo: safisha kwa maji safi, bonyeza kwa upole na kitambaa safi kusimamisha damu, funika kwa bandeji safi. " +
            "Kwa kuungua: pooza eneo kwa maji baridi (yasiyo na barafu) yanayotiririka kwa dakika 10-20, usipake mafuta, siagi, au dawa ya meno, " +
            "funika kwa upole. Tafuta huduma MARA MOJA kwa: kuungua kokote kubwa kuliko kiganja cha mtoto, kuungua usoni/mikononi/sehemu za siri, " +
            "mikato mikubwa, tuhuma ya mifupa iliyovunjika, jeraha la kichwa lenye kutapika au kupoteza fahamu, au kumeza kitu kigeni au sumu.");

        topic("HYGIENE",
            "Handwashing with soap at key times — before eating/feeding, after using the toilet or changing a nappy — is one of the most " +
            "effective ways to prevent diarrhea and respiratory infections. Bathe infants 2-3 times a week (daily isn't necessary and can dry " +
            "the skin); keep the umbilical cord stump clean and dry until it falls off on its own, usually within 1-2 weeks.",

            "Kunawa mikono kwa sabuni nyakati muhimu — kabla ya kula/kulisha, baada ya kutumia choo au kubadilisha nepi — ni mojawapo ya njia " +
            "bora za kuzuia kuhara na maambukizi ya njia ya hewa. Mwoge mtoto mchanga mara 2-3 kwa wiki (kila siku siyo lazima na kunaweza " +
            "kukausha ngozi); weka kitovu safi na kikavu hadi kianguke chenyewe, kwa kawaida ndani ya wiki 1-2.");
    }

    /** Look up an EN/SW excerpt for a detected topic. Returns null if the topic has no entry (e.g. GENERAL, EMERGENCY). */
    public static String get(String topic, String language) {
        Map<String, String> entry = TOPICS.get(topic);
        if (entry == null) return null;
        return "sw".equals(language) ? entry.get("sw") : entry.get("en");
    }

    public static boolean has(String topic) {
        return TOPICS.containsKey(topic);
    }
}
