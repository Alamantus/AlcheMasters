# AlcheMasters

An attempt to make a fantasy potion-themed AR game using geolocation and compass heading in Phaser and ES6/ES2015.

## This Branch

This branch is where the work is done. My local directory structure is set up like this:

```
--Alchemasters
|
|----master
|    |
|    |----src
|
|----gh-pages
```

where the master directory is just this master branch and the gh-pages directory is the gh-pages branch.
My webpack configuration is set up to compile the contents of master/src/ directly into gh-pages/, which I then
push commits up to GitHub so I can use the GitHub Pages' https, which is now necessary for using geolocaiton on
mobile browsers.

Because of this, my gh-pages branch will contain TONS of tiny commits just for me to test with.
