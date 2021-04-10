window.onload = function () {

    // let draw;
    // let xline;

    $("#mySpriteSpin").spritespin({
        source: SpriteSpin.sourceArray('img/zol{frame}.jpg',
            {
                frame: [1, 100],
                digits: 4
            }),
        width: 1024,
        height: 1024,
        sizeMode: 'fit',
        animate: false,
        responsive: true,
        onInit: function (e, data) {
            //прошла инициализация слайдера, картинки еще не загрузились
            //console.log('onInit'); 
            //draw = SVG().addTo('#svg').viewbox(0, 0, 100, 100)

            // aline = draw.rect(30, 1).move(50,55).css({
            //     'transform-origin': '50% 55%'
            // }).stroke({ color: 'red', width: 0.1 })

            // bline = draw.rect(60, 1).move(50,55).css({
            //     'transform-origin': '50% 55%'
            // }).stroke({ color: 'blue', width: 0.1 })
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
        },

        onDraw: function (e, data) {
            //когда прошли вычисления для измения кадра и кадр сейчас будет отрисован
            //console.log('onDraw');
        },

        onFrame: function (e, data) {
            //когда поступил запрос на изменение текущего кадра
            // console.log('текущий кадр',data.frame);
            // (data.frame > 100 && data.frame < 150) ? $(".custom-tooltip-1").show() : $(".custom-tooltip-1").hide()
            // xline.css('transform', `rotateY(${data.frame*1.8}deg)`)
            // xline.css('transform', `rotateY(${data.frame*1.8}deg) rotateZ(${data.frame*1.8}deg)`)
            // aline.css('transform', `rotate3d(0,1,1,140deg) rotate3d(0,1,1,${data.frame*1.8}deg)`)

            // bline.css('transform', `rotate3d(0,1,1,${data.frame*1.8}deg) translateX(-50%) `)
            
        },

        onFrameChanged: function (e, data) {
            //когда текущий кадр уже изменился
            //console.log('onFrameChanged');
        },

    });


    //(function drowsvg(){
        //initialize SVG.js
        // var draw = SVG().addTo('#svg').viewbox(0, 0, 100, 100)

        // var Xline = draw.rect(30, 1).move(50,55).css({
        //     'transform': `rotateY(0deg)`,
        //     'transform-origin': '50% 0%'
        // }).stroke({ color: 'red', width: 0.1 })


        // var Yline = draw.rect(10, 10).css({'transform-origin':'center center 50px', 'transform':'rotateX(15deg)', 'display':'none'})
        // Yline.stroke({ color: 'green', width: 0.5 })

        // var Zline = draw.rect(10, 10).css({'transform-origin':'center center 50px', 'transform':'rotateX(15deg)', 'display':'none'})
        // Zline.stroke({ color: 'blue', width: 0.5 })
    //}())


}

