import type { Question } from '../../types';

export type ClozeTuple = [string, string, string, [string, string, [string, string, string, string], number, string][]];

export const cloze2Raw: ClozeTuple[] = [
  ["c006", "A Healthy Diet",
   "What we eat is very important for our health. A healthy diet should include vegetables, fruit, meat, and grains. Vegetables and fruit give us vitamins, which help us fight against disease. Meat and eggs give us protein, which helps our body grow. Grains like rice and bread give us energy. However, many people eat too much fast food. Fast food is delicious but unhealthy, because it contains too much salt, sugar, and fat. Eating too much fast food can make us fat and sick. So we should eat less fast food and more healthy food. We should also drink enough water every day. Water helps our body work well. In a word, a balanced diet and enough water are the keys to a healthy life.",
   [
    ["c006q1", "What we eat is very ____ for our health.", ["important", "interesting", "expensive", "difficult"], 0, "饮食对健康很重要，very important。"],
    ["c006q2", "A healthy diet should include vegetables, fruit, meat, and ____ .", ["grains", "candy", "chips", "cakes"], 0, "健康饮食包括谷物，and grains。"],
    ["c006q3", "Vegetables and fruit give us ____ .", ["vitamins", "protein", "sugar", "salt"], 0, "蔬果提供维生素，give us vitamins。"],
    ["c006q4", "Meat and eggs give us ____ .", ["protein", "vitamins", "water", "fat"], 0, "肉蛋提供蛋白质，give us protein。"],
    ["c006q5", "Grains like rice and bread give us ____ .", ["energy", "vitamins", "protein", "sugar"], 0, "谷物提供能量，give us energy。"],
    ["c006q6", "However, many people eat too much ____ .", ["fast food", "fruit", "vegetables", "rice"], 0, "很多人吃太多快餐，too much fast food。"],
    ["c006q7", "Fast food contains too much salt, sugar, and ____ .", ["fat", "water", "protein", "vitamins"], 0, "快餐含太多盐、糖和脂肪，and fat。"],
    ["c006q8", "Eating too much fast food can make us ____ and sick.", ["fat", "thin", "tall", "strong"], 0, "变胖生病，make us fat and sick。"],
    ["c006q9", "We should also drink enough ____ every day.", ["water", "cola", "juice", "coffee"], 0, "每天喝足够的水，drink enough water。"],
    ["c006q10", "A balanced diet and enough water are the ____ to a healthy life.", ["keys", "doors", "ways", "steps"], 0, "是健康生活的关键，the keys to。"],
   ]
  ],
  ["c007", "The Mobile Phone",
   "The mobile phone has become an important part of our life. Almost everyone has one now. With a mobile phone, we can call our friends, send messages, and take photos. We can also use it to check the weather, read the news, and pay for things. In fact, the mobile phone is like a small computer in our pocket. However, using the phone too much is bad for us. It is bad for our eyes and our sleep. Some people play with their phones while walking, which is very dangerous. Some students use phones in class and do not listen to the teacher. So we should use mobile phones wisely. We should not let them take away our time with family and friends. Remember, the phone is a tool for us, not our master.",
   [
    ["c007q1", "The mobile phone has become an important ____ of our life.", ["part", "book", "game", "job"], 0, "成为生活的重要部分，an important part。"],
    ["c007q2", "Almost ____ has one now.", ["everyone", "nobody", "someone", "anyone"], 0, "几乎每个人都有，Almost everyone。"],
    ["c007q3", "We can call our friends, send messages, and take ____ .", ["photos", "books", "buses", "breaks"], 0, "拍照，take photos。"],
    ["c007q4", "The mobile phone is like a small ____ in our pocket.", ["computer", "radio", "watch", "camera"], 0, "像口袋里的电脑，a small computer。"],
    ["c007q5", "However, using the phone too much is ____ for us.", ["bad", "good", "useful", "helpful"], 0, "用太多对我们不好，is bad for us。"],
    ["c007q6", "It is bad for our eyes and our ____ .", ["sleep", "food", "shoes", "books"], 0, "对眼睛和睡眠不好，and our sleep。"],
    ["c007q7", "Some people play with their phones while ____ .", ["walking", "eating", "sleeping", "swimming"], 0, "边走边玩手机，while walking。"],
    ["c007q8", "Some students use phones in class and do not ____ to the teacher.", ["listen", "talk", "look", "write"], 0, "不听老师讲课，do not listen to the teacher。"],
    ["c007q9", "So we should use mobile phones ____ .", ["wisely", "quickly", "loudly", "carelessly"], 0, "明智地使用手机，use wisely。"],
    ["c007q10", "The phone is a tool for us, not our ____ .", ["master", "friend", "teacher", "servant"], 0, "不是我们的主人，not our master。"],
   ]
  ],
  ["c008", "My Hometown",
   "My hometown is a small town in the south of China. It is surrounded by green mountains and a clear river runs through it. The air is fresh, and the sky is blue. There are many old houses with red roofs and small gardens. The people in my hometown are very kind and hard-working. Every morning, farmers go to the fields, and some old people do exercise in the square. In spring, the whole town is full of flowers. In summer, children swim in the river. In autumn, the fields turn golden. In winter, people stay at home and chat around the fire. Although my hometown is not big, I love it deeply. It is the place where I was born and grew up. Wherever I go, my hometown is always in my heart.",
   [
    ["c008q1", "My hometown is a small town in the ____ of China.", ["south", "north", "east", "west"], 0, "在中国南方，in the south of China。"],
    ["c008q2", "It is surrounded by green ____ .", ["mountains", "buildings", "towers", "walls"], 0, "被青山环绕，surrounded by green mountains。"],
    ["c008q3", "A clear river ____ through it.", ["runs", "jumps", "flies", "walks"], 0, "一条清澈的河流穿过，runs through it。"],
    ["c008q4", "There are many old houses with red ____ .", ["roofs", "doors", "windows", "walls"], 0, "红屋顶的老房子，with red roofs。"],
    ["c008q5", "The people in my hometown are very kind and ____ .", ["hard-working", "lazy", "rich", "famous"], 0, "善良勤劳，kind and hard-working。"],
    ["c008q6", "Some old people do ____ in the square.", ["exercise", "homework", "shopping", "cooking"], 0, "做锻炼，do exercise。"],
    ["c008q7", "In spring, the whole town is full of ____ .", ["flowers", "snow", "rain", "wind"], 0, "春天开满花，full of flowers。"],
    ["c008q8", "In summer, children ____ in the river.", ["swim", "work", "sleep", "study"], 0, "夏天孩子们在河里游泳，swim in the river。"],
    ["c008q9", "In winter, people stay at home and ____ around the fire.", ["chat", "play", "cook", "read"], 0, "围炉聊天，chat around the fire。"],
    ["c008q10", "It is the place ____ I was born and grew up.", ["where", "which", "that", "who"], 0, "定语从句修饰地点 the place，用 where。"],
   ]
  ],
  ["c009", "Sports and Health",
   "Doing sports is good for our health. It makes our heart stronger, our bones stronger, and our body more flexible. It also helps us relax and sleep better. Many students like to play basketball, football, or table tennis. Some people like running, swimming, or cycling. No matter what sport you choose, the most important thing is to keep doing it. You do not need to be a professional athlete. You just need to do sports regularly, such as three times a week. Before doing sports, you should warm up to avoid getting hurt. After doing sports, you should drink some water and rest. Remember, sports can also help us make friends, because we often play in teams. So let us get moving and enjoy the fun of sports!",
   [
    ["c009q1", "Doing sports is ____ for our health.", ["good", "bad", "difficult", "boring"], 0, "运动对健康有好处，good for our health。"],
    ["c009q2", "It makes our heart ____ .", ["stronger", "weaker", "bigger", "smaller"], 0, "让心脏更强壮，heart stronger。"],
    ["c009q3", "It also helps us relax and sleep ____ .", ["better", "worse", "less", "more"], 0, "睡得更好，sleep better。"],
    ["c009q4", "Many students like to play basketball, football, or table ____ .", ["tennis", "games", "cards", "chess"], 0, "打乒乓球，table tennis。"],
    ["c009q5", "The most important thing is to keep ____ it.", ["doing", "do", "to do", "done"], 0, "坚持做，keep doing it。"],
    ["c009q6", "You do not need to be a professional ____ .", ["athlete", "teacher", "doctor", "farmer"], 0, "职业运动员，a professional athlete。"],
    ["c009q7", "You just need to do sports ____ .", ["regularly", "suddenly", "loudly", "quietly"], 0, "规律地运动，do sports regularly。"],
    ["c009q8", "Before doing sports, you should ____ up.", ["warm", "stand", "get", "wake"], 0, "热身，warm up。"],
    ["c009q9", "After doing sports, you should drink some ____ .", ["water", "cola", "tea", "juice"], 0, "运动后喝水，drink some water。"],
    ["c009q10", "Sports can also help us make ____ .", ["friends", "money", "trouble", "noise"], 0, "交朋友，make friends。"],
   ]
  ],
  ["c010", "A Visit to the Doctor",
   "Last week, I felt very tired and had a headache. My mother took me to see the doctor. The doctor asked me some questions, such as how I slept and what I ate. Then he took my temperature and checked my throat. He said I had a cold and that I should rest for a few days. He told me to take some medicine three times a day and drink more hot water. He also advised me not to stay up late and to do more exercise. I followed his advice and stayed in bed for two days. I drank a lot of water and took the medicine on time. Now I feel much better. I have learned that health is the most important thing in the world. Without health, we can do nothing. So we should take good care of ourselves every day.",
   [
    ["c010q1", "Last week, I felt very tired and had a ____ .", ["headache", "toothache", "stomachache", "backache"], 0, "头痛，had a headache。"],
    ["c010q2", "My mother took me to see the ____ .", ["doctor", "teacher", "friend", "farmer"], 0, "去看医生，see the doctor。"],
    ["c010q3", "The doctor asked me some ____ .", ["questions", "stories", "jokes", "lessons"], 0, "问一些问题，asked me some questions。"],
    ["c010q4", "Then he took my ____ and checked my throat.", ["temperature", "book", "bag", "shoe"], 0, "量体温，took my temperature。"],
    ["c010q5", "He said I had a ____ .", ["cold", "fever", "cough", "pain"], 0, "得了感冒，had a cold。"],
    ["c010q6", "He told me to take some ____ three times a day.", ["medicine", "food", "fruit", "water"], 0, "吃药，take some medicine。"],
    ["c010q7", "He also advised me not to ____ up late.", ["stay", "get", "wake", "stand"], 0, "不要熬夜，not to stay up late。"],
    ["c010q8", "I followed his ____ and stayed in bed for two days.", ["advice", "question", "book", "plan"], 0, "听从他的建议，followed his advice。"],
    ["c010q9", "I took the medicine ____ time.", ["on", "in", "at", "for"], 0, "按时吃药，on time。"],
    ["c010q10", "Health is the most ____ thing in the world.", ["important", "interesting", "expensive", "difficult"], 0, "最重要的东西，the most important thing。"],
   ]
  ]
];

export function buildCloze(t: ClozeTuple): { passage: { id: string; title: string; text: string }; questions: Question[] } {
  const [pid, title, text, qs] = t;
  const passage = { id: pid, title, text: text.replace(/\\n/g, '\n') };
  const questions: Question[] = qs.map(([id, prompt, options, answer, explanation]) => ({
    id,
    section: 'cloze',
    passageId: pid,
    prompt,
    options: [...options],
    answer: String(answer),
    explanation,
    source: 'builtin',
  }));
  return { passage, questions };
}
