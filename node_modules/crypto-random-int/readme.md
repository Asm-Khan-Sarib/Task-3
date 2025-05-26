## Crypto-Random-Int

This module produces a function that returns a promise to find a cryptographically safe random integer within in the range and including the two integer arguments. The difference between the two integers must be less than 2<sup>32</sup>. It works in Node JS or a browser.

## Install
```
npm install crypto-random-int 
```

## Usage in Node

```javascript
const cryptoRandomInt = require("crypto-random-int");

cryptoRandomInt(-7, 28)
    .then((randomInt) => { 
        console.log(randomInt); 
    })
    .catch((err) => {
        console.log(err); 
    });
```

## Usage in browser

Download the repository and reference the crypto-random-int.js file as shown below. cryptoRandomInt is placed on the window object and can be referenced globally.
```html
<script src="path/to/crypto-random-int.js"></script>
<script>

let promises = Array(7).fill().map(x => cryptoRandomInt(9, 0));

Promise.all(promises)
    .then((arr) => {
        console.log(arr);
    })
    .catch((err) => {
        console.log(err);
    });

</script>
```