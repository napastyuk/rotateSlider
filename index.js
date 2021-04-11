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
    plugins: ["progress", "360", "drag"],
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
      
      //все что нужно загрузилось, и отрисовалась первая картинка
      //console.log('onComplete');
      document.querySelector('#svg-layer').hidden = false;
      updateTooltips(tooltipArr, data.frame);
    },

    onDraw: function (e, data) {
      //когда прошли вычисления для измения кадра и кадр сейчас будет отрисован
      //console.log('onDraw');
    },

    onFrame: function (e, data) {
      //когда поступил запрос на изменение текущего кадра
      //console.log("текущий кадр", data.frame);
      // console.log("текущий угл", angles[data.frame]);

      updateTooltips(tooltipArr, data.frame);
    },

    onFrameChanged: function (e, data) {
      //когда текущий кадр уже изменился
      //console.log('onFrameChanged');
    },
  });

  tooltipArr = drowSVGTooltips();

  (function () {
    let tootipCloseBtn = document.querySelector("#popup > .popup__closeBtn");
    tootipCloseBtn.addEventListener(
      "click",
      (e) => (document.getElementById("popup").hidden = true)
    );
  })();
};

function drowSVGTooltips() {
  //инициализация корневого svg объекта для рисования
  const draw = SVG()
    .addTo("#svg-layer")
    .size("100", "100")
    .viewbox("0 0 100 100");

  let restoranTooltip = dropTooltipItem(draw);

  let tooltipArray=[];
  tooltipArray.push(restoranTooltip)
  return tooltipArray;
}

function dropTooltipItem(draw) {
  //константы
  const targetX = 56; //куда указывать X
  const targetY = 29; //куда указывать Y
  const colorName = "rgba(0, 0, 0, 0.2)";

  let content = "Видовой ресторан"; // \n для переноса строки
  const textStyleObj = {
    fill: "#fff",
    family: "system-ui, serif",
    size: "2px",
  };

  //для каждого тултипа
  const nestedGroup = draw
    .group()
    .attr("data-place", "restaurant")
    .css("pointer-events", "auto")
    .click(function (e) {
      openPopup(e.target.closest("g").dataset.place);
    });
  const rect = nestedGroup.rect("20", "5").radius(1).attr({ fill: colorName }); // прямоугольник для фона, размеры пока захардкожены(!) что бы не вводить функцию вычисления размера текста
  const text = nestedGroup.text(content).font(textStyleObj).css("user-select", "none"); //вставляем контент и добавляем стили для текста
  //text.cx(rect.rbox().cx).cy(rect.rbox().cy); //центрируем получившийся текст , пока не работает
  text.dmove(1,0.5);
  nestedGroup.move(15, 15); //переместим тултип поближе к зданию

  let nearestCorner = getNearestCorner(nestedGroup, targetX, targetY);
  //добавляем указывающую линию до нужной точки
  const pointLine = draw
    .line(34.7,19.7,56, 29) 
    .stroke(colorName)
    .attr({ "stroke-linecap": "round", "stroke-width": 0.4 });
  //console.log(pointLine)

  //опционально: включаем перетаскивание и обновляем нарисованную линию в момент drag&drop-а
  // nestedGroup.draggable().on("dragmove", (e) => {
  //     let nearestCorner = getNearestCorner(nestedGroup, targetX, targetY);
  //     pointLine.plot(nearestCorner.x, nearestCorner.y, targetX, targetY);
  // });

  return {tooltipEl:nestedGroup, lineEl:pointLine}
}

function updateTooltips(tooltipArr, frame) {
  let currentTooltip = tooltipArr[0];
  //todo: сделать обход по массиву tooltipArr
  if ((frame >= 0 && frame < 48)||((frame > 76 && frame < 100))) {    //кадры во время которых показывать тултип
    currentTooltip.tooltipEl.show();
    currentTooltip.lineEl.show();
    let target = getCoordOnEllips(13,2,angles[frame]) //12 и 2 радиусы описывающий конкретный элипс по которому движется лииния тултипа
    let nearestCorner = getNearestCorner(currentTooltip.tooltipEl, target.x, target.y);
    currentTooltip.lineEl.plot(nearestCorner.x, nearestCorner.y, target.x, target.y);
  } else {
    currentTooltip.tooltipEl.hide();
    currentTooltip.lineEl.hide();
  }
}

function getCoordOnEllips(a, b, deg) {
  let rad = (deg * Math.PI) / 180;
  return {
    x: a * Math.cos(rad) + 50,  //50 потому что от центра
    y: b * Math.sin(rad) + 28,  //27 высота элипса траектории для конкретного тултипа
  };
}

function openPopup(popupName) {
  if (content.hasOwnProperty(popupName)) {
    let popUpWrapper = document.querySelector("#popup");

    let popUpHeader = popUpWrapper.querySelector(".popup__header");
    popUpHeader.textContent = content[popupName].header;

    let popUpImg = popUpWrapper.querySelector(".popup__img > img");
    popUpImg.src = content[popupName].imgPath;

    let popUpContent = popUpWrapper.querySelector(".popup__text>p");
    popUpContent.textContent = content[popupName].content;

    popUpWrapper.hidden = false;
  } else {
    console.log("toopltip не найден");
  }
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

//соотвествия кадров и углов, angles - массив где индекс соотвествует номеру кадра , а значение - углу поворота здания
const angles = [
  36,
  40,
  43,
  47,
  50,
  54,
  58,
  61,
  65,
  68,
  72,
  76,
  79,
  83,
  86,
  90,
  94,
  97,
  101,
  104,
  108,
  112,
  115,
  119,
  122,
  126,
  130,
  133,
  137,
  140,
  144,
  148,
  151,
  155,
  158,
  162,
  166,
  169,
  173,
  176,
  180,
  184,
  187,
  191,
  194,
  198,
  202,
  205,
  209,
  212,
  216,
  220,
  223,
  227,
  230,
  234,
  238,
  241,
  245,
  248,
  252,
  256,
  259,
  263,
  266,
  270,
  274,
  277,
  281,
  284,
  288,
  292,
  295,
  299,
  302,
  306,
  310,
  313,
  317,
  320,
  324,
  328,
  331,
  335,
  338,
  342,
  346,
  349,
  353,
  356,
  0,
  4,
  7,
  11,
  14,
  18,
  22,
  25,
  29,
  32,
];

//контент для тултипов
const content = {
  restaurant: {
    header: "Видовой ресторан",
    imgPath: "tooltip-img/restaurant.jpg",
    content:
      "Кафе и рестораны различного класса. Для сотрудников многочисленных офисов будут организованы недорогие столовые.",
  },
};
