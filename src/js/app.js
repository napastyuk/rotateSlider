import jQuery from "jquery";
window.$ = window.jQuery = jQuery;
var SpriteSpin = require("spritespin");
import { SVG } from "@svgdotjs/svg.js";
// import config from "./config.json"; //контент попапов не включаем в бандл, а запрашиваем отдельно
let sliderApi; //ссылка на api плагина SpriteSpin
let isOpenPopup = false; //флаг который разрешает открытие попапа по окончании анимации
var config //объект с контентом для попапа
//let isShowTooltips = true; //флаг для чекбокса что бы можно было скрывать тултипы 


window.onload = function () {
  //загружаем контент
  fetch('config.json')
  .then(response => response.json())
  .then(response => { config = response; pageInit()});

  /**
   * инициализация по очереди тултипов, слайдера, событий на UI элементах
   */
  function pageInit() {
    let tooltipArr = drowSVGTooltips();
    initSlider(tooltipArr);
    addTooltipEvents();
  };
};

/**
 * инициализация Spritespin слайдера и навешивание обработчиков 
 * @param {*} tooltipArr  - массив тултипов, прокидываем переменную внутрь
 */
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
    onInit: function (e, data) {
      //слайдер инициазировался, началась загрузка картинок

      //навесим события на интерактивные элементы, пока выключены
      // $(".spritespin-slider")
      //   .attr("min", 0)
      //   .attr("max", data.source.length - 1)
      //   .attr("value", 0)
      //   .on("input", function (e) {
      //     SpriteSpin.updateFrame(data, e.target.value);
      //   });

      // if ($(".debug__curFrame > input").length) {
      //   $(".debug__curFrame > input")
      //     .val(data.frame)
      //     .on("input", function (e) {
      //       SpriteSpin.updateFrame(data, e.target.value);
      //     });
      // }

      // if ($(".debug__curFrame > input").length) {
      //   $(".debug__curAngle > input").val(angles.indexOf(data.frame));
      // }

      // $(".spritespin-nextFrame").on("click", function (e) {
      //   SpriteSpin.updateFrame(data, data.frame + 1);
      // });
      // $(".spritespin-prevFrame").on("click", function (e) {
      //   SpriteSpin.updateFrame(data, data.frame - 1);
      // });
    },
    onComplete: function (e, data) {
      //все что нужно загрузилось, и отрисовалась первая картинка
      sliderApi = $("#mySpriteSpin").spritespin("api");
      document.querySelector("#svg-layer").hidden = false;
      updateTooltips(tooltipArr, data.frame);
    },
    onFrame: function (e, data) {
      // console.log('текущий кадр', data.frame)
      //поступил запрос на изменение текущего кадра
      // $(".spritespin-slider").val(data.frame);
      // if ($(".debug__curFrame > input").length) {
      //   $(".debug__curFrame > input").val(data.frame);
      // }
      // if ($(".debug__curAngle > input").length) {
      //   $(".debug__curAngle > input").val(angles[data.frame]);
      // }

      updateTooltips(tooltipArr, data.frame);
      //т к в spritespin нету колбеков по завершении анимации, 
      //попап открываем по флагу isOpenPopup и кадру 95 (под этот кадр делался контент попапов)
      if (data.frame === 95 && isOpenPopup) {
        openPopup(isOpenPopup);
      }
    },
  });
}

/**
 * добавляем события на интерактивные элементы
 * закрытие попапа по крестику
 * и скрытие тултипов по чекбоксу
 */
function addTooltipEvents() {
  $("#popup > .popup__closeBtn").on("click", (e) => $("#popup").fadeOut());
  
  //пока интерактивне элементы управления не нужны
  // $(".spritespin-switch").on("change", (e) => {
  //   isShowTooltips = !isShowTooltips;
  //   $("#svg-layer").toggle();
  // });
}

/**
 * инициализация корневого svg объекта для рисования
 * @returns tooltipArray - массив со всеми отрисованными тултипами
 */
function drowSVGTooltips() {
  const draw = SVG()
    .addTo("#svg-layer")
    .size("100", "100")
    .viewbox("0 0 100 100");

  //ellipse нужен только для отладки координат 
  //var ellipse = draw.ellipse().radius(6, 3).fill('rgba(255, 0, 102, 0.5)').center(50, 70)

  let tooltipArray = [];
  for (var tooltipItem in config) {
    let restoranTooltip = dropTooltipItem(draw, config[tooltipItem]);
    tooltipArray.push(restoranTooltip);
  }

  return tooltipArray;
}

/**
 * Первая отрисовка одного тултипа 
 * @param {*} draw - элемент svg.js , по сути svg-холст на котором будем отрисовывать тултипы
 * @param {*} tooltipConfig - размеры и координаты тултипов из config , по которым будем строить тултипы
 * @returns 
 */
function dropTooltipItem(draw, tooltipConfig) {
  //константы
  const colorName = "rgba(0, 0, 0, 0.2)";
  const textStyleObj = {
    fill: "#fff",
    family: "system-ui, serif",
    size: "2px",
  };

  //создадим группу для прямоугольника с текстом
  const nestedGroup = draw
    .group()
    .attr("data-place", tooltipConfig.slug)
    .addClass(`tooltip-group__${tooltipConfig.slug}`)
    .css("pointer-events", "auto")
    .click(function (e) {
      //по клику открываем попап, но только на 95 кадре
      //проверим находимся ли мы на 95 кадре
      if (sliderApi.currentFrame() === 95) {
        openPopup(e.target.closest("g").dataset.place);
      } else {
        sliderApi.playTo(95, {
          force: false,
          nearest: true,
        });
        isOpenPopup = e.target.closest("g").dataset.place; //выставляем глобальный флаг, что бы попап открылся когда анимация доёдет до 95 кадра
      }
    });

  const rect = nestedGroup
    .rect(tooltipConfig.content.tooltipTitle.length + 2, "5")
    .radius(1)
    .attr({ fill: colorName }); // прямоугольник для фона, +2 для отступов по бокам
  const text = nestedGroup
    .text(tooltipConfig.content.tooltipTitle) // \n для переноса строки
    .font(textStyleObj)
    .css("user-select", "none"); //вставляем контент и добавляем стили для текста

  //text.cx(rect.rbox().cx).cy(rect.rbox().cy); //центрируем получившийся текст , сейчас выключено т к холст отрисовывается скрытым и центровка не срабатывает 
  text.dmove(1, 0.5); //коррекция надписи в прямоугольнике по высоте
  nestedGroup.move(
    tooltipConfig.defaultCoord.tooltipX,
    tooltipConfig.defaultCoord.tooltipY
  ); //переместим тултип поближе к зданию

  //добавляем указывающую линию до нужной точки
  //let nearestCorner = getNearestCorner(nestedGroup, tooltipConfig.defaultCoord.targetX, tooltipConfig.defaultCoord.targetY);  не иммет смысла т к в момент загрузки все размеры равны нулю из за того что svg отрисовывается с атрибутом hidden
  const pointLine = draw
    .line(1,1,tooltipConfig.defaultCoord.targetX,tooltipConfig.defaultCoord.targetY) //пока нарисуем от верхнего угла, в момент загрузки все равно обновим
    .stroke(colorName)
    .attr({ "stroke-linecap": "round", "stroke-width": 0.4 })
    .addClass(`tooltip-group__${tooltipConfig.slug}`);

  return { tooltipEl: nestedGroup, lineEl: pointLine, config: tooltipConfig };
}

/**
 * Перерасчет координат и показ/скрытие тултипов и указывающих линий на каждом кадре
 * @param {*} tooltipArr - массив со всеми тултипами на странице, в том числе скрытыми
 * @param {*} currentFrame - текущий кадр
 */
function updateTooltips(tooltipArr, currentFrame) {
  tooltipArr.forEach((currentTooltip) => {
    let range = currentTooltip.config.targetEllips.frameRange;
    function isInRange(element) {
      return currentFrame >= element[0] && currentFrame <= element[1];
    }
    let isShow = range.some(isInRange);
    if (isShow) {
      //кадры во время которых показывать тултип
      currentTooltip.tooltipEl.show();
      currentTooltip.lineEl.show();
      let target = getCoordOnEllips(
        currentTooltip.config.targetEllips,
        angles[currentFrame]
      );
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

/**
 * расчёт коодинат точки которая движется по эллипсу
 * @param {*} ellips объект описыващий размеры и координаты эллипса
 * @param {*} deg текущий угол поворота в градусах, shift если надо двигатся не от нуля
 * @returns объект с координатами
 */
function getCoordOnEllips(ellips, deg) {
  let dir = ellips.directionIsStraight ? 1 : -1; // направление движения по часовой или против
  let rad = ((deg + ellips.shift) * Math.PI) / (dir * 180); //градусы переведём в радианы

  return {
    x: ellips.x * Math.cos(rad) + 50, //50 потому что все элипсы расположены в центре
    y: ellips.y * Math.sin(rad) + ellips.height, //height - корректировка высоты эллипса
  };
}

/**
 * Наполнение попапа контентом из config и его появление
 * @param {*} popupName  - id попапа, которое соотвествует полю в config
 */
function openPopup(popupName) {
  if (config.hasOwnProperty(popupName)) {
    let popUpWrapper = document.querySelector("#popup");

    let popUpHeader = popUpWrapper.querySelector(".popup__header");
    popUpHeader.textContent = config[popupName].content.header;

    let popUpImg = popUpWrapper.querySelector(".popup__img > img");
    popUpImg.src = config[popupName].content.imgPath;

    let popUpContent = popUpWrapper.querySelector(".popup__text>p");
    popUpContent.textContent = config[popupName].content.content;

    $("#popup").fadeIn("slow");
  } else {
    console.log("toopltip не найден");
  }
  isOpenPopup = false; //скидываем флаг для нового открытия попапа
}

/**
 * хелпер - вычисляем ближайший угол прямоугольника к целевой точке
 * @param {*} rectangleEl - dom-елемент внури которого вычисляем ближайший угол 
 * @param {*} targetX координаты до целевой точки    
 * @param {*} targetY 
 * @returns minimalValue - объект который содежит координаты coordinates{x,y}
 */
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

/**
 * соотвествие кадров и углов. 
 * angles - массив где индекс соотвествует номеру кадра , а значение - углу поворота здания
 */
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
