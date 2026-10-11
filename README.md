# 电路 · CircuitWiki

按邱关源《电路》第5版组织的电路学习平台。

面向大学生、电气工程师与电子爱好者的电路学习与知识管理平台。从电路理论出发，把知识总结、公式、电路图、例题、常见错误、交互计算与个人学习记录连接起来。

界面默认采用纯白背景、黑色文字和电路图，保留可手动切换的黑白深色模式。按用户提供并确认的邱关源《电路》第5版核对全站基础公式和电源符号，公式旁提供书页与式号；数字代入示例为本站原创。具体范围见 `docs/textbook-review.md`。

## 已实现功能

- 首页提供系统学习、解题查阅和动手验证三个入口；六个学习阶段串联教材知识，章节保留教材原章号与节顺序。
- 知识体系、可操作的局部知识关系图与文本视图，分别表达知识归属、前置/后续关系和教材顺序。
- 三条真实可用的推荐路径：基础入门、分析方法复习、相量到三相；保持所选文章的教材顺序。
- 我的学习：收藏、阅读历史、最远阅读位置、当前页阅读进度、手动完成；支持JSON导出与合并导入。v1完成记录兼容至v2，无需登录；不自动跨设备同步。
- 文章目录使用共享布局，切换文章保留滚动位置；刷新和重新打开移动目录也可恢复位置。
- 59 个本地 MDX 学习页面：53 个教材小节独立成页，另有 6 篇补充专题；原章节聚合讲解已拆入对应小节。每节均包含概念、条件、公式、代入示例和易错点。
- 三栏知识布局、当前文章高亮、面包屑、8 节页内目录、上一篇/下一篇和知识互链。移动端可展开目录。
- KaTeX 公式、参数和单位展开、按教材章、节顺序的公式速查，以及关联知识页入口。
- SVG 元件及分压、RC、RL、节点分析、双网孔、戴维宁等效电路，以及教材电源符号对照与易错提示。
- 欧姆定律与功率计算、RC 实时响应图、相量双向转换和加减计算，包含空值、数值范围与物理条件校验。
- 全站搜索按相关度排列教材小节、补充专题、提高题、公式与工具，支持 Ctrl/Cmd+K、方向键、Enter 和 Esc；完整搜索页支持内容类型、知识分类和更多结果，公式结果可直接定位卡片。
- 公式速查支持名称、符号和章节筛选，保留教材顺序、单位与条件，提供空结果恢复和稳定链接。
- Light / Dark / System 主题、持久化、系统主题变化同步、响应式布局、键盘焦点和跳过导航。
- 43 组教材来源练习与53道原创题，共96组；53个教材小节全部配有至少一组教材题。教材题区分38组选题、3个书中例题、2组据教材图整理的练习，保留题号/例号/图号、书页、本站解答和关键判断；题库默认展示教材选题，可按来源、章节和题型筛选。原创题包含15道综合挑战、38道综合提高。
- 电容并联、串联，以及无互感电感串联、并联四组原图与等效图，分别解释共同电压/电流、初始值、公式和数字示例。
- KCL页面的多回路演示可切换元件支路与串联组合计数，并高亮6条回路，区分3个网孔与更大的回路。

- 叠加定理补充功率交叉项与适用情况；戴维宁提供开路、短路、输入电阻和测试源两种求解方法。
- 输入电阻独立专题、四种理想电源组合对外等效警告，以及逐卡符号释义；串并联相量图可切换。
- 学习路线与侧栏只呈现实际学习内容，保留教材原章号。
- 电源等效变换、四类受控源与含源桥臂案例；桥臂参数可实时调整并切换端口状态。
- 正弦瞬时值与波形实验、分步相量画图、Y/Δ三相对照；公式速查包含69条关系，保持教材顺序。

模拟电子、数字电路的旧课程规划链接仍可访问，已从首页学习入口中移除。无账户、数据库和外部服务密钥。产品审查与优化记录见 [docs/product-review.md](docs/product-review.md)。

平台改造先完成[产品诊断报告](docs/CircuitWiki-产品诊断报告.md)，再按[分阶段实施记录](docs/分阶段实施记录.md)落地。[产品架构与设计系统](docs/产品架构与设计系统.md)说明信息层级和组件约定。AI仅预留[服务契约](docs/AI学习助手接口.md)，尚未接入模型。SEO包含逐页canonical、Open Graph、站点地图、robots和知识页JSON-LD。小节拆分记录见 [小节与提高题验收](docs/小节与提高题验收.md)，前一轮10道教材选题与课件检索记录见 [教材选题与图解验收](docs/教材选题与图解验收.md)，当前53节逐项配题及章节标签见 [教材章节与逐节配题](docs/教材章节与逐节配题.md)。旧章节链接及教材节号锚点会跳转到独立小节，旧收藏和历史迁移到新入口；聚合页完成记录归档保留，避免误将全部小节标成完成。

## 技术栈

安装时通过 npm registry 的稳定标签解析并锁定：Next.js 16.3.8、React 19.3.0、TypeScript 6.0.3、Tailwind CSS 4.3.3、MDX 3.1.1、KaTeX 0.19.0、Recharts 3.10.1、next-themes。App Router 的知识页在构建时静态生成，计算器在客户端运行。

采用本地 `@mdx-js/mdx` 编译器，MDX 通过组件映射调用 UI。**仅编译仓库内可信作者维护的 MDX，不接受用户提交的原始 MDX 执行。** 所有字体和公式资源随应用打包，无远程字体依赖。

## 安装与运行

建议 Node.js 24 LTS，最低 Node.js 22，使用 npm。进入本 README 所在目录：

```bash
npm install
npm run dev
```

访问 http://localhost:3000。生产模式：

```bash
npm run build
npm start
```

有锁文件后，可在 CI 中使用 `npm ci`。无需 `.env`。

### 当前 Codex Windows 工作区

本机已有 Node.js，但 npm 没有加入 PATH。本次开发已在工作区 `work/npm` 准备 npm，依赖也已安装。在项目目录可直接执行：

```powershell
.\Start-CircuitWiki.ps1
# 或指定任务
.\Start-CircuitWiki.ps1 build
```

此脚本优先使用系统 npm，找不到才使用当前工作区的 npm。复制项目到其他机器后，安装标准 Node.js LTS 即可使用上面的普通 npm 命令；无需复制 work 目录。

## 项目目录

```text
CircuitWiki/
├── content/
│   ├── circuits/          # 基础分析、端口等效及补充专题
│   ├── dynamics/          # 电容、电感、RC/RL专题
│   ├── ac/                # 相量、功率、谐振专题
│   ├── sections/          # 新增30个独立教材小节
│   └── three-phase/       # 第十二章5个小节
├── src/
│   ├── app/
│   │   ├── page.tsx       # 首页
│   │   ├── learn/[slug]/  # 59个静态知识页及旧链接兼容
│   │   ├── curriculum/   # 按教材顺序的53小节目录
│   │   ├── practice/     # 提高题入口与筛选
│   │   ├── formulas/     # 69条公式速查
│   │   ├── knowledge/    # 知识体系
│   │   ├── paths/        # 学习路径
│   │   ├── graph/        # 知识关系
│   │   ├── me/           # 个人学习记录
│   │   ├── tools/        # 三个计算器
│   │   ├── globals.css   # 全局主题
│   │   └── challenges.css # 提高题样式
│   ├── components/
│   │   ├── tools/        # 独立计算器与输入组件
│   │   ├── challenge-problem.tsx # 提示、解答、校验面板
│   │   ├── problem-diagrams.tsx # 题目电路、有向图及相量图
│   │   ├── formula.tsx
│   │   ├── circuit-diagram.tsx
│   │   ├── navigation.tsx
│   │   └── ui.tsx
│   └── lib/
│       ├── chapters.ts   # 教材章号与小节顺序
│       ├── textbook-scope.ts # 53个教材小节及学习范围
│       ├── content.ts    # 页面与导航元数据
│       ├── challenges/   # 原创题、轻量索引与独立数值检查
│       ├── legacy-lessons.ts # 旧聚合页面链接映射
│       ├── formulas.ts   # 公式目录
│       ├── study-data.ts # 学习记录与版本迁移
│       ├── calculations.ts # 无UI的计算函数
│       └── mdx.tsx       # MDX读取与组件映射
├── tests/                # 数值、内容与浏览器测试
├── docs/screenshots/     # 实际运行截图
├── docs/verification.md  # 验收记录和当前限制
├── Start-CircuitWiki.ps1
└── package-lock.json
```

## 截图

`docs/screenshots/coverage-*.png` 保存当前章节标签、教材题、手机和深色截图，可运行 `node tests/capture-coverage.mjs` 更新；`textbook-*.png` 保存此前四组等效图与10道教材选题截图；可运行 `node tests/capture-textbook.mjs` 重新生成。`docs/screenshots/sections-*.png` 保存此前53小节与提高题的实际浏览器截图，覆盖题库、电桥、三网孔、超级结点、两次换路、相量、三相、手机端和深色模式。`platform-*.png` 与其他截图为此前的平台与科学图示验收记录。

![首页](docs/screenshots/platform-home.png)

服务启动后可重新生成：

```bash
npx playwright install chromium
node tests/capture-sections.mjs
# 平台整体截图
node tests/capture-platform.mjs
```

Windows 已安装 Edge 时，可设置 `$env:PLAYWRIGHT_CHANNEL='msedge'` 后运行，避免额外下载浏览器。

## 如何新增知识文章

1. 在 `content/sections` 或对应学科目录添加 slug 对应的 `.mdx` 文件。
2. 在 `src/lib/content.ts` 的 `entries` 增加元数据：`folder`、`textbookSection`、`supplemental` 等。主教材小节还需加入 `src/lib/textbook-scope.ts` 与 `src/lib/chapters.ts` 的对应章 `slugs`；额外专题设置 `supplemental: true`，在章位置映射中登记，不重复计入53节。`keywords` 用于搜索，页面类型统一为“教材小节 / 补充专题”。
3. 保持下面的 8 个二级标题，编号自动映射到 `section-1` 至 `section-8`，供目录定位。
4. 使用 `/learn/slug` 链接，运行测试与构建。无需手动增加页面路由。

```mdx
## 1. 核心概念

简短说明，先说清解决什么问题。

## 2. 前置知识

[KCL 与 KVL](/learn/kcl-kvl)

## 3. 核心公式

<Formula latex={"U=IR"} description="关联参考方向下的线性电阻" />

<InlineFormula latex={"R>0"} />

## 4. 解题步骤

1. 确定方向。
2. 建立方程。

## 5. 电路图

<CircuitDiagram type="divider" caption="电阻分压电路" />

## 6. 典型例题

<Example title="分压练习">

写出题目、思路、计算过程与答案。

</Example>

## 7. 常见错误

<Warning>注意单位换算。</Warning>

## 8. 相关知识

[节点电压法](/learn/nodal-analysis)
```

LaTeX 放入 JavaScript 字符串时反斜杠须转义，例如 `<Formula latex={"\\frac{U}{R}"} />`。不要直接写 `$...$`，本项目明确使用 Formula / InlineFormula 组件。MDX 自定义块组件与 Markdown 段落之间留空行。新增组件需在 `src/lib/mdx.tsx` 注册。

## 如何新增公式

向 `src/lib/formulas.ts` 的 `formulaEntries` 添加 `FormulaEntry`：`name`、`latex`、`position: [章号, 节号, 节内顺序]`、目标文章 `slug`、适用条件 `condition`、含单位的 `parameters`、教材出处 `source`。公式页面按 position 自动排序并按教材章节展示；原创补充例题标记 `supplemental: true`。公式名称也会进入文章搜索索引。

## 如何新增提高题

原创题在 `src/lib/challenges/data.json` 添加符合 `Challenge` 类型的题目，填入题设、任务、提示、至少三步解答、答案及独立检查数据；同步 `catalogue.ts` 的轻量题目索引。在对应 MDX 的“典型例题”中调用 `<ChallengeProblem id="章-节" />`。教材配套题在 `section-exercises.json` 关联文章slug、题目ID与本节重点，使用 `<TextbookExercises slug="文章slug" />`统一渲染；同一题跨多个知识点时复用ID，不重复计数。解答在服务端渲染，默认折叠，不把整套解答带入客户端搜索数据。

用 `network` 描述结点、元件支路、导线路径和参考方向；特殊拓扑可独立为组件。用 `phasors` 添加求解后的同量纲相量图。检查数据采用原方程残差、图的回路关联关系、能量或功率公式；必须独立核对文字解答和连接图，不要只比较复制的结果。教材选题单独放在 `textbook.json` 和轻量 `textbook-catalogue.json` 中，并填写 `source.exercise`、`source.pages`、`source.note` 与 `takeaway`；可用 `networks` 放入换路前后等多幅图。题目须标明原创或实际来源，不能将改编内容冒称教材原题或考试真题。

## 如何新增电路图

在 `src/components/circuit-symbols.tsx` 中复用 `Wire`、`Resistor`、`Capacitor`、`Inductor`、`VoltageSource`、`CurrentSource`、`Ground`、`Node`。在 `circuit-diagram.tsx` 增加 `CircuitKind` 类型并组合新拓扑。电源沿用第5版图1-8、图1-10。使用 `viewBox` 与 `currentColor`，不要写死浅色背景；添加 SVG title、图注与参考方向。复杂电路日后可以独立成组件或替换专业绘图库。

## 如何新增工具

1. 将纯计算和输入约束放进 `src/lib/calculations.ts` 或新的专用模块。
2. 在 `src/components/tools/` 创建带 `use client` 的组件，复用 `Field`、`ErrorMessage`、公式和主题变量。
3. 在 `/tools` 引入，设置唯一锚点并增加顶部入口。
4. 添加有物理意义的数值边界测试及主要用户操作的浏览器测试。

当前 RC 模型限定为理想电压源、零初始电压、单电容直流阶跃充电；图表横轴随参数显示 0–5τ 的真实秒数。相量工具的幅值是通用数值，计算时必须使用一致的频率、单位和峰值/有效值约定；文章统一采用有效值相量。

## 检查与测试

```bash
npm run lint
npm run typecheck
npm test
npm run build
# 另一个终端先运行 npm start 或 npm run dev
npx playwright install chromium
npm run test:e2e
```

浏览器测试访问 `http://localhost:3000`，需先启动服务。默认使用 Chromium；本次 Windows 验收使用 Edge Chromium。包括全部路由、MDX、公式、内部链接和页内锚点、搜索、提高题与折叠解答、主题持久化、系统主题跟随、三个计算器和 390px 移动端。

`npm run format` 统一格式。TypeScript 开启 strict。计算精度为 JavaScript 双精度，显示约 6 位有效数字，属于教学计算而非专业 SPICE 仿真。

## 部署到 Vercel

1. 将 **CircuitWiki 目录内的项目文件** 提交至 Git 仓库，不提交 node_modules 和 .next。
2. 在 Vercel 导入仓库，Framework Preset 选择 Next.js；若仓库含上级目录，把 Root Directory 设为 `outputs/CircuitWiki`。
3. Node.js 选择 24.x，安装命令 `npm ci`，构建命令 `npm run build`，输出目录保留框架默认值。
4. 不需要环境变量或数据库。部署完成后检查 `/learn/rc-circuit`、`/formulas` 和 `/tools`。

线上地址：[circuit-wiki.vercel.app](https://circuit-wiki.vercel.app)。当前仓库已关联 Vercel，推送 main 分支后自动触发部署。

## 后续开发与已知限制

- 增加更多完整推导、多难度题库、模拟/数字电子课程。
- 当前学习范围内的53个教材小节均独立成页并有综合提高题；每节保留一道原创综合题，另有43组教材来源练习，覆盖全部53节；更多题型、严格证明与多套练习可继续扩展。
- 时间常数统一写作τRC=ReqC、τRL=L/Req；变压器内容采用理想模型，中性点位移与并联电容补偿标记为非重点。
- 第4章限§4-1至§4-4；第7章限§7-1至§7-4；第5章跳过；第11章仅§11-2、§11-4。
- 增加非零初始条件、放电与 RL/RLC 响应工具，以及更丰富的电路拓扑。
- 后续可增强搜索拼音/模糊匹配、账户同步和无障碍审计；本地学习进度与收藏已经实现。
- 当前搜索是本地标题/关键词/公式名匹配，不是文章全文搜索。
- 当前标准路由与浏览器交互未发现阻塞问题；尚未在 Safari / Firefox 和实体手机上验证。
- `npm audit --omit=dev` 为 0 漏洞。完整审计提示 5 个 high 记录，来自开发期 `eslint-config-next → fast-glob → micromatch → braces` 同一依赖链；当前 braces 稳定版 3.0.3 尚无修复版。没有使用 `audit fix --force` 降级 Next lint 配置。此依赖不进入生产运行包；后续升级需继续关注上游修复。

安装方式参考 [Next.js 官方文档](https://nextjs.org/docs/app/getting-started/installation) 与 [Tailwind CSS Next.js 指南](https://tailwindcss.com/docs/installation/framework-guides/nextjs)。
