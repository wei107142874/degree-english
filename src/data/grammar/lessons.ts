import type { GrammarLesson } from '../../types';

export const LESSONS: GrammarLesson[] = [
  {
    id: 'sentence-structure',
    title: '句子结构基础：主语+谓语',
    category: '基础',
    summary: '英语句子最核心的骨架：谁（主语）+ 做什么（谓语）。',
    sections: [
      {
        heading: '英语句子的最小骨架',
        content: [
          '英语句子最基本的结构是：主语（谁）+ 谓语（做什么）。这是所有句子的地基。',
          '主语通常是名词或代词，比如 I（我）、you（你）、he（他）、she（她）、the cat（猫）。',
          '谓语是动词，表示动作或状态。比如 run（跑）、eat（吃）、is（是）。',
          '例子：I study. （我学习。）主语 I + 谓语 study，这就构成了一个完整句子。',
        ],
        examples: [
          { en: 'I study English every day.', zh: '我每天学英语。' },
          { en: 'She works in a hospital.', zh: '她在一家医院工作。' },
        ],
      },
      {
        heading: '怎么判断一句话对不对？',
        content: [
          '拿到一个句子先问两个问题：① 谁？② 干什么/是什么？',
          '如果两个都有，句子基本结构就成立了。这就是写作和翻译的保底方法：先写出主谓，再往上加修饰。',
        ],
        examples: [
          { en: 'He runs. → He runs fast in the morning.', zh: '他跑。→ 他早上跑得很快。（先骨架后修饰）' },
        ],
      },
    ],
    quiz: [
      { question: '下面哪个是完整的英语句子？', options: ['Because I like it.', 'I like it.', 'Likes it.', 'I like.'], answer: 1, explanation: 'I（主语）+ like it（谓语+宾语）结构完整；Because 开头的从句不能单独成句；Likes it 缺主语；I like 缺宾语（口语可，考试算不完整）。' },
      { question: '"她每天学习英语。" 的主语是？', options: ['学习', '英语', '她', '每天'], answer: 2, explanation: '主语是动作的执行者"她"（she）。' },
      { question: '句子 "The boy is reading." 中哪个是谓语？', options: ['The boy', 'is reading', 'reading', 'boy'], answer: 1, explanation: 'is reading 是谓语部分（is + 现在分词构成进行时）。' },
    ],
  },
  {
    id: 'tense-voice',
    title: '动词时态与语态（必考重点）',
    category: '动词',
    summary: '掌握 4 大高频时态：一般现在、一般过去、一般将来、现在完成。',
    sections: [
      {
        heading: '一般现在时：表示经常发生的动作或客观事实',
        content: [
          '结构：主语 + 动词原形（第三人称单数加 -s/-es）。',
          '标志词：always（总是）、usually（通常）、often（经常）、every day（每天）。',
          '注意：主语是 he/she/it 时，动词要加 s，如 She likes music.',
        ],
        examples: [
          { en: 'She goes to work by bus every day.', zh: '她每天坐公交上班。' },
          { en: 'The sun rises in the east.', zh: '太阳从东方升起。（客观事实）' },
        ],
      },
      {
        heading: '一般过去时：表示过去发生的动作',
        content: [
          '结构：主语 + 动词过去式（-ed 或不规则变化）。',
          '标志词：yesterday（昨天）、last week（上周）、ago（以前）、in 2020。',
          '不规则动词要单独记：go→went，see→saw，do→did，have→had。',
        ],
        examples: [
          { en: 'I visited my grandparents last weekend.', zh: '我上周末看望了祖父母。' },
          { en: 'He went to Beijing in 2020.', zh: '他2020年去了北京。' },
        ],
      },
      {
        heading: '一般将来时：表示将来要发生的动作',
        content: [
          '结构：will + 动词原形，或 be going to + 动词原形。',
          '标志词：tomorrow（明天）、next week（下周）、soon（很快）、in the future（将来）。',
        ],
        examples: [
          { en: 'I will call you tomorrow.', zh: '我明天给你打电话。' },
          { en: 'We are going to have a test next Monday.', zh: '我们下周一要考试。' },
        ],
      },
      {
        heading: '现在完成时：表示过去发生且对现在有影响的动作',
        content: [
          '结构：have/has + 过去分词（done）。',
          '标志词：already（已经）、yet（还没）、ever（曾经）、never（从不）、since（自从）、for + 一段时间。',
          '这是学位英语最爱考的时态之一，注意区分：I have finished my homework.（我已经写完作业了——对现在的影响：现在可以玩了）',
        ],
        examples: [
          { en: 'I have already finished my homework.', zh: '我已经写完作业了。' },
          { en: 'She has lived here for five years.', zh: '她在这里住了五年了。' },
        ],
      },
      {
        heading: '被动语态：动作不是主语发出的',
        content: [
          '结构：be + 过去分词。时态体现在 be 上：is done（一般现在被动）、was done（过去被动）、will be done（将来被动）、has been done（完成被动）。',
          '判断方法：主语是被"做"的对象就用被动。如 The bridge was built in 2000.（桥是被建的）',
        ],
        examples: [
          { en: 'The classroom is cleaned every day.', zh: '教室每天被打扫。' },
          { en: 'The letter was written by Tom.', zh: '这封信是汤姆写的。' },
        ],
      },
    ],
    quiz: [
      { question: 'She ___ English every day.', options: ['study', 'studies', 'studied', 'will study'], answer: 1, explanation: 'every day 是一般现在时标志，主语 she 是第三人称单数，动词加 -es。' },
      { question: 'I ___ my homework yesterday.', options: ['finish', 'finishes', 'finished', 'will finish'], answer: 2, explanation: 'yesterday（昨天）是一般过去时标志，用过去式 finished。' },
      { question: 'They ___ to Shanghai next month.', options: ['go', 'went', 'have gone', 'will go'], answer: 3, explanation: 'next month（下个月）是将来时标志，用 will go。' },
      { question: 'We ___ each other since 2018.', options: ['know', 'knew', 'have known', 'will know'], answer: 2, explanation: 'since 2018（自从2018年）是现在完成时标志，用 have known。' },
      { question: 'The book ___ by Lu Xun.', options: ['wrote', 'was written', 'is writing', 'writes'], answer: 1, explanation: '书是被鲁迅写的，主语是被动对象，用被动语态 was written。' },
    ],
  },
  {
    id: 'nonfinite',
    title: '非谓语动词：to do / doing / done',
    category: '动词',
    summary: '一句话里只能有一个谓语动词，其他的动词要用 to do、doing 或 done 形式。',
    sections: [
      {
        heading: '为什么需要非谓语？',
        content: [
          '英语规定：一个简单句只能有一个谓语动词。如果想说"我喜欢游泳"，两个动词（喜欢、游泳）就要处理：I like swimming. 其中 like 是谓语，swimming 就是非谓语。',
          '三种形式各有用途：to do（表目的/将来）、doing（表主动/正在进行/习惯）、done（表被动/完成）。',
        ],
      },
      {
        heading: '常考搭配（必须背）',
        content: [
          '后接 doing：enjoy doing（喜欢做）、finish doing（完成做）、mind doing（介意做）、keep doing（继续做）、practice doing（练习做）、give up doing（放弃做）。',
          '后接 to do：want to do（想要做）、decide to do（决定做）、hope to do（希望做）、plan to do（计划做）、agree to do（同意做）、try to do（努力做）。',
          '后接 sb. to do：ask sb. to do（叫某人做）、tell sb. to do（告诉某人做）、want sb. to do（想让某人做）。',
        ],
        examples: [
          { en: 'I enjoy listening to music.', zh: '我喜欢听音乐。（enjoy + doing）' },
          { en: 'She decided to study abroad.', zh: '她决定出国留学。（decide + to do）' },
          { en: 'The teacher asked us to keep quiet.', zh: '老师让我们保持安静。（ask sb. to do）' },
        ],
      },
      {
        heading: 'doing 和 done 做定语（修饰名词）',
        content: [
          'doing 表主动：the running boy（奔跑的男孩，男孩自己跑）。',
          'done 表被动：the broken window（破碎的窗户，窗户被打破）。',
        ],
        examples: [
          { en: 'There is a sleeping cat on the sofa.', zh: '沙发上有一只睡觉的猫。' },
          { en: 'The lost key was found at last.', zh: '丢失的钥匙终于被找到了。' },
        ],
      },
    ],
    quiz: [
      { question: 'I enjoy ___ English songs.', options: ['listen to', 'listening to', 'to listen to', 'listened to'], answer: 1, explanation: 'enjoy 后接 doing：enjoy listening to。' },
      { question: 'He decided ___ a doctor.', options: ['become', 'becoming', 'to become', 'became'], answer: 2, explanation: 'decide 后接 to do：decide to become。' },
      { question: 'The teacher told us ___ late for school.', options: ['not be', 'not to be', 'don’t be', 'to not be'], answer: 1, explanation: 'tell sb. not to do：告诉某人不要做某事，否定形式是 not to be。' },
      { question: 'Please keep ___ until I come back.', options: ['wait', 'waited', 'waiting', 'to wait'], answer: 2, explanation: 'keep + doing：keep waiting（继续等）。' },
    ],
  },
  {
    id: 'attributive-clause',
    title: '定语从句（阅读高频考点）',
    category: '从句',
    summary: '用 who/which/that 引导的从句来修饰名词，读懂它就能读懂阅读里的长句。',
    sections: [
      {
        heading: '什么是定语从句？',
        content: [
          '定语就是"修饰语"。定语从句 = 一个从句当形容词用，跟在名词后面。',
          '引导词选择规则：修饰人用 who/that；修饰物用 which/that；表示"谁的"用 whose。',
          '例：The girl who is singing is my sister.（正在唱歌的那个女孩是我妹妹。）who is singing 修饰 the girl。',
        ],
        examples: [
          { en: 'The man who helped me is a teacher.', zh: '帮助我的那个人是老师。' },
          { en: 'This is the book which I bought yesterday.', zh: '这是我昨天买的书。' },
        ],
      },
      {
        heading: 'that 和 which 的区别（常考）',
        content: [
          '只能用 that 不能用 which 的情况：先行词是 all、everything、nothing 等不定代词时，或先行词被最高级、序数词修饰时。',
          '例：This is the best book that I have read.（这是我读过的最好的书。）',
        ],
        examples: [
          { en: 'Everything that he said is true.', zh: '他说的每件事都是真的。' },
          { en: 'She is the first student that came to school.', zh: '她是第一个到校的学生。' },
        ],
      },
      {
        heading: 'who 和 whom 的区别',
        content: [
          'who 在从句中做主语：the man who spoke（说话的那个人，who 做主语）。',
          'whom 在从句中做宾语：the man whom I met（我遇见的那个人，whom 做 met 的宾语）。现代英语常用 who 代替 whom，但考试要注意。',
        ],
        examples: [
          { en: 'The doctor who saved the child is famous.', zh: '救孩子的医生很有名。' },
          { en: 'The girl whom I met at the party is from Canada.', zh: '我在聚会上遇到的女孩来自加拿大。' },
        ],
      },
    ],
    quiz: [
      { question: 'The boy ___ is playing basketball is my brother.', options: ['which', 'who', 'whom', 'whose'], answer: 1, explanation: '先行词 the boy 是人且在从句中做主语，用 who。' },
      { question: 'This is the house ___ we lived in ten years ago.', options: ['who', 'whose', 'which', 'where'], answer: 2, explanation: '先行词 the house 是物，用 which/that；此句 which 做 lived in 的宾语。' },
      { question: 'All ___ he said was right.', options: ['which', 'that', 'who', 'what'], answer: 1, explanation: '先行词是不定代词 all 时，只能用 that。' },
      { question: 'The woman ___ daughter is my classmate works in a bank.', options: ['who', 'which', 'whom', 'whose'], answer: 3, explanation: '表示"那个女人的女儿"，用 whose（谁的）。' },
    ],
  },
  {
    id: 'noun-clause',
    title: '名词性从句：主语/宾语/表语从句',
    category: '从句',
    summary: '一个从句当名词用：that 引导陈述，whether 引导是否，what/who 等引导特殊疑问。',
    sections: [
      {
        heading: '宾语从句（最重要）',
        content: [
          '结构：主句动词 + that/whether/疑问词 + 从句。',
          '陈述内容用 that：I think that he is right.（我认为他是对的。）',
          '"是否"用 whether/if：I don’t know whether he will come.（我不知道他是否会来。）',
          '特殊疑问用疑问词：Can you tell me where the station is?（你能告诉我车站在哪吗？）',
          '注意：宾语从句用陈述语序（主语在前），且主句是过去时从句要相应过去化。',
        ],
        examples: [
          { en: 'I believe (that) you can pass the exam.', zh: '我相信你能通过考试。' },
          { en: 'He asked me where I lived.', zh: '他问我住在哪里。（陈述语序 I lived）' },
        ],
      },
      {
        heading: '主语从句与 it 形式主语',
        content: [
          '从句做主语：That he came late surprised us.（他来晚了让我们惊讶。）',
          '更常见的写法是用 it 做形式主语：It is important that we study hard.（我们努力学习很重要。）',
          '常考句型：It is + adj. + that 从句；It is said that...（据说……）',
        ],
        examples: [
          { en: 'It is said that the meeting has been cancelled.', zh: '据说会议被取消了。' },
          { en: 'It is necessary that we should practice every day.', zh: '我们每天练习是必要的。' },
        ],
      },
      {
        heading: '表语从句',
        content: [
          'be 动词后面的从句就是表语从句：The reason is that he was ill.（原因是他病了。）',
          '常见结构：The reason is that...（原因是……）、That is why...（那就是为什么……）。',
        ],
        examples: [
          { en: 'That is why I like English.', zh: '那就是我喜欢英语的原因。' },
          { en: 'The problem is that we have no time.', zh: '问题是我们没有时间。' },
        ],
      },
    ],
    quiz: [
      { question: 'I don’t know ___ he will come tomorrow.', options: ['that', 'whether', 'what', 'which'], answer: 1, explanation: '"是否"用 whether/if 引导宾语从句。' },
      { question: 'Can you tell me ___?', options: ['where is the station', 'where the station is', 'the station is where', 'where was the station'], answer: 1, explanation: '宾语从句用陈述语序：疑问词 + 主语 + 谓语。' },
      { question: '___ is important that we should protect the environment.', options: ['That', 'This', 'It', 'What'], answer: 2, explanation: 'it 做形式主语，真正的主语是后面的 that 从句。' },
      { question: 'The reason for his absence is ___ he was ill.', options: ['because', 'why', 'that', 'what'], answer: 2, explanation: 'The reason is that... 是固定句型，用 that 引导表语从句。' },
    ],
  },
  {
    id: 'adverbial-clause',
    title: '状语从句：时间/原因/条件/让步',
    category: '从句',
    summary: '用连接词连接"什么时候、为什么、什么条件下、虽然"等逻辑关系。',
    sections: [
      {
        heading: '时间状语从句',
        content: [
          '常用连接词：when（当……时）、while（当……时/而）、before（在……之前）、after（在……之后）、as soon as（一……就）、until（直到）。',
          '注意：主句用将来时，从句用一般现在时（"主将从现"）。如 I will call you when I arrive.（我到了就给你打电话。）',
        ],
        examples: [
          { en: 'When I got home, my mother was cooking.', zh: '我到家时，妈妈正在做饭。' },
          { en: 'Please wait here until the bus comes.', zh: '请在这里等到公交车来。' },
        ],
      },
      {
        heading: '原因状语从句',
        content: [
          '常用连接词：because（因为）、since（既然/因为）、as（由于）。',
          'because 回答 why 的问题，语气最强：He didn’t come because he was ill.（他没来因为他病了。）',
          '注意 because 和 so 不能同时用：不能说 Because he was ill, so he didn’t come.（错误）',
        ],
        examples: [
          { en: 'Since you are tired, you should rest.', zh: '既然你累了，你应该休息。' },
          { en: 'I stayed at home because it rained heavily.', zh: '因为雨下得很大，我待在家里。' },
        ],
      },
      {
        heading: '条件状语从句',
        content: [
          '常用连接词：if（如果）、unless（除非=if not）、as long as（只要）。',
          '主将从现规则同样适用：If it rains tomorrow, we will stay home.（如果明天下雨，我们就待在家。）',
        ],
        examples: [
          { en: 'If you work hard, you will succeed.', zh: '如果你努力，就会成功。' },
          { en: 'You will fail unless you study.', zh: '除非你学习，否则你会失败。' },
        ],
      },
      {
        heading: '让步状语从句',
        content: [
          '常用连接词：although/though（虽然）、even if（即使）、no matter how（无论怎样）。',
          '注意 although 和 but 不能同时用：Although it was late, he kept working.（正确）',
        ],
        examples: [
          { en: 'Although it was cold, he went swimming.', zh: '虽然很冷，他还是去游泳了。' },
          { en: 'Even if I fail, I will try again.', zh: '即使失败，我也会再试。' },
        ],
      },
    ],
    quiz: [
      { question: 'I will call you as soon as I ___ home.', options: ['get', 'got', 'will get', 'have got'], answer: 0, explanation: '主将从现：主句将来时，as soon as 从句用一般现在时。' },
      { question: '___ he was ill, he didn’t come to school.', options: ['So', 'Because', 'Although', 'But'], answer: 1, explanation: '他病了是没来上学的原因，用 Because。' },
      { question: 'You won’t pass the exam ___ you study hard.', options: ['if', 'unless', 'because', 'so'], answer: 1, explanation: 'unless = if not："除非你努力学习"，否则不会通过。' },
      { question: '___ it was raining, we went out for a walk.', options: ['Because', 'Although', 'So', 'If'], answer: 1, explanation: '虽然下雨但出去了，表转折让步，用 Although；且 although 不与 but 连用。' },
    ],
  },
  {
    id: 'subjunctive',
    title: '虚拟语气（选词题常客）',
    category: '动词',
    summary: '表达与事实相反的假设，记住三个"公式"就能拿分。',
    sections: [
      {
        heading: '与现在事实相反',
        content: [
          '公式：If + 主语 + did/were, 主语 + would/could + do。',
          '例：If I were you, I would study harder.（如果我是你，我会更努力学习。——事实上我不是你）',
          '注意：be 动词一律用 were（包括 I/he/she）。',
        ],
        examples: [
          { en: 'If I had more time, I would travel more.', zh: '如果我有更多时间，我会多旅行。（实际没时间）' },
        ],
      },
      {
        heading: '与过去事实相反',
        content: [
          '公式：If + 主语 + had done, 主语 + would/could have done。',
          '例：If I had known the answer, I would have told you.（如果我早知道答案，我会告诉你。——实际没告诉）',
        ],
        examples: [
          { en: 'If he had studied harder, he would have passed.', zh: '如果他当初更努力学习，他就通过了。（实际没通过）' },
        ],
      },
      {
        heading: '与将来事实相反及特殊句型',
        content: [
          '与将来相反：If + 主语 + did/were to do, 主语 + would + do。',
          '特殊句型（常考）：I wish + 过去式（但愿……）；It is time that + 过去式（该做……了）；suggest/require 等动词后接 (should) do。',
          '例：I wish I knew the answer.（但愿我知道答案。）The doctor suggested that he (should) stop smoking.（医生建议他戒烟。）',
        ],
        examples: [
          { en: 'I wish I were taller.', zh: '但愿我更高一些。' },
          { en: 'She suggested that we (should) leave early.', zh: '她建议我们早点出发。' },
        ],
      },
    ],
    quiz: [
      { question: 'If I ___ you, I would accept the offer.', options: ['am', 'was', 'were', 'be'], answer: 2, explanation: '与现在事实相反的虚拟语气，be 动词一律用 were。' },
      { question: 'If he ___ harder last year, he would have passed.', options: ['studies', 'studied', 'had studied', 'has studied'], answer: 2, explanation: '与过去事实相反：if + had done。' },
      { question: 'I wish I ___ more time to read.', options: ['have', 'had', 'will have', 'am having'], answer: 1, explanation: 'wish 后接虚拟语气，与现在事实相反用过去式 had。' },
      { question: 'The teacher suggested that we ___ more carefully.', options: ['write', 'wrote', 'had written', 'are writing'], answer: 0, explanation: 'suggest 后接 (should) + 动词原形，should 可省略。' },
    ],
  },
  {
    id: 'inversion-emphasis',
    title: '倒装句与强调句',
    category: '句型',
    summary: '掌握"否定词开头倒装"和"It is...that..."强调句型。',
    sections: [
      {
        heading: '部分倒装：否定词或 only 放在句首时',
        content: [
          '公式：否定词/only + 助动词 + 主语 + 谓语。',
          '常见触发词：never（从不）、seldom（很少）、hardly（几乎不）、not only...but also、only + 状语、so（也）。',
          '例：Never have I seen such a beautiful place.（我从未见过这么美的地方。）',
          '例：Only in this way can we solve the problem.（只有用这种方法我们才能解决问题。）',
        ],
        examples: [
          { en: 'Seldom does he go to the cinema.', zh: '他很少去看电影。' },
          { en: 'Not only did she sing, but she also danced.', zh: '她不仅唱歌，还跳舞。' },
        ],
      },
      {
        heading: 'so/neither 引导的倒装',
        content: [
          '"也……"用 so + 助动词 + 主语：I like tea. So does she.（我喜欢茶。她也喜欢。）',
          '"也不……"用 neither/nor + 助动词 + 主语：I can’t swim. Neither can he.（我不会游泳。他也不会。）',
        ],
        examples: [
          { en: 'He passed the exam. So did I.', zh: '他通过了考试。我也是。' },
          { en: 'She doesn’t like coffee. Neither do I.', zh: '她不喜欢咖啡。我也不喜欢。' },
        ],
      },
      {
        heading: '强调句型：It is/was + 被强调部分 + that/who',
        content: [
          '去掉 It is...that 后句子仍然完整，就是强调句。',
          '强调人可以用 who：It was Tom who broke the window.（是汤姆打碎了窗户。）',
          '强调时间/地点等一律用 that：It was in 2020 that we met.（我们是在2020年认识的。）注意不能用 when/where！',
        ],
        examples: [
          { en: 'It is English that we should study well.', zh: '我们应该学好的正是英语。' },
          { en: 'It was yesterday that he told me the news.', zh: '他是在昨天告诉我这个消息的。' },
        ],
      },
    ],
    quiz: [
      { question: 'Never ___ such a wonderful performance.', options: ['I have seen', 'have I seen', 'I saw', 'saw I'], answer: 1, explanation: 'never 放句首，句子要部分倒装：助动词 + 主语 + 谓语。' },
      { question: 'Only by working hard ___ succeed.', options: ['you can', 'can you', 'you will', 'you could'], answer: 1, explanation: 'only + 状语放句首，主句倒装。' },
      { question: 'He can speak French. So ___ his sister.', options: ['can', 'does', 'is', 'has'], answer: 0, explanation: '"也……"用 so + 助动词 + 主语，前面是 can，后面也用 can。' },
      { question: 'It was in the park ___ we met for the first time.', options: ['when', 'where', 'that', 'which'], answer: 2, explanation: '强调句 It was...that...，即使强调地点也用 that，不用 where。' },
    ],
  },
  {
    id: 'agreement',
    title: '主谓一致',
    category: '语法细节',
    summary: '谓语动词要和主语保持一致，最常考"就近原则"和"就远原则"。',
    sections: [
      {
        heading: '基本原则',
        content: [
          '主语是单数（或不可数），谓语用单数（is/has/does/动词加s）；主语是复数，谓语用复数（are/have/do）。',
          '例：The book is interesting.（书是单数）The books are interesting.（书们是复数）',
        ],
        examples: [
          { en: 'Water is important for life.', zh: '水对生命很重要。（不可数名词用单数谓语）' },
          { en: 'The children are playing outside.', zh: '孩子们在外面玩。（复数主语用复数谓语）' },
        ],
      },
      {
        heading: '就近原则：either...or / neither...nor / not only...but also / there be',
        content: [
          '这些结构连接两个主语时，谓语和最近的那个主语一致。',
          '例：Either you or he is wrong.（要么你错要么他错——he 是单数，用 is）',
          '例：There is a pen and two books on the desk.（离 be 最近的是 a pen，用 is）',
        ],
        examples: [
          { en: 'Neither the teacher nor the students were satisfied.', zh: '老师和学生都不满意。（students 最近，用复数）' },
        ],
      },
      {
        heading: '就远原则：with / together with / as well as / except',
        content: [
          '主语 + with/together with/as well as + 其他，谓语和真正的主语（前面那个）一致。',
          '例：The teacher with his students is visiting the museum.（主语是 the teacher，用 is）',
        ],
        examples: [
          { en: 'Tom as well as his friends likes football.', zh: '汤姆和他的朋友都喜欢足球。（主语是 Tom，用 likes）' },
        ],
      },
      {
        heading: '特殊主语',
        content: [
          'everyone/someone/nobody/everything 等不定代词视为单数：Everyone is here.（大家都到了。）',
          '时间、距离、金钱视为单数：Ten years is a long time.（十年是很长时间。）',
        ],
        examples: [
          { en: 'Nobody knows the answer.', zh: '没有人知道答案。' },
          { en: 'Five hundred yuan is enough.', zh: '五百元足够了。' },
        ],
      },
    ],
    quiz: [
      { question: 'Either you or I ___ wrong.', options: ['am', 'is', 'are', 'be'], answer: 0, explanation: '就近原则：离谓语最近的是 I，用 am。' },
      { question: 'The teacher with his students ___ gone to the museum.', options: ['have', 'has', 'are', 'were'], answer: 1, explanation: '就远原则：真正的主语是 the teacher（单数），用 has。' },
      { question: 'There ___ a book and two pens on the desk.', options: ['are', 'is', 'were', 'be'], answer: 1, explanation: '就近原则：离 be 最近的是 a book（单数），用 is。' },
      { question: 'Everyone in our class ___ the exam.', options: ['pass', 'passes', 'are passing', 'have passed'], answer: 1, explanation: 'everyone 视为单数，谓语用单数 passes。' },
    ],
  },
  {
    id: 'comparison',
    title: '形容词副词的比较级与最高级',
    category: '语法细节',
    summary: '比较级用于两者比较，最高级用于三者以上，记住几个常考句型。',
    sections: [
      {
        heading: '比较级与最高级的构成',
        content: [
          '短词加 -er/-est：tall→taller→tallest；long→longer→longest。',
          '以 e 结尾加 -r/-st：large→larger→largest。',
          '辅音+y 结尾变 i 加 -er/-est：happy→happier→happiest。',
          '多音节词用 more/most：beautiful→more beautiful→most beautiful。',
          '不规则：good/well→better→best；bad→worse→worst；many/much→more→most；little→less→least。',
        ],
        examples: [
          { en: 'This book is more interesting than that one.', zh: '这本书比那本更有趣。' },
          { en: 'She is the best student in our class.', zh: '她是我们班最好的学生。' },
        ],
      },
      {
        heading: '常考句型',
        content: [
          '比较级 + than：A is taller than B.（A 比 B 高。）',
          'the + 比较级, the + 比较级：The more you practice, the better you will be.（你练得越多，就越好。）',
          'as...as 原级比较：He runs as fast as me.（他和我跑得一样快。）否定：not as/so...as。',
          '最高级 + 范围：the + 最高级 + in/of 短语。',
        ],
        examples: [
          { en: 'The harder you work, the more progress you make.', zh: '你越努力，进步越大。' },
          { en: 'English is as important as math.', zh: '英语和数学一样重要。' },
        ],
      },
    ],
    quiz: [
      { question: 'This question is ___ than that one.', options: ['easy', 'easier', 'easiest', 'more easy'], answer: 1, explanation: '两者比较用比较级，easy 是短词，加 -er 变 easier（辅音+y 变 i）。' },
      { question: 'She is ___ student in her class.', options: ['good', 'better', 'the best', 'best'], answer: 2, explanation: 'in her class 表示范围，三者以上用最高级且要加 the。' },
      { question: 'The ___ you read, the more you will learn.', options: ['many', 'much', 'more', 'most'], answer: 2, explanation: 'the + 比较级, the + 比较级：你读得越多，学得越多。' },
      { question: 'My bag is not as ___ as yours.', options: ['heavier', 'heavy', 'heaviest', 'more heavy'], answer: 1, explanation: 'as...as 中间用原级：not as heavy as。' },
    ],
  },
  {
    id: 'preposition',
    title: '介词与固定搭配',
    category: '语法细节',
    summary: '介词没有固定规则，靠积累搭配。这里总结最高频的 30 个搭配。',
    sections: [
      {
        heading: '时间介词 in / on / at',
        content: [
          'in + 月份/年份/季节/上午下午晚上：in May、in 2025、in summer、in the morning。',
          'on + 具体某天/星期/节日：on Monday、on May 1st、on my birthday。',
          'at + 时刻/年龄/夜：at 7 o’clock、at noon、at night、at the age of 18。',
        ],
        examples: [
          { en: 'We have an exam in June.', zh: '我们六月份有考试。' },
          { en: 'I was born on October 1st, 1998.', zh: '我出生于1998年10月1日。' },
        ],
      },
      {
        heading: '高频动词短语（必背）',
        content: [
          'look for 寻找 / look after 照顾 / look forward to 期待 / look up 查阅。',
          'turn on 打开 / turn off 关闭 / turn up 出现，调大 / turn down 拒绝，调小。',
          'give up 放弃 / give in 屈服 / give out 分发。',
          'take off 起飞，脱下 / take part in 参加 / take care of 照顾 / take place 发生。',
          'put on 穿上 / put off 推迟 / put up 张贴，搭建。',
          'break down 出故障 / break out 爆发 / break up 分手，解散。',
          'come true 实现 / come up with 想出 / run out of 用完 / get along with 与……相处。',
        ],
        examples: [
          { en: 'I am looking forward to hearing from you.', zh: '我期待收到你的来信。（look forward to + doing）' },
          { en: 'The meeting was put off until next week.', zh: '会议被推迟到下周。' },
        ],
      },
      {
        heading: '形容词固定搭配',
        content: [
          'be good at 擅长 / be interested in 对……感兴趣 / be proud of 以……为豪 / be afraid of 害怕 / be full of 充满 / be busy with 忙于 / be different from 与……不同 / be similar to 与……相似。',
        ],
        examples: [
          { en: 'She is good at playing the piano.', zh: '她擅长弹钢琴。' },
          { en: 'I am interested in history.', zh: '我对历史感兴趣。' },
        ],
      },
    ],
    quiz: [
      { question: 'We usually have dinner ___ 7 o’clock.', options: ['in', 'on', 'at', 'by'], answer: 2, explanation: '具体时刻前用 at：at 7 o’clock。' },
      { question: 'The meeting was put ___ until next Friday.', options: ['up', 'off', 'on', 'down'], answer: 1, explanation: 'put off 推迟。' },
      { question: 'She is looking forward to ___ you.', options: ['see', 'seeing', 'saw', 'seen'], answer: 1, explanation: 'look forward to 中 to 是介词，后接 doing。' },
      { question: 'The students are interested ___ science.', options: ['at', 'on', 'in', 'for'], answer: 2, explanation: 'be interested in 对……感兴趣，固定搭配。' },
    ],
  },
  {
    id: 'confusable',
    title: '易混词辨析（选择题送分题）',
    category: '词汇',
    summary: '考试最爱考的 10 组易混词，背下来直接拿分。',
    sections: [
      {
        heading: '常用易混词（上）',
        content: [
          '1. bring（带来）vs take（带走）：bring 向说话人方向来，take 离开说话人方向。',
          '2. borrow（借入）vs lend（借出）：borrow from 从……借，lend to 借给……。',
          '3. say（说内容）vs speak（说语言/演讲）vs talk（交谈）vs tell（告诉）：tell sb. sth.、speak English、talk about、say "hello"。',
          '4. lie（躺/说谎）vs lay（放置/下蛋）：lie-lay-lain；lay-laid-laid。',
          '5. rise（上升，不及物）vs raise（举起，及物）：The sun rises. / Raise your hand.',
        ],
        examples: [
          { en: 'Please bring your dictionary tomorrow.', zh: '明天请把词典带来。（朝说话人方向）' },
          { en: 'Can I borrow your pen? / Can you lend me your pen?', zh: '我可以借你的笔吗？/ 你能把笔借给我吗？' },
        ],
      },
      {
        heading: '常用易混词（下）',
        content: [
          '6. win（赢得比赛）vs beat（打败对手）：win the game / beat the team。',
          '7. cost（物作主语，花费钱）vs spend（人作主语，花费钱/时间）vs take（it 作主语，花费时间）：The book cost me 20 yuan. / I spent 20 yuan on the book. / It took me two hours to finish.',
          '8. few（很少，否定，可数）vs a few（几个，肯定，可数）vs little（很少，否定，不可数）vs a little（一点，肯定，不可数）。',
          '9. advice（建议，不可数）vs suggestion（建议，可数）：a piece of advice / a suggestion。',
          '10. country（国家/农村）vs nation（民族/国家）vs state（州/国家）。',
        ],
        examples: [
          { en: 'There are a few students in the classroom.', zh: '教室里有几个学生。（肯定，可数）' },
          { en: 'It took me three days to finish the work.', zh: '我花了三天完成这项工作。' },
        ],
      },
    ],
    quiz: [
      { question: 'Can you ___ me your dictionary?', options: ['borrow', 'lend', 'take', 'bring'], answer: 1, explanation: '借给某人用 lend：lend sb. sth.；borrow 是"借入"。' },
      { question: 'She ___ English very well.', options: ['says', 'tells', 'speaks', 'talks'], answer: 2, explanation: '说某种语言用 speak：speak English。' },
      { question: 'I ___ 100 yuan on the book.', options: ['cost', 'spent', 'took', 'paid'], answer: 1, explanation: '人作主语"花钱"用 spend：sb. spend money on sth.；cost 的主语是物。' },
      { question: 'There is ___ water in the bottle. Let’s buy some.', options: ['a few', 'a little', 'little', 'few'], answer: 2, explanation: 'water 不可数；"几乎没水了"表示否定用 little，a little 表示"有一点"（肯定）。' },
    ],
  },
  {
    id: 'modal-aux',
    title: '情态动词与常见句型',
    category: '动词',
    summary: 'can/may/must/should 的用法及"must have done"等高频考点。',
    sections: [
      {
        heading: '情态动词的基本用法',
        content: [
          'can 能/可以：can do；过去 could。',
          'may 可以/可能：May I come in?（我可以进来吗？）',
          'must 必须/一定：You must finish it today.（必须）',
          'should 应该：You should see a doctor.（应该）',
          'need 需要：作情态动词用于否定 needn’t（不必）。',
          '注意：情态动词后接动词原形。',
        ],
        examples: [
          { en: 'You must be careful when crossing the road.', zh: '过马路时你必须小心。' },
          { en: 'Students shouldn’t use phones in class.', zh: '学生上课不应该用手机。' },
        ],
      },
      {
        heading: '情态动词 + have done（高频考点）',
        content: [
          'must have done：过去一定做过（肯定推测）。He must have finished the work.（他一定完成了工作。）',
          'can’t have done：过去不可能做过。He can’t have told a lie.（他不可能说谎。）',
          'should have done：本应该做而没做。You should have come earlier.（你本应该早点来。）',
          'needn’t have done：本不必做却做了。',
        ],
        examples: [
          { en: 'She must have left, for the light is off.', zh: '她一定走了，因为灯关了。' },
          { en: 'I should have studied harder for the exam.', zh: '我本应该为考试更努力学习的。（遗憾没做到）' },
        ],
      },
      {
        heading: 'can’t / must 表推测',
        content: [
          '肯定推测用 must（一定）、may（可能）、might（或许）；否定推测用 can’t（不可能）。',
          '例：It must be Tom’s book; his name is on it.（一定是汤姆的书，上面有他的名字。）',
          '例：That can’t be true.（那不可能是真的。）',
        ],
        examples: [
          { en: 'He must be at home now, because the light is on.', zh: '他现在一定在家，因为灯亮着。' },
          { en: 'It can’t be Mary; she is in Beijing now.', zh: '那不可能是玛丽，她现在在北京。' },
        ],
      },
    ],
    quiz: [
      { question: 'You ___ finish the work today; tomorrow is also OK.', options: ['must', 'needn’t', 'can’t', 'mustn’t'], answer: 1, explanation: '明天也可以，说明"不必"今天完成，用 needn’t。' },
      { question: 'He ___ have finished the task; he is so confident.', options: ['must', 'can’t', 'should', 'needn’t'], answer: 0, explanation: '他很有信心，推测"一定"完成了，用 must have done。' },
      { question: 'She ___ have come to the meeting, but she didn’t.', options: ['must', 'should', 'can', 'needn’t'], answer: 1, explanation: '本应该来而没来，用 should have done，表示遗憾责备。' },
      { question: 'You look tired. You ___ have a rest.', options: ['must', 'should', 'can’t', 'may not'], answer: 1, explanation: '建议"应该"休息一下，用 should。' },
    ],
  },
];

export function getLesson(id: string): GrammarLesson | undefined {
  return LESSONS.find(l => l.id === id);
}

export const GRAMMAR_CATEGORIES: string[] = [...new Set(LESSONS.map(l => l.category))];
