---
title: "Git时代结束：新平台Enttire重新定义开发者工具"
pubDate: 2026-02-18
description: "GitHub前CEO再创业，6000万美元种子轮打造Enttire。在Agent时代，代码是副产品，推理才是资产。为什么Git不够用了？新平台如何保存推理链路而非仅仅代码？"
author:
  name: "LLM-X-Factors"
  url: "https://www.douyin.com/user/MS4wLjABAAAAa_UEGuvpvJS_KhxBllkYl7gb7AP87hzCjDHMa1Ab34U"
sourceUrl: "https://www.douyin.com/video/7606646452537904390"
image: ""
tags: ["科技、未来与物理"]
rereadStars: 4
---

GitHub的缔造者，1.8亿开发者，15亿个仓库。然后他辞职了，说了一句话：**"Git的时代结束了。"**

在Agent的时代，**代码是副产品，推理才是资产**。

## 新公司Enttire

他的新公司Enttire正式亮相：**6000万美元种子轮，3亿美元估值**。

更有意思的是，他的老东家微软的M12也跟投了。Gary、Tenjerry Young都在投资人名单里——这是开发工具领域有史以来最大的种子轮。

## Git哪里不够用了？

DMkey指出了4个核心裂缝：

1. **Issue系统是给人看的**：Agent读不了
2. **Git只存改了什么文件**：完全不记录"为什么"
3. **Pull Request在大型Monorepo面前不Scale**
4. **Agent被中心化的API限流卡住，跑不动**

## 开发者的新工作方式

现在最前沿的开发者怎么工作？

- 同时开十几个终端，每个跑一个Agent
- **Agent驱动开发，不再手写代码**
- Agent同时生成上百个方案变体，并行评估
- 代码产出速度远超任何人类能Review的上限

## 根本性的范式转变

**旧范式**：
- 人写代码，人Review
- Git保存Diff就够了
- 知识在开发者脑子里

**新范式**：
- Agent写代码，人Review的是**意图**
- 需要保存**完整的推理链路**
- 知识在上下文窗口里，关掉Session就全没了

JMkey接受Exel采访时说了一句很大胆的话：
> "以后开发者不会再看代码了，因为Agent写出的量远超人类能Review的极限。"

仔细品这句话，它的**颠覆性很强**。

## Enttire的三层架构

1. **底层**：Git兼容数据库，不只存代码，还统一存储意图、约束和推理过程
2. **中间层**：通用语义推理层，让多个Agent通过上下文图谱协调
3. **上层**：AI原生的开发生命周期界面

中间这个**语义推理层**是最核心的。

## 第一个产品：Checkpoints

开源CLI。每次用Agent生成代码并Commit时，它自动抓取完整的Session、上下文对话记录、Prompt、文件变更、Token用量、工具调用作为原数据，和Commit相关联，推送到独立分支。

目前支持Cloud Code和Gemini CLI。

这解决了一个非常现实的问题：现在用Cloud Code写了一堆代码，关掉Terminal，推理过程全没了。下次另一个Agent接手，不知道之前做过什么决策，踩过什么坑，只能从零开始重复推理，浪费Token。

**Checkpoints就是把推理过程变成持久化资产。**

## 三个信号

### 第一个信号
这不是外部挑战者喊口号。DMkey就是GitHub前CEO，亲手把Copilot做到2000万用户。他比谁都清楚GitHub的天花板在哪。**缔造者亲手说这个平台架构不够用了**，这个信号的分量远比一篇博客要重。

### 第二个信号
微软M12投资了Enttire。多克说，6月跟Nadella谈时，Nadella回应："让我们看看能怎么在微软生态合作。"连GitHub母公司都在对冲GitHub的未来。这说明什么？**连微软都认为旧架构可能撑不住AGI时代。**

### 第三个信号（最深层的假设）
在Agent的时代，**理解代码为什么被写出来，比看到代码本身更重要**。

- Git保存：What changed
- Enttire要保存：Why it changed

如果这个判断对了，开发者核心竞争力就**不再是写代码，而是定义意图和评估推理质量**。

## 挑战与机会

- GitHub有1.8亿开发者的网络效应，这不是6000万能轻易撼动的
- AI供应商自己会不会做这一层？Anthropic和Google会不会直接在Agent里内置上下文持久化？
- 目前发布的只是一个开源CLI，那个Git数据库和语义推理层还只是愿景

但DMkey选的路很聪明：**开源切入，降低门槛，不做Agent，不做模型，只做中间层**，和所有Agent都是合作，而不是竞争。

先用Checkpoints解决一个具体痛点——Agent上下文丢失——再逐步扩展到完整平台。经典的开源平台打法。

---

回到开头的判断：构建GitHub的人亲手给Git时代签了死亡通知书。

不管Enttire最终能不能成功，信号是明确的：**开发者核心技能正在从写代码转向定义意图和评估推理。工具链范式转变正在发生。关注Reasoning Layer，而不只是Coding Layer。**

这不是遥远的未来，是正在发生的当下。
