/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({

    transpiler: 'typescript',
    typescriptOptions: { emitDecoratorMetadata: true },

    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',

      // angular bundles
      '@angular/core': 'npm:@angular/core',
      '@angular/common': 'npm:@angular/common',
      '@angular/compiler': 'npm:@angular/compiler',
      '@angular/platform-browser': 'npm:@angular/platform-browser',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic',
      '@angular/http': 'npm:@angular/http',
      '@angular/router': 'npm:@angular/router',
      '@angular/forms': 'npm:@angular/forms',

      // other libraries
      'rxjs':                      'npm:rxjs',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',

      // typescript
      'typescript': 'npm:typescript/lib/typescriptServices.js'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.ts',
        defaultExtension: 'ts'
      },
      rxjs: {
        defaultExtension: 'js'
      }
    }
  });

})(this);
