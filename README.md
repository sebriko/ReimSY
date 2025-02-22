# ReimSY

ReimSY is a lightweight JS class for evaluating logical statements.

Here is an example: https://codepen.io/animiert/pen/emYJQXx?editors=1111

## Possible applications

- Alternative to small databases
- Learning apps and games
- Intelligent forms (diagnose, configuration etc.)
- Teaching everyday logic

## Creating an Instance

let demo = new ReimSY("en"); // "en" means, that operators like "if" are Englisch. 

## First example

let demo = new ReimSY("en");  
demo.add(["LED", "color", "green"]);  
let result = demo.evaluate();
console.log(result[0]); // Output ["LED","color","green"]

Demo: https://codepen.io/animiert/pen/XJWKJyW

## Simple If-statement

let demo = new ReimSY("en"); 
demo.add(["LED", "color", "green"]);
demo.add(["device", "status", "on", "if", "LED", "color", "green"]);
let result = demo.evaluate();
console.log(result); 
/* Output:
[
["LED","color","green"], 
["device","status","on"]
]
*/

Demo: https://codepen.io/animiert/pen/raNLaRN

## Abstract tautology

let demo = new ReimSY("en"); 
demo.add(["%A", "is eaten by", "%B", "if", "%B", "eats", "%A"]);
demo.add(["Marc", "eats", "ice cream"]);
let result = demo.evaluate();
console.log(result); 
/* Output:
[
["ice cream","is eaten by","Marc"],
["Marc","eats","ice cream"]
]
*/

Demo: https://codepen.io/animiert/pen/NPWrPVE

## Batch method

let demo = new ReimSY("en"); 
demo.addBatch([
  ["%A", "is eaten by", "%B", "if", "%B", "eats", "%A"],
  ["Marc", "eats", "ice cream"]
]);
let result = demo.evaluate();
console.log(result); 
/*Output 
[
  ["ice cream","is eaten by","Marc"],
  ["Marc","eats","ice cream"]
]
*/[

Demo: https://codepen.io/animiert/pen/YPzWPmr?editors=1111

## Logical operators

- and-if: conjunction (∧)
- if: implication (→)
- count-if: implication (→) and counting 
- or-if: disjunction (∨)
- not-if: negation (¬)

## Additional Notes:

The class currently runs up to **5 logical iterations**. This can be adjusted using the `numberOfLoops` variable.
