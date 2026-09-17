import type { Lesson } from './types';

export const LESSONS: Lesson[] = [
  // ─────────────────────── UNIT 1 ───────────────────────
  {
    id: 'dfa',
    unit: 1,
    title: 'Deterministic Finite Automata',
    subtitle: 'One state per moment. Every input has exactly one path.',
    prerequisites: [],
    objective: 'Formally define a DFA and manually simulate it on input strings.',
    workspace: 'automata',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why do we need automata?',
        content: `Imagine you need a **vending machine** that only accepts valid coin sequences before dispensing a drink. It doesn't store the entire history—it just needs to remember *which stage* it's in.\n\nThat's exactly what a finite automaton does: it processes an input one symbol at a time, moving between a finite set of **states**.\n\nBy the end of this lesson, you'll be able to design a machine that accepts any pattern you describe.`,
      },
      {
        type: 'intuition',
        title: 'What is a state?',
        content: `Think of states as "moments in memory". A traffic light has 3 states: Red, Yellow, Green. It moves between them on a clock signal.\n\nA DFA has:\n- **States** — the possible conditions of the machine\n- **Alphabet** — the set of symbols it can read (e.g., {0, 1})\n- **Transitions** — rules: *"In state q0, reading 1, go to q1"*\n- **Start state** — where execution begins\n- **Accepting states** — states that mean "YES, accepted"`,
        checkQuestion: {
          question: 'A DFA reads one symbol at a time. After each symbol, it moves to…',
          options: ['Any number of states simultaneously', 'Exactly one new state', 'No state (it waits)', 'A random state'],
          correct: 1,
          explanation: 'A DFA is *deterministic*: every (state, symbol) pair leads to exactly one next state. This is what separates it from an NFA.',
        },
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A **DFA** is a 5-tuple:\n\n$$M = (Q, \\Sigma, \\delta, q_0, F)$$\n\nWhere:\n- $Q$ — finite set of states\n- $\\Sigma$ — finite input alphabet (no ε)\n- $\\delta: Q \\times \\Sigma \\to Q$ — transition function\n- $q_0 \\in Q$ — initial state\n- $F \\subseteq Q$ — set of accepting states\n\n**Key constraint:** $\\delta$ is *total*: every state must have exactly one transition for each symbol.`,
      },
      {
        type: 'example',
        title: 'Worked Example: Strings ending in "1"',
        content: `Let's build a DFA that accepts all binary strings ending in **1**.\n\n**States:** q0 (seen even/no trailing 1), q1 (last symbol was 1)\n\n**Transitions:**\n| State | 0 | 1 |\n|-------|---|---|\n| →q0  | q0 | q1 |\n| *q1  | q0 | q1 |\n\n**Trace "101":**\nq0 →(1)→ q1 →(0)→ q0 →(1)→ q1 ✓ (accepted, q1 is final)`,
        preloadAutomaton: JSON.stringify({
          type: 'DFA', alphabet: ['0','1'],
          states: [
            {id:'q0', label:'q0', x:150, y:200, initial:true, accepting:false},
            {id:'q1', label:'q1', x:350, y:200, initial:false, accepting:true}
          ],
          transitions: [
            {id:'t1', from:'q0', to:'q0', symbols:['0']},
            {id:'t2', from:'q0', to:'q1', symbols:['1']},
            {id:'t3', from:'q1', to:'q0', symbols:['0']},
            {id:'t4', from:'q1', to:'q1', symbols:['1']}
          ],
          initialState: 'q0'
        }),
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `**Task:** Build a DFA that accepts binary strings containing **at least one "0"**.\n\nHints:\n1. Start in a "no zero seen" state.\n2. When you read a 0, move to a "seen zero" state.\n3. The "seen zero" state should be accepting.\n4. What happens when you read 1 in the "seen zero" state?\n\nUse the canvas on the right. Add states with **+ State**, then shift-drag to connect them.`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Design DFAs for the following languages over $\\Sigma = \\{0, 1\\}$:\n\n1. All strings of **even length**\n2. All strings that **start with "01"**\n3. All strings where **the number of 1s is divisible by 3**\n4. The **empty language** (rejects everything)\n\nFor each: build the automaton, run test strings, verify the transition table is correct.`,
      },
      {
        type: 'exam',
        title: 'Exam-Level Question',
        content: `**Q:** Construct a DFA over $\\Sigma = \\{a, b\\}$ that accepts all strings that **do not** contain the substring "ab".\n\nRequirements:\n- Clearly label all states\n- Mark the start and final states\n- Complete the transition table\n- Test with: "aab", "ba", "ab", "bbb", "aaa"`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Missing transitions**\nA DFA's $\\delta$ must be *total*. If you forget $\\delta(q1, 0)$, the machine is *incomplete* and crashes on input "0".\n\n**Mistake 2: Multiple transitions from one state on the same symbol**\nThat makes it an NFA, not a DFA.\n\n**Mistake 3: ε-transitions**\nDFAs have no ε-transitions. Only ENFAs do.\n\n**Mistake 4: Confusing start and accepting states**\nA state can be both start AND accepting (e.g., a DFA for "ε | strings ending in 0").`,
      },
    ],
    commonMistakes: ['Missing transitions', 'ε in DFA', 'Multiple destinations'],
    masteryCriteria: ['Build DFA from description', 'Complete transition table', 'Simulate strings correctly', 'Identify incomplete DFA'],
  },

  {
    id: 'nfa',
    unit: 1,
    title: 'Nondeterministic Finite Automata',
    subtitle: 'Multiple paths at once. The machine explores all possibilities.',
    prerequisites: ['dfa'],
    objective: 'Understand NFA nondeterminism and simulate NFA execution using state sets.',
    workspace: 'automata',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why NFA?',
        content: `DFAs can be hard to design. Sometimes the *natural* description of a language implies branching: "the string *might* go left or *might* go right depending on the future".\n\nAn NFA lets you express that intuition directly. It can be in **multiple states at once**, and it accepts a string if **any** one of those parallel paths leads to an accepting state.`,
      },
      {
        type: 'intuition',
        title: 'The Parallel Paths Intuition',
        content: `Imagine you're in a maze and, at every fork, you send a clone of yourself down *both* paths simultaneously.\n\nIf **any clone** reaches the exit, you win.\n\nAn NFA works the same way: it maintains a **set of active states**. At each step, every active state fires its transition for the current symbol, potentially producing many new states.`,
        checkQuestion: {
          question: 'An NFA reading "0" from states {q0, q1} will next be in…',
          options: [
            'The union of δ(q0,0) and δ(q1,0)',
            'Only δ(q0,0)',
            'The intersection of δ(q0,0) and δ(q1,0)',
            'A random single state'
          ],
          correct: 0,
          explanation: 'The NFA takes the *union* of all transitions from every currently active state. That\'s what makes it nondeterministic — multiple futures coexist.',
        },
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `An **NFA** is also a 5-tuple:\n\n$$M = (Q, \\Sigma, \\delta, q_0, F)$$\n\nBut now $\\delta$ maps to a **set** of states:\n\n$$\\delta: Q \\times \\Sigma \\to \\mathcal{P}(Q)$$\n\n$\\delta(q, a)$ can be **∅** (no transition — dead path), **{q'}** (single destination), or **{q', q''}** (fork).\n\nA string $w$ is accepted if $\\hat{\\delta}(q_0, w) \\cap F \\neq \\emptyset$.`,
      },
      {
        type: 'example',
        title: 'Worked Example: Strings ending in "01"',
        content: `Build an NFA for strings ending in "01" over {0,1}:\n\n| State | 0 | 1 |\n|-------|------|------|\n| →q0  | {q0,q1} | {q0} |\n| q1   | ∅   | {q2} |\n| *q2  | ∅   | ∅   |\n\n**Trace "001":**\n- Start: {q0}\n- Read 0: δ(q0,0) = {q0,q1} → Active: {q0,q1}\n- Read 0: δ(q0,0)∪δ(q1,0) = {q0,q1}∪∅ = {q0,q1}\n- Read 1: δ(q0,1)∪δ(q1,1) = {q0}∪{q2} = {q0,q2}\n- q2 ∈ F → **Accepted** ✓`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `**Task:** Build an NFA for strings **containing "11" as a substring**.\n\nHints:\n1. Stay in q0 as long as no "11" has appeared yet.\n2. When you see the first "1", tentatively move to q1 (via the 1-transition).\n3. When q1 sees another "1", move to q2 (the accepting state).\n4. Once in q2, stay there forever.\n5. Notice q0 also loops to itself on "0" and "1".`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Design NFAs for:\n1. Strings that **start or end** with "0"\n2. Strings containing "010" as a substring\n3. Strings of length exactly 2\n4. Strings of **odd length** (Hint: use 2 states and exploit nondeterminism)`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Given the NFA below, trace the execution of string "0110" step by step, showing the active state set at each step. State whether the string is accepted, and identify which accepting state is reached.\n\n| State | 0 | 1 |\n|-------|------|------|\n| →q0 | {q0,q1} | {q0} |\n| q1  | ∅ | {q2} |\n| *q2 | {q2} | {q2} |`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Confusing "any path" with "all paths"**\nAn NFA accepts if *at least one* path leads to acceptance — not all paths.\n\n**Mistake 2: Stopping on empty transition**\nIf $\\delta(q, a) = \\emptyset$, only that *path* dies. Other active states continue.\n\n**Mistake 3: Adding ε-transitions to an NFA**\nPlain NFAs have no ε. That makes it an ENFA.`,
      },
    ],
    commonMistakes: ['Any vs all paths', 'Dead path kills NFA', 'ε in NFA'],
    masteryCriteria: ['Simulate NFA with state sets', 'Trace branching correctly', 'Identify accepted strings'],
  },

  {
    id: 'enfa',
    unit: 1,
    title: 'ε-NFA (Epsilon NFA)',
    subtitle: 'Spontaneous moves — the machine can transition without reading anything.',
    prerequisites: ['nfa'],
    objective: 'Understand ε-transitions, compute ε-closure, and simulate an ENFA.',
    workspace: 'automata',
    examWeight: 3,
    steps: [
      {
        type: 'why',
        title: 'Why ε-transitions?',
        content: `Sometimes you want to say: *"The machine can move from state A to state B for free — without consuming any input"*.\n\nThis is incredibly useful when **constructing** automata from regular expressions (Thompson's construction). Each RE operator maps cleanly to a small fragment connected by ε-transitions.\n\nε-transitions make **construction** easy — but before simulation, we must handle them.`,
      },
      {
        type: 'intuition',
        title: 'Free Moves',
        content: `Imagine a teleporter: when you're at location A, you can *instantly* teleport to location B without spending any time (reading any symbol).\n\nε-transitions are free moves. Whenever the machine is in a state, it *automatically* follows all ε-paths reachable, even before reading the next symbol.\n\nThe set of all states reachable via ε-moves from a set S is called the **ε-closure of S**.`,
        checkQuestion: {
          question: 'If q0 →ε→ q1 →ε→ q2 and q2 →ε→ q3, what is ε-closure({q0})?',
          options: ['{q0}', '{q0, q1}', '{q0, q1, q2, q3}', '{q1, q2, q3}'],
          correct: 2,
          explanation: 'ε-closure is the transitive closure of ε-transitions. Starting from q0, we can reach q1, q2, and q3 for free. q0 is always included in its own closure.',
        },
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `An **ε-NFA** (also written ENFA) has:\n$$\\delta: Q \\times (\\Sigma \\cup \\{\\varepsilon\\}) \\to \\mathcal{P}(Q)$$\n\n**ε-closure** is defined recursively:\n$$\\varepsilon\\text{-closure}(q) = \\{q\\} \\cup \\bigcup_{p \\in \\delta(q,\\varepsilon)} \\varepsilon\\text{-closure}(p)$$\n\n**Simulation step:**\nGiven current set $S$ and symbol $a$:\n1. Compute $\\text{Move}(S, a) = \\bigcup_{q \\in S} \\delta(q, a)$\n2. Then compute $\\varepsilon\\text{-closure}(\\text{Move}(S,a))$\n\n**Acceptance:** Start from $\\varepsilon\\text{-closure}(\\{q_0\\})$, not just $\\{q_0\\}$.`,
      },
      {
        type: 'example',
        title: 'Worked Example',
        content: `ENFA with: q0 →ε→ q1, q1 →a→ q2, q2 →ε→ q3\n\n**Simulate "a":**\n1. Start: ε-closure({q0}) = {q0, q1}\n2. Read 'a': Move({q0,q1}, a) = δ(q0,a) ∪ δ(q1,a) = ∅ ∪ {q2} = {q2}\n3. ε-closure({q2}) = {q2, q3}\n4. If q3 ∈ F → **Accepted**`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `**Task:** Calculate ε-closure for each state of the automaton loaded in the canvas.\n\nFor the ENFA: q0 →ε→ q1, q1 →ε→ q2, q0 →a→ q3:\n1. ε-closure({q0}) = ?\n2. ε-closure({q1}) = ?\n3. ε-closure({q2}) = ?\n4. ε-closure({q3}) = ?`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `1. Build an ENFA for the language (a|b)*c — all strings ending in 'c'\n2. Trace "abc" and "bc" through it step by step, showing ε-closure at each step\n3. Identify which states are reachable only via ε-transitions`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Forgetting ε-closure at start**\nSimulation must begin with ε-closure({q0}), NOT just {q0}.\n\n**Mistake 2: Not applying ε-closure AFTER each move**\nAfter every symbol read, you must apply ε-closure again.\n\n**Mistake 3: Thinking ε-transitions consume the empty string**\nε-transitions are free — no symbol is consumed. The input tape does NOT advance.`,
      },
    ],
    commonMistakes: ['Forget start ε-closure', 'Forget post-move ε-closure', 'ε ≠ empty string consumed'],
    masteryCriteria: ['Compute ε-closure', 'Simulate ENFA step by step', 'Identify ε-reachable states'],
  },

  {
    id: 'nfa-to-dfa',
    unit: 1,
    title: 'NFA → DFA (Subset Construction)',
    subtitle: 'Turn parallel possibilities into a single deterministic machine.',
    prerequisites: ['nfa', 'enfa'],
    objective: 'Apply subset construction to convert any NFA/ENFA to an equivalent DFA.',
    workspace: 'nfa-to-dfa-lab',
    examWeight: 5,
    steps: [
      {
        type: 'why',
        title: 'Why convert?',
        content: `NFAs are easy to *design* but hard to *implement*. Real computers are deterministic. So to actually run an NFA, we convert it to a DFA first.\n\nThe key insight: **each DFA state represents a set of NFA states**. The DFA "remembers" all the places the NFA could simultaneously be.`,
      },
      {
        type: 'intuition',
        title: 'The Subset Trick',
        content: `Think of it this way: instead of tracking which *one* state the DFA is in, we track which *subset* of NFA states the machine could be in.\n\nIf the NFA has 3 states {q0, q1, q2}, the DFA can have at most $2^3 = 8$ states — one for each subset of NFA states.\n\nMost subsets are usually unreachable, so in practice the DFA is much smaller.`,
        checkQuestion: {
          question: 'An NFA with 4 states can produce a DFA with at most how many states?',
          options: ['4', '8', '16', '12'],
          correct: 2,
          explanation: '$2^4 = 16$. Each subset of 4 states is a potential DFA state. In practice, most are unreachable.',
        },
      },
      {
        type: 'formal',
        title: 'Subset Construction Algorithm',
        content: `**Input:** NFA $(Q, \\Sigma, \\delta, q_0, F)$\n\n**Algorithm:**\n1. DFA start state = ε-closure({q0})\n2. Queue = [start state]\n3. While queue not empty:\n   - Take a subset $S$\n   - For each symbol $a \\in \\Sigma$:\n     - Compute $S' = \\varepsilon\\text{-closure}(\\text{Move}(S, a))$\n     - Add DFA transition $S \\xrightarrow{a} S'$\n     - If $S'$ not yet seen, add to queue\n4. DFA accepting states = any subset containing an NFA accepting state`,
      },
      {
        type: 'example',
        title: 'Worked Example',
        content: `NFA for strings ending in "01":\n| State | 0 | 1 |\n|-------|------|------|\n| →q0 | {q0,q1} | {q0} |\n| q1 | ∅ | {q2} |\n| *q2 | ∅ | ∅ |\n\n**Subset Construction:**\n- Start: {q0}\n- {q0} on 0: {q0,q1}  → new DFA state\n- {q0} on 1: {q0}    → already known\n- {q0,q1} on 0: {q0,q1} → already known\n- {q0,q1} on 1: {q0}∪{q2} = {q0,q2} → new DFA state (accepting!)\n- {q0,q2} on 0: {q0,q1} → already known\n- {q0,q2} on 1: {q0} → already known\n\n**Result DFA:** 3 states: {q0}, {q0,q1}, {q0,q2}*`,
      },
      {
        type: 'guided',
        title: 'Guided: Step Through It',
        content: `Use the NFA→DFA Lab on the right:\n\n1. The NFA is pre-loaded on the left\n2. Begin with the start subset {q0}\n3. For each symbol, click the states to compute Move(S, a)\n4. Apply ε-closure if needed\n5. Click "Create DFA State" to add it\n6. Continue until no new subsets appear\n\nThe system will verify each step and give feedback if you miss a state.`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Convert the following NFAs to DFAs using subset construction:\n\n1. **NFA** for strings containing "00":\n   | State | 0 | 1 |\n   |-------|---|---|\n   | →q0 | {q0,q1} | {q0} |\n   | q1 | {q2} | ∅ |\n   | *q2 | {q2} | {q2} |\n\n2. Design your own NFA and convert it`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Convert the following ENFA to a DFA. Show all steps including ε-closure calculations and the complete transition table for the resulting DFA.\n\n| State | ε | a | b |\n|-------|---|---|---|\n| →q0 | {q1} | ∅ | ∅ |\n| q1 | ∅ | {q2} | ∅ |\n| q2 | ∅ | ∅ | {q3} |\n| *q3 | ∅ | ∅ | ∅ |`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Forgetting to apply ε-closure during subset construction**\nIf the NFA has ε-transitions, every Move must be followed by ε-closure.\n\n**Mistake 2: Marking DFA dead state as non-accepting**\nThe empty set ∅ is always a non-accepting DFA state (a "dead state").\n\n**Mistake 3: Not marking DFA state as accepting**\nAny DFA subset containing an NFA accepting state is an accepting DFA state.\n\n**Mistake 4: Assuming unreachable subsets are needed**\nOnly subsets reachable from the start are required.`,
      },
    ],
    commonMistakes: ['Missing ε-closure in construction', 'Missing accepting subsets', 'Including unreachable subsets'],
    masteryCriteria: ['Apply subset construction', 'Compute ε-closure during construction', 'Correctly mark DFA accepting states', 'Language is preserved'],
  },

  {
    id: 'minimization',
    unit: 1,
    title: 'DFA Minimization',
    subtitle: 'Find the smallest DFA that recognizes the same language.',
    prerequisites: ['nfa-to-dfa'],
    objective: 'Apply the table-filling (partition refinement) algorithm to minimize a DFA.',
    workspace: 'minimization-lab',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why minimize?',
        content: `Subset construction can produce DFAs with redundant states — states that behave identically. Minimization finds the **unique smallest** DFA for a language.\n\nThis matters for: compiler implementation, verification, and proving two automata are equivalent.`,
      },
      {
        type: 'intuition',
        title: 'Equivalent States',
        content: `Two states $p$ and $q$ are **equivalent** if: for every string $w$, the machine accepts from $p$ iff it accepts from $q$.\n\nIntuitively: if you can't tell two states apart by any future input, they're equivalent and can be merged.\n\nWe find *distinguishable* pairs first, then merge everything that's left.`,
        checkQuestion: {
          question: 'If δ(p, a) is accepting and δ(q, a) is non-accepting, then p and q are…',
          options: ['Equivalent', 'Distinguishable', 'Need more input to decide', 'Always the same'],
          correct: 1,
          explanation: 'They\'re distinguishable by the string "a". From p, "a" leads to acceptance; from q, it doesn\'t. So p and q must be in different equivalence classes.',
        },
      },
      {
        type: 'formal',
        title: 'Partition Refinement Algorithm',
        content: `**Step 1:** Remove unreachable states (states with no path from q0).\n\n**Step 2:** Initial partition:\n$$P_0 = \\{F,\\ Q \\setminus F\\}$$\n(Accepting and non-accepting states are always distinguishable.)\n\n**Step 3:** Refine. For each group $G$ in $P$ and each symbol $a$:\n- Split $G$ if two states $p, q \\in G$ have $\\delta(p,a)$ and $\\delta(q,a)$ in **different** groups.\n\n**Step 4:** Repeat until partition is stable.\n\n**Step 5:** Merge each group into one state. Build the minimized DFA.`,
      },
      {
        type: 'example',
        title: 'Worked Example',
        content: `DFA with states {q0,q1,q2,q3}, F={q1,q3}:\n| State | 0 | 1 |\n|-------|---|---|\n| →q0 | q1 | q3 |\n| *q1 | q0 | q3 |\n| *q3 | q1 | q0 |\n| q2 | q2 | q2 |\n\n**P0:** {q1,q3}, {q0,q2}\n**Check {q0,q2} on 0:** δ(q0,0)=q1∈F, δ(q2,0)=q2∉F → Split! {q0},{q2}\n**Check {q1,q3} on 0:** δ(q1,0)=q0, δ(q3,0)=q1 → both in {q0} and {q1,q3} respectively — same group? No! Split.\n**q2 is unreachable** — remove it first.\n**Final:** q0, q1≡q3 merge → 2-state minimum DFA.`,
      },
      {
        type: 'guided',
        title: 'Guided: Step Through It',
        content: `Use the Minimization Lab:\n\n1. **Stage 1:** Identify and remove unreachable states. Click states you think are unreachable.\n2. **Stage 2:** The lab shows initial partition P0. Confirm it's correct.\n3. **Stage 3:** For each group, check transitions on each symbol. If two states go to different groups, split them.\n4. **Stage 4:** Continue until no splits possible.\n5. **Stage 5:** Merge equivalent groups and generate minimized DFA.`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Minimize the following DFAs:\n\n1. A 5-state DFA you construct for "strings with even number of 0s"\n2. The DFA resulting from subset construction of the NFA in the previous lesson\n3. Prove two DFAs are equivalent by minimizing both and showing identical canonical forms`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Minimize the following DFA and show all partition refinement steps:\n\n| State | 0 | 1 |\n|-------|---|---|\n| →A | B | C |\n| *B | A | D |\n| *D | A | B |\n| C | C | C |\n| E | B | C |\n\nIdentify: unreachable states, initial partition P0, all refinement steps, and the final minimized DFA.`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Not removing unreachable states first**\nUnreachable states can corrupt partition refinement.\n\n**Mistake 2: Wrong initial partition**\nP0 = {F, Q-F}. Accepting and non-accepting states are ALWAYS distinguishable.\n\n**Mistake 3: Stopping refinement too early**\nContinue until the partition doesn't change.\n\n**Mistake 4: "q1 and q2 cannot be in the same partition because on input 1 they go to different partition groups."**\nAlways check BOTH symbols before deciding.`,
      },
    ],
    commonMistakes: ['Skip unreachable removal', 'Wrong P0', 'Early stopping', 'Checking only one symbol'],
    masteryCriteria: ['Remove unreachable states', 'Construct P0', 'Refine partitions correctly', 'Produce correct minimized DFA'],
  },

  {
    id: 'regex',
    unit: 1,
    title: 'Regular Expressions',
    subtitle: 'Describe infinite languages with finite patterns.',
    prerequisites: ['dfa'],
    objective: 'Construct and interpret regular expressions using union, concatenation, and Kleene star.',
    workspace: 'regex-lab',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why regex?',
        content: `Automata are great for *running* machines, but what if you want to *describe* a language concisely?\n\n"All strings starting with 01 and containing at least one 1" is hard to draw but easy to write as a regex: **01(0|1)*1(0|1)***.\n\nRegular expressions and finite automata describe **exactly the same class of languages** — the regular languages.`,
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A **Regular Expression** over $\\Sigma$ is defined inductively:\n\n**Base cases:**\n- $\\emptyset$ — empty language\n- $\\varepsilon$ — language containing only the empty string\n- $a$ for any $a \\in \\Sigma$ — language {a}\n\n**Inductive cases** (if $R_1$, $R_2$ are REs):\n- $R_1 | R_2$ (union): strings in $R_1$ OR $R_2$\n- $R_1 R_2$ (concatenation): string from $R_1$ followed by string from $R_2$\n- $R_1^*$ (Kleene star): zero or more strings from $R_1$ concatenated\n\n**Precedence:** Star > Concatenation > Union`,
      },
      {
        type: 'example',
        title: 'Worked Examples',
        content: `**RE:** $(0|1)^*01$\n- Strings ending in "01": 01, 001, 101, 0101 ...\n\n**RE:** $0^*10^*10^*$\n- Exactly two 1s, any number of 0s around them: 11, 010110, 0010100 ...\n\n**RE:** $(0|1)^*(00|11)(0|1)^*$\n- Strings containing two consecutive identical symbols\n\n**RE:** $\\varepsilon | 0(0|1)^*$\n- Empty string OR strings starting with 0`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `Write regular expressions for:\n\n1. **Strings of length exactly 3** over {0,1}\n   Hint: (0|1)(0|1)(0|1)\n\n2. **Strings containing "101"** as a substring\n   Hint: Start with (0|1)*...\n\n3. **Strings with no two consecutive 0s**\n   Hint: Think about what can follow a 0.\n\nEnter your regex in the Regex Lab. The system will test it against randomly generated strings and tell you if your regex matches the intended language.`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Construct REs for:\n1. Even-length strings over {a,b}\n2. Strings over {0,1} with an even number of 1s\n3. Strings that do NOT contain "00"\n4. Strings where every 0 is followed by at least one 1`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q1:** Write a regular expression for: "Binary strings that begin with 1 and end with 0, or begin with 0 and end with 1."\n\n**Q2:** Show that $(0|1)^* = (0^*1)^*0^*$ by tracing the same string through both.`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Confusing $R^*$ and $R^+$**\n$R^*$ includes ε (zero or more). $R^+$ = $RR^*$ (one or more).\n\n**Mistake 2: Forgetting parentheses for grouping**\n$01^*$ means "0 followed by zero or more 1s". It does NOT mean "(01)*".\n\n**Mistake 3: $\\emptyset^* = \\{\\varepsilon\\}$**\nThe Kleene star of the empty language is the language containing only ε.`,
      },
    ],
    commonMistakes: ['R* vs R+', 'Missing parentheses', 'Empty language star'],
    masteryCriteria: ['Write RE from description', 'Parse complex RE', 'Test RE against strings', 'Explain precedence'],
  },

  {
    id: 're-to-fa',
    unit: 1,
    title: 'RE → FA (Thompson Construction)',
    subtitle: 'Compile a regular expression into an NFA, fragment by fragment.',
    prerequisites: ['regex', 'enfa'],
    objective: 'Apply Thompson\'s construction to convert any regular expression to an ε-NFA.',
    workspace: 'regex-lab',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why Thompson Construction?',
        content: `Regular expressions are convenient to write, but we need automata to *execute* them.\n\nThompson's construction gives us a systematic recipe: **every RE operator maps to a small NFA fragment** connected by ε-transitions. We build up the NFA from the bottom of the parse tree.`,
      },
      {
        type: 'formal',
        title: 'Thompson Fragments',
        content: `**Symbol a:**\n→(i) --a--> ((f))\n\n**Union R1|R2:**\n→(i) --ε--> [R1] --ε--> ((f))\n→(i) --ε--> [R2] --ε--> ((f))\n\n**Concatenation R1R2:**\n[R1] --ε--> [R2] (connect accepting of R1 to start of R2)\n\n**Kleene Star R*:**\n→(i) --ε--> [R] --ε--> ((f))\n(i) --ε--> (f)  (allows zero occurrences)\n[R]'s accepting --ε--> [R]'s start  (allows repetition)`,
      },
      {
        type: 'example',
        title: 'Example: Build NFA for (a|b)*c',
        content: `**Parse tree:** concat( star( union(a,b) ), c )\n\n**Step 1:** Build fragment for 'a' → (q0)--a-->(q1)\n**Step 2:** Build fragment for 'b' → (q2)--b-->(q3)\n**Step 3:** Union: new start → ε to q0 and q2; q1 and q3 → ε to new accept\n**Step 4:** Star: loop the union fragment\n**Step 5:** Build fragment for 'c' → (qc)--c-->(qf)\n**Step 6:** Concatenate: ε from star's accept to qc\n\nResult: ε-NFA with multiple ε-transitions.`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `In the RE Lab, enter: **a(b|c)***\n\n1. The AST will be displayed: concat(a, star(union(b,c)))\n2. Click "Build Fragment" on each node\n3. Connect the fragments using ε-transitions\n4. Test the final NFA by running strings: "a", "ab", "abc", "abcbc"`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Convert to ε-NFA using Thompson's construction:\n1. (0|1)*00\n2. 1(0|1)*0\n3. a*b*c*\n\nFor each, also run the resulting NFA on 3 strings and verify acceptance.`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Apply Thompson's construction to: **01*|10***\n\nShow:\n1. The parse tree / AST\n2. Each primitive fragment\n3. How fragments are combined\n4. The final ε-NFA with all states labeled\n5. Trace "010" through the result`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Shared states between fragments**\nEach Thompson fragment must have fresh states — never reuse states across fragments.\n\n**Mistake 2: Forgetting the ε-back-loop in Kleene star**\nThe back loop from the old accepting state to the old start state is what enables repetition.\n\n**Mistake 3: Connecting fragments with a direct edge instead of ε**\nAlways use ε to connect fragments — direct edges would change the language.`,
      },
    ],
    commonMistakes: ['Shared states', 'Missing star back-loop', 'Non-ε connection'],
    masteryCriteria: ['Build RE AST', 'Apply each Thompson rule', 'Produce correct ε-NFA', 'Verify with string traces'],
  },

  {
    id: 'fa-to-re',
    unit: 1,
    title: 'FA → RE (State Elimination)',
    subtitle: 'Systematically eliminate states to extract the regular expression.',
    prerequisites: ['re-to-fa'],
    objective: 'Apply GNFA state elimination to convert any FA to an equivalent regular expression.',
    workspace: 'regex-lab',
    examWeight: 3,
    steps: [
      {
        type: 'why',
        title: 'Why FA → RE?',
        content: `RE → FA is easy (Thompson). But going the other way — extracting a compact regex from an automaton — requires the **state elimination** method using a **Generalized NFA (GNFA)**.\n\nA GNFA allows regex labels on transitions (not just symbols). We eliminate states one by one, rerouting transitions until only the start and accept states remain.`,
      },
      {
        type: 'formal',
        title: 'State Elimination Algorithm',
        content: `**Step 1:** Convert FA to GNFA:\n- Add new unique start state $s_{new}$ with ε to original start\n- Add new unique accept state $f_{new}$ with ε from all original accept states\n- Convert parallel edges to single edges using union\n\n**Step 2:** Repeatedly eliminate an internal state $q_{rip}$:\nFor every pair $(q_i, q_j)$ where $q_i \\neq q_{rip} \\neq q_j$:\n$$R_{ij} = R_{ij}\\ |\\ R_{i,rip}\\cdot R_{rip,rip}^*\\cdot R_{rip,j}$$\n\n**Step 3:** When only $s_{new}$ and $f_{new}$ remain, the label on the edge is the RE.`,
      },
      {
        type: 'example',
        title: 'Worked Example',
        content: `DFA for strings ending in "1":\n- q0 (start), q1 (accept)\n- q0 --0--> q0, q0 --1--> q1, q1 --0--> q0, q1 --1--> q1\n\n**GNFA:** add s_new --ε--> q0, q1 --ε--> f_new\n\n**Eliminate q0:**\n- Path from s_new through q0 to q1: ε(0*)(1) = 0*1\n- Path from q1 through q0 to q1: (0)(0*)(1) = 00*1\n\n**Simplify:** s_new --ε·(0*1)|(1·(00*1)*)·ε--> f_new\n= $0^*1(00^*1)^*$\n\nSimplified: $(0|1)^*1$ ✓`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `Use the FA→RE panel:\n\n1. Load any DFA you built earlier\n2. Click "Convert to GNFA" — the system adds new start/accept and converts parallel edges\n3. Select a state to eliminate (start with a non-initial, non-accepting state)\n4. The system shows the formula $R_{ij} = R_{ij} | R_{i,k}(R_{kk})^*R_{k,j}$\n5. You enter the updated regex for each edge\n6. Repeat until 2 states remain`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Convert the following DFA to a regular expression using state elimination:\n\n| State | a | b |\n|-------|---|---|\n| →q0 | q1 | q0 |\n| *q1 | q1 | q0 |\n\nShow the GNFA at each stage and the final regex. Verify your regex accepts "a", "aa", "ba" and rejects "b", "bb".`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Eliminating start or accept states**\nOnly eliminate internal states. $s_{new}$ and $f_{new}$ must remain until the end.\n\n**Mistake 2: Forgetting the self-loop term $R_{kk}^*$**\nIf the eliminated state has a self-loop, its star must appear in the formula.\n\n**Mistake 3: Forgetting parallel edges**\nBefore elimination, merge all parallel edges with union.`,
      },
    ],
    commonMistakes: ['Eliminating boundary states', 'Missing self-loop star', 'Ignoring parallel edges'],
    masteryCriteria: ['Build GNFA', 'Apply elimination formula', 'Produce correct regex', 'Verify regex'],
  },

  {
    id: 'equivalence',
    unit: 1,
    title: 'Automata Equivalence',
    subtitle: 'Prove two machines accept exactly the same language.',
    prerequisites: ['minimization'],
    objective: 'Check DFA equivalence via minimization or product construction; produce distinguishing strings.',
    workspace: 'equivalence-arena',
    examWeight: 3,
    steps: [
      {
        type: 'why',
        title: 'Why equivalence?',
        content: `You've built two automata that you *think* accept the same language. How do you *prove* it?\n\nOr: you minimized a DFA. How do you prove the result is still correct?\n\nEquivalence testing answers this definitively.`,
      },
      {
        type: 'formal',
        title: 'Methods',
        content: `**Method 1: Minimize both DFAs**\nMinimize both. The minimum DFAs are *isomorphic* iff the languages are equal.\n\n**Method 2: Product Construction**\nBuild the product automaton $M_A \\times M_B$. States are pairs $(q_A, q_B)$.\nCheck for a state where one component is accepting and the other is not.\nIf such a state is *reachable*, that state's input path is a **distinguishing string** — proof they differ.\n\n**Method 3: Table-filling (Hopcroft-Karp)**\nTreat the two automata's states as one combined set and run the minimization distinguishability check.`,
      },
      {
        type: 'example',
        title: 'Distinguishing String',
        content: `**Machine A** accepts strings ending in 0.\n**Machine B** accepts strings ending in 1.\n\nProduct $(q_A, q_B)$ starting from (start_A, start_B).\nRead "0": move to (accept_A, nonaccept_B).\nThis state has one accepting component → languages differ.\n\n**Witness string: "0"** — A accepts, B rejects. QED.`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `In the Equivalence Arena:\n1. Build Machine A (e.g., strings ending in "0")\n2. Build Machine B (e.g., strings ending in "01")\n3. Click "Check Equivalence"\n4. The system builds the product and highlights any distinguishing state\n5. It outputs the shortest witness string if languages differ`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Are the following two DFAs equivalent? If not, find a string that one accepts and the other rejects.\n\n**DFA1:** Accepts strings with even number of 0s\n**DFA2:** Accepts strings with even number of 1s\n\nJustify your answer and provide a witness if they differ.`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Claiming equivalence without a proof**\nAlways either show isomorphism of minimized forms OR exhaustive product check.\n\n**Mistake 2: Testing only a few strings**\nFinite string tests never prove equivalence — only disprove it.`,
      },
    ],
    commonMistakes: ['No formal proof', 'String testing ≠ proof'],
    masteryCriteria: ['Build product automaton', 'Find distinguishing string', 'Minimize and compare canonical forms'],
  },

  {
    id: '2dfa',
    unit: 1,
    title: 'Two-Way Finite Automata',
    subtitle: 'The tape head can move left and right — but the power stays the same.',
    prerequisites: ['dfa'],
    objective: 'Simulate a 2DFA on a tape and understand why 2DFAs recognize only regular languages.',
    workspace: 'tape-2dfa',
    examWeight: 2,
    steps: [
      {
        type: 'why',
        title: 'What makes 2DFA different?',
        content: `A standard DFA reads left-to-right only. A 2DFA can move the tape head in **either direction** — left or right — on each step.\n\nSurprisingly, this extra power doesn't help: 2DFAs still recognize exactly the **regular languages**. But they can sometimes express languages more *concisely*.`,
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A **2DFA** is a 5-tuple $(Q, \\Sigma, \\delta, q_0, F)$ where:\n$$\\delta: Q \\times \\Sigma_{\\vdash \\dashv} \\to Q \\times \\{L, R\\}$$\n\nThe tape has endmarkers: **⊢** (left end) and **⊣** (right end).\nThe head must not move left past ⊢ or right past ⊣.\nThe machine halts and accepts if it enters an accepting state. It halts and rejects if it gets stuck or enters a rejecting state.`,
      },
      {
        type: 'example',
        title: 'Example: Palindrome Detection',
        content: `A 2DFA for even-length palindromes over {a,b} works by:\n1. Read first symbol, remember it, scan right to find the last symbol\n2. Compare them; if equal, continue; if not, reject\n3. Move head back to the second symbol\n4. Repeat for the second and second-to-last, and so on\n\nThis requires multiple passes — impossible for a standard DFA!`,
      },
      {
        type: 'guided',
        title: 'Guided: Tape Simulation',
        content: `Use the Tape Lab:\n\n1. The tape shows: ⊢ a b a ⊣\n2. Current state and head position are highlighted\n3. At each step, the system shows: Current State, Read Symbol, Transition taken, Head movement\n4. Click "Step" to advance, or "Play" for automatic execution\n5. Try to trace the path manually before clicking Step`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Design a 2DFA that accepts strings of the form $a^n b^n$ for $n \\geq 1$ over {a,b} and trace its execution on "aabb". Show the state and head position at every step.`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Thinking 2DFAs are more powerful than DFAs**\n2DFAs recognize exactly the regular languages — same as DFAs. More power would require memory (like a stack → PDA).\n\n**Mistake 2: Moving left past the left endmarker**\nThe transition on ⊢ must always move Right.`,
      },
    ],
    commonMistakes: ['2DFA ≠ more power than DFA', 'Crossing endmarker'],
    masteryCriteria: ['Trace 2DFA on tape', 'Design simple 2DFA', 'Explain equivalence to DFA'],
  },

  {
    id: 'moore',
    unit: 1,
    title: 'Moore Machines',
    subtitle: 'Output depends on the current state.',
    prerequisites: ['dfa'],
    objective: 'Design and simulate a Moore machine; observe that output is tied to states.',
    workspace: 'moore-mealy',
    examWeight: 2,
    steps: [
      {
        type: 'why',
        title: 'Beyond Accept/Reject',
        content: `DFAs only answer YES or NO. But what if you need the machine to *produce output* — like a parity checker that outputs 0 or 1 at each state?\n\n**Moore** and **Mealy** machines are finite automata extended with outputs. They are used in digital circuit design, protocol modeling, and compiler construction.`,
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A **Moore machine** is a 6-tuple:\n$$(Q, \\Sigma, \\Delta, \\delta, \\lambda, q_0)$$\n\n- $Q$ — states\n- $\\Sigma$ — input alphabet\n- $\\Delta$ — output alphabet\n- $\\delta: Q \\times \\Sigma \\to Q$ — transition function\n- $\\lambda: Q \\to \\Delta$ — **output function (depends only on state)**\n- $q_0$ — initial state\n\nThe output at each step is the output of the **current state**, not the transition.`,
      },
      {
        type: 'example',
        title: 'Example: Even/Odd Parity Checker',
        content: `States: q0 (even 1s seen), q1 (odd 1s seen)\nOutput: q0 → 'E', q1 → 'O'\n\nInput "110":\n- Start: q0 / output E\n- Read 1: → q1 / output O\n- Read 1: → q0 / output E\n- Read 0: → q0 / output E\n\nFull output: E O E E`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `Build a Moore machine that outputs:\n- '0' when an even number of 0s has been seen\n- '1' when an odd number of 0s has been seen\n\nUse the Moore/Mealy Lab. Remember:\n- Output is assigned to states, not transitions.\n- Test with "00", "010", "101" and verify output sequences.`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Design a Moore machine over {a,b} that outputs 'X' whenever the last two symbols are "ab" and 'O' otherwise. Trace "aab" and "abb".`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Putting output on transitions in a Moore machine**\nIn Moore, output belongs to STATES. Mealy puts output on transitions.\n\n**Mistake 2: Output length**\nMoore machine output length = number of states visited = input length + 1 (including initial state output).`,
      },
    ],
    commonMistakes: ['Output on transitions', 'Wrong output length'],
    masteryCriteria: ['Assign output to states', 'Trace Moore machine', 'Produce correct output sequence'],
  },

  {
    id: 'mealy',
    unit: 1,
    title: 'Mealy Machines',
    subtitle: 'Output depends on both the state and the input symbol.',
    prerequisites: ['moore'],
    objective: 'Design and simulate a Mealy machine and convert between Moore and Mealy forms.',
    workspace: 'moore-mealy',
    examWeight: 2,
    steps: [
      {
        type: 'why',
        title: 'Moore vs Mealy',
        content: `In a **Mealy machine**, the output is produced on the **transition**, not the state. This means output depends on *both* the current state and the current input symbol.\n\nMealy machines are generally more compact — they may have fewer states than an equivalent Moore machine.`,
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A **Mealy machine** is a 6-tuple:\n$$(Q, \\Sigma, \\Delta, \\delta, \\lambda, q_0)$$\n\n- $\\lambda: Q \\times \\Sigma \\to \\Delta$ — **output function (depends on state AND input)**\n\nEach transition is labeled: $a/z$ meaning "on input a, output z".\n\nOutput length = input length (one output per transition).`,
      },
      {
        type: 'example',
        title: 'Example: Complement Machine',
        content: `Mealy machine that outputs the complement of each input bit:\n- Single state q0\n- On 0/1: stay in q0, output 1\n- On 1/0: stay in q0, output 0\n\nInput "1010" → Output "0101"`,
      },
      {
        type: 'guided',
        title: 'Moore → Mealy Conversion',
        content: `Given a Moore machine, convert it to an equivalent Mealy machine:\n\n**Rule:** For each transition $p \\xrightarrow{a} q$, the Mealy output is $\\lambda_{Moore}(q)$ (the output of the destination state).\n\nThe Moore/Mealy Lab will guide you through this conversion step-by-step for the machine you built in the previous lesson.`,
      },
      {
        type: 'guided',
        title: 'Mealy → Moore Conversion',
        content: `Going the other way is slightly harder:\n\n**Rule:** For each state $q$ that can be entered from multiple transitions with different outputs, you may need to **split** $q$ into multiple states — one for each possible incoming output.\n\nUse the Lab to convert your Mealy complement machine back to a Moore machine.`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Design a Mealy machine over {0,1} that outputs '1' whenever the last two input symbols were equal, and '0' otherwise.\n\nThen convert it to an equivalent Moore machine. How many states does each have? Run "0011" through both and verify the output sequences match.`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Mealy output length ≠ Moore output length**\nMealy: |output| = |input|. Moore: |output| = |input| + 1.\n\n**Mistake 2: Forgetting to split states in Mealy → Moore**\nIf a state $q$ can produce different outputs (coming from different transitions), it MUST be split.`,
      },
    ],
    commonMistakes: ['Output length confusion', 'Not splitting states in M→M conversion'],
    masteryCriteria: ['Design Mealy machine', 'Trace Mealy correctly', 'Convert Moore ↔ Mealy', 'Verify output equivalence'],
  },

  // ─────────────────────── UNIT 2 ───────────────────────
  {
    id: 'cfg',
    unit: 2,
    title: 'Context-Free Grammars',
    subtitle: 'Define hierarchical languages — the foundation of programming language syntax.',
    prerequisites: [],
    objective: 'Write a CFG, understand its components, and generate strings using productions.',
    workspace: 'grammar',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why CFGs?',
        content: `Regular languages can't express "balanced parentheses" or "matched brackets". These are **context-free** languages — the next level up in the Chomsky hierarchy.\n\nEvery programming language uses a CFG to define its syntax. When your compiler says "syntax error", it checked your code against a CFG.`,
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A **CFG** is a 4-tuple $G = (V, T, P, S)$:\n\n- $V$ — finite set of **variables** (nonterminals), e.g., {S, A, B}\n- $T$ — finite set of **terminals** (actual symbols), e.g., {a, b, (, )}\n- $P$ — finite set of **productions** of the form $A \\to \\alpha$ where $A \\in V$, $\\alpha \\in (V \\cup T)^*$\n- $S \\in V$ — **start symbol**\n\n$V$ and $T$ must be disjoint.`,
      },
      {
        type: 'example',
        title: 'Example: Balanced Parentheses',
        content: `$G$: $S \\to SS\\ |\\ (S)\\ |\\ \\varepsilon$\n\n**Generating "(())":**\n- S → (S)\n- (S) → (SS) ... wait, let's use the simpler rule:\n- S → (S) → ((S)) → (()) ✓\n\n**The language:** $L(G)$ = all strings of balanced parentheses, including ε.`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `Build a CFG in the Grammar Workspace for: **strings of the form $a^n b^n$, $n \\geq 0$**\n\nHints:\n1. You need one variable S\n2. S should produce: ε (for n=0) OR a, then "nested" S, then b\n3. Verify by generating "aabb" and "aaabbb"`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Write CFGs for:\n1. $\\{a^n b^n c^n\\ |\\ n \\geq 0\\}$ — is this possible with a CFG?\n2. $\\{w w^R\\ |\\ w \\in \\{a,b\\}^*\\}$ — palindromes\n3. Arithmetic expressions: id, +, *, (, )\n4. $\\{a^i b^j\\ |\\ i \\leq j\\}$`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Write a CFG for the language $L = \\{a^m b^n\\ |\\ m \\geq n \\geq 0\\}$.\n\nGenerate the string "aab" from your grammar and show the derivation step by step.`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Variables and terminals overlap**\n$V \\cap T = \\emptyset$ always.\n\n**Mistake 2: Production LHS must be a single variable**\nContext-free means the LHS is ALWAYS a single variable. If LHS has more than one symbol, it's context-sensitive.\n\n**Mistake 3: Forgetting ε production when needed**\nIf the language includes the empty string, you need $S \\to \\varepsilon$ explicitly.`,
      },
    ],
    commonMistakes: ['V∩T ≠ ∅', 'LHS not single variable', 'Missing ε production'],
    masteryCriteria: ['Write CFG from description', 'Identify V, T, P, S', 'Generate strings from grammar'],
  },

  {
    id: 'derivations',
    unit: 2,
    title: 'Derivations & Parse Trees',
    subtitle: 'Show how a grammar generates a string, step by step.',
    prerequisites: ['cfg'],
    objective: 'Perform leftmost and rightmost derivations and construct parse trees.',
    workspace: 'grammar',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why derivations?',
        content: `A grammar says *which* strings are in the language. A **derivation** shows *how* a specific string is generated — the proof that the string belongs to the language.\n\nDerivations also reveal the **structure** of the string — the parse tree — which is critical for meaning in programming languages (operator precedence, etc.).`,
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A **derivation** is a sequence:\n$$\\alpha_0 \\Rightarrow \\alpha_1 \\Rightarrow \\cdots \\Rightarrow \\alpha_n$$\n\nwhere each step replaces one variable with the RHS of one of its productions.\n\n**Leftmost derivation ($\\Rightarrow_{lm}$):** Always replace the **leftmost** variable.\n\n**Rightmost derivation ($\\Rightarrow_{rm}$):** Always replace the **rightmost** variable.\n\nBoth must produce the same string if the grammar is unambiguous.`,
      },
      {
        type: 'example',
        title: 'Example: Both Derivations',
        content: `Grammar: $E \\to E + E\\ |\\ E * E\\ |\\ id$\nString: $id + id * id$\n\n**Leftmost:**\n$E \\Rightarrow E + E \\Rightarrow id + E \\Rightarrow id + E * E \\Rightarrow id + id * E \\Rightarrow id + id * id$\n\n**Rightmost:**\n$E \\Rightarrow E + E \\Rightarrow E + E * E \\Rightarrow E + E * id \\Rightarrow E + id * id \\Rightarrow id + id * id$\n\nNote: Both produce the same string. But are the parse trees identical?`,
      },
      {
        type: 'guided',
        title: 'Guided: Build the Parse Tree',
        content: `In the Grammar Workspace:\n\n1. Load the grammar $S \\to aSb\\ |\\ \\varepsilon$\n2. Target string: "aabb"\n3. Click on the leftmost variable to expand it\n4. The system enforces LEFTMOST derivation — only the leftmost variable is clickable\n5. Select the production to apply from the dropdown\n6. Watch the parse tree grow\n7. When no variables remain, the derivation is complete`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `For the grammar $S \\to AB,\\ A \\to aA\\ |\\ \\varepsilon,\\ B \\to Bb\\ |\\ \\varepsilon$:\n\n1. Derive "aab" using leftmost derivation\n2. Derive "aab" using rightmost derivation\n3. Construct the parse tree for "aab"\n4. Is there more than one parse tree? (This is the ambiguity question!)`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Using the grammar $E \\to E+T\\ |\\ T,\\ T \\to T*F\\ |\\ F,\\ F \\to (E)\\ |\\ id$:\n\n1. Derive "id * (id + id)" using leftmost derivation\n2. Construct the parse tree\n3. Show that this grammar is unambiguous by explaining why there is only one parse tree for this string`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: In leftmost derivation, replacing a non-leftmost variable**\nIn leftmost derivation, ONLY the leftmost variable may be replaced at each step.\n\n**Mistake 2: Stopping before all variables are eliminated**\nA complete derivation has no variables — only terminals remain.\n\n**Mistake 3: Confusing derivation steps with parse tree nodes**\nThe parse tree is built from the derivation but is a different object.`,
      },
    ],
    commonMistakes: ['Non-leftmost replacement', 'Incomplete derivation', 'Derivation ≠ parse tree'],
    masteryCriteria: ['Perform leftmost derivation', 'Perform rightmost derivation', 'Build parse tree from derivation'],
  },

  {
    id: 'ambiguity',
    unit: 2,
    title: 'Grammar Ambiguity',
    subtitle: 'When a string has two different parse trees, the grammar is ambiguous.',
    prerequisites: ['derivations'],
    objective: 'Identify ambiguous grammars by constructing two distinct parse trees for the same string.',
    workspace: 'grammar',
    examWeight: 3,
    steps: [
      {
        type: 'why',
        title: 'Why does ambiguity matter?',
        content: `If a grammar is ambiguous, the same string can be parsed in two different ways — with two different meanings.\n\nIn programming languages, this causes bugs: "1+2*3" could mean 9 or 7 depending on which parse tree the compiler chooses.\n\nAmbiguity detection is critical for grammar design.`,
      },
      {
        type: 'formal',
        title: 'Formal Definition',
        content: `A CFG $G$ is **ambiguous** if there exists a string $w \\in L(G)$ that has **two or more distinct leftmost derivations** (equivalently, two or more distinct parse trees).\n\nA language is **inherently ambiguous** if *every* grammar for it is ambiguous.`,
        checkQuestion: {
          question: 'To prove a grammar is ambiguous, you must…',
          options: [
            'Show all strings have two parse trees',
            'Find one string with two distinct parse trees',
            'Show the grammar has undefined variables',
            'Minimize the grammar'
          ],
          correct: 1,
          explanation: 'Ambiguity only requires a single witness: one string for which two distinct parse trees (or leftmost derivations) exist.',
        },
      },
      {
        type: 'example',
        title: 'Classic Example: Arithmetic',
        content: `Grammar: $E \\to E + E | E * E | id$\n\nString: $id + id * id$\n\n**Parse Tree 1** (addition at root):\nRoot = E+E. Left child = id. Right child = E*E, with leaves id and id.\nThis groups as: id + (id * id)\n\n**Parse Tree 2** (multiplication at root):\nRoot = E*E. Left child = E+E with leaves id and id. Right child = id.\nThis groups as: (id + id) * id\n\nTwo distinct trees for the same string → **Grammar is ambiguous**.`,
      },
      {
        type: 'guided',
        title: 'Guided: Find the Witness',
        content: `In the Grammar Workspace with $E \\to E + E\\ |\\ E * E\\ |\\ id$:\n\n1. Target string: "id + id * id"\n2. Build Parse Tree 1: first expand using $E \\to E + E$ at the top\n3. Build Parse Tree 2: first expand using $E \\to E * E$ at the top\n4. The system will validate both trees are correct derivations\n5. Once two distinct trees are found, the system marks the grammar as **AMBIGUOUS**`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `1. Is $S \\to aSbS\\ |\\ aS\\ |\\ \\varepsilon$ ambiguous? Find a witness if so.\n2. The grammar $S \\to AB,\\ A \\to a,\\ B \\to b$ — is it ambiguous? Why or why not?\n3. Fix the arithmetic grammar by adding precedence levels (T and F productions).`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Prove that the grammar $S \\to aSa\\ |\\ bSb\\ |\\ a\\ |\\ b\\ |\\ \\varepsilon$ is ambiguous.\n\nProvide:\n1. A specific string that has two parse trees\n2. Both parse trees drawn completely\n3. Both corresponding leftmost derivations`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Marking a grammar ambiguous just because "it looks complicated"**\nAmbiguity requires a concrete witness — two distinct parse trees for the SAME string.\n\n**Mistake 2: Confusing two derivation orders with two parse trees**\nLeftmost vs rightmost derivation of the SAME parse tree is not ambiguity.`,
      },
    ],
    commonMistakes: ['No concrete witness', 'Two derivations ≠ ambiguity'],
    masteryCriteria: ['Find ambiguity witness', 'Construct two distinct parse trees', 'Distinguish ambiguous from unambiguous grammars'],
  },

  {
    id: 'cfg-simplification',
    unit: 2,
    title: 'CFG Simplification',
    subtitle: 'Remove useless symbols, null productions, and unit productions.',
    prerequisites: ['cfg'],
    objective: 'Apply the three simplification algorithms to clean up a CFG without changing its language.',
    workspace: 'grammar',
    examWeight: 4,
    steps: [
      {
        type: 'why',
        title: 'Why simplify?',
        content: `A CFG may contain "junk" that doesn't affect the language but complicates analysis:\n\n- **Useless symbols** — variables that can never generate a terminal string, or can't be reached from S\n- **Null productions** — $A \\to \\varepsilon$ (except possibly $S \\to \\varepsilon$)\n- **Unit productions** — $A \\to B$ (a variable mapping directly to another variable)\n\nSimplification prepares a grammar for CNF conversion.`,
      },
      {
        type: 'formal',
        title: 'Useless Symbols',
        content: `A symbol $X$ is **useful** if:\n1. It is **generating** (productive): $X \\Rightarrow^* w$ for some terminal string $w$\n2. It is **reachable**: $S \\Rightarrow^* \\alpha X \\beta$ for some $\\alpha, \\beta$\n\n**Algorithm:**\n1. Find all generating variables (bottom-up: terminals generate themselves, then variables whose RHS is all generators)\n2. Find all reachable symbols (from S, follow productions)\n3. Remove any symbol that is not both generating AND reachable`,
      },
      {
        type: 'formal',
        title: 'Null Productions',
        content: `**Nullable** variables: $A$ is nullable if $A \\Rightarrow^* \\varepsilon$.\n\n**Algorithm:**\n1. Find all nullable variables\n2. For every production $A \\to X_1 X_2 \\cdots X_k$, add ALL combinations where nullable $X_i$ may be omitted\n3. Remove all $A \\to \\varepsilon$ productions (except $S \\to \\varepsilon$ if $\\varepsilon \\in L$)\n\nThe resulting grammar generates $L(G)$ or $L(G) \\setminus \\{\\varepsilon\\}$.`,
      },
      {
        type: 'formal',
        title: 'Unit Productions',
        content: `A **unit production** is $A \\to B$ where $B \\in V$.\n\n**Unit pairs:** $(A, B)$ is a unit pair if $A \\Rightarrow^* B$ using only unit productions.\n\n**Algorithm:**\n1. Compute all unit pairs\n2. For each unit pair $(A, B)$ and each non-unit production $B \\to \\alpha$, add $A \\to \\alpha$\n3. Remove all unit productions`,
      },
      {
        type: 'example',
        title: 'Worked Example: Full Simplification',
        content: `Grammar: $S \\to AB\\ |\\ a,\\ A \\to b\\ |\\ \\varepsilon,\\ B \\to C,\\ C \\to c\\ |\\ d$\n\n**Step 1 — Null removal:**\n- Nullable: {A}\n- $S \\to AB$ becomes $S \\to AB\\ |\\ B$ (with A omitted)\n- Remove $A \\to \\varepsilon$\n\n**Step 2 — Unit removal:**\n- Unit pairs: (B,C), (S,B) via B→C... wait, B→C is unit.\n- Add $B \\to c\\ |\\ d$ (from C's productions). Remove $B \\to C$.\n- (S,B)? S→B now exists (from null removal step). Add $S \\to c\\ |\\ d$. Remove $S \\to B$.\n\n**Result:** $S \\to AB\\ |\\ a\\ |\\ c\\ |\\ d,\\ A \\to b,\\ B \\to c\\ |\\ d,\\ C \\to c\\ |\\ d$\n\n**Step 3 — Useless removal:**\n- C is not reachable (no production refers to C anymore) → remove C.`,
      },
      {
        type: 'guided',
        title: 'Guided Practice',
        content: `Load the grammar:\n$S \\to ASB\\ |\\ \\varepsilon,\\ A \\to aAS\\ |\\ a,\\ B \\to SbS\\ |\\ A\\ |\\ bb$\n\nIn the Grammar Cleanup Lab:\n1. Identify nullable variables (click to select them)\n2. Generate all new productions after null removal\n3. Identify unit productions\n4. Apply unit production removal\n5. Check for useless symbols`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Simplify the following grammar:\n$S \\to aS\\ |\\ A,\\ A \\to B,\\ B \\to b\\ |\\ \\varepsilon,\\ C \\to c$\n\nPerform in order:\n1. Useless symbol removal\n2. Null production elimination\n3. Unit production elimination\n\nShow the grammar after each step.`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Wrong simplification order**\nThe standard order is: Null removal → Unit removal → Useless symbol removal.\nBut you must always check for useless symbols again after the other steps.\n\n**Mistake 2: Missing derived combinations in null removal**\nIf $A \\to XYZ$ and both X and Y are nullable, you must add:\n$A \\to XYZ\\ |\\ YZ\\ |\\ XZ\\ |\\ Z\\ |\\ XY\\ |\\ X\\ |\\ Y\\ |\\ \\varepsilon$ (minus the ε itself).\n\n**Mistake 3: Your grammar still contains $A \\to B$**\nThat means your unit production: "$A \\to B$" was not properly removed.`,
      },
    ],
    commonMistakes: ['Wrong order', 'Missing null combinations', 'Leftover unit productions'],
    masteryCriteria: ['Remove useless symbols', 'Eliminate null productions', 'Eliminate unit productions', 'Language preserved'],
  },

  {
    id: 'cnf',
    unit: 2,
    title: 'Chomsky Normal Form',
    subtitle: 'The canonical form for CFGs — every production is A→BC or A→a.',
    prerequisites: ['cfg-simplification'],
    objective: 'Convert any CFG to Chomsky Normal Form using the full 5-step pipeline.',
    workspace: 'grammar',
    examWeight: 5,
    steps: [
      {
        type: 'why',
        title: 'Why CNF?',
        content: `CNF is important because:\n1. **CYK parsing algorithm** requires CNF — it's the most efficient general CFG parser\n2. CNF proofs are cleaner — parse trees are always binary\n3. Every CFL has a CNF grammar (this is a theorem)\n\nCNF is the "canonical form" of CFGs.`,
      },
      {
        type: 'formal',
        title: 'Definition of CNF',
        content: `A CFG is in **Chomsky Normal Form (CNF)** if every production is of the form:\n\n$$A \\to BC \\quad \\text{(two variables)}$$\n$$A \\to a \\quad \\text{(single terminal)}$$\n\nAnd optionally $S \\to \\varepsilon$ if $\\varepsilon \\in L(G)$.\n\nNo production may have:\n- More than 2 symbols on RHS\n- Mixed terminals and variables on RHS\n- A single variable on RHS (unit production)`,
      },
      {
        type: 'formal',
        title: 'Conversion Pipeline',
        content: `**Step 1: Add new start symbol**\n$S_0 \\to S$\n\n**Step 2: Eliminate ε-productions** (null removal)\n\n**Step 3: Eliminate unit productions**\n\n**Step 4: Eliminate useless symbols**\n\n**Step 5: Convert remaining long productions**\nFor $A \\to X_1 X_2 \\cdots X_k$ with $k \\geq 3$:\n- Introduce variables $A_1, A_2, \\ldots$\n- $A \\to X_1 A_1,\\ A_1 \\to X_2 A_2,\\ \\ldots,\\ A_{k-2} \\to X_{k-1}X_k$\n\n**Step 6: Replace terminals in long productions**\nFor $A \\to X_1 X_2$ where $X_1$ is a terminal $a$:\n- Introduce $T_a \\to a$, replace $X_1$ with $T_a$`,
      },
      {
        type: 'example',
        title: 'Worked Example',
        content: `Grammar: $S \\to ASA\\ |\\ aB,\\ A \\to B\\ |\\ S,\\ B \\to b\\ |\\ \\varepsilon$\n\n**Step 1:** $S_0 \\to S$\n\n**Step 2 — Null removal:** B is nullable. Add:\n$S \\to ASA\\ |\\ AS\\ |\\ SA\\ |\\ S\\ |\\ aB\\ |\\ a$\n$A \\to B\\ |\\ S\\ |\\ \\varepsilon$... wait A is now nullable too!\nRedo: $S_0 \\to S\\ |\\ \\varepsilon$ (since S was nullable through A→B→ε)\n\n**Step 3 — Unit removal:** $A \\to B$ → add $A \\to b$; $A \\to S$ → add A's all S productions\n\n**Step 4 — Long production:** $S \\to ASA$ has length 3:\n- Introduce $A_1$: $S \\to A A_1,\\ A_1 \\to S A$\n\n**Step 5 — Terminal replacement:** $S \\to aB$:\n- Introduce $T_a \\to a$: $S \\to T_a B$`,
      },
      {
        type: 'guided',
        title: 'Guided: CNF Factory',
        content: `Use the CNF Factory Lab:\n\n1. Load your grammar\n2. Each pipeline stage is a separate interactive step\n3. At each stage, the system shows what needs to be done and you perform the operation\n4. After each step, you can inspect the current grammar\n5. When complete, the system verifies all productions are in CNF`,
      },
      {
        type: 'independent',
        title: 'Independent Practice',
        content: `Convert to CNF:\n1. $S \\to aSb\\ |\\ \\varepsilon$ (balanced a's and b's)\n2. $E \\to E+T\\ |\\ T,\\ T \\to T*F\\ |\\ F,\\ F \\to id\\ |\\ (E)$\n\nFor each, show the grammar after every individual step.`,
      },
      {
        type: 'exam',
        title: 'Exam Question',
        content: `**Q:** Convert to CNF:\n$S \\to ABa,\\ A \\to aab,\\ B \\to Ac\\ |\\ \\varepsilon$\n\nShow the grammar after each of the 5 steps. The final grammar must satisfy:\n- Every production is $A \\to BC$ or $A \\to a$\n- No useless symbols\n- No unit or null productions (except optionally $S_0 \\to \\varepsilon$)`,
      },
      {
        type: 'mistakes',
        title: 'Common Mistakes',
        content: `**Mistake 1: Not adding a new start symbol**\nIf $S$ appears on any RHS and $S \\to \\varepsilon$, you must create $S_0$.\n\n**Mistake 2: Mixing terminal and variable in a two-symbol production**\n$A \\to aB$ is NOT CNF. Replace $a$ with $T_a \\to a$.\n\n**Mistake 3: Skipping unit/null removal before binarization**\nThe order matters. Always do null → unit → useless → terminal substitution → binarization.`,
      },
    ],
    commonMistakes: ['No new start symbol', 'Mixed terminal+variable RHS', 'Wrong pipeline order'],
    masteryCriteria: ['Apply all 5 CNF steps', 'Produce valid CNF grammar', 'Verify no CNF violations', 'Language is preserved'],
  },
];

export const getLessonById = (id: string): Lesson | undefined =>
  LESSONS.find(l => l.id === id);

export const getUnit1Lessons = () => LESSONS.filter(l => l.unit === 1);
export const getUnit2Lessons = () => LESSONS.filter(l => l.unit === 2);
