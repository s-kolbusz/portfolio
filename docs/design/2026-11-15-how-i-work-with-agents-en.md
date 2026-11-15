# “How I work with agents”: English copy for the subpage

**Status:** English version of the Polish copy approved by the owner on 15.11. The translation itself has
not been read by him yet. A document, not code.

**Source:** part 2 of `2026-11-14-jak-pracuje-z-agentami-szkic.md`. The Polish text wins where the two
differ. If the Polish copy changes, this file has to follow.

**Translation choices to check** are listed at the end.

---

## Intro

I work alone, and part of the work is done by AI agents. I write code with Claude. For research outside
code I often use Gemini and ChatGPT as well, and ChatGPT also for first drafts of Polish copy, which I
then edit myself. I don't take their word for it, just as I don't take anyone's: I check before I accept.

Below are six rules this collaboration runs on. The whole process serves one thing: quality and security
first. Security here means two things: code without vulnerabilities and no secrets in the repository.
Each rule came from a specific mistake, and each has something that enforces it.

## 1. “Done” means verified

Agents reported “done” when it wasn't done. Models are inconsistent, and checking is the step they skip
most often.

So I don't leave verification to the model. It goes to tools that handled it before LLMs became popular:
formatting, linting, type checking, unit tests with a coverage threshold (80% of branches, 85% of
functions and lines), browser tests, an accessibility test and screenshot comparison. Reference
screenshots are generated in the same environment the tests run in, because the same screen renders
fonts differently on another system.

Tools don't replace the process around them. Brainstorming, planning and splitting work into stages stay
just as important, also now that I'm building Airchos: tests check whether the thing was built right,
not whether the right thing was built.

Green tests are a condition, not the end. An agent once proposed releasing the whole redesign because the
tests passed and I had accepted one scene. Accepting one scene is not approval to release. I judge look
and motion myself, in the browser and on my own phone.

## 2. Questions and a plan first, then code

A larger change follows a fixed order: a round of questions to pick holes in the idea, then a
spec, a plan, the work and verification. Small things (text, a color, spacing) skip this path. I work
the same way on client projects.

Guessing ends in more rounds of fixes. One solid round of research at the start gives a better result.
Prototypes are built only in the real code, not on boards next to the repository.

After a bigger rewrite, a document is read by a reviewer who doesn't know the conversation. On the first
clean version of this site's concept, that reviewer found 15 gaps.

## 3. Decisions live in files, not in the conversation

A conversation with an agent disappears with the session. So what was agreed goes into files in the
repository and onto the task board, and a new session starts from those, not from chat history. One file
is the index: it says which document is the source of truth and in what order to read the rest.

A session also leaves a short note: what was decided, what was tried and ruled out, what to watch out
for. It is committed together with the change, so the next session doesn't discover the same thing
twice.

Tasks don't live in a file. I tried: the file grew with every closed task and had to be read in full at
the start of every session. Now the agent asks the board only for the open tasks of one project. What
costs is what gets read, not how it is read.

## 4. One session, one topic, one agent

A long session that mixes topics loses details: once the conversation is summarized, some of what was
agreed is gone, and the result is harder to check. Its cost grows too, but that is a side effect, not
the reason for this rule.

So one session keeps the direction, and concrete pieces (one subpage, one stage) are done by separate,
small sessions. Heavy work comes back as a file and a few sentences of summary. A brief for an agent is
short: what to do, what not to touch, what not to do, and how to tell it is finished. I took this split
from the Elephant-Goldfish model (egm.dev).

By default one agent does the work. Before I'm shown a result there is at most one round of fixes; after
that I look at it myself instead of letting the agent keep fixing it in circles. When something is
unclear, the agent asks one question instead of producing a round of variants. A second reviewer comes
in for a new direction or when I ask. Terminal command output goes through a filter that shortens it
before it reaches the model.

## 5. A tool enters the stack after a read test and a measurement

Before a tool goes into my stack, I check whether an agent can read from it through the API. I learned
this rule the expensive way on Plane: the project strategy written into its pages was invisible to the
agent, because those pages are CRDT documents that can't be read with an API key. Linear passes the
test: its documents answer an ordinary query.

The second half of the rule: measurement comes before choosing a tool. I picked my code search tool,
trail, after testing three candidates on the same task. An agent can measure and present the result. The
decision about what stays is mine.

## 6. What stays with me

The agent executes and checks. It doesn't decide what counts as a task. Only what has been decided and
has a next step goes on the work board; ideas have a separate place and their own path: from a raw note,
through a round of questions, to my yes or no. A rejected idea stays in the archive together with the
reason, because the reason is worth as much as the idea.

An agent can close a task that already exists once the work is finished and verified, and it writes in a
comment what exactly it did. It doesn't create new tasks: it raises them in the conversation. Some tasks
carry a “do not touch” label. They exist so that someone doesn't fix something.

Also staying with me: the choice of tools, the moment of release, and every sentence that says something
about me. Copy about myself comes to me as concrete proposals built from facts, and I correct them. I'm no
good at open-ended questions about myself.

## Where next

- The road “AI agents → Airchos”: the same principle, verification handed to tools, as a separate
  project.
- “Why” notes: short texts about single technical decisions.

---

## Translation choices to check

Not open questions about content; only places where English forced a choice.

1. **OK (owner, 15.11):** page title is “How I work with agents”. The owner asked (15.11) whether “How do I work with agents”
   is more correct. It is not: with “do” it becomes a question, as if asking for instructions; a title
   that announces an explanation uses the statement order. He kept it.
2. **OK (owner, 15.11):** “bezpieczeństwo” is “security” (code without vulnerabilities, no secrets), not
   “safety”.
3. **Changed (owner, 15.11: “executor” is not a good word):** “wykonawca” is now “one agent” in the
   heading of section 4 and “one agent does the work” in the text.
4. **Changed (owner, 15.11):** no literal translation of Polish sayings. “Seria pytań, która szuka dziury
   w pomyśle” is now “a round of questions to pick holes in the idea”, his wording and the English idiom.
5. **OK (owner, 15.11):** “whether the thing was built right, not whether the right thing was built”.
6. **Changed (owner, 15.11: sounded odd):** “open questions about myself don't work on me” is now “I'm no
   good at open-ended questions about myself”. Waiting for his reply on the new wording.
7. **Open, context given to the owner:** “droga” is “road” and notatki „dlaczego” are “Why” notes, only in
   the closing “Where next” list. Both are names used across the whole site, so they should be settled
   once in the concept, not on this page. Candidates for “droga”: road, path, route.
8. **Open, owner asked to unify (15.11):** this document now uses American spelling (“color”,
   “summarized”). The current site mixes “optimized”, “specialized” with “colour”; aligning the site's
   own English files is a separate small change in `src/`, not done here.
