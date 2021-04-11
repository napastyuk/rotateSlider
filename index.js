window.onload = function () {
  $("#mySpriteSpin").spritespin({
    source: SpriteSpin.sourceArray("img/zol{frame}.jpg", {
      frame: [1, 100],
      digits: 4,
    }),
    width: 1024,
    height: 1024,
    sizeMode: "fit",
    animate: false,
    responsive: true,
    onInit: function (e, data) {
      //прошла инициализация слайдера, картинки еще не загрузились
      //console.log('onInit');
    },

    onProgress: function (e, data) {
      //произошла загрузка одной из картинок для слайдера
      //console.log('onProgress');
    },

    onLoad: function (e, data) {
      //произошла загрузка всех картинок для слайдера, слайдер готов отрисовывать
      //console.log('onLoad');
    },

    onComplete: function (e, data) {
      drowSVGTooltips();
      //все что нужно загрузилось, и отрисовалась первая картинка
      //console.log('onComplete');
    },

    onDraw: function (e, data) {
      //когда прошли вычисления для измения кадра и кадр сейчас будет отрисован
      //console.log('onDraw');
    },

    onFrame: function (e, data) {
      //когда поступил запрос на изменение текущего кадра
      // console.log('текущий кадр',data.frame);
    },

    onFrameChanged: function (e, data) {
      //когда текущий кадр уже изменился
      //console.log('onFrameChanged');
    },
  });
};

function drowSVGTooltips() {
    //константы
    const targetX = 50; //куда указывать X
    const targetY = 50; //куда указывать Y
    const colorName = "rgba(0, 0, 0, 0.2)";
    let textInTooltip = '<div style="font-family:system-ui;font-size:2px">- Смолчал хозяин, да и то, что мог сказать - Мне невдомёк, что во владениях чертога</div>';
    let content = "Видовой ресторан"; // \n для переноса строки
    const textStyleObj = { fill: "#fff", family: "system-ui, serif", 'size': '2px' };

    //инициализация корневого svg объекта для рисования
    const draw = SVG().addTo("#svg-layer").size("100", "100").viewbox('0 0 100 100');

        //для каждого тултипа
        const nestedGroup = draw.group().css('pointer-events','auto');;
        const rect = nestedGroup.rect("20", "5").radius(1).attr({ fill: colorName }); // svg>rect прямоугольник для фона, размеры пока захардкожены(!) что бы не вводить функцию вычисления размера текста
        const text = nestedGroup.text(content).font(textStyleObj).css('user-select','none'); //svg>a>text вставляем контент и добавляем стили для текста
        text.cx(rect.bbox().cx).cy(rect.bbox().cy); //центрируем получившийся текст относительно rect
        nestedGroup.move(20,20); //перемацам тултип поближе к зданию

        //добавляем указывающую линию до нужной точки
        const pointLine = draw.line().stroke(colorName).attr({"stroke-linecap": "round", "stroke-width": 0.4});

        //первый раз рисуем линию от прямоугольника до нужной точки
        let nearestCorner = getNearestCorner(nestedGroup, targetX, targetY);
        pointLine.plot(nearestCorner.x, nearestCorner.y, targetX, targetY);

        //опционально: включаем перетаскивание и обновляем нарисованную линию в момент drag&drop-а
        nestedGroup.draggable().on("dragmove", (e) => {
            let nearestCorner = getNearestCorner(nestedGroup, targetX, targetY);
            pointLine.plot(nearestCorner.x, nearestCorner.y, targetX, targetY);
        });
}

//хелпер - вычисляем ближайший угол прямоугольника к целевой точке
function getNearestCorner(rectangleEl, targetX, targetY) {
  //занесём в переменные координаты углов прямоугольника и целевой точки
  let topLeft = { x: rectangleEl.bbox().x, y: rectangleEl.bbox().y }; 
  let topRight = { x: rectangleEl.bbox().x2, y: rectangleEl.bbox().y }; 
  let bottomLeft = { x: rectangleEl.bbox().x, y: rectangleEl.bbox().y2 }; 
  let bottomRight = { x: rectangleEl.bbox().x2, y: rectangleEl.bbox().y2 }; 
  let target = { x: targetX, y: targetY };
  let smoothing = 0.3; // коррекция на сколько px начало линии сдвигать внутрь прямоугольника, для коррекции сглаживания, рекомендуется выставлять stroke-width / 2

  //сначала посчитаем расстояние от верхнего левого угла
  let distanceTopLeft = Math.hypot(target.x - topLeft.x, target.y - topLeft.y);

  let minimalValue = {
    coordinates: {
      x: topLeft.x + smoothing,
      y: topLeft.y + smoothing,
    },
    value: distanceTopLeft,
    //name:"topLeft"
  };

  //что бы потом сравнить его с расстоянием от остальных углов
  let distanceTopRight = Math.hypot(
    target.x - topRight.x,
    target.y - topRight.y
  );
  if (distanceTopRight < minimalValue.value) {
    minimalValue.value = distanceTopRight;
    minimalValue.coordinates.x = topRight.x - smoothing;
    minimalValue.coordinates.y = topRight.y + smoothing;
    //minimalValue.name = "topRight";
  }
  let distanceBottomLeft = Math.hypot(
    target.x - bottomLeft.x,
    target.y - bottomLeft.y
  );
  if (distanceBottomLeft < minimalValue.value) {
    minimalValue.value = distanceBottomLeft;
    minimalValue.coordinates.x = bottomLeft.x + smoothing;
    minimalValue.coordinates.y = bottomLeft.y - smoothing;
    //minimalValue.name = "bottomLeft";
  }
  let distanceBottomRight = Math.hypot(
    target.x - bottomRight.x,
    target.y - bottomRight.y
  );
  if (distanceBottomRight < minimalValue.value) {
    minimalValue.value = distanceBottomRight;
    minimalValue.coordinates.x = bottomRight.x - smoothing;
    minimalValue.coordinates.y = bottomRight.y - smoothing;
    //minimalValue.name = "bottomRight";
  }

  return minimalValue.coordinates;
}
