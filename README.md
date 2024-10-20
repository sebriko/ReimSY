# ReimSY

ReimSY is a lightweight JS class for evaluating logical statements.

## Creating an Instance

let myInstance = new ReimSY();

## Adding and evaluating Statements  

demo.add("Device", "Status", "on", "when", "LED", "lights", "green");
demo.add("LED", "lights", "green");

## Evaluating the Result

let result = demo.evaluate();
console.log(result); // [["LED", "lights", "green"], ["Device", "Status", "on"]]

## Additional Notes:

- The class currently runs up to **5 logical iterations**. This can be adjusted using the `numberOfLoops` variable.
- **Negations are not yet supported**. It’s also not possible to **retract** statements.
