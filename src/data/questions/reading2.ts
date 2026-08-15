import type { Question, ReadingPassage } from '../../types';

export type ReadingTuple = [string, string, string, [string, string, [string, string, string, string], number, string][]];

export const reading2Raw: ReadingTuple[] = [
  ["r010", "Eating Habits Around the World",
   "People in different countries have different eating habits. In China, people usually eat rice, noodles, and vegetables. They use chopsticks and often share dishes with each other. In Japan, people eat a lot of fish and rice, and they use chopsticks too. In Western countries like the United States and Britain, people eat more bread, meat, and potatoes. They use knives and forks. In India, many people do not eat beef because of their religion, and they often use their hands to eat. Breakfast is also different. Some people like a big breakfast, while others only have a cup of coffee. Eating habits come from history, climate, and culture. When you travel to a new country, try the local food. It is a good way to understand its culture.",
   [
    ["r010q1", "What do people in China usually eat?", ["Bread and milk", "Rice, noodles and vegetables", "Fish and chips", "Beef and potatoes"], 1, "文中说 In China, people usually eat rice, noodles, and vegetables。"],
    ["r010q2", "What do people use in Western countries?", ["Chopsticks", "Hands", "Knives and forks", "Spoons only"], 2, "文中说 They use knives and forks。"],
    ["r010q3", "Why do many people in India not eat beef?", ["Because of their religion", "Because it is expensive", "Because they do not like it", "Because it is unhealthy"], 0, "文中说 many people do not eat beef because of their religion。"],
    ["r010q4", "What are eating habits influenced by?", ["History, climate and culture", "Only by money", "Only by weather", "Only by age"], 0, "文中说 Eating habits come from history, climate, and culture。"],
    ["r010q5", "What is a good way to understand a country's culture?", ["Trying the local food", "Staying at home", "Reading maps", "Watching TV"], 0, "最后一句：try the local food. It is a good way to understand its culture。"],
   ]
  ],
  ["r011", "The Power of Music",
   "Music is an important part of our life. We hear music in films, in shops, on the radio, and at concerts. Music can change our feelings. When we are sad, slow music can calm us down. When we are happy, fast music can make us feel more excited. Students often listen to music while studying. Some studies show that music can help people remember things better, especially classical music. Music also brings people together. At a concert, thousands of people sing and dance together, and strangers become friends. Many people learn to play an instrument when they are young. Playing music is not only fun but also good for the brain. So no matter how busy you are, try to enjoy some music every day.",
   [
    ["r011q1", "Where do we hear music according to the passage?", ["Only at concerts", "In films, shops and on the radio", "Only in schools", "Only at home"], 1, "文中说 We hear music in films, in shops, on the radio, and at concerts。"],
    ["r011q2", "What can slow music do when we are sad?", ["Make us angrier", "Calm us down", "Make us run", "Make us sleep"], 1, "文中说 slow music can calm us down。"],
    ["r011q3", "Which music helps people remember things better?", ["Rock music", "Pop music", "Classical music", "Jazz music"], 2, "文中说 music can help people remember things better, especially classical music。"],
    ["r011q4", "What happens at a concert?", ["People become strangers", "People sing and dance together", "People sleep", "People eat together"], 1, "文中说 thousands of people sing and dance together, and strangers become friends。"],
    ["r011q5", "What is the writer's advice?", ["Stop listening to music", "Enjoy some music every day", "Only play instruments", "Never go to concerts"], 1, "最后一句：try to enjoy some music every day。"],
   ]
  ],
  ["r012", "My First Job Interview",
   "Last month, I had my first job interview. I was very nervous before it. I prepared for several days. I searched for information about the company and practiced possible questions. On the day of the interview, I wore a clean shirt and arrived thirty minutes early. The interviewer was a friendly woman. She asked me about my school life, my hobbies, and why I wanted this job. At first, I spoke too fast because I was nervous, but then I took a deep breath and slowed down. I answered all the questions honestly. At the end, she asked if I had any questions. I asked about the working hours and the training plan. Two days later, I received an email saying I got the job. I was so happy! From this experience, I learned that being prepared and honest is the key to success.",
   [
    ["r012q1", "How did the writer feel before the interview?", ["Excited", "Nervous", "Angry", "Bored"], 1, "第一段：I was very nervous before it。"],
    ["r012q2", "What did the writer do to prepare?", ["Slept early", "Searched information about the company", "Bought a new phone", "Called the interviewer"], 1, "文中说 I searched for information about the company and practiced possible questions。"],
    ["r012q3", "Why did the writer speak too fast at first?", ["Because he was happy", "Because he was nervous", "Because he was angry", "Because he was tired"], 1, "文中说 I spoke too fast because I was nervous。"],
    ["r012q4", "What did the writer ask about at the end?", ["The salary only", "The working hours and training plan", "The company name", "The interviewer's age"], 1, "文中说 I asked about the working hours and the training plan。"],
    ["r012q5", "What is the key to success according to the writer?", ["Being rich", "Being prepared and honest", "Being fast", "Being famous"], 1, "最后一句：being prepared and honest is the key to success。"],
   ]
  ],
  ["r013", "Computers in Education",
   "Computers are now widely used in education. In many classrooms, teachers use computers to show pictures, play videos, and give lessons. Students can also use computers at home to do homework and search for information. Online courses make it possible for people in faraway places to study. A student in a small village can learn from a famous teacher in a big city. Computers also help teachers check homework quickly and tell parents about their children's progress. However, computers have some disadvantages. Some students play games instead of studying. Too much screen time is bad for the eyes. So schools should teach students how to use computers in a healthy way. In a word, computers are useful tools, but we should not depend on them too much.",
   [
    ["r013q1", "How do teachers use computers in classrooms?", ["To show pictures and play videos", "To cook food", "To clean rooms", "To make phone calls"], 0, "文中说 teachers use computers to show pictures, play videos, and give lessons。"],
    ["r013q2", "Who can benefit from online courses?", ["Only city students", "People in faraway places", "Only rich people", "Only young children"], 1, "文中说 Online courses make it possible for people in faraway places to study。"],
    ["r013q3", "What is a disadvantage of computers mentioned?", ["They are too expensive", "Some students play games instead of studying", "They are too heavy", "They make noise"], 1, "文中说 Some students play games instead of studying。"],
    ["r013q4", "What should schools teach students?", ["How to use computers in a healthy way", "How to buy computers", "How to play games", "How to make computers"], 0, "文中说 schools should teach students how to use computers in a healthy way。"],
    ["r013q5", "What is the writer's attitude towards computers?", ["We should not use them at all", "They are useful but we should not depend on them too much", "They are useless", "They will replace teachers"], 1, "最后一句：computers are useful tools, but we should not depend on them too much。"],
   ]
  ],
  ["r014", "A Letter to a Friend",
   "Dear Li Hua,\n\nHow is everything going? I am writing to tell you about my new school life. I have been at this school for two months. It is a big school with a beautiful garden and a modern library. My classmates are friendly, and my teachers are helpful. I like English best because our English teacher makes the class interesting. She often tells stories and plays games with us. After class, I join the basketball club. We practice every Tuesday and Thursday. Last week, our team played against another school and won the match! I was so excited.\n\nI also want to invite you to visit our school next month. We can play basketball together and visit the library. I miss you very much. Please write back soon.\n\nYours,\nWang Wei",
   [
    ["r014q1", "How long has Wang Wei been at the new school?", ["Two weeks", "Two months", "Two years", "Two days"], 1, "信中：I have been at this school for two months。"],
    ["r014q2", "Why does the writer like English best?", ["Because it is easy", "Because the teacher makes the class interesting", "Because there is no homework", "Because it is short"], 1, "信中：I like English best because our English teacher makes the class interesting。"],
    ["r014q3", "When does the basketball club practice?", ["Every Monday and Wednesday", "Every Tuesday and Thursday", "Every weekend", "Every morning"], 1, "信中：We practice every Tuesday and Thursday。"],
    ["r014q4", "What happened last week?", ["They lost the match", "They won the match", "They visited a library", "They had an exam"], 1, "信中：our team played against another school and won the match。"],
    ["r014q5", "What does the writer invite Li Hua to do?", ["Visit the school next month", "Send a gift", "Write an email", "Join the club"], 0, "信中：I want to invite you to visit our school next month。"],
   ]
  ],
  ["r015", "The Importance of Sleep",
   "Sleep is very important for our health, but many people do not get enough of it. Scientists say that adults need about seven to nine hours of sleep every night, and teenagers need even more. When we sleep, our brain cleans itself and stores what we learned during the day. That is why students who sleep well usually do better in exams. However, modern life makes it hard to sleep well. Many people use phones or watch TV late at night. The light from the screens makes our brain think it is still daytime, so we cannot fall asleep easily. Here are some tips: do not drink coffee before bed; keep your room dark and quiet; go to bed at the same time every night. If you follow these tips, you will sleep better and feel more energetic the next day.",
   [
    ["r015q1", "How many hours of sleep do adults need?", ["About 3-4 hours", "About 7-9 hours", "About 10-12 hours", "About 5-6 hours"], 1, "文中说 adults need about seven to nine hours of sleep。"],
    ["r015q2", "What does the brain do during sleep?", ["It cleans itself and stores what we learned", "It stops working", "It gets bigger", "It forgets everything"], 0, "文中说 our brain cleans itself and stores what we learned during the day。"],
    ["r015q3", "Why is it hard to fall asleep with screens?", ["The light makes the brain think it is daytime", "The screens are too big", "The phones are heavy", "The TV is loud"], 0, "文中说 The light from the screens makes our brain think it is still daytime。"],
    ["r015q4", "Which is a tip mentioned in the passage?", ["Drink coffee before bed", "Keep the room dark and quiet", "Watch TV late", "Sleep at different times"], 1, "文中建议 keep your room dark and quiet。"],
    ["r015q5", "Who usually does better in exams?", ["Students who sleep well", "Students who study all night", "Students who drink coffee", "Students who watch TV"], 0, "文中说 students who sleep well usually do better in exams。"],
   ]
  ],
  ["r016", "Shopping Online vs In Stores",
   "Nowadays, more and more people choose to shop online. You can buy almost everything on the Internet, from books to clothes to food. Online shopping is convenient because you do not need to leave your home, and the prices are often lower. You can compare prices from different shops easily. However, online shopping also has problems. You cannot see or touch the goods before you buy them, so sometimes the clothes do not fit or the quality is not good. It also takes time for the goods to arrive. In contrast, shopping in stores lets you try things on and take them home at once. You can also talk with the shop workers and get advice. But you may have to spend time traveling and waiting in line. Both ways have advantages and disadvantages, so we should choose the right way according to our needs.",
   [
    ["r016q1", "What is an advantage of online shopping?", ["You can touch the goods", "You do not need to leave home", "The goods arrive at once", "You can try clothes on"], 1, "文中说 online shopping is convenient because you do not need to leave your home。"],
    ["r016q2", "What problem may online shopping have?", ["Goods are too expensive", "Clothes may not fit", "No goods to buy", "Shops are closed"], 1, "文中说 sometimes the clothes do not fit or the quality is not good。"],
    ["r016q3", "What can you do in stores?", ["Compare prices online", "Try things on and take them home at once", "Wait for delivery", "Buy without money"], 1, "文中说 shopping in stores lets you try things on and take them home at once。"],
    ["r016q4", "What may you have to do when shopping in stores?", ["Travel and wait in line", "Compare prices for hours", "Use a computer", "Pay online"], 0, "文中说 you may have to spend time traveling and waiting in line。"],
    ["r016q5", "What is the writer's conclusion?", ["Online shopping is always better", "Store shopping is always better", "Choose the right way according to our needs", "Stop shopping"], 2, "最后一句：we should choose the right way according to our needs。"],
   ]
  ],
  ["r017", "A Special Festival",
   "The Mid-Autumn Festival is one of the most important festivals in China. It falls on the 15th day of the 8th lunar month, when the moon is full and bright. On this day, family members get together and have a big dinner. The most popular food is mooncakes, which are round and sweet, just like the full moon. There is a famous story about this festival. Long ago, a beautiful woman named Chang'e flew to the moon after drinking a magic medicine. People believe that she still lives on the moon with a white rabbit. On the night of the festival, families sit outside, enjoy the moon, and tell this story to the children. For Chinese people, the Mid-Autumn Festival means family reunion and happiness. Even people far away from home will try to come back for this special day.",
   [
    ["r017q1", "When is the Mid-Autumn Festival?", ["On the 15th day of the 8th lunar month", "On January 1st", "On the 1st day of the 5th month", "On the 15th day of the 1st month"], 0, "文中说 It falls on the 15th day of the 8th lunar month。"],
    ["r017q2", "What is the most popular food?", ["Noodles", "Mooncakes", "Dumplings", "Rice cakes"], 1, "文中说 The most popular food is mooncakes。"],
    ["r017q3", "Who flew to the moon according to the story?", ["A white rabbit", "A beautiful woman named Chang'e", "A young boy", "An old man"], 1, "文中说 a beautiful woman named Chang'e flew to the moon。"],
    ["r017q4", "What do families do on the night of the festival?", ["Stay inside and sleep", "Sit outside and enjoy the moon", "Go shopping", "Watch movies"], 1, "文中说 families sit outside, enjoy the moon。"],
    ["r017q5", "What does the festival mean to Chinese people?", ["Family reunion and happiness", "Good luck in business", "New clothes", "Long life"], 0, "文中说 the Mid-Autumn Festival means family reunion and happiness。"],
   ]
  ],
  ["r018", "How to Read Faster",
   "Reading is a good habit, but many people read slowly. Here are some ways to read faster. First, do not move your lips when you read. Moving lips slows you down because you read word by word. Second, try to read groups of words instead of single words. For example, read “a cup of tea” together instead of reading each word separately. Third, do not stop at every new word. If a word is not important for the meaning, just go on. You can guess its meaning from the sentence. Fourth, use your finger or a pen to guide your eyes. This helps you keep moving and avoid going back. Finally, practice every day. The more you read, the faster you become. Remember, being fast is not enough; you should also understand what you read. Try to find the balance between speed and understanding.",
   [
    ["r018q1", "What slows you down when reading?", ["Reading groups of words", "Moving your lips", "Using a pen", "Guessing meanings"], 1, "文中说 Moving lips slows you down。"],
    ["r018q2", "What should you do with unimportant new words?", ["Stop and look them up", "Go on and guess the meaning", "Read them loudly", "Write them down"], 1, "文中说 do not stop at every new word... guess its meaning from the sentence。"],
    ["r018q3", "What can guide your eyes while reading?", ["A finger or a pen", "A dictionary", "A ruler", "A phone"], 0, "文中说 use your finger or a pen to guide your eyes。"],
    ["r018q4", "What is the balance mentioned at the end?", ["Balance between speed and understanding", "Balance between work and rest", "Balance between reading and writing", "Balance between food and sleep"], 0, "最后说 try to find the balance between speed and understanding。"],
    ["r018q5", "What is the main idea of the passage?", ["How to choose books", "How to read faster", "How to write well", "How to remember words"], 1, "全文介绍如何提高阅读速度的方法。"],
   ]
  ]
];

export function buildReading(t: ReadingTuple): { passage: ReadingPassage; questions: Question[] } {
  const [pid, title, text, qs] = t;
  const passage: ReadingPassage = { id: pid, title, text: text.replace(/\\n/g, '\n') };
  const questions: Question[] = qs.map(([id, prompt, options, answer, explanation]) => ({
    id,
    section: 'reading',
    passageId: pid,
    prompt,
    options: [...options],
    answer: String(answer),
    explanation,
    source: 'builtin',
  }));
  return { passage, questions };
}
