-- ===================================================================
-- MtotoCare Africa - Tanzania EPI Vaccination Schedule
-- Version: 1.0
-- Migration: V2__seed_tanzania_epi.sql
-- Description: Seeds the standard Tanzania Expanded Programme
--              on Immunization (EPI) schedule
-- ===================================================================

INSERT INTO vaccination_schedule (vaccine_code, vaccine_name, description, recommended_age_weeks, doses_required, dose_number) VALUES
-- At birth (Week 0)
('BCG', 'BCG (Bacillus Calmette-Guérin)',
 'Vaccine against tuberculosis (TB). Given at birth or as early as possible.',
 0, 1, 1),

('OPV0', 'Oral Polio Vaccine (Birth dose)',
 'First dose of polio vaccine given at birth.',
 0, 1, 1),

-- 6 weeks
('PENTA1', 'Pentavalent 1 (DPT-HepB-Hib)',
 'Combination vaccine protecting against Diphtheria, Pertussis (whooping cough), Tetanus, Hepatitis B, and Haemophilus influenzae type b.',
 6, 1, 1),

('PCV1', 'Pneumococcal Conjugate Vaccine 1',
 'Protects against pneumococcal diseases (pneumonia, meningitis, ear infections).',
 6, 1, 1),

('ROTA1', 'Rotavirus Vaccine 1',
 'Protects against severe rotavirus diarrhea in infants.',
 6, 1, 1),

('OPV1', 'Oral Polio Vaccine 1',
 'Second dose of polio vaccine.',
 6, 1, 1),

-- 10 weeks
('PENTA2', 'Pentavalent 2 (DPT-HepB-Hib)',
 'Second dose of Pentavalent vaccine.',
 10, 1, 1),

('PCV2', 'Pneumococcal Conjugate Vaccine 2',
 'Second dose of PCV.',
 10, 1, 1),

('ROTA2', 'Rotavirus Vaccine 2',
 'Second dose of Rotavirus vaccine.',
 10, 1, 1),

('OPV2', 'Oral Polio Vaccine 2',
 'Third dose of polio vaccine.',
 10, 1, 1),

-- 14 weeks
('PENTA3', 'Pentavalent 3 (DPT-HepB-Hib)',
 'Third and final dose of Pentavalent vaccine. Completes primary series.',
 14, 1, 1),

('PCV3', 'Pneumococcal Conjugate Vaccine 3',
 'Third and final dose of PCV.',
 14, 1, 1),

('OPV3', 'Oral Polio Vaccine 3',
 'Fourth dose of polio vaccine.',
 14, 1, 1),

('IPV', 'Inactivated Polio Vaccine',
 'Injectable polio vaccine for additional protection.',
 14, 1, 1),

-- 9 months (39 weeks)
('MEASLES1', 'Measles Vaccine 1 (MV1)',
 'First dose of measles vaccine. Critical for preventing measles outbreaks.',
 39, 1, 1),

('YELLOW_FEVER', 'Yellow Fever Vaccine',
 'Vaccine against yellow fever. Given in endemic regions of Tanzania.',
 39, 1, 1),

-- 15 months (65 weeks)
('MEASLES2', 'Measles Vaccine 2 (MV2)',
 'Second dose of measles vaccine. Provides long-term immunity.',
 65, 1, 1),

-- 6 months (Vitamin A)
('VIT_A1', 'Vitamin A Supplementation 1',
 'First dose of Vitamin A. Critical for vision and immune function.',
 26, 1, 1),

-- 12 months
('VIT_A2', 'Vitamin A Supplementation 2',
 'Second dose of Vitamin A.',
 52, 1, 1),

-- 18 months
('VIT_A3', 'Vitamin A Supplementation 3',
 'Third dose of Vitamin A.',
 78, 1, 1),

-- 2 years
('VIT_A4', 'Vitamin A Supplementation 4',
 'Fourth dose of Vitamin A.',
 104, 1, 1),

-- DPT Booster
('DPT_BOOSTER', 'DPT Booster',
 'Booster dose for continued protection against Diphtheria, Pertussis, and Tetanus.',
 78, 1, 1);

-- ===================================================================
-- END OF V2__seed_tanzania_epi.sql
-- ===================================================================
