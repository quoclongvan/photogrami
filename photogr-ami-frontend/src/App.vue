<template>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Messages Pro+</title>
  </head>
  <body>
    <div id="app">
      <header-haut></header-haut>
      <router-view/>
      <footer-bas></footer-bas>
    </div>
  </body>
</html>
</template>

<script>
import Header from './components/statique/Header.vue';
import Footer from './components/statique/Footer.vue';

export default {
  name: 'app',
  components: {
    'header-haut': Header,
    'footer-bas': Footer,
  },
};
</script>


<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}
*::-webkit-scrollbar {
  display: none;
}
*:focus {
  outline: none;
}
select {
  cursor: pointer;
  font-size: 16px;
  border: 1px solid black;
  background-color: white;
  height: 40px;
  &:focus {
    border: 1px solid rgb(248, 176, 140);
  }
}
.radius-left {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
.radius-right {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}
section {
  padding-top: 40px;
  padding-bottom: 40px;
  min-width: 320px;
  min-height: 100%;
  background-color: #fff1e2;
}
body, html, div#app {
  height: 100%;
  background-color: #fff1e2;
}
html {
  -webkit-text-size-adjust: 100%;
}
input, button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: rgb(253, 200, 175);
  padding: 10px;
  font-size: 16px;
  border-radius: 20px;
  border: 1px solid black;
}
input:not([type=submit]) {
  background-color: white;
  color: black;
}
img, button, .no-selection {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}
input:not([type=submit]):focus {
  border: 1px solid rgb(248, 176, 140);
}
input[type=submit]:hover, button:hover:enabled {
  cursor: pointer;
  background-color: rgb(248, 176, 140) !important;
}
input[type=submit]:active, button:active {
  background-color: rgb(248, 176, 140) !important;
  transform: translateY(1px);
}
.active {
  background-color: rgb(248, 176, 140) !important;
}
@keyframes afficheAnimation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes disparaitAnimation {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    height: 0;
    border: 0;
  }
}
.apparait-animation {
  animation-name: afficheAnimation;
  animation-timing-function: ease-out;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}
.disparait-animation {
  animation-name: disparaitAnimation;
  animation-timing-function: ease-in;
  animation-duration: 0.3s;
  animation-fill-mode: forwards;
}
.invisible {
  height: 0;
  border: 0 !important;
}
@keyframes afficheBordure {
  0% {
    border: 1px solid black;
  }
  100% {
    border: 1px solid red;
  }
}
@keyframes focusCommentaire {
  0% {
    border: 1px solid black;
  }
  100% {
    border: 1px solid rgb(248, 176, 140);
  }
}

@media only screen and (max-width: 414px) {
  div.selection-fil-actualite, div.selection-page-profil {
    > div {
      font-size: 13px;
      padding: 0 8px;
    }
  }
  button, input {
    font-size: 14px;
    padding: 8px;
  }
  select {
    height: 34px;
  }
}

</style>
