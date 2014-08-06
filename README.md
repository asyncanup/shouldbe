shouldbe
--------

**shouldbe** is a type-checking utility for JavaScript code that lives write 
in your code and throws up if underscore says the value is not of the given type.

## Example

    shouldbe("string", str) // throws if _.isString(str) would return false


## Dependencies

Underscore is the only dependency right now.


## How to add more types

Just add the relevant mixin to underscore. 

For example:

    _.mixin({
        isEvenValue: function (val) { return !(val % 2); }
    });
    shouldbe("even-value", 3); // throws up!

