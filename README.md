# babel-plugin-react-pug

> Chuck out JSX and use Pug!

A nice little babel plugin that lets you use Pug over JSX, giving you a productive and readable alternative for defining React Component templates. In essence, the plugin transforms Pug templates into React function calls.   

## Example

### In

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            #profile.profile__container
                h1.profile__name ${this.state.name}
        `
    }
}
```

### Out

```js
class Profile extends React.Component {
    ...
    render() {
        return React.createElement('div', { id: 'profile', className: 'profile__container' },
            React.createElement('h1', { className: 'profile__name' }, this.state.name));
    }
}
```

## Installation

```sh
$ yarn add babel-plugin-react-pug --dev
```

## Features

`babel-plugin-react-pug` supports Pug features that make the most sense when using Pug as a template language for React. 

### Attributes

#### Class

Using the pug class syntax will automatically rename the attribute to `className` - so you won't have to worry about this!

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            .profile__card
        `
    }
}
```

#### Other Attributes / Events

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            #profile_01.profile__card(title="Profile Title")
        `
    }
}
```

...or with interpolations:

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            #profile__01.profile__card(onClick=${ this.state.update })
        `
    }
}
```

### Loops

```js
class ProfileList extends React.Component {
    ...
    render() {
        return pug`
            ul#profile__list ${ this.state.profiles.map((item) => pug`li ${item.name}`) }
        `
    }
}
```

### Components

To include components you don't need to use interpolation, just ensure that the component name is capitalised. For example:

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            ProfileCard(cardImage=${ this.state.imgSrc })
        `
    }
}
```

### Include

You can include pug templates into your components, for example say you have `tpls/profile-footer.pug`:

```html
.profile__footer
    .profile__footer__img
        img(src="http://placehold.it/200x200")
```

...now you can include the file in the component:

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            .profile__container
                h1.profile__title ${ this.state.title }
                .profile__body
                    h2.profile__subtitle ${ this.state.subtitle }
                include ./tpls/profile-footer.pug
        `
    }
}
```

### Extends

You can harness the awesome power of Pug's `extends` to have component template inheritance!

For example, you could specify a base component template (`tpls/base-profile.pug`):

```html
.profile__container
    .profile__header
    block content
.profile__footer
    h3 This is the footer!
    block footer
    p This is the sub footer text!
```

...Now reference this in the component:  

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            extends ./tpls/base-profile.pug
            block content
                h2.profile__title ${ this.state.title }
            block footer
                ul.profile__links ${ this.state.links.map((link) => pug`li.link ${ link }`) } 
        `
    }
}
```

## Usage

### Via .babelrc

```js
{
    "plugins": ["react-pug"]
}
```

### Via CLI

```sh
$ babel --plugins react-pug index.js
```

### Via Node API

```sh
require('babel-core').transform('code', {
    plugins: ['react-pug']
});
```

## Licence

MIT