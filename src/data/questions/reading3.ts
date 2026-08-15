import type { Question, ReadingPassage } from '../../types';

export type ReadingTuple = [string, string, string, [string, string, [string, string, string, string], number, string][]];

export const reading3Raw: ReadingTuple[] = [
  ["r019", "The Weather and Us",
   "Weather affects our life in many ways. It decides what we wear, what we eat, and what we do. On sunny days, people like to go out, play sports, and have picnics. On rainy days, they may stay at home and watch TV. Weather can also affect our feelings. Some people feel happy and active in spring, but feel sad in winter when the days are short. Farmers care most about the weather because it decides whether their crops grow well. Too much rain or too little rain is bad for farming. Weather forecast is very useful. It tells us if it will rain or snow tomorrow, so we can make plans. With the help of weather forecast, we can take an umbrella on rainy days and wear warm clothes on cold days. In a word, knowing the weather helps us live better.",
   [
    ["r019q1", "What do people like to do on sunny days?", ["Stay at home", "Go out and play sports", "Sleep all day", "Watch TV"], 1, "文中说 On sunny days, people like to go out, play sports, and have picnics。"],
    ["r019q2", "Why do farmers care most about the weather?", ["Because it decides whether crops grow well", "Because they like rain", "Because they sell umbrellas", "Because they work at night"], 0, "文中说 it decides whether their crops grow well。"],
    ["r019q3", "What is weather forecast useful for?", ["Making plans", "Cooking food", "Selling clothes", "Growing trees"], 0, "文中说 it tells us if it will rain or snow tomorrow, so we can make plans。"],
    ["r019q4", "How can weather affect our feelings?", ["Some people feel sad in winter", "Weather has no effect", "Everyone is happy in winter", "Only farmers feel sad"], 0, "文中说 some people feel sad in winter when the days are short。"],
    ["r019q5", "What is the main idea of this passage?", ["How weather changes", "Weather affects our life in many ways", "How to make a forecast", "Farmers and weather"], 1, "全文围绕天气对生活各方面的影响展开。"],
   ]
  ],
  ["r020", "A Great Scientist",
   "Thomas Edison was a great American scientist and inventor. He was born in 1847 in a small town. As a child, he was curious and asked many questions. His teacher thought he was not smart, so his mother taught him at home. Edison loved reading and doing experiments. He once sat on eggs to hatch chickens because he wanted to know how they were born. When he grew up, he worked hard day and night in his laboratory. He made many inventions, the most famous of which is the electric light bulb. He also improved the telephone and the movie camera. Edison had over a thousand inventions in his life. He once said, “Genius is one percent inspiration and ninety-nine percent perspiration.” This means that hard work is the most important thing for success. Edison's story tells us that we should never give up, no matter how difficult things are.",
   [
    ["r020q1", "Where was Edison born?", ["In England", "In a small town in America", "In France", "In Germany"], 1, "文中说 He was born in 1847 in a small town（美国小镇）。"],
    ["r020q2", "Who taught Edison when he was a child?", ["His teacher", "His mother", "His father", "His uncle"], 1, "文中说 his mother taught him at home。"],
    ["r020q3", "What is Edison's most famous invention?", ["The computer", "The electric light bulb", "The airplane", "The car"], 1, "文中说 the most famous of which is the electric light bulb。"],
    ["r020q4", "What does “Genius is one percent inspiration and ninety-nine percent perspiration” mean?", ["Geniuses do not work hard", "Hard work is the most important thing", "Inspiration is useless", "Only one percent can succeed"], 1, "文中解释 This means that hard work is the most important thing for success。"],
    ["r020q5", "What can we learn from Edison's story?", ["Never give up", "Stop asking questions", "Only geniuses can invent", "Reading is a waste of time"], 0, "最后一句：we should never give up, no matter how difficult things are。"],
   ]
  ],
  ["r021", "Keeping Pets",
   "Many families keep pets, such as dogs, cats, and birds. Pets bring us joy and friendship. When you come home after a busy day, your dog wags its tail happily, and you forget your tiredness. Pets can also help lonely people feel less lonely. Some studies show that children who grow up with pets are more caring and responsible. However, keeping a pet is not easy. It takes time and money. You need to feed the pet, clean its home, and take it to the doctor when it is sick. A dog needs daily walks, and a cat needs a clean litter box. Before you get a pet, think carefully about whether you can take care of it. A pet is not a toy; it is a family member. If you decide to keep one, be kind to it and give it love for its whole life.",
   [
    ["r021q1", "What do pets bring us according to the passage?", ["Only trouble", "Joy and friendship", "Money", "Danger"], 1, "文中说 Pets bring us joy and friendship。"],
    ["r021q2", "What do children who grow up with pets become?", ["More caring and responsible", "More lazy", "More angry", "More selfish"], 0, "文中说 children who grow up with pets are more caring and responsible。"],
    ["r021q3", "What do you need to do for a pet?", ["Feed it and clean its home", "Only play with it", "Buy it clothes", "Let it stay outside"], 0, "文中说 You need to feed the pet, clean its home, and take it to the doctor。"],
    ["r021q4", "What should you do before getting a pet?", ["Think about whether you can take care of it", "Buy a bigger house", "Ask friends for money", "Move to the countryside"], 0, "文中说 think carefully about whether you can take care of it。"],
    ["r021q5", "What does the writer compare a pet to?", ["A toy", "A family member", "A tool", "A machine"], 1, "文中说 A pet is not a toy; it is a family member。"],
   ]
  ],
  ["r022", "Travel by Train",
   "Traveling by train is a wonderful experience. Unlike planes, trains run on the ground, so you can see the beautiful countryside, rivers, and mountains through the window. The seats are usually comfortable, and you can walk around when you are tired of sitting. There is a dining car where you can buy hot meals and drinks. Many people like to talk with the passengers sitting next to them, and sometimes they become friends. Train tickets are often cheaper than plane tickets, so trains are a good choice for people who want to save money. However, trains are slower than planes, and long trips may take a whole day. In China, high-speed trains are very popular. They are fast, clean, and almost never late. Whether it is a short trip or a long journey, traveling by train gives you time to relax and enjoy the views.",
   [
    ["r022q1", "What can you see from a train window?", ["Clouds and stars", "Countryside, rivers and mountains", "The ocean only", "Other planes"], 1, "文中说 you can see the beautiful countryside, rivers, and mountains。"],
    ["r022q2", "What is in the dining car?", ["Beds", "Hot meals and drinks", "Books", "Toys"], 1, "文中说 There is a dining car where you can buy hot meals and drinks。"],
    ["r022q3", "Why do people choose trains to save money?", ["Train tickets are cheaper than plane tickets", "Trains are faster", "Trains are free", "Planes are closed"], 0, "文中说 Train tickets are often cheaper than plane tickets。"],
    ["r022q4", "What is a disadvantage of trains mentioned?", ["They are too expensive", "They are slower than planes", "They are dirty", "They are late all the time"], 1, "文中说 trains are slower than planes。"],
    ["r022q5", "What do we know about high-speed trains in China?", ["They are fast, clean and almost never late", "They are very slow", "They only run at night", "They are expensive"], 0, "文中说 They are fast, clean, and almost never late。"],
   ]
  ],
  ["r023", "The Value of Failure",
   "Nobody likes failure, but failure is a necessary part of life. Every successful person has failed many times. Thomas Edison failed thousands of times before he invented the light bulb. J.K. Rowling, the writer of Harry Potter, was turned down by many publishers before her book became famous. What can we learn from failure? First, failure teaches us what does not work. Second, it makes us stronger. When you fail, you learn to try new ways and never give up. Third, failure helps us know ourselves better. It shows us our weak points so that we can improve. Of course, we should not fail on purpose. But when failure comes, we should face it bravely and learn from it. As the saying goes, “Failure is the mother of success.” So do not be afraid of failing. Stand up, try again, and you will be closer to success.",
   [
    ["r023q1", "What is failure according to the passage?", ["A necessary part of life", "Something to be afraid of", "The end of everything", "A punishment"], 0, "第一句：failure is a necessary part of life。"],
    ["r023q2", "What happened to J.K. Rowling?", ["She was turned down by many publishers", "She never wrote books", "She failed at school", "She gave up writing"], 0, "文中说 she was turned down by many publishers before her book became famous。"],
    ["r023q3", "What does failure show us?", ["Our weak points", "Our good looks", "Our money", "Our friends"], 0, "文中说 It shows us our weak points so that we can improve。"],
    ["r023q4", "What should we do when failure comes?", ["Give up", "Face it bravely and learn from it", "Hide from it", "Blame others"], 1, "文中说 we should face it bravely and learn from it。"],
    ["r023q5", "What does the saying “Failure is the mother of success” mean?", ["Failure leads to success if we learn from it", "Failure is the end", "Success comes easily", "Only mothers succeed"], 0, "失败是成功之母：从失败中学习才能成功。"],
   ]
  ],
  ["r024", "How to Make Friends",
   "Friends are important in our life. Good friends share our happiness and sadness. But how can we make friends? First, be friendly and smile. A smile is the easiest way to open a conversation. Second, be a good listener. When your friends talk, listen carefully and do not interrupt them. People like those who understand them. Third, be honest and keep your promises. If you say you will help, do it. Fourth, be kind and helpful. Help your classmates with their problems, and they will remember your kindness. Fifth, do not judge people by their looks. A person may not be beautiful or handsome, but he or she can be a true friend. Finally, be yourself. Do not pretend to be someone you are not. True friends accept you as you are. Remember, friendship needs time and care, just like a plant needs water and sunlight.",
   [
    ["r024q1", "What is the easiest way to open a conversation?", ["Smiling", "Shouting", "Crying", "Dancing"], 0, "文中说 A smile is the easiest way to open a conversation。"],
    ["r024q2", "What should a good listener do?", ["Interrupt the speaker", "Listen carefully and not interrupt", "Talk all the time", "Walk away"], 1, "文中说 listen carefully and do not interrupt them。"],
    ["r024q3", "How should we judge people?", ["By their looks", "By their clothes", "Not by their looks", "By their money"], 2, "文中说 do not judge people by their looks。"],
    ["r024q4", "What is the advice about being yourself?", ["Do not pretend to be someone you are not", "Copy others", "Show off", "Tell lies"], 0, "文中说 Do not pretend to be someone you are not。"],
    ["r024q5", "What does friendship need according to the passage?", ["Time and care", "Money and gifts", "Cars and houses", "Games and toys"], 0, "最后一句：friendship needs time and care。"],
   ]
  ],
  ["r025", "The City Library",
   "The city library is a wonderful place. It is not only a place for borrowing books but also a center for learning and communication. The library is open from 8:00 a.m. to 8:00 p.m. every day except Monday. It has three floors. On the first floor, there are newspapers, magazines, and a reading room for children. On the second floor, you can find books on science, history, and art. The third floor is a quiet study area with computers and free Wi-Fi. The library also holds activities, such as reading clubs, English corners, and lectures on weekends. Anyone with a library card can borrow up to five books for three weeks. If you finish reading a book, you can return it and borrow new ones. The librarians are friendly and always ready to help. In my opinion, the library is the best place to spend my free time. Reading there is not only relaxing but also a great way to learn.",
   [
    ["r025q1", "When is the library open?", ["From 8:00 a.m. to 8:00 p.m. every day", "From 8:00 a.m. to 8:00 p.m. except Monday", "Only on weekends", "Only in the morning"], 1, "文中说 open from 8:00 a.m. to 8:00 p.m. every day except Monday。"],
    ["r025q2", "What is on the first floor?", ["Newspapers, magazines and a reading room for children", "Computers", "Science books", "A cafe"], 0, "文中说 On the first floor, there are newspapers, magazines, and a reading room for children。"],
    ["r025q3", "What activities does the library hold?", ["Reading clubs, English corners and lectures", "Sports games", "Concerts", "Cooking classes"], 0, "文中说 the library also holds activities, such as reading clubs, English corners, and lectures。"],
    ["r025q4", "How many books can you borrow at a time?", ["Two", "Ten", "Up to five", "Only one"], 2, "文中说 anyone can borrow up to five books for three weeks。"],
    ["r025q5", "What is the writer's opinion of the library?", ["It is the best place to spend free time", "It is too noisy", "It is useless", "It is too far away"], 0, "文中说 the library is the best place to spend my free time。"],
   ]
  ]
];

export function buildReading(t: ReadingTuple): { passage: ReadingPassage; questions: Question[] } {
  const [pid, title, text, qs] = t;
  const passage: ReadingPassage = { id: pid, title, text };
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
