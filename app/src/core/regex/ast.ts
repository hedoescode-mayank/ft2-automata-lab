// ─── AST Node Types ──────────────────────────────────────────────────────────

export type RegexNodeType =
  | 'Char'        // single literal
  | 'Epsilon'     // ε
  | 'Empty'       // ∅
  | 'Union'       // R1 | R2
  | 'Concat'      // R1 R2
  | 'Star'        // R*
  | 'Plus'        // R+  (= RR*)
  | 'Question';   // R?  (= R|ε)

export interface RegexNode {
  type: RegexNodeType;
  value?: string;         // for Char nodes
  left?: RegexNode;       // for binary ops
  right?: RegexNode;      // for binary ops
  child?: RegexNode;      // for unary ops (Star, Plus, Question)
}

export const charNode  = (v: string):   RegexNode => ({ type: 'Char', value: v });
export const epsilonNode = ():          RegexNode => ({ type: 'Epsilon' });
export const emptyNode = ():            RegexNode => ({ type: 'Empty' });
export const unionNode = (l: RegexNode, r: RegexNode): RegexNode => ({ type: 'Union', left: l, right: r });
export const concatNode = (l: RegexNode, r: RegexNode): RegexNode => ({ type: 'Concat', left: l, right: r });
export const starNode  = (c: RegexNode): RegexNode => ({ type: 'Star',  child: c });
export const plusNode  = (c: RegexNode): RegexNode => ({ type: 'Plus',  child: c });
export const questionNode = (c: RegexNode): RegexNode => ({ type: 'Question', child: c });

/** Pretty-print an AST back to a regex string */
export const astToString = (node: RegexNode): string => {
  switch (node.type) {
    case 'Char':     return node.value!;
    case 'Epsilon':  return 'ε';
    case 'Empty':    return '∅';
    case 'Star':     return `(${astToString(node.child!)})*`;
    case 'Plus':     return `(${astToString(node.child!)})+`;
    case 'Question': return `(${astToString(node.child!)})?`;
    case 'Concat':   return `${astToString(node.left!)}${astToString(node.right!)}`;
    case 'Union':    return `(${astToString(node.left!)}|${astToString(node.right!)})`;
  }
};
