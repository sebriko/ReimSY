# ReimSY

ReimSY is a lightweight JS class for evaluating logical statements.

## Creating an Instance

let demo = new ReimSY();

## Adding Statements  

demo.add("device", "status", "on", "if", "LED", "color", "green");

demo.add("LED", "color", "green");

## Evaluating the Result

let result = demo.evaluate();
console.log(result); // [["LED", "color", "green"], ["device", "status", "on"]]

## Additional Notes:

- The class currently runs up to **5 logical iterations**. This can be adjusted using the `numberOfLoops` variable.
- **Negations are not yet supported**. It’s also not possible to **retract** statements.
