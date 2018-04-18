const gulp = require('gulp');

gulp.task('deploy-server-main', function() {
  return gulp.src(['app/server/main.js', 'app/server/package.json'])
    .pipe(gulp.dest('deploy/server'))
});

gulp.task('deploy-server-build', function() {
    return gulp.src(['app/server/build/tictactoe.js'])
      .pipe(gulp.dest('deploy/server/build'))
  });

gulp.task('deploy-server-public', function() {
  return gulp.src(['app/web/index.html', 'app/web/build/index.js'])
    .pipe(gulp.dest('deploy/server/public'))
});

gulp.task('default', ['deploy-server-main', 'deploy-server-build', 'deploy-server-public']);
