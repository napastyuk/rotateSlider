import jQuery from "jquery";
window.$ = window.jQuery = jQuery;
var SpriteSpin = require("spritespin");
import { SVG } from '@svgdotjs/svg.js';
import config from "./config.json";

window.onload = function () {
  $(function () {
    let tooltipArr = drowSVGTooltips();
    initSlider(tooltipArr);
    addTooltipEvents();
  });
};

function initSlider(tooltipArr) {
  $("#mySpriteSpin").spritespin({
    source: SpriteSpin.sourceArray("img/frames/zol{frame}.jpg", {
      frame: [1, 100],
      digits: 4,
    }),
    width: 1024,
    height: 1024,
    sizeMode: "fit",
    animate: false,
    responsive: true,
    plugins: ["progress", "360", "drag"],
    onComplete: function (e, data) {
      //все что нужно загрузилось, и отрисовалась первая картинка
      document.querySelector("#svg-layer").hidden = false;
      updateTooltips(tooltipArr, data.frame);
    },
    onFrame: function (e, data) {
      // console.log('текущий кадр', data.frame)
      //поступил запрос на изменение текущего кадра
      updateTooltips(tooltipArr, data.frame);
    },
  });
}

function addTooltipEvents() {
  let tootipCloseBtn = document.querySelector("#popup > .popup__closeBtn");
  tootipCloseBtn.addEventListener(
    "click",
    (e) => (document.getElementById("popup").hidden = true)
  );
}

function drowSVGTooltips() {
  //инициализация корневого svg объекта для рисования
  const draw = SVG()
    .addTo("#svg-layer")
    .size("100", "100")
    .viewbox("0 0 100 100");

    //dev ellips
  // var ellipse = draw.ellipse().radius(13, 1).fill('rgba(255, 0, 102, 0.5)').center(50, 47)

  let tooltipArray = [];
  for (var tooltipItem in config) {
    let restoranTooltip = dropTooltipItem(draw, config[tooltipItem]);
    tooltipArray.push(restoranTooltip);
  }

  return tooltipArray;
}

function dropTooltipItem(draw, tooltipConfig) {
  //константы
  const colorName ="rgba(0, 0, 0, 0.2)";
  const textStyleObj = {
    fill: "#fff",
    family: "system-ui, serif",
    size: "2px",
  };

  //создадим группу для прямоугольника с текстом
  const nestedGroup = draw.group()
    .attr("data-place", tooltipConfig.slug)
    .css("pointer-events", "auto")
    .click(function (e) {
      openPopup(e.target.closest("g").dataset.place);
    });
  const rect = nestedGroup.rect("20", "5").radius(1).attr({ fill: colorName }); // прямоугольник для фона, размеры пока захардкожены(!) что бы не вводить функцию вычисления размера текста
  const text = nestedGroup
    .text(tooltipConfig.content.tooltipTitle)  // \n для переноса строки
    .font(textStyleObj)
    .css("user-select", "none"); //вставляем контент и добавляем стили для текста
  //text.cx(rect.rbox().cx).cy(rect.rbox().cy); //центрируем получившийся текст , пока не работает
  text.dmove(1, 0.5); //коррекция надписи в прямоугольнике по высоте
  nestedGroup.move(tooltipConfig.defaultCoord.tooltipX, tooltipConfig.defaultCoord.tooltipY); //переместим тултип поближе к зданию
  
  //добавляем указывающую линию до нужной точки
  //let nearestCorner = getNearestCorner(nestedGroup, tooltipConfig.defaultCoord.targetX, tooltipConfig.defaultCoord.targetY);  не иммет смысла т к в момент загрузки все размеры равны нулю
  const pointLine = draw
    .line(1, 1, tooltipConfig.defaultCoord.targetX, tooltipConfig.defaultCoord.targetY) //пока нарисуем от угла, в момент загрузки все равно обновим
    .stroke(colorName)
    .attr({ "stroke-linecap": "round", "stroke-width": 0.4 });

  return { tooltipEl: nestedGroup, lineEl: pointLine, config: tooltipConfig};
}

function updateTooltips(tooltipArr, currentFrame) {
  tooltipArr.forEach(currentTooltip => {
    let startFr = currentTooltip.config.targetFrameSet.startRange;
    let endFr = currentTooltip.config.targetFrameSet.endRange;
    if ((currentFrame >= 0 && currentFrame < startFr) || (currentFrame > endFr && currentFrame <= 100)) {
      //кадры во время которых показывать тултип
      currentTooltip.tooltipEl.show();
      currentTooltip.lineEl.show();
      let elpSizes = currentTooltip.config.targetEllipsSizes;
      let target = getCoordOnEllips(elpSizes.x, elpSizes.y, angles[currentFrame], elpSizes.s , elpSizes.h ); //12 и 2 радиусы описывающий конкретный элипс по которому движется лииния тултипа
      let nearestCorner = getNearestCorner(
        currentTooltip.tooltipEl,
        target.x,
        target.y
      );
      currentTooltip.lineEl.plot(
        nearestCorner.x,
        nearestCorner.y,
        target.x,
        target.y
      );
    } else {
      //иначе скрываем
      currentTooltip.tooltipEl.hide();
      currentTooltip.lineEl.hide();
    }
  });
}

function getCoordOnEllips(a, b, deg, shift ,height) {
  deg=deg+shift;
  let rad = (deg * Math.PI) / 180;
  return {
    x: a * Math.cos(rad) + 50, //50 потому что от центра
    y: b * Math.sin(rad) + height, //27 высота элипса траектории для конкретного тултипа
  };
}

function openPopup(popupName) {
  if (config.hasOwnProperty(popupName)) {
    let popUpWrapper = document.querySelector("#popup");

    let popUpHeader = popUpWrapper.querySelector(".popup__header");
    popUpHeader.textContent = config[popupName].content.header;

    let popUpImg = popUpWrapper.querySelector(".popup__img > img");
    popUpImg.src = config[popupName].content.imgPath;

    let popUpContent = popUpWrapper.querySelector(".popup__text>p");
    popUpContent.textContent = config[popupName].content.content;

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


