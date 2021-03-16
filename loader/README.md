# Installation
Using npm:
> $ npm i --save --dev tvfocus-loader

# Configuration 

```javascript
module: {
    rules: [
        {
            test:/\.focus$/,
            exclude:/(node_modules)/,
            loader:'tvfocus-loader'
        }
    ]
}
```