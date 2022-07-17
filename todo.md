# TODO

1. I would split up your Dockerfile into at least one more stage, and maybe 2 more:
   - install dev deps
   - build TS into JS
   - install production deps
   - copy JS over and run
     > This way you can do better caching, which matters as you re-build your image over and over again in future development.
