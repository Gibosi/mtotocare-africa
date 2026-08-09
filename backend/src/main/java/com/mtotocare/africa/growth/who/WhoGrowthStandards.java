package com.mtotocare.africa.growth.who;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * WHO Child Growth Standards (0-5 years) Z-score engine.
 *
 * Loads the official WHO MGRS LMS reference tables (bundled as CSVs under
 * resources/who-growth/) at startup and computes:
 *   - WAZ  weight-for-age
 *   - HAZ  length/height-for-age
 *   - BAZ  BMI-for-age
 *   - WHZ  weight-for-length (age &lt; 24 months) or weight-for-height (&gt;= 24 months)
 *
 * Age-based tables are daily-precision (0-1826 days), so lookups are exact
 * array indexing — no interpolation error. The length/height-based tables
 * are in 0.1 cm steps (45.0-110.0 cm for length, 65.0-120.0 cm for height);
 * lookups round to the nearest 0.1 cm and clamp to the table's range.
 */
@Slf4j
@Component
public class WhoGrowthStandards {

    private static final int MAX_AGE_DAYS = 1856; // WHO tables run 0-1856 (~5y1m) for wfa/hfa/bfa
    private static final int SEXES = 3; // index 1=male(boy), 2=female(girl)

    private Lms[][] weightForAge;   // [sex][ageDays]
    private Lms[][] heightForAge;   // [sex][ageDays]
    private Lms[][] bmiForAge;      // [sex][ageDays]

    private Map<Integer, Lms>[] weightForLength; // [sex] keyed by round(length*10)
    private Map<Integer, Lms>[] weightForHeight; // [sex] keyed by round(height*10)
    private int wflMinKey, wflMaxKey, wfhMinKey, wfhMaxKey;

    @SuppressWarnings("unchecked")
    @PostConstruct
    public void load() {
        weightForAge = loadAgeTable("who-growth/wfa.csv");
        heightForAge = loadAgeTable("who-growth/hfa.csv");
        bmiForAge = loadAgeTable("who-growth/bfa.csv");

        weightForLength = new HashMap[SEXES];
        weightForHeight = new HashMap[SEXES];
        for (int s = 1; s <= 2; s++) {
            weightForLength[s] = new HashMap<>();
            weightForHeight[s] = new HashMap<>();
        }
        int[] wflRange = loadLengthTable("who-growth/wfl.csv", weightForLength);
        int[] wfhRange = loadLengthTable("who-growth/wfh.csv", weightForHeight);
        wflMinKey = wflRange[0]; wflMaxKey = wflRange[1];
        wfhMinKey = wfhRange[0]; wfhMaxKey = wfhRange[1];

        log.info("WHO growth standards loaded: wfa/hfa/bfa 0-{} days, wfl {}-{}cm, wfh {}-{}cm",
                MAX_AGE_DAYS, wflMinKey / 10.0, wflMaxKey / 10.0, wfhMinKey / 10.0, wfhMaxKey / 10.0);
    }

    private Lms[][] loadAgeTable(String resourcePath) {
        Lms[][] table = new Lms[SEXES][MAX_AGE_DAYS + 1];
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource(resourcePath).getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine(); // header
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split(",");
                int sex = Integer.parseInt(parts[0]);
                int age = (int) Double.parseDouble(parts[1]);
                double l = Double.parseDouble(parts[2]);
                double m = Double.parseDouble(parts[3]);
                double s = Double.parseDouble(parts[4]);
                if (age >= 0 && age <= MAX_AGE_DAYS && sex >= 1 && sex <= 2) {
                    table[sex][age] = new Lms(l, m, s);
                }
            }
        } catch (Exception e) {
            log.error("Failed to load WHO growth reference table {}: {}", resourcePath, e.getMessage());
        }
        return table;
    }

    /** Returns [minKey, maxKey] where key = round(length_or_height * 10). */
    private int[] loadLengthTable(String resourcePath, Map<Integer, Lms>[] target) {
        int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource(resourcePath).getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine(); // header
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split(",");
                int sex = Integer.parseInt(parts[0]);
                int key = Math.round((float) (Double.parseDouble(parts[1]) * 10));
                double l = Double.parseDouble(parts[2]);
                double m = Double.parseDouble(parts[3]);
                double s = Double.parseDouble(parts[4]);
                if (sex >= 1 && sex <= 2) {
                    target[sex].put(key, new Lms(l, m, s));
                    min = Math.min(min, key);
                    max = Math.max(max, key);
                }
            }
        } catch (Exception e) {
            log.error("Failed to load WHO growth reference table {}: {}", resourcePath, e.getMessage());
        }
        return new int[]{min, max};
    }

    private int sexCode(String gender) {
        return "MALE".equalsIgnoreCase(gender) || "M".equalsIgnoreCase(gender) ? 1 : 2;
    }

    private int clampAgeDays(long ageDays) {
        if (ageDays < 0) return 0;
        return (int) Math.min(ageDays, MAX_AGE_DAYS);
    }

    public Double weightForAgeZ(String gender, long ageDays, Double weightKg) {
        if (weightKg == null) return null;
        Lms lms = weightForAge[sexCode(gender)][clampAgeDays(ageDays)];
        return lms == null ? null : round2(lms.zScore(weightKg));
    }

    public Double heightForAgeZ(String gender, long ageDays, Double heightCm) {
        if (heightCm == null) return null;
        Lms lms = heightForAge[sexCode(gender)][clampAgeDays(ageDays)];
        return lms == null ? null : round2(lms.zScore(heightCm));
    }

    public Double bmiForAgeZ(String gender, long ageDays, Double bmi) {
        if (bmi == null) return null;
        Lms lms = bmiForAge[sexCode(gender)][clampAgeDays(ageDays)];
        return lms == null ? null : round2(lms.zScore(bmi));
    }

    /**
     * Weight-for-length (age &lt; 24 months) or weight-for-height (&gt;= 24 months),
     * matching WHO convention: children under 2 are measured recumbent
     * (length), 2 and over standing (height). The underlying tables cover
     * an overlapping range (~65-120cm) so results are continuous across
     * the switch.
     */
    public Double weightForLengthOrHeightZ(String gender, long ageDays, Double heightOrLengthCm, Double weightKg) {
        if (heightOrLengthCm == null || weightKg == null) return null;
        int sex = sexCode(gender);
        boolean useLength = ageDays < (24L * 30);
        Map<Integer, Lms> table = useLength ? weightForLength[sex] : weightForHeight[sex];
        int minKey = useLength ? wflMinKey : wfhMinKey;
        int maxKey = useLength ? wflMaxKey : wfhMaxKey;

        int key = Math.round((float) (heightOrLengthCm * 10));
        key = Math.max(minKey, Math.min(maxKey, key));
        Lms lms = table.get(key);
        if (lms == null) return null;
        return round2(lms.zScore(weightKg));
    }

    private Double round2(double v) {
        if (Double.isNaN(v) || Double.isInfinite(v)) return null;
        return Math.round(v * 100.0) / 100.0;
    }
}
