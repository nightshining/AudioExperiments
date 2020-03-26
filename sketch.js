 var type = /(canvas|webgl)/.test(url.type) ? url.type : 'svg';
        var two = new Two({
          type: Two.Types[type],
          fullscreen: true,
          autostart: true
        }).appendTo(document.body);

        // Two.js colors from main.css
        var colors = [
          'rgb(255, 64, 64)',
          'rgb(255, 128, 0)',
          'rgb(0, 200, 255)',
          'rgb(0, 191, 168)',
          'rgb(153, 102, 255)',
          'rgb(255, 244, 95)'
        ];
        colors.index = 0;

        var linearGradient = two.makeLinearGradient(
          two.width / 2, - two.height / 2,
          two.width / 2, two.height / 2,
          new Two.Stop(0, colors[0]),
          new Two.Stop(1, colors[1]),
          new Two.Stop(1, colors[2])
        );

        var rectangle = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
        rectangle.noStroke();

        rectangle.fill = linearGradient;

        var radius = Math.max(two.width, two.height);
        var radialGradient = two.makeRadialGradient(
          0, 0,
          radius,
          new Two.Stop(0, 'rgba(255, 0, 0, 1)', 1),
          new Two.Stop(0.5, 'rgba(255, 0, 0, 0)', 0)
        );

        var vignette = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
        vignette.noStroke();

        vignette.fill = radialGradient;

        var mouse = new Two.Vector(two.width / 2, two.height / 2);
        var destination = new Two.Vector();

        $(window)
          .bind('mousemove', function(e) {
            mouse.set(e.clientX, e.clientY);
          })
          .bind('touchmove', function(e) {
            e.preventDefault();
            var touch = e.originalEvent.changedTouches[0];
            mouse.set(touch.pageX, touch.pageY);
            return false;
          });

        two
          .bind('resize', function() {

            var w = two.width / 2;
            var h = two.height / 2;

            linearGradient.left.y = - h;
            linearGradient.right.y = h;

            rectangle.vertices[0].set(- w, - h);
            rectangle.vertices[1].set(w, - h);
            rectangle.vertices[2].set(w, h);
            rectangle.vertices[3].set(- w, h);

            vignette.vertices[0].copy(rectangle.vertices[0]);
            vignette.vertices[1].copy(rectangle.vertices[1]);
            vignette.vertices[2].copy(rectangle.vertices[2]);
            vignette.vertices[3].copy(rectangle.vertices[3]);

            rectangle.translation.set(w, h);
            vignette.translation.copy(rectangle.translation);

            radius = Math.max(two.width, two.height);

          })
          .bind('update', function(frameCount) {

            radialGradient.radius = (radius / 4) * (Math.sin(frameCount / 60) + 1) / 2 + radius * 0.75;

            destination.set(
              mouse.x - two.width / 2,
              mouse.y - two.height / 2
            );
            radialGradient.center.addSelf(
              destination
                .subSelf(radialGradient.center)
                .multiplyScalar(0.125)
            );

            var o = linearGradient.stops[1].offset;

            if (o < 0.001) {
              linearGradient.stops[1].offset = 1;
              colors.index = (colors.index + 1) % colors.length;
              for (var i = 0; i < linearGradient.stops.length; i++) {
                linearGradient.stops[i].color = colors[(colors.index + i) % colors.length];
              }
              return;
            }

            linearGradient.stops[1].offset -= o * 0.125;

          });
