import type { Question, ReadingPassage } from '../../types';

// 紧凑格式：[passageId, 标题, 正文, [ [题id, 题干, 选项, 答案下标, 解析], ... ]]
export type ReadingTuple = [string, string, string, [string, string, [string, string, string, string], number, string][]];

export const reading1Raw: ReadingTuple[] = [
  ["r001", "A Healthy Habit",
   "Many people want to keep healthy, but they do not know how to start. Doctors say that walking is one of the easiest ways to stay in good shape. You do not need any special equipment, and you can do it almost anywhere. Walking for about 30 minutes every day can help your heart, make your bones stronger, and reduce stress. You can walk in a park, around your neighborhood, or even in a shopping mall when the weather is bad. To make it a habit, try to walk at the same time every day. For example, you can walk after dinner with your family or friends. Remember to wear comfortable shoes and drink enough water. If you keep doing it, you will feel healthier and happier.",
   [
    ["r001q1", "What is one of the easiest ways to stay healthy according to the passage?", ["Running", "Swimming", "Walking", "Cycling"], 2, "第一句提到 doctors say walking is one of the easiest ways to stay in good shape。"],
    ["r001q2", "How long should you walk every day?", ["10 minutes", "About 30 minutes", "2 hours", "5 minutes"], 1, "文中说 Walking for about 30 minutes every day 有益健康。"],
    ["r001q3", "What can you do when the weather is bad?", ["Stay at home all day", "Walk in a shopping mall", "Run fast", "Stop exercising"], 1, "文中说 you can walk in a shopping mall when the weather is bad。"],
    ["r001q4", "What should you wear when walking?", ["New clothes", "Uniforms", "Comfortable shoes", "High heels"], 2, "文中建议 remember to wear comfortable shoes。"],
    ["r001q5", "What is the main idea of this passage?", ["How to eat healthily", "Walking is a simple way to stay healthy", "Shoes are important", "Shopping malls are good places"], 1, "全文围绕“步行是保持健康的简单方法“展开。"],
   ]
  ],
  ["r002", "The Internet and Our Life",
   "The Internet has changed our life in many ways. We can use it to get information, talk with friends, shop online, and even study. Students can take online classes at home. Workers can have meetings on the computer. In the past, sending a letter took several days, but now an email arrives in seconds. However, the Internet also brings problems. Some people spend too much time online and forget to meet their friends in real life. Others may buy things they do not really need. So we should use the Internet wisely and not let it control our time.",
   [
    ["r002q1", "Which is NOT mentioned as a use of the Internet?", ["Getting information", "Shopping online", "Cooking meals", "Taking online classes"], 2, "文中提到获取信息、网上购物、在线学习，未提到做饭。"],
    ["r002q2", "How long does an email take to arrive now?", ["Several days", "A week", "Seconds", "A month"], 2, "文中说 now an email arrives in seconds。"],
    ["r002q3", "What problem can the Internet bring?", ["People forget to meet friends in real life", "People sleep more", "People eat more", "People study harder"], 0, "文中说有些人花太多时间上网，忘了在现实中见朋友。"],
    ["r002q4", "What does the writer advise us to do?", ["Stop using the Internet", "Use the Internet wisely", "Spend more time online", "Buy more things online"], 1, "最后一句：we should use the Internet wisely。"],
    ["r002q5", "The best title for this passage is ___.", ["How to Send Emails", "Problems of Computers", "The Internet and Our Life", "Online Shopping"], 2, "全文讲互联网给生活带来的变化和问题，标题应为 The Internet and Our Life。"],
   ]
  ],
  ["r003", "Learning a Language",
   "Learning a foreign language is not easy, but it is possible if you work hard. First, you should have a clear goal. For example, you may want to pass an exam or talk with foreign friends. Second, you need to practice every day. Even ten minutes a day is better than two hours once a week. You can listen to English songs, watch movies, or read simple stories. Third, do not be afraid of making mistakes. Mistakes are part of learning. Finally, you should be patient. Language learning takes time, and you cannot become good at it in one night. If you follow these steps, you will make progress day by day.",
   [
    ["r003q1", "What should you have first when learning a language?", ["A clear goal", "A new dictionary", "Foreign friends", "A good teacher"], 0, "文中说 First, you should have a clear goal。"],
    ["r003q2", "What is better according to the passage?", ["Two hours once a week", "Ten minutes every day", "One hour a month", "All day on Sunday"], 1, "文中说 ten minutes a day is better than two hours once a week。"],
    ["r003q3", "Which activity is mentioned for practice?", ["Listening to English songs", "Playing games", "Cooking", "Painting"], 0, "文中提到 listen to English songs, watch movies, read simple stories。"],
    ["r003q4", "What should you not be afraid of?", ["Making mistakes", "Sleeping", "Eating", "Walking"], 0, "文中说 do not be afraid of making mistakes。"],
    ["r003q5", "What does the writer think of language learning?", ["It is impossible", "It takes time and patience", "It is only for children", "It is very cheap"], 1, "文中说 Language learning takes time，要耐心。"],
   ]
  ],
  ["r004", "My Favorite Season",
   "Of all the seasons, I like spring best. When spring comes, the weather becomes warm, and the days get longer. The trees turn green, and flowers come out everywhere. Birds sing in the morning, and everything seems full of life. In spring, I like to take a walk in the park with my friends. We can see the green grass and smell the fresh air. Sometimes we fly kites in the open field. Spring is also a good time for outdoor sports, such as hiking and cycling. Besides, the spring rain is gentle, and it makes the world clean. I feel happy and energetic in spring. I hope spring lasts longer every year.",
   [
    ["r004q1", "Which season does the writer like best?", ["Summer", "Autumn", "Spring", "Winter"], 2, "开头即说 I like spring best。"],
    ["r004q2", "What is the weather like in spring?", ["Cold and dry", "Warm", "Hot", "Snowy"], 1, "文中说 the weather becomes warm。"],
    ["r004q3", "What does the writer do in the park?", ["Take a walk and fly kites", "Swim", "Play football", "Sell flowers"], 0, "文中提到 take a walk 和 fly kites。"],
    ["r004q4", "Which sport is mentioned as good in spring?", ["Skiing", "Hiking and cycling", "Ice skating", "Swimming"], 1, "文中说 spring is a good time for hiking and cycling。"],
    ["r004q5", "How does the writer feel in spring?", ["Tired", "Sad", "Happy and energetic", "Bored"], 2, "文中说 I feel happy and energetic in spring。"],
   ]
  ],
  ["r005", "Volunteers in the Community",
   "Volunteers are people who help others without asking for money. In our community, there are many volunteers. Some help the old people do housework and buy things for them. Some take care of the children whose parents are busy at work. Others clean the streets and plant trees in the park. Last month, a group of volunteers organized a charity sale to raise money for sick children. They collected old books, clothes, and toys from the neighbors and sold them in the market. With the money, they bought medicine and schoolbags for the children. The volunteers say that helping others makes them happy. The community has become warmer because of their hard work.",
   [
    ["r005q1", "What do volunteers do without asking for?", ["Food", "Money", "Clothes", "Praise"], 1, "第一句：help others without asking for money。"],
    ["r005q2", "What did the volunteers do for the old people?", ["Cooked for them", "Did housework and bought things", "Sang songs", "Took them to travel"], 1, "文中说 Some help the old people do housework and buy things for them。"],
    ["r005q3", "Why did they organize the charity sale?", ["To make money for themselves", "To raise money for sick children", "To buy new clothes", "To clean the market"], 1, "文中说 organize a charity sale to raise money for sick children。"],
    ["r005q4", "What did they sell in the market?", ["New computers", "Old books, clothes and toys", "Fresh vegetables", "Cooking tools"], 1, "文中说 collected old books, clothes, and toys and sold them。"],
    ["r005q5", "What did they buy with the money?", ["Medicine and schoolbags", "Toys and dolls", "Cars and bikes", "Flowers and trees"], 0, "文中说 bought medicine and schoolbags for the children。"],
   ]
  ],
  ["r006", "The History of Paper",
   "Paper is one of the most important inventions in human history. Before paper was invented, people wrote on stones, animal skins, or bamboo. These materials were heavy and difficult to carry. About two thousand years ago, the Chinese invented paper. At first, paper was made from old cloth and fishing nets. Later, people used bamboo and wood to make it. The invention of paper made writing much easier and cheaper. Books became lighter, and more people could read and study. From China, the technology of making paper spread to other parts of the world. Today, we use paper everywhere — in books, newspapers, boxes, and many other things. Although computers are popular now, paper is still very useful in our daily life.",
   [
    ["r006q1", "What did people write on before paper was invented?", ["Plastic and glass", "Stones and bamboo", "Wood and metal", "Leaves and flowers"], 1, "文中说 people wrote on stones, animal skins, or bamboo。"],
    ["r006q2", "Who invented paper according to the passage?", ["The Japanese", "The Chinese", "The Americans", "The British"], 1, "文中说 the Chinese invented paper。"],
    ["r006q3", "What was paper first made from?", ["Stones and sand", "Old cloth and fishing nets", "Plastic bags", "Animal skins only"], 1, "文中说 At first, paper was made from old cloth and fishing nets。"],
    ["r006q4", "What happened after paper was invented?", ["Books became lighter", "Writing became harder", "People stopped reading", "Wood disappeared"], 0, "文中说 Books became lighter, and more people could read。"],
    ["r006q5", "What can we infer from the last paragraph?", ["Paper will disappear soon", "Paper is still useful today", "Computers are useless", "People only use computers"], 1, "最后一句说 paper is still very useful in our daily life。"],
   ]
  ],
  ["r007", "Time Management",
   "Do you often feel that you do not have enough time? Many students complain about this. The problem is not that we have too little time, but that we do not use it well. Here are some tips. First, make a list of things you need to do and write them down. Then put the most important things first. Do not start many tasks at the same time; finish one before you begin another. Second, say no to things that are not important, such as watching TV for hours. Third, take short breaks. A ten-minute rest after an hour of study can help you work better. Finally, go to bed early and get up early. A good sleep makes your brain work faster. If you manage your time well, you will find that you have enough time for both study and play.",
   [
    ["r007q1", "What is the real problem according to the writer?", ["We have too little time", "We do not use time well", "We work too hard", "We sleep too much"], 1, "文中说 the problem is not that we have too little time, but that we do not use it well。"],
    ["r007q2", "What should you do first according to the tips?", ["Watch TV", "Make a list of things to do", "Take a rest", "Go to bed"], 1, "文中说 First, make a list of things you need to do。"],
    ["r007q3", "Why should you take short breaks?", ["To watch TV", "To work better", "To eat more", "To save time"], 1, "文中说 A ten-minute rest can help you work better。"],
    ["r007q4", "What does a good sleep do?", ["Makes the brain work faster", "Makes you lazy", "Wastes time", "Makes you hungry"], 0, "文中说 A good sleep makes your brain work faster。"],
    ["r007q5", "The passage mainly tells us ___.", ["how to study English", "how to manage time well", "how to watch TV", "how to make friends"], 1, "全文主题是时间管理（Time Management）。"],
   ]
  ],
  ["r008", "Protecting the Environment",
   "The environment around us is getting worse. Air pollution, water pollution, and waste are big problems. If we do nothing, our life will be in danger. Luckily, everyone can do something to help. First, we should save water and electricity in daily life. Turn off the lights when you leave a room, and do not let the water run while brushing your teeth. Second, we should reduce waste. Take your own shopping bags to the store instead of using plastic bags. Third, we should plant more trees because trees make the air clean. Finally, we can tell our friends and family about the importance of protecting the environment. Small actions together make a big difference. Let us start from today!",
   [
    ["r008q1", "Which is NOT mentioned as a big problem?", ["Air pollution", "Water pollution", "Waste", "Traffic jams"], 3, "文中提到空气污染、水污染和垃圾，未提到交通堵塞。"],
    ["r008q2", "What should you do when leaving a room?", ["Turn on the lights", "Turn off the lights", "Open the window", "Close the door"], 1, "文中说 Turn off the lights when you leave a room。"],
    ["r008q3", "Why should we plant more trees?", ["They make the air clean", "They are beautiful", "They provide food", "They make noise"], 0, "文中说 trees make the air clean。"],
    ["r008q4", "What does the writer suggest instead of plastic bags?", ["Paper bags", "Your own shopping bags", "No bags", "Metal boxes"], 1, "文中说 Take your own shopping bags to the store instead of using plastic bags。"],
    ["r008q5", "What is the writer's attitude towards the future?", ["Worried but hopeful", "Very sad", "Angry", "Indifferent"], 0, "作者既指出问题严重，又说 small actions together make a big difference，担忧但充满希望。"],
   ]
  ],
  ["r009", "A Day at the Beach",
   "Last Sunday, my family and I went to the beach. We got up early and drove for two hours. When we arrived, the sun was shining, and the sea was blue and calm. My little sister ran to the water and laughed. My father and I played beach volleyball with some other people. My mother sat under an umbrella and read a book. At noon, we had a picnic on the sand. We ate sandwiches, fruit, and drank cold juice. In the afternoon, we collected shells and took many photos. The most exciting moment was when we saw a small boat with colorful flags. Before we left, we cleaned up all our rubbish so that the beach stayed clean. We were tired but very happy. It was a wonderful day.",
   [
    ["r009q1", "How did the family go to the beach?", ["By train", "By car", "By bus", "By bike"], 1, "文中说 we drove for two hours（开车）。"],
    ["r009q2", "What did the writer do at the beach?", ["Played beach volleyball", "Read a book", "Swam in deep water", "Flew kites"], 0, "文中说 My father and I played beach volleyball。"],
    ["r009q3", "What did they eat at noon?", ["Noodles", "Sandwiches and fruit", "Rice and fish", "Cakes"], 1, "文中说 We ate sandwiches, fruit, and drank cold juice。"],
    ["r009q4", "What was the most exciting moment?", ["Seeing a small boat with colorful flags", "Eating lunch", "Sleeping on the sand", "Driving home"], 0, "文中说 The most exciting moment was when we saw a small boat with colorful flags。"],
    ["r009q5", "Why did they clean up the rubbish?", ["To keep the beach clean", "To find shells", "Because they were bored", "To play a game"], 0, "文中说 we cleaned up all our rubbish so that the beach stayed clean。"],
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
