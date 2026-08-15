import type { Question } from '../../types';

// 紧凑格式：[passageId, 标题, 正文, [ [题id, 含空句子, 选项, 答案下标, 解析], ... ]]
export type ClozeTuple = [string, string, string, [string, string, [string, string, string, string], number, string][]];

export const cloze1Raw: ClozeTuple[] = [
  ["c001", "A Busy Morning",
   "Yesterday morning, I got up late because my alarm clock did not work. I quickly washed my face and put on my clothes. I did not have time for breakfast, so I just drank a glass of milk. I ran to the bus stop, but the bus had already left. I had to wait for the next one. When I arrived at school, the first class had already begun. The teacher was not angry; he just smiled and asked me to sit down. After class, I told him the truth. He said, \"It is important to be honest. But next time, set your alarm clock before you go to bed.\" I learned a good lesson that day.",
   [
    ["c001q1", "I got up late because my alarm clock did not ____ .", ["work", "walk", "wake", "wait"], 0, "闹钟“不工作/失灵“用 did not work。"],
    ["c001q2", "I quickly washed my face and put on my ____ .", ["shoes", "clothes", "glasses", "hat"], 1, "洗漱后穿上衣服，put on my clothes。"],
    ["c001q3", "I did not have time for breakfast, so I just drank a glass of ____ .", ["water", "juice", "milk", "tea"], 2, "文中说 drank a glass of milk。"],
    ["c001q4", "I ran to the bus stop, but the bus had already ____ .", ["come", "left", "arrived", "stopped"], 1, "车已经开走了，had already left。"],
    ["c001q5", "When I arrived at school, the first class had already ____ .", ["begun", "ended", "finished", "started"], 0, "第一节课已经开始，had already begun。"],
    ["c001q6", "The teacher was not ____ ; he just smiled.", ["happy", "angry", "sad", "tired"], 1, "老师没有生气，not angry。"],
    ["c001q7", "After class, I told him the ____ .", ["story", "truth", "lie", "news"], 1, "告诉老师真相，told him the truth。"],
    ["c001q8", "He said, \"It is important to be ____ .\"", ["rich", "honest", "clever", "strong"], 1, "诚实很重要，be honest。"],
    ["c001q9", "But next time, set your ____ clock before you go to bed.", ["alarm", "wall", "hand", "table"], 0, "设置闹钟，set your alarm clock。"],
    ["c001q10", "I learned a good ____ that day.", ["lesson", "book", "word", "friend"], 0, "学到了一个好教训，a good lesson。"],
   ]
  ],
  ["c002", "Learning to Cook",
   "When I was in college, I lived far away from my parents. I had to learn to take care of myself. The biggest problem was cooking. At first, I could only cook noodles. One day, my mother called me and taught me how to cook rice and vegetables over the phone. She said, \"First, wash the rice and put it in the pot. Then add enough water and turn on the fire. When the water boils, turn the fire down and wait for twenty minutes.\" I followed her instructions carefully. To my surprise, the rice was perfect! After that, I began to try more dishes. Now I can cook many kinds of food. Cooking is not difficult if you have a good teacher and enough practice.",
   [
    ["c002q1", "When I was in college, I lived far away from my ____ .", ["parents", "friends", "teachers", "classmates"], 0, "远离父母生活，far away from my parents。"],
    ["c002q2", "I had to learn to take care of ____ .", ["myself", "himself", "herself", "itself"], 0, "照顾我自己，take care of myself。"],
    ["c002q3", "The biggest problem was ____ .", ["cooking", "washing", "cleaning", "shopping"], 0, "最大的问题是做饭，cooking。"],
    ["c002q4", "At first, I could only cook ____ .", ["rice", "noodles", "vegetables", "fish"], 1, "起初只会煮面，only cook noodles。"],
    ["c002q5", "My mother taught me ____ the phone.", ["on", "over", "by", "in"], 1, "通过电话教，over the phone。"],
    ["c002q6", "First, wash the rice and put it in the ____ .", ["pot", "cup", "bowl", "plate"], 0, "把米放进锅里，put it in the pot。"],
    ["c002q7", "When the water boils, turn the fire ____ and wait.", ["up", "down", "off", "on"], 1, "水开后把火调小，turn the fire down。"],
    ["c002q8", "I followed her instructions ____ .", ["carefully", "quickly", "loudly", "happily"], 0, "认真按照她的指导，followed her instructions carefully。"],
    ["c002q9", "To my ____ , the rice was perfect!", ["surprise", "sadness", "anger", "fear"], 0, "令我惊讶的是，to my surprise。"],
    ["c002q10", "Cooking is not difficult if you have a good ____ and enough practice.", ["teacher", "friend", "pot", "book"], 0, "有好老师和足够的练习，a good teacher。"],
   ]
  ],
  ["c003", "A Kind Stranger",
   "Last winter, I went to Beijing by train. It was my first time to travel alone. When I got off the train, it was late at night and it was snowing heavily. I did not know the way to my hotel. I stood at the station, worried and cold. At that moment, an old man came to me and asked, \"Can I help you?\" I showed him the address. He said, \"It is far from here. Let me take you there.\" He drove me to the hotel and refused to take any money. I was deeply moved. I asked for his name, but he just smiled and left. From then on, I always try to help people in need. A small act of kindness can warm a whole winter.",
   [
    ["c003q1", "It was my first time to travel ____ .", ["alone", "together", "quickly", "slowly"], 0, "第一次独自旅行，travel alone。"],
    ["c003q2", "When I got off the train, it was ____ at night.", ["late", "early", "noon", "dawn"], 0, "深夜，late at night。"],
    ["c003q3", "It was snowing ____ .", ["heavily", "lightly", "quietly", "suddenly"], 0, "下着大雪，snowing heavily。"],
    ["c003q4", "I stood at the station, ____ and cold.", ["worried", "happy", "excited", "proud"], 0, "又担心又冷，worried and cold。"],
    ["c003q5", "An old man came to me and asked, \"Can I ____ you?\"", ["help", "see", "call", "find"], 0, "需要帮忙吗？Can I help you?"],
    ["c003q6", "He said, \"It is ____ from here.\"", ["far", "near", "long", "short"], 0, "离这里很远，far from here。"],
    ["c003q7", "He drove me to the hotel and ____ to take any money.", ["refused", "agreed", "wanted", "decided"], 0, "拒绝收钱，refused to take any money。"],
    ["c003q8", "I was deeply ____ .", ["moved", "bored", "tired", "hurt"], 0, "被深深感动，deeply moved。"],
    ["c003q9", "I asked for his name, but he just ____ and left.", ["smiled", "cried", "shouted", "nodded"], 0, "他只是笑了笑就走了，just smiled and left。"],
    ["c003q10", "A small act of kindness can ____ a whole winter.", ["warm", "cool", "clean", "shorten"], 0, "温暖整个冬天，warm a whole winter。"],
   ]
  ],
  ["c004", "My English Learning",
   "I began to learn English when I was seven years old. At that time, I thought English was boring because I had to remember many new words. My teacher told me, \"Language learning needs patience. If you keep trying, you will make progress.\" So I made a plan. I learned ten new words every day and reviewed them before going to bed. I also listened to English songs and watched English movies. At first, I could not understand them, but I did not give up. Slowly, I found that I could understand more and more. Now English is my favorite subject. I can talk with foreigners and read English books. Learning English has opened a new window for me. I hope everyone can enjoy the joy of learning a language.",
   [
    ["c004q1", "I began to learn English when I was ____ years old.", ["seven", "ten", "twelve", "five"], 0, "七岁开始学英语，seven years old。"],
    ["c004q2", "At that time, I thought English was ____ .", ["boring", "interesting", "easy", "useful"], 0, "觉得英语无聊，was boring。"],
    ["c004q3", "I had to remember many new ____ .", ["words", "books", "rules", "songs"], 0, "记新单词，remember many new words。"],
    ["c004q4", "Language learning needs ____ .", ["patience", "money", "time only", "luck"], 0, "语言学习需要耐心，needs patience。"],
    ["c004q5", "I learned ten new words every ____ .", ["day", "week", "month", "hour"], 0, "每天学十个新单词，every day。"],
    ["c004q6", "I reviewed them before ____ to bed.", ["going", "go", "went", "gone"], 0, "睡前复习，before going to bed。"],
    ["c004q7", "I also listened to English ____ .", ["songs", "news", "stories", "speeches"], 0, "听英语歌曲，listened to English songs。"],
    ["c004q8", "At first, I could not ____ them.", ["understand", "hear", "see", "read"], 0, "听不懂，could not understand them。"],
    ["c004q9", "Slowly, I found that I could understand more and ____ .", ["more", "less", "better", "worse"], 0, "越来越多，more and more。"],
    ["c004q10", "Learning English has opened a new ____ for me.", ["window", "door", "book", "school"], 0, "打开了一扇新的窗户，opened a new window。"],
   ]
  ],
  ["c005", "The Value of Time",
   "Time is more valuable than money. Money can be earned again, but time can never come back. Some people waste their time watching TV or playing games all day. They do not realize that time is passing quickly. As students, we should make good use of our time. We can make a timetable and follow it. We should finish our homework first and then play. We should also read more books to enrich our knowledge. Remember, the early bird catches the worm. If we use our time wisely today, we will have a bright future tomorrow. Do not wait for tomorrow, because tomorrow never comes. Let us value every minute and make our life meaningful.",
   [
    ["c005q1", "Time is more ____ than money.", ["valuable", "expensive", "useful", "important"], 0, "时间比金钱更宝贵，more valuable。"],
    ["c005q2", "Money can be earned again, but time can never come ____ .", ["back", "up", "down", "out"], 0, "时间一去不复返，come back。"],
    ["c005q3", "Some people waste their time ____ TV all day.", ["watching", "watch", "to watch", "watched"], 0, "浪费时间看电视，waste time watching TV。"],
    ["c005q4", "They do not ____ that time is passing quickly.", ["realize", "remember", "forget", "believe"], 0, "没有意识到，do not realize。"],
    ["c005q5", "As students, we should make good ____ of our time.", ["use", "fun", "money", "friends"], 0, "好好利用时间，make good use of。"],
    ["c005q6", "We can make a ____ and follow it.", ["timetable", "plan", "list", "map"], 0, "制定时间表，make a timetable。"],
    ["c005q7", "We should finish our homework ____ and then play.", ["first", "last", "quickly", "slowly"], 0, "先完成作业再玩，finish homework first。"],
    ["c005q8", "We should also read more books to ____ our knowledge.", ["enrich", "reduce", "waste", "forget"], 0, "丰富知识，enrich our knowledge。"],
    ["c005q9", "Remember, the early bird ____ the worm.", ["catches", "eats", "sees", "finds"], 0, "早起的鸟儿有虫吃，catches the worm。"],
    ["c005q10", "Do not wait for tomorrow, because tomorrow never ____ .", ["comes", "goes", "ends", "begins"], 0, "明日复明日，明日何其多，tomorrow never comes。"],
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
