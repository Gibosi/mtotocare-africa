package com.mtotocare.africa.development;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Static catalog of WHO-recommended development milestones by age (in months) and category.
 * Used to auto-generate expected milestones when a child is born.
 */
public class MilestoneCatalog {

    public static class Milestone {
        public final String code;
        public final String category;
        public final String title;
        public final String description;
        public final int ageMonths;

        public Milestone(String code, String category, String title, String description, int ageMonths) {
            this.code = code;
            this.category = category;
            this.title = title;
            this.description = description;
            this.ageMonths = ageMonths;
        }
    }

    public static final java.util.List<Milestone> CATALOG = java.util.List.of(
        // 2 months
        new Milestone("SOCIAL_SMILE_2M", "SOCIAL", "Social smile", "Smiles responsively at familiar faces", 2),
        new Milestone("CO_2M", "GROSS_MOTOR", "Holds head up", "Holds head steady when held upright", 2),
        new Milestone("LANG_CO_2M", "LANGUAGE", "Coos", "Makes cooing sounds", 2),
        new Milestone("FINE_TRACK_2M", "FINE_MOTOR", "Tracks objects", "Follows objects with eyes", 2),
        // 4 months
        new Milestone("ROLL_4M", "GROSS_MOTOR", "Rolls over", "Rolls from tummy to back", 4),
        new Milestone("REACH_4M", "FINE_MOTOR", "Reaches for toys", "Reaches for and grasps objects", 4),
        new Milestone("LAUGH_4M", "SOCIAL", "Laughs", "Laughs out loud", 4),
        // 6 months
        new Milestone("SIT_6M", "GROSS_MOTOR", "Sits unsupported", "Sits without support for a few seconds", 6),
        new Milestone("TRANSFER_6M", "FINE_MOTOR", "Object transfer", "Transfers object from one hand to another", 6),
        new Milestone("BABBLE_6M", "LANGUAGE", "Babbles", "Makes babbling sounds like 'ba-ba'", 6),
        // 9 months
        new Milestone("CRAWL_9M", "GROSS_MOTOR", "Crawls", "Crawls on hands and knees", 9),
        new Milestone("PINCE_9M", "FINE_MOTOR", "Pincer grasp", "Uses thumb and finger to pick up small objects", 9),
        new Milestone("MAMA_9M", "LANGUAGE", "First words", "Says 'mama' or 'dada' non-specifically", 9),
        new Milestone("STRANGER_9M", "EMOTIONAL", "Stranger anxiety", "Shows fear of strangers", 9),
        // 12 months
        new Milestone("WALK_12M", "GROSS_MOTOR", "First steps", "Takes first independent steps", 12),
        new Milestone("WORDS_12M", "LANGUAGE", "First words (specific)", "Says 1-3 words with meaning", 12),
        new Milestone("WAVE_12M", "SOCIAL", "Waves bye-bye", "Waves goodbye", 12),
        new Milestone("POINT_12M", "COGNITIVE", "Points", "Points to desired objects", 12),
        // 18 months
        new Milestone("RUN_18M", "GROSS_MOTOR", "Runs", "Runs short distances", 18),
        new Milestone("WORDS_18M", "LANGUAGE", "10+ words", "Uses 10+ words", 18),
        new Milestone("STACK_18M", "FINE_MOTOR", "Stacks blocks", "Stacks 2-3 blocks", 18),
        // 24 months
        new Milestone("KICK_24M", "GROSS_MOTOR", "Kicks ball", "Kicks a ball forward", 24),
        new Milestone("PHRASES_24M", "LANGUAGE", "Two-word phrases", "Combines 2 words", 24),
        new Milestone("IMITATE_24M", "SOCIAL", "Imitates play", "Imitates household activities", 24),
        // 36 months
        new Milestone("STAIRS_36M", "GROSS_MOTOR", "Climbs stairs", "Climbs stairs alternating feet", 36),
        new Milestone("SENTENCES_36M", "LANGUAGE", "Speaks in sentences", "Uses 3-word sentences", 36),
        new Milestone("TOILET_36M", "COGNITIVE", "Toilet awareness", "Shows interest in potty training", 36)
    );
}
