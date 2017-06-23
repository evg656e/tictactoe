var gulp = require('gulp');

gulp.task('server', function() {
  return gulp.src(['app/server/main.js', 'app/server/package.json', 'build/tictactoeserver.js'])
    .pipe(gulp.dest('deploy/server'))
});

gulp.task('server/public', function() {
  return gulp.src(['app/web/index.html', 'build/tictactoeapp.js'])
    .pipe(gulp.dest('deploy/server/public'))
});

gulp.task('default', ['server', 'server/public']);
