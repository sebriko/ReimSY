# ReimSY

ReimSY is a lightweight JS class for evaluating logical statements.

Here is an example: https://codepen.io/animiert/pen/emYJQXx?editors=1111

## Creating an Instance

let demo = new ReimSY("en"); // "en" means, that word like "if" are Englisch. 

## First example

demo.add("LED", "color", "green");

let result = demo.evaluate();

console.log(result); // [["LED", "color", "green"]]

## Simple If-statement

demo.add("device", "status", "on", "if", "LED", "color", "green");

demo.add("LED", "color", "green");

let result = demo.evaluate();

console.log(result); // [["LED", "color", "green"], ["device", "status", "on"]]

## And-If-statement

demo.add("device", "status", "on", "and-if", "LED", "color", "green");

demo.add("device", "status", "on", "and-if", "switch", "status", "pressed");

demo.add("LED", "color", "green");

demo.add("switch", "status", "pressed");

let result = demo.evaluate();

console.log(result); // [["LED", "color", "green"], ["switch", "status", "pressed"], ["device", "status", "on"]]

## Abstract tautology

demo.add("%A", "is eaten by", "%B", "if", "%B", "eats", "%A");

demo.add("Marc", "eats", "ice cream");

let result = demo.evaluate();

console.log(result); // [["Marc", "eats", "ice cream"], ["ice cream", "is eaten by", "Marc"]]

## Additional Notes:

The class currently runs up to **5 logical iterations**. This can be adjusted using the `numberOfLoops` variable.
