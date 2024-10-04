# ReimSY

ReimSY is a lightweight JS class for evaluating logical statements.

## Creating an Instance

let myInstance = new ReimSY();

## Adding Statements  

### Example 1:

myInstance.add("Time", "is", "12.00");

### Example 2:

myInstance.add("The sky", "is", "blue", "if", "Time", "is", "12.00");

## Evaluating the Result

let result = myInstance.evaluate();

## Additional Notes:

- The class currently runs up to **5 logical iterations**. This can be adjusted using the `numberOfLoops` variable.
- **Negations are not yet supported**. It’s also not possible to **retract** statements.
