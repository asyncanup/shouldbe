
     _______  __    _  _______  __   __  ______    _______            ___  _______ 
    |       ||  |  | ||       ||  | |  ||    _ |  |       |          |   ||       |
    |    ___||   |_| ||  _____||  | |  ||   | ||  |    ___|          |   ||  _____|
    |   |___ |       || |_____ |  |_|  ||   |_||_ |   |___           |   || |_____ 
    |    ___||  _    ||_____  ||       ||    __  ||    ___| ___   ___|   ||_____  |
    |   |___ | | |   | _____| ||       ||   |  | ||   |___ |   | |       | _____| |
    |_______||_|  |__||_______||_______||___|  |_||_______||___| |_______||_______|


**Ensure.js** is a type-checking utility for JavaScript written in pure
Javascript that provides an easy api to check for a variable's value
against a common set of types, with an ability to easily add more.

    ensure("non_empty_string", str)

Types can be simply checked for (`ensure.test`) or be made to throw
errors in the case of a mismatch.

It also provides a utility function (`ensure.match`) to check and match
the arguments to a function against a set of provided type-arrays.

This enables another utility that can work as a function call tracer
and logger (`ensure.inside` and `ensure.stack`).
