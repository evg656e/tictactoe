var gulp = require('gulp');

gulp.task('deploy-server', function() {
  return gulp.src(['app/server/main.js', 'app/server/package.json', 'build/tictactoeserver.js'])
    .pipe(gulp.dest('deploy/server'))
});

gulp.task('deploy-server-public', function() {
  return gulp.src(['app/web/index.html', 'build/tictactoeapp.js'])
    .pipe(gulp.dest('deploy/server/public'))
});

gulp.task('default', ['deploy-server', 'deploy-server-public']);
