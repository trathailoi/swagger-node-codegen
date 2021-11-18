# Code generation for 7 Miles' HAPI/Typescript architecture

## Installation
```
git clone https://github.com/craigdrabiktxmq/swagger-node-codegen
cd swagger-node-codegen
npm i
```

## Running code generation

```
node cli.js input/cars-walkthrough.yaml -t templates/7miles-server -o output/cars-walkthrough
```

## What do I do with the generated files

The first time you run code generation from a YAML file, you should copy all files outputted by the code generator into the starter project.  Then, build and run the starter.  It should build and run, and you should be able to reach every endpoint described in the YAML.  All endpoints will return 501 - Not Implemented.  

Over time, you will probably make changes to the API (in YAML).  You can re-generate as many times as you like.  However, after the first time you generate code you should NOT overwrite any of the .controller.ts files when you copy code into the project as they will have been modified by developers to implement the API methods.  You can (and should) overwrite everything in src/api/interfaces, src/api/controllers.ts, everything in src/ioc, and everything in src/model every time the API changes.

When you update those files, the Typescript compiler will complain if there are any methods (endpoints) which have been added that the existing controllers don't implement.  You can copy the method signatures for those new methods from the generated controllers into your existing controllers.
