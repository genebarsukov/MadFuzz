# MadFuzz web app
http://www.madfuzz.com

## Aggregates recent news headlines and allows users to rate them

### The parts of this web project
 1. An Angular 2 front-end
 2. A PHP back-end (Because PHP is quick and this started as an Angular test bed so emphasis was put on the front end)
 3. A Python scraping process

The front end is written in Typescript.
For performance considerations, It is then pre-compiled into js using angular's compiler.
The code is then compressed using rollup.

### Main front-end code found in:
* app/components
* app/models
* app/services

### Main back-end code found in:
* app/assets
* app/components
* app/models
* app/services

### Python web scraping code resides in the MadFuzzWebScraper repo
