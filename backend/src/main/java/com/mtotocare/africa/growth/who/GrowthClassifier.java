package com.mtotocare.africa.growth.who;

/**
 * Turns raw WHO Z-scores into the classification labels WHO itself defines
 * for each indicator, plus two things WHO does NOT define but that
 * mtotocare needs for triage — a composite risk level and a 0-100 health
 * score. Those two are explicitly app-level heuristics built from the
 * official cutoffs below, not WHO-published metrics.
 *
 * Official WHO cutoffs (WHO Child Growth Standards, 2006 / WHO Vitamin and
 * Mineral Nutrition Information System (VMNIS) classification):
 *   WAZ (weight-for-age):        &lt;-3 severely underweight, -3..&lt;-2 underweight, -2..2 normal
 *   HAZ (height/length-for-age): &lt;-3 severely stunted,      -3..&lt;-2 stunted,      -2..2 normal
 *   WHZ (weight-for-height):     &lt;-3 severe wasting,         -3..&lt;-2 wasting,      -2..2 normal, &gt;2..3 overweight, &gt;3 obese
 *   BAZ (BMI-for-age):           same bands as WHZ
 */
public class GrowthClassifier {

    public enum Severity { SEVERE, MODERATE, NORMAL, ABOVE_NORMAL, OVERWEIGHT, OBESE, UNKNOWN }

    public static Severity classifyWaz(Double z) {
        if (z == null) return Severity.UNKNOWN;
        if (z < -3) return Severity.SEVERE;
        if (z < -2) return Severity.MODERATE;
        if (z <= 2) return Severity.NORMAL;
        return Severity.ABOVE_NORMAL; // WHO doesn't classify high WAZ as a distinct condition
    }

    public static Severity classifyHaz(Double z) {
        if (z == null) return Severity.UNKNOWN;
        if (z < -3) return Severity.SEVERE;
        if (z < -2) return Severity.MODERATE;
        if (z <= 2) return Severity.NORMAL;
        return Severity.ABOVE_NORMAL;
    }

    public static Severity classifyWhzOrBaz(Double z) {
        if (z == null) return Severity.UNKNOWN;
        if (z < -3) return Severity.SEVERE;
        if (z < -2) return Severity.MODERATE;
        if (z <= 2) return Severity.NORMAL;
        if (z <= 3) return Severity.OVERWEIGHT;
        return Severity.OBESE;
    }

    public static String wazLabel(Severity s) {
        switch (s) {
            case SEVERE: return "Severely underweight";
            case MODERATE: return "Underweight";
            case NORMAL: return "Normal weight-for-age";
            case ABOVE_NORMAL: return "Above-average weight-for-age";
            default: return "Unknown";
        }
    }

    public static String hazLabel(Severity s) {
        switch (s) {
            case SEVERE: return "Severely stunted";
            case MODERATE: return "Stunted";
            case NORMAL: return "Normal height-for-age";
            case ABOVE_NORMAL: return "Above-average height-for-age";
            default: return "Unknown";
        }
    }

    public static String whzBazLabel(Severity s, boolean isBmi) {
        String metric = isBmi ? "BMI-for-age" : "weight-for-height";
        switch (s) {
            case SEVERE: return "Severe wasting (" + metric + ")";
            case MODERATE: return "Wasted (" + metric + ")";
            case NORMAL: return "Normal " + metric;
            case OVERWEIGHT: return "Overweight (" + metric + ")";
            case OBESE: return "Obese (" + metric + ")";
            default: return "Unknown";
        }
    }

    /**
     * Overall composite classification for the record, preferring the most
     * clinically significant finding across all indicators.
     */
    public static String overallNutritionStatus(Double waz, Double haz, Double whz, Double baz) {
        Severity wazS = classifyWaz(waz);
        Severity hazS = classifyHaz(haz);
        Severity whzS = classifyWhzOrBaz(whz != null ? whz : baz);

        if (whzS == Severity.SEVERE) return "SEVERELY_WASTED";
        if (hazS == Severity.SEVERE) return "SEVERELY_STUNTED";
        if (wazS == Severity.SEVERE) return "SEVERELY_UNDERWEIGHT";
        if (whzS == Severity.OBESE) return "OBESE";
        if (whzS == Severity.MODERATE) return "WASTED";
        if (hazS == Severity.MODERATE) return "STUNTED";
        if (wazS == Severity.MODERATE) return "UNDERWEIGHT";
        if (whzS == Severity.OVERWEIGHT) return "OVERWEIGHT";
        if (wazS == Severity.UNKNOWN && hazS == Severity.UNKNOWN && whzS == Severity.UNKNOWN) return "UNKNOWN";
        return "NORMAL";
    }

    /**
     * App-level triage heuristic (NOT a WHO-published risk score): combines
     * indicator severity with clinician-reported danger signs. Anything
     * SEVERE or a danger sign is CRITICAL; MODERATE findings are HIGH;
     * borderline values (within 0.5 SD of the -2 cutoff) are MODERATE risk
     * as an early-warning buffer; everything else is LOW.
     */
    public static String riskLevel(Double waz, Double haz, Double whz, Double baz, boolean oedema, boolean severeDehydration) {
        if (oedema || severeDehydration) return "CRITICAL";

        Severity wazS = classifyWaz(waz);
        Severity hazS = classifyHaz(haz);
        Severity whzOrBazS = classifyWhzOrBaz(whz != null ? whz : baz);

        if (wazS == Severity.SEVERE || hazS == Severity.SEVERE || whzOrBazS == Severity.SEVERE) return "CRITICAL";
        if (wazS == Severity.MODERATE || hazS == Severity.MODERATE || whzOrBazS == Severity.MODERATE
                || whzOrBazS == Severity.OBESE) {
            return "HIGH";
        }
        if (isNearCutoff(waz) || isNearCutoff(haz) || isNearCutoff(whz) || isNearCutoff(baz)
                || whzOrBazS == Severity.OVERWEIGHT) {
            return "MODERATE";
        }
        return "LOW";
    }

    private static boolean isNearCutoff(Double z) {
        return z != null && z < -1.5 && z >= -2;
    }

    /**
     * 0-100 composite health score (app-level heuristic, not a WHO metric).
     * Starts at 100 and deducts for each indicator's distance below/above
     * the healthy band, weighted toward undernutrition since that's the
     * dominant risk in this context.
     */
    public static int healthScore(Double waz, Double haz, Double whz, Double baz, boolean oedema, boolean severeDehydration) {
        double score = 100;
        score -= deficitPenalty(waz, 6.0);
        score -= deficitPenalty(haz, 6.0);
        Double whzOrBaz = whz != null ? whz : baz;
        score -= deficitPenalty(whzOrBaz, 8.0);
        score -= surplusPenalty(whzOrBaz, 4.0);
        if (oedema) score -= 40;
        if (severeDehydration) score -= 40;
        return (int) Math.max(0, Math.min(100, Math.round(score)));
    }

    private static double deficitPenalty(Double z, double weight) {
        if (z == null || z >= -2) return 0;
        // Each SD below -2 costs `weight` points, capped at a full penalty by -5 SD.
        double sdBelow = Math.min(-2 - z, 3);
        return sdBelow * weight;
    }

    private static double surplusPenalty(Double z, double weight) {
        if (z == null || z <= 2) return 0;
        double sdAbove = Math.min(z - 2, 3);
        return sdAbove * weight;
    }

    /**
     * Compares the primary wasting indicator (WHZ, falling back to BAZ) between
     * the previous and current assessment to flag a trend. This is a simple
     * threshold heuristic (app-level, not a WHO-published prediction model):
     * a drop of more than 0.3 SD is "growth faltering", a rise of more than
     * 0.3 SD is "improving", otherwise "stable". Returns "INSUFFICIENT_DATA"
     * when there's no prior assessment to compare against.
     */
    public static String growthTrend(Double previousWhzOrBaz, Double currentWhzOrBaz) {
        if (previousWhzOrBaz == null) return "INSUFFICIENT_DATA";
        if (currentWhzOrBaz == null) return "INSUFFICIENT_DATA";
        double delta = currentWhzOrBaz - previousWhzOrBaz;
        if (delta <= -0.3) return "FALTERING";
        if (delta >= 0.3) return "IMPROVING";
        return "STABLE";
    }
}
