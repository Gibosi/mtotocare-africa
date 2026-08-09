package com.mtotocare.africa.growth.who;

/**
 * One row of the WHO Child Growth Standards LMS reference tables:
 * L (Box-Cox power), M (median), S (coefficient of variation) for a given
 * sex + age-in-days (or sex + length/height-in-cm for the weight-for-length
 * / weight-for-height tables).
 *
 * Source: World Health Organization Multicentre Growth Reference Study
 * (MGRS), 2006. Reference data transcribed from the official WHO "anthro"
 * R package (https://github.com/WorldHealthOrganization/anthro),
 * data-raw/growthstandards/{weianthro,lenanthro,bmianthro,wflanthro,wfhanthro}.txt.
 */
public class Lms {
    public final double l;
    public final double m;
    public final double s;

    public Lms(double l, double m, double s) {
        this.l = l;
        this.m = m;
        this.s = s;
    }

    /**
     * WHO LMS z-score formula (Cole, 1990):
     *   Z = (((X / M) ^ L) - 1) / (L * S)      when L != 0
     *   Z = ln(X / M) / S                      when L == 0
     */
    public double zScore(double x) {
        if (x <= 0) return Double.NaN;
        if (Math.abs(l) < 1e-9) {
            return Math.log(x / m) / s;
        }
        return (Math.pow(x / m, l) - 1.0) / (l * s);
    }
}
