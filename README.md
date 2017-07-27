# babel-plugin-ng-inject-classes

Annotates decorated AngularJS classes.

## How to install

```
npm install @zdychacek/babel-plugin-ng-inject-classes --save-dev
```

Note: this library depends on the [syntax decorators](https://www.npmjs.com/package/babel-plugin-syntax-decorators) plugin for parsing. Simply type `npm install babel-plugin-syntax-decorators --save-dev`.

## How to setup

#### .babelrc
```js
{
  "presets": [ "es2015" ],
  "plugins": [
    "syntax-decorators",
    [
      "@zdychacek/babel-plugin-ng-inject-classes", {
        "decoratorNames": [ "Component" ]
      }
    ]
  ]
}
```

This plugin takes one option - `decoratorNames`. This option allows you to define list of decorator names to parse.

## How to use

Transforms this code:

```js
@Component('foo')
class Foo {
  constructor($timeout, $element) {}
}
```

into this:

```js
@Component('foo')
class Foo {
  constructor($timeout, $element) {}
}
Foo.$inject = ['$timeout', '$element'];
```
