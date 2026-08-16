import { useState } from 'react'

// 学习步骤与方法指南（可折叠）

interface GuideItem {
  id: string
  icon: string
  title: string
  desc: string
  steps: string[]
  tip?: string
}

const GUIDES: GuideItem[] = [
  {
    id: 'word',
    icon: '📚',
    title: '单词怎么背（不是死记硬背）',
    desc: '学位英语词汇题是选择题，考"认不认识"，不考拼写。看到英文能想起中文就能得分。',
    steps: [
      '先认后写：第一遍只要求看到 ability 能想起"能力"，不用背拼写。混熟了自然就会写。',
      '少量多次：每天 30-50 个拆成 3 批（早/午/晚各 10-15 个），隔几小时再背下一批。一次猛背 50 个，第二天全忘。',
      '带例句和声音：看例句 + 听🔊发音（多感官记忆），比干瞪眼背 10 遍强。',
      '交给 SRS：闪卡点"认识/模糊/不认识"决定这个词第 2/4/7 天再来找你，这是最有效的间隔重复。',
      '睡前把今天的新词再过一遍。做错/模糊的词，软件会自动安排明天复习。',
    ],
    tip: '每天流程：背单词页 → 开始学习 → 闪卡过 30 个新词 → 切自测模式检验 → 睡前复习。',
  },
  {
    id: 'grammar',
    icon: '📖',
    title: '语法怎么学（不是从上往下看）',
    desc: '语法讲义按顺序读是最低效的方式，前面看不懂就卡住放弃。要"抓大放小 + 以题带学"。',
    steps: [
      '先做 10 道词汇语法题，看解析里反复出现哪个语法点（基本是时态、非谓语、从句）。',
      '卡住的知识点再回语法页，只点开对应那一节看。比如总错时态，就只看"动词时态与语态"。',
      '每节末尾的随堂小测能答对 70% 就算过关，不用追求完全懂，及格万岁。',
      '看不懂的细节直接跳过，等做题遇到了再回来看。',
      '必拿分的 4 大块优先学：①动词时态/语态 ②非谓语动词 ③三大从句 ④虚拟语气/主谓一致/比较级。',
    ],
    tip: '做题 → 错 → 看解析 → 懂一个点，比从头看一章效率高 10 倍。',
  },
  {
    id: 'daily',
    icon: '🗓️',
    title: '每日学习流程（2-3 个月版）',
    desc: '跟着首页"今日任务"走，每天固定节奏，形成习惯比猛学一天重要得多。',
    steps: [
      '每天 · 新词 30 个 + 复习到期词（软件自动提醒）—— 30-40 分钟',
      '每天 · 专项刷题 10-15 题（词汇语法为主）—— 20 分钟',
      '每天 · 语法 1 节（只看重点章节，不全读）—— 15 分钟',
      '每周 · 1 套模拟卷 + 错题本重练 —— 约 2 小时',
      '每周 · 把错题本清一遍，错误集中在哪几个点就重点补哪几个点',
    ],
  },
  {
    id: 'sprint',
    icon: '🚀',
    title: '考前 2 周冲刺策略',
    desc: '临近考试切换"冲刺"模式，只做性价比最高的事。',
    steps: [
      '只刷高频词（tier1）+ 错题本重练，不再背新词。',
      '背熟 2-3 个作文模板（书信、观点、利弊）+ 万能开头结尾句，作文保底 6-8 分。',
      '每周 2 套模拟卷练手感，重点看分节报告里的薄弱题型。',
      '考前 1-2 天：只看错题本和作文模板，不再做新题。',
    ],
    tip: '作文别裸考：专项练习 → 写作里有 20 个模板，这是性价比最高的一步。',
  },
]

export default function LearningGuide() {
  const [open, setOpen] = useState<string | null>('word')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h2 className="font-bold text-slate-800 mb-1">📚 学习步骤与方法</h2>
      <p className="text-xs text-slate-500 mb-3">不知道怎么学？点开下面每一项，照做就行。也欢迎回首页看"今日任务"。</p>
      <div className="space-y-2">
        {GUIDES.map(g => (
          <div key={g.id} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === g.id ? null : g.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
            >
              <span className="font-medium text-slate-800 text-sm">{g.icon} {g.title}</span>
              <span className={'text-slate-400 transition-transform ' + (open === g.id ? 'rotate-180' : '')}>▼</span>
            </button>
            {open === g.id && (
              <div className="px-4 pb-4">
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">{g.desc}</p>
                <ol className="space-y-1.5">
                  {g.steps.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-blue-500 shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                {g.tip && (
                  <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">💡 {g.tip}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
