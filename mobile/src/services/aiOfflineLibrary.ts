/**
 * Offline AI library for common parenting/health questions.
 * Used when the network or AI service is unavailable.
 */
import { Child } from '../types';
import { ageInMonths, ageInWeeks } from '../utils/date';

interface QA { keywords: string[]; answer: (child?: Child) => string; }

const library: QA[] = [
  {
    keywords: ['food', 'eat', 'feeding', 'meal', 'nutrition'],
    answer: (child) => {
      const months = child ? ageInMonths(child.dateOfBirth) : 18;
      if (months < 6) return 'For babies under 6 months, exclusive breastfeeding is recommended. Consult your pediatrician before introducing solid foods.';
      if (months < 12) return `At ${months} months, your baby can eat soft mashed foods like bananas, sweet potatoes, and rice. Continue breastfeeding.`;
      if (months < 24) return `For an ${months}-month-old: offer a variety of foods - cereals (ugali, rice, oats), protein (beans, eggs, meat, fish), fruits (banana, avocado, mango), and vegetables (spinach, carrots, pumpkin). 3 main meals and 2 healthy snacks daily. Always ensure clean water is available.`;
      return `For children 2+, offer balanced meals with carbohydrates, protein, fruits, and vegetables. Limit sugar and processed foods. 3 meals + 2 snacks.`;
    },
  },
  {
    keywords: ['fever', 'temperature', 'hot'],
    answer: () => 'For fever: give plenty of fluids, dress in light clothing, and use paracetamol as per dosage on the label. If fever exceeds 39°C, lasts more than 3 days, or is accompanied by rash, vomiting, or difficulty breathing, see a doctor immediately.',
  },
  {
    keywords: ['vaccine', 'vaccination', 'immunization', 'jab'],
    answer: (child) => {
      const weeks = child ? ageInWeeks(child.dateOfBirth) : 0;
      if (weeks < 2) return 'BCG and OPV are typically given at birth. Make sure your child received these at the hospital.';
      if (weeks < 6) return 'At 6 weeks: PENTA 1, PCV 1, ROTA 1, OPV 1. Check the Vaccination Tracker for your child\'s schedule.';
      if (weeks < 10) return 'At 10 weeks: PENTA 2, PCV 2, ROTA 2, OPV 2. Check the Vaccination Tracker.';
      if (weeks < 14) return 'At 14 weeks: PENTA 3, PCV 3, OPV 3. Check the Vaccination Tracker.';
      if (weeks < 39) return 'No more vaccines until 9 months. Use this time for growth monitoring.';
      return 'At 9 months: Measles 1 and Yellow Fever vaccines. Check the Vaccination Tracker for exact dates.';
    },
  },
  {
    keywords: ['growth', 'weight', 'height', 'tall', 'grow'],
    answer: (child) => {
      if (!child) return 'Add a child to track their growth. Track weight and height monthly using the Growth Monitoring screen.';
      const months = ageInMonths(child.dateOfBirth);
      return `Your child is ${months} months old. Regular growth monitoring is key. Compare weight and height to WHO standards at each clinic visit. If you notice sudden changes, consult your doctor.`;
    },
  },
  {
    keywords: ['diarrhea', 'diarrhoea', 'running stomach', 'stomach'],
    answer: () => 'For diarrhea: give Oral Rehydration Salts (ORS) frequently, continue feeding, and give zinc supplements. Watch for signs of dehydration (sunken eyes, dry mouth, no tears). If severe or with blood, see a doctor immediately.',
  },
  {
    keywords: ['cough', 'cold', 'flu', 'runny nose'],
    answer: () => 'For cough and cold: keep the child hydrated, use saline nose drops, and a cool-mist humidifier. Honey (for children over 1 year) can soothe cough. See a doctor if symptoms last more than 10 days, breathing is difficult, or fever is high.',
  },
  {
    keywords: ['rash', 'skin', 'itch'],
    answer: () => 'For skin rashes: keep the area clean and dry, avoid scratching, and use mild soap. If the rash is widespread, with fever, or signs of infection (pus, swelling), see a doctor.',
  },
  {
    keywords: ['sleep', 'sleeping', 'night', 'bedtime'],
    answer: (child) => {
      const months = child ? ageInMonths(child.dateOfBirth) : 18;
      if (months < 6) return 'Newborns sleep 14-17 hours a day in short stretches. Safe sleep: on the back, firm mattress, no loose bedding.';
      if (months < 12) return 'Infants 6-12 months need 12-16 hours of sleep (including naps). Establish a bedtime routine.';
      if (months < 24) return `Toddlers (${months} months) need 11-14 hours of sleep. Keep a consistent bedtime, calm routine, dark room.`;
      return 'Children 2+ need 10-13 hours of sleep. Maintain a regular sleep schedule.';
    },
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    answer: () => "Hello! I'm MtotoCare AI. I can help with feeding, vaccines, growth, common illnesses, and more. What would you like to know?",
  },
  {
    keywords: ['thank', 'thanks'],
    answer: () => "You're welcome! Stay healthy and feel free to ask anytime.",
  },
];

const fallbackAnswers = [
  "I'm not sure about that specific question. For urgent concerns, please contact your healthcare provider or visit the nearest clinic.",
  "That's a great question. For personalized medical advice, please consult your doctor. You can book an appointment through the Reminders tab.",
  "I don't have specific information on that topic, but your healthcare provider can help. Use the Records tab to find contact details.",
];

export const aiOfflineLibrary = {
  answer(question: string, child?: Child): string {
    const q = question.toLowerCase();
    for (const qa of library) {
      if (qa.keywords.some(k => q.includes(k))) {
        return qa.answer(child);
      }
    }
    return fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
  },
};
